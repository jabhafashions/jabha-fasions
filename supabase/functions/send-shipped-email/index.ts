import { createClient } from 'npm:@supabase/supabase-js@2';
import { cors, json } from '../_shared/razorpay.ts';
import { sendShippedEmail } from '../_shared/notify.ts';

const clean = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const url = Deno.env.get('SUPABASE_URL')!;

    // 1) only a logged-in admin may call this (the public anon key is not enough)
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const authClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: userData } = await authClient.auth.getUser(token);
    if (!userData?.user) return json({ error: 'Please log in again.' }, 401);

    // 2) validate input
    const body = await req.json();
    const courier = clean(body.courier, 60);
    const trackingNumber = clean(body.trackingNumber, 80);
    const trackingUrl = clean(body.trackingUrl, 300);
    if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
      return json({ error: 'The tracking link must start with http:// or https://' }, 400);
    }

    const supabase = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: order } = await supabase.from('orders').select('*').eq('id', body.orderId).single();
    if (!order) return json({ error: 'Order not found.' }, 404);
    if (order.payment_status !== 'paid') {
      return json({ error: 'Only paid orders can be marked as shipped.' }, 400);
    }

    // 3) mark shipped + save the tracking details
    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        order_status: 'shipped',
        courier: courier || null,
        tracking_number: trackingNumber || null,
        tracking_url: trackingUrl || null,
      })
      .eq('id', order.id)
      .select('*')
      .single();
    if (error || !updated) {
      console.error(error);
      return json({ error: "Couldn't update the order." }, 500);
    }

    // 4) email the customer (once, unless the admin asks to resend)
    let emailSent = false;
    let alreadySent = false;
    let emailError: string | null = null;

    if (body.sendEmail !== false) {
      if (updated.shipped_email_sent_at && !body.resend) {
        alreadySent = true;
      } else {
        try {
          await sendShippedEmail(updated);
          await supabase
            .from('orders')
            .update({ shipped_email_sent_at: new Date().toISOString() })
            .eq('id', order.id);
          emailSent = true;
        } catch (e) {
          console.error('Shipped email failed:', e);
          emailError = 'Please check the email settings and try Resend.';
        }
      }
    }

    return json({ ok: true, emailSent, alreadySent, emailError });
  } catch (e) {
    console.error(e);
    return json({ error: 'Something went wrong.' }, 500);
  }
});
