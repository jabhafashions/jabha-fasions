import { createClient } from 'npm:@supabase/supabase-js@2';
import { cors, json } from '../_shared/razorpay.ts';

// Keep these in sync with src/utils/shipping.js
const SHIPPING_FEE = 80;
const FREE_SHIPPING_ABOVE = 2000;
const MAX_QTY = 10;

const PHONE = /^[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PIN = /^\d{6}$/;
const clean = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json();
    const c = body.customer ?? {};
    const customer = {
      name: clean(c.name, 100),
      phone: clean(c.phone, 20).replace(/\D/g, '').slice(-10),
      email: clean(c.email, 120).toLowerCase(),
      address: clean(c.address, 300),
      city: clean(c.city, 80),
      state: clean(c.state, 80),
      pincode: clean(c.pincode, 6),
      notes: clean(c.notes, 300),
    };

    if (
      !customer.name || !customer.address || !customer.city || !customer.state ||
      !PHONE.test(customer.phone) || !EMAIL.test(customer.email) || !PIN.test(customer.pincode)
    ) {
      return json({ error: 'Please check your contact and address details.' }, 400);
    }

    const rawItems = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
    if (rawItems.length === 0) return json({ error: 'Your cart is empty.' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Prices ALWAYS come from the database, never from the browser.
    const ids = [...new Set(rawItems.map((i: any) => i.productId))];
    const { data: products, error: pErr } = await supabase
      .from('products')
      .select('id, name, price, variants')
      .in('id', ids);
    if (pErr || !products) return json({ error: 'Could not load products.' }, 500);

    const lines: any[] = [];
    for (const it of rawItems) {
      const p = products.find((x: any) => String(x.id) === String(it.productId));
      const qty = Number(it.qty);
      if (!p || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        return json({ error: 'Some items in your cart are no longer available. Please review your cart.' }, 400);
      }
      const v = Array.isArray(p.variants)
        ? p.variants.find((x: any) => x.id === it.variantId)
        : undefined;
      lines.push({
        productId: p.id,
        variantId: v?.id ?? 'default',
        name: p.name,
        color: v?.color ?? '',
        price: Number(p.price),
        qty,
      });
    }

    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;
    if (!(total >= 1)) return json({ error: 'Invalid order total.' }, 400);

    // 1) save the order as "pending"
    const { data: order, error: iErr } = await supabase
      .from('orders')
      .insert({
        customer_name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address_line: customer.address,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
        notes: customer.notes || null,
        items: lines,
        subtotal,
        shipping,
        total,
      })
      .select('id, order_number')
      .single();
    if (iErr || !order) {
      console.error(iErr);
      return json({ error: "Couldn't create your order. Please try again." }, 500);
    }

    // 2) create the matching Razorpay order (amount is in paise)
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')!;
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`${keyId}:${keySecret}`),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        currency: 'INR',
        receipt: order.order_number,
        notes: { order_id: order.id },
      }),
    });
    const rzp = await res.json();
    if (!res.ok) {
      console.error('Razorpay error', rzp);
      await supabase.from('orders').delete().eq('id', order.id);
      return json({ error: "Couldn't start the payment. Please try again." }, 502);
    }

    await supabase.from('orders').update({ razorpay_order_id: rzp.id }).eq('id', order.id);

    return json({
      orderNumber: order.order_number,
      razorpayOrderId: rzp.id,
      amount: rzp.amount,
      keyId,
    });
  } catch (e) {
    console.error(e);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
