import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

// ---- shop details shown in the emails (edit if they change) ----
const SHOP = {
  name: 'Jabha Fashions',
  phones: '97890 21183 / 86081 68862',
  address: 'No.18/1, Kamarajar Salai, Lakshmi Puram, Thiruvanmiyur, Chennai - 600 041',
};

// Everything that comes from a customer is escaped before going into HTML.
const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
const inr = (n: unknown) => '\u20B9' + Number(n).toLocaleString('en-IN');

function itemRows(order: any) {
  return (order.items ?? [])
    .map(
      (it: any) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${esc(it.name)}${it.color ? ` (${esc(it.color)})` : ''} &times; ${esc(it.qty)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${inr(it.price * it.qty)}</td>
      </tr>`
    )
    .join('');
}

function totals(order: any) {
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:8px">
      ${itemRows(order)}
      <tr><td style="padding-top:10px">Subtotal</td><td style="padding-top:10px;text-align:right">${inr(order.subtotal)}</td></tr>
      <tr><td>Shipping</td><td style="text-align:right">${Number(order.shipping) > 0 ? inr(order.shipping) : 'Free'}</td></tr>
      <tr><td style="padding-top:8px"><strong>Total paid</strong></td><td style="padding-top:8px;text-align:right"><strong>${inr(order.total)}</strong></td></tr>
    </table>`;
}

function address(order: any) {
  return `${esc(order.customer_name)}<br>${esc(order.address_line)}<br>${esc(order.city)}, ${esc(order.state)} - ${esc(order.pincode)}`;
}

const wrap = (inner: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#222;line-height:1.5">
    <h2 style="color:#7a1f22;margin-bottom:4px">${SHOP.name}</h2>
    ${inner}
  </div>`;

function customerEmail(order: any) {
  return {
    subject: `Order ${order.order_number} confirmed - ${SHOP.name}`,
    html: wrap(`
      <p>Hi ${esc(order.customer_name)},</p>
      <p>Thank you for your order! Your payment was received successfully.</p>
      <p><strong>Order number: ${esc(order.order_number)}</strong></p>
      ${totals(order)}
      <h3 style="color:#7a1f22;margin-bottom:4px">Delivery address</h3>
      <p style="margin-top:0">${address(order)}<br>Phone: ${esc(order.phone)}</p>
      ${order.notes ? `<p><strong>Your notes:</strong> ${esc(order.notes)}</p>` : ''}
      <p>We will contact you shortly to confirm the details. If you have any questions, call us on ${SHOP.phones}.</p>
      <p style="color:#777;font-size:13px">${SHOP.name}, ${SHOP.address}</p>`),
  };
}

function ownerEmail(order: any) {
  return {
    subject: `New paid order ${order.order_number} - ${inr(order.total)}`,
    html: wrap(`
      <p><strong>New paid order ${esc(order.order_number)}</strong></p>
      ${totals(order)}
      <h3 style="color:#7a1f22;margin-bottom:4px">Customer</h3>
      <p style="margin-top:0">${address(order)}<br>
        Phone: ${esc(order.phone)}<br>Email: ${esc(order.email)}</p>
      ${order.notes ? `<p><strong>Customer notes:</strong> ${esc(order.notes)}</p>` : ''}
      <p style="color:#777;font-size:13px">Update the status in the admin page, Orders tab.</p>`),
  };
}

async function sendEmail(opts: { to: string[]; subject: string; html: string; replyTo?: string }) {
  const key = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM');
  if (!key || !from) throw new Error('Email is not configured (RESEND_API_KEY / MAIL_FROM)');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      reply_to: opts.replyTo,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

/**
 * Marks the order paid and sends the confirmation emails exactly once.
 * Both verify-payment and the webhook call this; whichever gets there first
 * sends the emails, the other one just sees they were already sent.
 */
export async function markPaidAndNotify(
  supabase: SupabaseClient,
  razorpayOrderId: string,
  paymentId: string,
) {
  const { data: order, error } = await supabase
    .from('orders')
    .update({ payment_status: 'paid', razorpay_payment_id: paymentId })
    .eq('razorpay_order_id', razorpayOrderId)
    .select('*')
    .single();
  if (error || !order) return null;

  // "claim" the emails: only one caller can flip emails_sent_at from null
  const { data: claimed } = await supabase
    .from('orders')
    .update({ emails_sent_at: new Date().toISOString() })
    .eq('id', order.id)
    .is('emails_sent_at', null)
    .select('id')
    .maybeSingle();
  if (!claimed) return order;

  const owners = (Deno.env.get('OWNER_EMAILS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const jobs = [sendEmail({ to: [order.email], replyTo: owners[0], ...customerEmail(order) })];
  if (owners.length) jobs.push(sendEmail({ to: owners, replyTo: order.email, ...ownerEmail(order) }));

  const results = await Promise.allSettled(jobs);
  results.forEach((r) => r.status === 'rejected' && console.error('Email failed:', r.reason));

  // if nothing went out at all, allow a retry (e.g. from the webhook)
  if (results.every((r) => r.status === 'rejected')) {
    await supabase.from('orders').update({ emails_sent_at: null }).eq('id', order.id);
  }
  return order;
}

/** "Your order has shipped" email, with courier / tracking details if given. */
export async function sendShippedEmail(order: any) {
  const owners = (Deno.env.get('OWNER_EMAILS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const link = /^https?:\/\//i.test(order.tracking_url ?? '') ? order.tracking_url : '';
  const hasTracking = order.courier || order.tracking_number || link;

  const trackingBlock = hasTracking
    ? `
      <div style="background:#faf3ee;border-radius:8px;padding:14px 16px;margin:16px 0">
        ${order.courier ? `<div>Courier: <strong>${esc(order.courier)}</strong></div>` : ''}
        ${order.tracking_number ? `<div>Tracking number: <strong>${esc(order.tracking_number)}</strong></div>` : ''}
        ${link ? `<p style="margin:12px 0 0"><a href="${esc(link)}" style="background:#7a1f22;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;display:inline-block">Track your order</a></p>` : ''}
      </div>`
    : '';

  await sendEmail({
    to: [order.email],
    replyTo: owners[0],
    subject: `Your order ${order.order_number} is on its way - ${SHOP.name}`,
    html: wrap(`
      <p>Hi ${esc(order.customer_name)},</p>
      <p>Good news! Your order <strong>${esc(order.order_number)}</strong> has been shipped.</p>
      ${trackingBlock}
      <table style="width:100%;border-collapse:collapse">${itemRows(order)}</table>
      <h3 style="color:#7a1f22;margin-bottom:4px">Delivering to</h3>
      <p style="margin-top:0">${address(order)}<br>Phone: ${esc(order.phone)}</p>
      <p>If you have any questions, call us on ${SHOP.phones}.</p>
      <p style="color:#777;font-size:13px">${SHOP.name}, ${SHOP.address}</p>`),
  });
}
