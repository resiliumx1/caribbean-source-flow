## Plan

The order is being created successfully, but the external WooCommerce payment page is loading inside Lovable’s preview iframe. `mountkailashslu.com` blocks iframe embedding, so the preview shows “refused to connect.”

### What I’ll change
1. Update the checkout redirect to open the WooCommerce payment URL in the top-level browser context instead of inside the preview iframe.
2. Keep the existing successful order creation flow and return URL unchanged.
3. Add a safe fallback so if top-level navigation is blocked by the browser, the payment page opens in a new tab.

### Technical details
- File: `src/pages/Checkout.tsx`
- Replace `window.location.href = result.payment_url` with a top-window redirect pattern, falling back to `window.open(result.payment_url, "_blank", "noopener,noreferrer")`.
- No backend or WooCommerce credential changes are needed.