### 1. Swap the PayPal Client ID
Replace the hardcoded LIVE Client ID in `src/lib/paypal.ts` with the new ID you provided.

### 2. Store the new PayPal Client Secret
Add `PAYPAL_CLIENT_SECRET` as a runtime secret via the secrets tool so it is available to edge functions if/when server-side verification is added later.

### 3. Keep existing checkout flow
No changes to the `paypal-checkout` or `retreat-checkout` edge functions — they will continue trusting the client-provided capture ID and amount as they do today.

---

**New Client ID received:** `ARA5I0pb-Sr8CDj3wiliKf-qILV9wMuX0YRNaBFbBsVld88v2CWs2ILHegOPuLfizo2G-czuNEyHje0L`
**Environment:** LIVE
**Server-side verification:** Not included (per your request)