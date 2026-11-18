/** Shipping rule: free over the threshold, otherwise a flat fee. All amounts in USD cents. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 25000;
export const FLAT_SHIPPING_CENTS = 1500;

export const calcShippingCents = (subtotalCents: number) =>
  subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : FLAT_SHIPPING_CENTS;
