# Add 3-D Secure (SCA) to card payments

European cards require 3-D Secure. Authorize.Net does not perform 3DS itself — it accepts the
result of an authentication done by CardinalCommerce (Cardinal Cruise). So this is two jobs:
one you do with your payment processor, one I do in the app.

## Part 1 — What you have to get (I cannot do this)

Cardinal credentials are issued by CardinalCommerce during merchant onboarding, not from the
Authorize.Net dashboard. To get them:

1. Contact Authorize.Net / your merchant service provider (or reseller) and ask to be
   **enabled for 3-D Secure / Payer Authentication via Cardinal Cruise (CCA)**.
2. Your acquirer must also register you with the card schemes for Verified by Visa /
   Mastercard SecureCode (EMV 3DS).
3. Cardinal onboarding then gives you SSO credentials in the Cardinal Centinel portal:
   - **Org Unit Id** (GUID)
   - **API Key Identifier** (GUID)
   - **API Key Secret**
   - Sandbox equivalents for testing

When you have those four values, I store them as backend secrets — never in code.

## Part 2 — What I build once the credentials exist

Flow: card entered → Cardinal authenticates the cardholder (bank challenge if required) →
Accept.js token + authentication result sent to our backend → Authorize.Net charge includes
the authentication data.

- **New edge function `cardinal-jwt`** — signs the Cardinal Cruise JWT server-side with the
  API key secret (never exposed to the browser) and returns it to the card form.
- **`src/components/payments/AuthorizeNetCardForm.tsx`** — load Cardinal Cruise Songbird,
  init with the JWT, run `cca_continue` / device data collection, handle the bank challenge
  iframe, and only tokenise + submit after Cardinal returns a result. Pass `eci`, `cavv`,
  `dsTransId` and the auth status alongside the opaque data.
- **`supabase/functions/_shared/authnet.ts`** — populate the already-whitelisted
  `cardholderAuthentication` block (authentication indicator from ECI, CAVV value), plus
  the 3DS version / DS transaction id fields Authorize.Net expects.
- **`authnet-charge`, `authnet-plan-charge`, `consultation-pay`, `retreat-checkout`,
  `wce-retreat-checkout`** — accept and forward the authentication fields.
- **`plan-autobill`** — recurring instalments are merchant-initiated, so they carry the
  original transaction's 3DS reference rather than a new challenge. Frequency/exemption
  handling documented in the function.
- **Failure handling** — if Cardinal returns "failed" or "unavailable", block the charge
  with a clear message rather than sending an unauthenticated transaction that the issuer
  will decline.

## Part 3 — The $1,227.60 plan in the meantime

3DS is mandatory for that customer's card, so the payment cannot be completed on the current
setup. Until Cardinal is live, the practical options are a bank transfer or an invoice paid
through a provider that already does SCA. I will not add an instalment-splitting workaround,
since splitting does not remove the SCA requirement.

## Technical notes

- Cardinal Cruise reference: Authorize.Net's own `accept-sample-app` includes a
  `README-CardinalCruise.md` integration walkthrough that matches this design.
- Secrets to add later: `CARDINAL_ORG_UNIT_ID`, `CARDINAL_API_KEY_ID`,
  `CARDINAL_API_KEY_SECRET`, `CARDINAL_ENV` (sandbox/production).
- Testing uses Cardinal sandbox cards for frictionless, challenge, and failed-auth paths
  before switching `CARDINAL_ENV` to production.

Approve this and I will build Part 2 up to the point where it needs the real credentials
(edge function, form flow, gateway fields), so it goes live the moment Cardinal issues them.
