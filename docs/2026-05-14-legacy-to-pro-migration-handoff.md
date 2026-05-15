# Legacy → Pro migration handoff

**Written:** 2026-05-14, ~12:30 PM PT
**Author:** previous Claude session (briancline.co website repo, incident-response context)
**Audience:** the Pro app session/agent that owns the legacy→Pro consolidation

This document is the complete state of the world on the **website / legacy / Stripe** side as of the moment immediately before the legacy-to-Pro DB consolidation begins. Read it once before planning the cutover.

---

## 1. Why this handoff exists

A customer (Adrian Baumann) submitted the diving order form at `marine.briancline.co` overnight on 2026-05-13 and reported "doing strange things — recorded my credit card twice, but the website said it didn't go through." Triage uncovered that **the production Supabase edge function was running in Stripe TEST mode**, so every real-card submission was failing at `stripe.confirmCardSetup`. The incident is fully closed. Three fixes shipped today:

1. Cancelled Adrian's two duplicate orders.
2. Flipped `STRIPE_MODE` from `test` → `live` on the legacy Supabase project's edge function secrets.
3. Wrote (locally, not deployed) the architectural fix to move post-Stripe email sending behind the `setup_intent.succeeded` webhook.

The Pro app session now owns moving the website's order pipeline off the legacy DB and onto the Pro DB. This document captures what you need to know that isn't in the legacy DB itself or the briancline.co repo's git history.

---

## 2. Key identifiers

| Thing | Value |
|---|---|
| **Legacy Supabase project ID** | `fzygakldvvzxmahkdylq` ("SailorSkills Platform (Legacy — migrate before deleting)") |
| **Pro Supabase project ID** | `lusfrdquqqfencafhdai` ("SailorSkills Pro Production") |
| **Legacy edge function host** | `https://fzygakldvvzxmahkdylq.supabase.co/functions/v1/…` |
| **Stripe live account ID** | `acct_1BjzlUEbT3YrW03C` |
| **Stripe webhook endpoint (live, ACTIVE post-2026-05-14)** | `sailorskills-production` → `https://fzygakldvvzxmahkdylq.supabase.co/functions/v1/stripe-webhook` |
| **Stripe webhook endpoint (live, also active)** | `SailorSkills Pro - Production` → `https://pro.sailorskills.com/api/stripe/webhook` |
| **Live webhook signing secret (digest)** | `f94fd1cfc8c2878997da0cd7dcdf2f5eb8d0214b5b653c5f6583597ff3edefa4` |
| **1Password item for live webhook secret** | "Stripe Webhook - briancline.co Supabase (live)" (Personal vault, id `k735jfvyiyqbl2e7eu5oxi73qe`) |
| **1Password item for Stripe restricted live key (rk_live)** | "Sailor Skills Pro Stripe Billing Key" (Personal vault). Restricted scopes only — does NOT have `webhook_read` or `setup_intent_read`. |
| **1Password item for Stripe test sandbox** | "Stripe - Sandbox - Zinnwaldite Bridge" (item id `guliw3oeujxlycbtvlpkbjspr4`). This is a **different Stripe account** from the live one — it does not have the test-mode versions of the live account's customers. |

---

## 3. State of the legacy DB (`fzygakldvvzxmahkdylq`)

### Row counts that matter

```
customers            237
boats                212
service_orders        39   (one of which is mine from a test today — see §7)
service_schedules    120
invoices            1858   (substantial billing history)
payments             282
service_logs        1267
marinas               45
addresses              0   (used by create-payment-intent but always empty? worth verifying)
business_pricing_config 22
```

### Schema columns on `service_orders`

```
id, order_number, customer_id, boat_id, marina_id, dock, slip_number,
service_type, service_interval, estimated_amount, final_amount,
stripe_payment_intent_id, status, notes, created_at, scheduled_date,
completed_at, service_details, metadata, updated_at,
confirmation_email_sent_at, confirmation_email_log_id,
decline_reason, declined_at, declined_by, decline_notes,
customer_notified, is_test, created_by, updated_by, requires_review
```

`service_orders_status_check` constraint accepts only: `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`. (`declined` is **not** allowed despite the existence of `decline_reason` / `declined_at` columns — those are auxiliary fields on a `cancelled` row.)

### Notable: columns the *deployed* webhook v50 writes that DO NOT EXIST on `service_orders`

The deployed `stripe-webhook` v50 does `service_orders.update({ stripe_payment_method_id, payment_status: 'authorized' })`. **Neither column exists** on the legacy table. The PostgREST update silently no-ops on unknown columns (or errors and the v50 handler swallows it; either way, those values never get persisted in legacy). Confirmed empirically: my own test order today succeeded end-to-end on Stripe but `stripe_payment_intent_id` and `confirmation_email_sent_at` are NULL in the legacy row.

**Implication for migration:** if Pro DB has `stripe_payment_method_id` and `payment_status` columns on its order analog, those columns will start getting populated correctly the moment the function is deployed against Pro.

### `business_pricing_config` snapshot (relevant rows)

| `config_key` | `config_value` |
|---|---|
| `recurring_cleaning_rate` | `4.50` |
| `onetime_cleaning_rate` | `6.00` |
| `minimum_service_charge` | **`150.00`** |
| `anodes_only_rate` | `150.00` |
| `item_recovery_rate` | `200.00` |
| `propeller_service_rate` | `350.00` |
| `underwater_inspection_rate` | `4.00` |

⚠ The `minimum_service_charge` value of `$150` is **higher than the deployed frontend's hardcoded `RATES.minimum: 99.00`** in `src/services/lib/diving-calculator.js`. This silently rejects every boat shorter than ~33 ft at the recurring rate. Adrian's 32-ft boat got through only because surcharges pushed her estimate above $150. **Fix shipped locally (uncommitted) today** — see §6.

---

## 4. State of Stripe (account `acct_1BjzlUEbT3YrW03C`)

### Webhook endpoints (live)

| Endpoint | Status | Notes |
|---|---|---|
| `sailorskills-production` → legacy Supabase | **Active** (re-enabled 2026-05-14 during incident) | This is the one the website's `create-payment-intent` relies on. Listens to `setup_intent.succeeded`, `payment_intent.succeeded`, `charge.succeeded`, `charge.refunded`. Has 5 historical failed `charge.succeeded` deliveries from May 1–2 with 500 errors — unrelated bug in legacy webhook's `generate_invoice_number` RPC; see §10. |
| `SailorSkills Pro - Production` → `pro.sailorskills.com/api/stripe/webhook` | Active | Pro app's own webhook handler. Stripe fans events to both endpoints. |
| `needs-are-normal` → external | Disabled | Unrelated project. |

### Customers / payment methods to be aware of

| Customer | Stripe ID | Mode | Notes |
|---|---|---|---|
| Adrian Baumann (`adrianrfb@gmail.com`) | `cus_UVvZwlAzdPvvW0` | **TEST** | Artifact of the bug. The legacy `customers.stripe_customer_id` field for her row still holds this test-mode ID. **Must be NULLed before/during migration** or the edge function's "customer not in this mode, create new" branch will keep creating fresh live customers each future attempt. |
| Brian Cline (`standardhuman@gmail.com`) | `cus_TH1QhKmcwCWZ1Y` | LIVE | Has **10 cards attached, all Visa ····3980** (one per past test submission — no de-dup logic in the deployed webhook). The default payment method (`pm_1TX4egEbT3YrW03CPbIjCpal`) was just set today by today's test, proving the live webhook chain works end-to-end. Other 9 cards are detachment candidates whenever you feel like cleaning up. |

There may be additional customers in legacy DB whose `stripe_customer_id` is a test-mode ID from the incident window. Audit query:

```sql
SELECT id, email, stripe_customer_id, created_at
FROM customers
WHERE stripe_customer_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 50;
```

Then for each non-null ID, you can verify mode against Stripe before migrating that row.

### Supabase secrets currently on legacy project (digests)

```
STRIPE_MODE                 247610f4… = sha256("live")
STRIPE_WEBHOOK_SECRET       f94fd1cfc8… (live signing secret for sailorskills-production endpoint)
STRIPE_SECRET_KEY           33bd2df2…  (= STRIPE_SECRET_KEY_LIVE, same digest)
STRIPE_SECRET_KEY_LIVE      33bd2df2…
STRIPE_SECRET_KEY_TEST      e84cfb92…
STRIPE_PUBLISHABLE_KEY_LIVE 6838740b…
STRIPE_PUBLISHABLE_KEY_TEST dadcc2ff…
RESEND_API_KEY              87bfa583…
ADMIN_EMAILS                7d5a4225… (currently `standardhuman@gmail.com` per default)
EMAIL_FROM_ADDRESS          27fc0552… (currently `Brian Cline <diving@briancline.co>` per default)
EMAIL_BCC_ADDRESS           7d5a4225… (same digest as ADMIN_EMAILS — probably same value)
```

**The Pro project's edge function secrets must match these (at minimum `STRIPE_MODE=live`, `STRIPE_SECRET_KEY_LIVE`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `ADMIN_EMAILS`) before the cutover, or the function silently breaks one of: card processing, webhook signature validation, email delivery.** Easiest: copy them via `supabase secrets list --project-ref fzygakldvvzxmahkdylq` + `supabase secrets set --project-ref lusfrdquqqfencafhdai`.

---

## 5. State of the website frontend (this repo)

### Deployed

- Hosted on Vercel (per `vercel.json` and `package.json`).
- `VITE_SUPABASE_URL` env var points at the legacy project (`fzygakldvvzxmahkdylq.supabase.co`).
- Frontend code path for the order form: `src/services/pages/DivingOrder.jsx` → POST to `${VITE_SUPABASE_URL}/functions/v1/create-payment-intent` and GET `${VITE_SUPABASE_URL}/functions/v1/get-stripe-config`.

### Uncommitted local changes (as of 2026-05-14 12:30 PT)

```
M src/services/App.jsx                              ← chargeback hardening, predates today
M src/services/components/ServiceFooter.jsx          ← footer legal links, predates today
M src/services/pages/DivingOrder.jsx                ← full rewrite: Turnstile + ZIP allowlist + typed-name + dual checkboxes + missing-fields callout + auth block. Predates today.
M src/services/lib/diving-calculator.js              ← TODAY: bumped RATES.minimum 99 → 150 to match DB
?? src/services/components/Markdown.jsx              ← predates today
?? src/services/pages/RecurringAuthorization.jsx     ← predates today
?? src/services/pages/Terms.jsx                      ← predates today
?? src/services/pages/legal/…                        ← predates today
?? supabase/                                         ← predates today, contains migration + new edge functions
```

**The diving-calculator.js minimum bump is the only piece safe to ship independently of the migration.** Everything else (`DivingOrder.jsx`, the `supabase/` folder contents) is the chargeback-hardening bundle, tightly coupled to the unapplied `20260429_chargeback_hardening.sql` migration AND to the local-only architectural fix to `create-payment-intent` and `stripe-webhook` (see §6).

---

## 6. Uncommitted edge-function code targeting the chargeback-hardening world

Two files in `supabase/functions/` that are the local-only architectural fix written during today's incident:

### `supabase/functions/create-payment-intent/index.ts`

Differences vs. deployed v90:
- Adds full Cloudflare Turnstile + honeypot + IP rate limiting + email rate limiting.
- Adds lead-quality validation (boat type, marina allowlist, ZIP).
- Adds `authorization` block validation (typed name match, terms version exists, dual checkbox).
- Writes to **new tables** `order_authorizations` and `payment_methods` (created by `20260429_chargeback_hardening.sql`).
- Writes to **new columns** on `service_orders`: `stripe_setup_intent_id`, `stripe_customer_id`, `stripe_payment_method_id`, `order_authorization_id`.
- **Today's architectural change**: removed the inline Resend init and the pre-Stripe email send block. Now the function only creates the order + SetupIntent and returns. Emails are sent by the webhook.

### `supabase/functions/stripe-webhook/index.ts`

Differences vs. deployed v50:
- Reads `STRIPE_WEBHOOK_SECRET_{LIVE,TEST}` (mode-specific) instead of single `STRIPE_WEBHOOK_SECRET`. **If you deploy this without first adding `STRIPE_WEBHOOK_SECRET_LIVE` to the function secrets, signature validation breaks.**
- `handleSetupIntentSucceeded` now also: upserts a `payment_methods` row, backfills the `order_authorizations` row, flips `customers.auto_charge_enabled` for recurring orders.
- **Today's architectural change**: at the end of the handler, does an atomic claim-and-fetch `UPDATE service_orders SET stripe_payment_method_id, confirmation_email_sent_at = NOW() WHERE id = … AND confirmation_email_sent_at IS NULL RETURNING (joined row)`. If the row comes back, sends the customer + admin Resend emails. If not, idempotent skip on retry. Wrapped in non-fatal try/catch so an email outage doesn't cause Stripe to retry the webhook.

### Migration script `supabase/migrations/20260429_chargeback_hardening.sql`

Adds:
- `order_authorizations` table (chargeback evidence rows)
- `payment_methods` table (already exists in Pro DB — schema may differ)
- `terms_documents` table (versioned terms-of-service rows)
- Adds 4 columns to `service_orders`: `stripe_setup_intent_id`, `stripe_customer_id`, `stripe_payment_method_id`, `order_authorization_id`
- Adds 3 columns to `customers`: `auto_charge_enabled`, `auto_charge_enabled_at`, `auto_charge_disabled_at`, `auto_charge_disabled_reason`

**Rewrite consideration for Pro DB:** `payment_methods` already exists in Pro. The Pro app may not need this migration at all if its schema already covers these cases. The Pro session needs to decide what fragments of this migration apply.

---

## 7. Specific rows in legacy DB to handle thoughtfully

### Adrian's two cancelled orders

```sql
SELECT id, order_number, status, decline_reason, decline_notes, declined_at
FROM service_orders
WHERE id IN (
  'b8edc47d-4acb-4c79-b08a-b1d920bc7c01',  -- ORD-1778743812873-PK99U
  '30f1dec8-e56c-4c48-bc6b-348d93111609'   -- ORD-1778743922265-7OXPP
);
```

Status: `cancelled`, `decline_reason: 'duplicate-from-stripe-test-mode-bug'`. **Migrate as-is, preserving the audit trail.** Adrian may still contact Brian about these; the explanatory text in `decline_notes` is the record.

### Adrian's `customers` row

```sql
SELECT * FROM customers WHERE email = 'adrianrfb@gmail.com';
```

Critical: her `stripe_customer_id` is `cus_UVvZwlAzdPvvW0` which is a TEST mode ID (see §4). **Set to NULL on migration.** Brian will text her separately to invite a resubmission; the edge function will create a fresh live Stripe customer on her next submit.

### Brian's test order from today (2026-05-14)

```sql
SELECT * FROM service_orders WHERE order_number = 'ORD-1778785845216-WBEO6';
```

- `id`: `78109455-cdca-4ef4-aa99-dfdb04597eb1`
- `status`: `pending`
- Boat: "Test name", 40ft
- $180 quarterly Cleaning & Anodes

This is a real card-on-file with a real Stripe customer (`cus_TH1QhKmcwCWZ1Y`) and a real default payment method attached. Brian explicitly opted not to cancel it during today's session, but it's also not a real customer order. Either: cancel it before migrating, or migrate and let Brian handle later.

---

## 8. Cutover ordering — what MUST happen in what sequence

The cutover has hard ordering constraints because there are three independently-deployed components calling each other:

```
Stripe ──webhook──▶ Legacy edge function ──reads/writes──▶ Legacy DB
                          ▲
                          │ POST /create-payment-intent
                          │ GET /get-stripe-config
                          │
                Frontend (marine.briancline.co)
```

The Pro-side cutover means swapping the "Legacy edge function" and "Legacy DB" boxes for their Pro equivalents. To avoid a window where two of those three components are inconsistent, the **safe order** is:

1. **Pre-flight on Pro side** (no customer impact):
   - Apply whatever schema migration Pro needs to receive website-form orders (or confirm it already has).
   - Copy all Supabase secrets from legacy project to Pro project. Verify with digest match. `STRIPE_MODE`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY_LIVE` are non-negotiable.
   - Deploy `create-payment-intent`, `get-stripe-config`, and `stripe-webhook` to Pro project (whatever versions you decide — likely the new chargeback-hardening ones, possibly with Pro-schema adjustments).
   - Smoke-test the new function URL directly with curl + a fake payload; verify it returns 400 with a recognizable validation error (not 500 with "missing secret").
2. **Data migration** (legacy → Pro). Owned by the Pro session.
3. **Cutover** (atomic-ish, customer-affecting):
   - **Repoint Stripe webhook endpoint** `sailorskills-production` to the Pro project's function URL (or create a new endpoint and disable the legacy one — but using the same endpoint preserves event history). The same signing secret should keep working IF you set it identically on the Pro project secrets in step 1.
   - **Update `VITE_SUPABASE_URL`** in the frontend's Vercel env vars to the Pro project URL.
   - **Trigger a Vercel redeploy** of the website (`vercel deploy --prod` or git push depending on the deployment trigger).
   - **Verify** with a real test submission to `marine.briancline.co` end-to-end: success page, customer email, admin email, new live Stripe customer with attached card and set-as-default PM, new row in Pro `service_orders` (or equivalent) populated with `stripe_payment_method_id`.
4. **Decommission legacy** (only after verification):
   - Disable the legacy `create-payment-intent` function (set status=inactive in Supabase, or delete).
   - Keep the legacy project alive at minimum until you've confirmed no remaining systems read from it (Pro app may still query legacy for historical invoices/service_logs during transition).
   - Eventually delete the legacy project once the Pro session signs off.

The window of risk in this ordering is between **3a (Stripe webhook repoint)** and **3c (frontend redeploy completion)** — during that window, the frontend is still hitting legacy URLs but Stripe is delivering to Pro. New live customer submissions in that window create orders in legacy that never get their `setup_intent.succeeded` webhook landed in legacy (because Stripe sends to Pro now). Mitigate by either: scheduling the cutover during low-traffic hours, or temporarily putting the form behind a maintenance message during the swap (~5 min window).

---

## 9. What to verify after cutover

Run these as a sanity checklist:

```sql
-- Pro DB: new test order landed with all the right joins
SELECT order_number, status, estimated_amount, stripe_payment_method_id IS NOT NULL AS has_pm,
       confirmation_email_sent_at IS NOT NULL AS emails_sent
FROM <pro-orders-table>
WHERE created_at >= NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC LIMIT 3;

-- Pro DB: no test-mode customer IDs lurking
SELECT id, email, stripe_customer_id
FROM customers
WHERE stripe_customer_id ~ '^cus_[A-Za-z0-9]{14}$';  -- crude heuristic; legacy-era 14-char IDs are suspect

-- Stripe: latest customer was created in live mode and has at least one card + default
-- (use the curl approach with rk_live restricted key from 1Password, or the Stripe MCP if Pro session has it loaded)
```

Watch the **Stripe dashboard → Webhooks → sailorskills-production → Event deliveries** tab for ~30 minutes after cutover. Any `setup_intent.succeeded` events returning 4xx/5xx mean the new function is misconfigured.

---

## 10. Loose ends to schedule (after migration, not blocking)

- **Buggy `charge.succeeded` handler in deployed v50 webhook** — fails with 500 because it calls `supabase.rpc('generate_invoice_number')` which probably doesn't exist on legacy DB. Five failed deliveries logged May 1–2. Fix or remove that handler in the new Pro deployment.
- **No de-dup on payment-method attach** — every successful SetupIntent attaches a new pm to the customer, so repeat customers accumulate duplicates (Brian has 10 cards on his Stripe customer, all the same Visa). Add a check in the new webhook: before completing, list existing PMs on the customer, detach prior cards if they match brand + last4 + fingerprint.
- **Resend-from-create-payment-intent → resend-from-webhook architectural fix** — the *local* `create-payment-intent` and `stripe-webhook` files in `supabase/functions/` already implement this. Carry it forward into whatever Pro deploys.
- **Frontend `RATES.minimum` bump** — local uncommitted, 99 → 150. Commit + deploy alongside the cutover frontend redeploy.
- **The 9 stale payment methods on Brian's `cus_TH1QhKmcwCWZ1Y`** — Brian declined to clean these up today. Whenever convenient.
- **`get-stripe-config` function** — version 32 deployed, entrypoint is at `…/sailorskills-inventory/shared/…` (per `list_edge_functions` output) — confirms this function originated in a different repo. Worth tracing where it lives now and how to redeploy it against the Pro project.

---

## 11. Reference: useful commands during cutover

```bash
# Compare Supabase secrets between projects (digest-only, safe to print)
supabase secrets list --project-ref fzygakldvvzxmahkdylq
supabase secrets list --project-ref lusfrdquqqfencafhdai

# Copy one secret across projects without exposing the value
SUPABASE_ACCESS_TOKEN=... supabase secrets set STRIPE_MODE=live --project-ref lusfrdquqqfencafhdai

# Verify Stripe webhook signing secret matches what's in Supabase
op item get k735jfvyiyqbl2e7eu5oxi73qe --fields "credential" --reveal | tr -d '\n' | shasum -a 256

# Stripe customer lookup (live, using rk_live restricted key)
SK=$(op read "op://Personal/Sailor Skills Pro Stripe Billing Key/password")
curl -sS https://api.stripe.com/v1/customers/<cus_id> -u "$SK:"
# Note: rk_live does NOT have setup_intent_read or webhook scopes.
# For those, use the Stripe dashboard or have the user paste the value via op.
```

---

## 12. What I (the prior session) am NOT carrying forward

- I have not seen the Pro app's source code.
- I have not seen Pro DB's full schema (only `list_tables` summary — column-level details unknown to me).
- I have not seen the "join Pro's unmatched rows against legacy" plan; the Pro session owns that.
- I have not decided where the diving-order edge functions should live post-cutover (Pro project vs. dedicated new project) — the Pro session owns that.

Everything above is verified true as of the timestamp at the top of this file. If the Pro session finds anything I got wrong, the legacy DB and Stripe dashboard are the authoritative sources — trust them over this doc.

Good luck.
