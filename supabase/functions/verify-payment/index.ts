import { createClient } from 'npm:@supabase/supabase-js@2';
import { cors, hmacHex, json, safeEqual } from '../_shared/razorpay.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ error: 'Missing payment details.' }, 400);
    }

    const expected = await hmacHex(
      Deno.env.get('RAZORPAY_KEY_SECRET')!,
      `${razorpay_order_id}|${razorpay_payment_id}`,
    );
    if (!safeEqual(expected, String(razorpay_signature))) {
      return json({ error: 'Payment could not be verified.' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', razorpay_payment_id })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('order_number')
      .single();
    if (error || !data) return json({ error: 'Order not found.' }, 404);

    return json({ ok: true, orderNumber: data.order_number });
  } catch (e) {
    console.error(e);
    return json({ error: 'Something went wrong.' }, 500);
  }
});
