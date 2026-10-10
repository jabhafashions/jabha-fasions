// Safety net: if a customer pays and then closes the tab before verify-payment
// runs, Razorpay still calls this and the order gets marked paid (and emailed).
// Deploy with --no-verify-jwt (Razorpay does not send a Supabase token).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { hmacHex, safeEqual } from '../_shared/razorpay.ts';
import { markPaidAndNotify } from '../_shared/notify.ts';

Deno.serve(async (req) => {
  const raw = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  const expected = await hmacHex(Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!, raw);
  if (!safeEqual(expected, signature)) return new Response('Invalid signature', { status: 400 });

  const event = JSON.parse(raw);
  const payment = event?.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  if (!razorpayOrderId) return new Response('ok');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    await markPaidAndNotify(supabase, razorpayOrderId, payment.id);
  } else if (event.event === 'payment.failed') {
    // only if it hasn't already been paid (customers can retry on the same order)
    await supabase
      .from('orders')
      .update({ payment_status: 'failed' })
      .eq('razorpay_order_id', razorpayOrderId)
      .eq('payment_status', 'pending');
  }

  return new Response('ok');
});
