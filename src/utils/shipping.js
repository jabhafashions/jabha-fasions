// Change these to the shop's real charges.
// IMPORTANT: also change the same two numbers at the top of
// supabase/functions/create-order/index.ts (the server is what actually charges).
export const SHIPPING_FEE = 80;
export const FREE_SHIPPING_ABOVE = 2000;

export const calcShipping = (subtotal) =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;

export const formatINR = (n) => `\u20B9${Number(n).toLocaleString('en-IN')}`;
