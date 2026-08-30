import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  splitName,
  type OpaqueData,
} from "../_shared/authnet.ts";
import { requireAdmin, serviceClient } from "../_shared/admin-auth.ts";

type Body = {
  action: "setup" | "cancel" | "sync";
  planId?: string;
  scheduleId?: string;
  amount?: number;
  cadence?: "weekly" | "biweekly" | "monthly";
  startDate?: string;         // YYYY-MM-DD
  opaqueData?: OpaqueData;
  cardholderName?: string;
  billingZip?: string;
  email?: string;
};

const CADENCE: Record<string, { length: number; unit: "days" | "months" }> = {
  weekly: { length: 7, unit: "days" },
  biweekly: { length: 14, unit: "days" },
  monthly: { length: 1, unit: "months" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = (await req.json()) as Body;
    const svc = serviceClient();

    // ------------------------------------------------ setup (customer-facing)
    if (body.action === "setup") {
      if (!body.planId || !body.opaqueData?.dataValue) {
        return json({ error: "Missing plan or payment details." }, 400);
      }
      const billingZip = String(body.billingZip ?? "").trim();
      if (!billingZip) return json({ error: "Billing zip / postal code is required." }, 400);
      const cadence = CADENCE[body.cadence ?? "monthly"];
      if (!cadence) return json({ error: "Invalid payment frequency." }, 400);

      const { data: plan } = await svc
        .from("payment_plans").select("*").eq("id", body.planId).maybeSingle();
      if (!plan || plan.archived_at) return json({ error: "Plan not found." }, 404);
      if (plan.status !== "active") return json({ error: "This plan is not active." }, 400);

      const remaining = Number(plan.balance_remaining);
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) {
        return json({ error: "Invalid instalment amount." }, 400);
      }
      const occurrences = Math.max(1, Math.ceil(remaining / amount));

      const { data: existing } = await svc
        .from("plan_billing_schedules")
        .select("id").eq("plan_id", plan.id).eq("status", "active").maybeSingle();
      if (existing) return json({ error: "Automatic payments are already set up for this plan." }, 400);

      const today = new Date();
      today.setUTCDate(today.getUTCDate() + 1);
      const startDate = body.startDate || today.toISOString().slice(0, 10);
      const { firstName, lastName } = splitName(body.cardholderName || plan.customer_name);

      const subscriptionId = await createSubscription({
        name: `MKRC ${plan.package_name}`.slice(0, 50),
        amount,
        intervalLength: cadence.length,
        intervalUnit: cadence.unit,
        startDate,
        totalOccurrences: occurrences,
        opaqueData: body.opaqueData,
        firstName,
        lastName,
        zip: billingZip.slice(0, 20),
        email: (body.email || plan.customer_email || "").toLowerCase().trim() || undefined,
      });

      const { data: schedule } = await svc.from("plan_billing_schedules").insert({
        plan_id: plan.id,
        amount,
        cadence: body.cadence ?? "monthly",
        status: "active",
        next_run_date: startDate,
        authnet_subscription_id: subscriptionId,
      }).select().single();

      await svc.from("payment_plan_audit").insert({
        plan_id: plan.id,
        action: "autopay_enabled",
        changes: { amount, cadence: body.cadence ?? "monthly", startDate, occurrences },
        actor_email: plan.customer_email,
      });

      return json({ success: true, schedule });
    }

    // ------------------------------------------------ admin-only actions
    const admin = await requireAdmin(req);

    if (body.action === "cancel") {
      if (!body.scheduleId) return json({ error: "scheduleId required" }, 400);
      const { data: schedule } = await svc
        .from("plan_billing_schedules").select("*").eq("id", body.scheduleId).maybeSingle();
      if (!schedule) return json({ error: "Schedule not found." }, 404);

      if (schedule.authnet_subscription_id) {
        try {
          await cancelSubscription(schedule.authnet_subscription_id);
        } catch (e) {
          console.error("ARB cancel warning:", (e as Error).message);
        }
      }
      await svc.from("plan_billing_schedules")
        .update({ status: "cancelled", next_run_date: null }).eq("id", schedule.id);

      await svc.from("payment_plan_audit").insert({
        plan_id: schedule.plan_id,
        action: "autopay_cancelled",
        changes: { schedule_id: schedule.id },
        actor_id: admin.id,
        actor_email: admin.email,
      });
      return json({ success: true });
    }

    if (body.action === "sync") {
      if (!body.scheduleId) return json({ error: "scheduleId required" }, 400);
      const { data: schedule } = await svc
        .from("plan_billing_schedules").select("*").eq("id", body.scheduleId).maybeSingle();
      if (!schedule?.authnet_subscription_id) return json({ error: "Nothing to sync." }, 400);

      const status = await getSubscriptionStatus(schedule.authnet_subscription_id);
      const sub = status?.subscription;
      const txs: any[] = sub?.arbTransactions?.arbTransaction
        ? [].concat(sub.arbTransactions.arbTransaction)
        : [];

      let recorded = 0;
      for (const tx of txs) {
        const transId = String(tx?.transId ?? "");
        if (!transId || String(tx?.responseCode ?? "") !== "1") continue;

        const { data: seen } = await svc
          .from("payments").select("id").eq("paypal_capture_id", transId).maybeSingle();
        if (seen) continue;

        await svc.from("payments").insert({
          plan_id: schedule.plan_id,
          amount: Number(schedule.amount),
          paypal_capture_id: transId,
          type: "payment",
          status: "succeeded",
          reason: "Automatic instalment",
        });
        await svc.rpc("apply_payment", { p_plan_id: schedule.plan_id, p_amount: Number(schedule.amount) });
        recorded++;
      }

      await svc.from("plan_billing_schedules").update({
        last_run_at: new Date().toISOString(),
        status: sub?.status === "canceled" || sub?.status === "terminated" ? "cancelled"
          : sub?.status === "expired" ? "completed" : schedule.status,
      }).eq("id", schedule.id);

      return json({ success: true, recorded, providerStatus: sub?.status ?? "unknown" });
    }

    return json({ error: "Unsupported action." }, 400);
  } catch (err) {
    const message = (err as Error).message || "Request failed.";
    console.error("plan-autobill error:", message);
    const status = /authenticated|Admin access/i.test(message) ? 401 : 400;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
