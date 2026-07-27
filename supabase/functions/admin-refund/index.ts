import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { refundOrVoid } from "../_shared/authnet.ts";
import { requireAdmin, serviceClient } from "../_shared/admin-auth.ts";

type Body = {
  scope: "plan_payment" | "order";
  paymentId?: string;   // payments.id (plan payment)
  orderId?: string;     // orders.id
  amount: number;
  reason: string;
  adminNote?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const admin = await requireAdmin(req);
    const body = (await req.json()) as Body;

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) return json({ error: "Enter a valid refund amount." }, 400);
    if (!body.reason || body.reason.trim().length < 3) {
      return json({ error: "A refund reason is required." }, 400);
    }
    const reason = body.reason.trim().slice(0, 500);
    const svc = serviceClient();

    // ---------------- Plan payment refund ----------------
    if (body.scope === "plan_payment") {
      if (!body.paymentId) return json({ error: "paymentId required" }, 400);

      const { data: payment, error: pErr } = await svc
        .from("payments").select("*").eq("id", body.paymentId).maybeSingle();
      if (pErr) throw pErr;
      if (!payment) return json({ error: "Payment not found." }, 404);
      if (payment.type !== "payment") return json({ error: "Only original payments can be refunded." }, 400);

      const alreadyRefunded = Number(payment.refunded_amount ?? 0);
      const refundable = +(Number(payment.amount) - alreadyRefunded).toFixed(2);
      if (amount > refundable + 0.001) {
        return json({ error: `Only $${refundable.toFixed(2)} is left to refund on this payment.` }, 400);
      }

      const result = await refundOrVoid({
        transId: payment.paypal_capture_id,
        amount,
        cardLast4: payment.card_last4 ?? undefined,
      });
      const applied = result.kind === "void" ? refundable : amount;

      await svc.from("payments").insert({
        plan_id: payment.plan_id,
        amount: applied,
        paypal_capture_id: result.transId || `${result.kind}-${payment.paypal_capture_id}-${Date.now()}`,
        type: result.kind === "void" ? "void" : "refund",
        status: "succeeded",
        parent_payment_id: payment.id,
        reason,
        admin_note: body.adminNote?.slice(0, 1000) ?? null,
        card_last4: result.cardLast4 ?? payment.card_last4,
        card_type: result.cardType ?? payment.card_type,
        created_by: admin.id,
      });

      await svc.from("payments")
        .update({ refunded_amount: +(alreadyRefunded + applied).toFixed(2) })
        .eq("id", payment.id);

      const { data: plan, error: rpcErr } = await svc.rpc("apply_plan_refund", {
        p_plan_id: payment.plan_id,
        p_amount: applied,
      });
      if (rpcErr) throw rpcErr;

      await svc.from("payment_plan_audit").insert({
        plan_id: payment.plan_id,
        action: result.kind === "void" ? "payment_voided" : "payment_refunded",
        changes: { payment_id: payment.id, amount: applied, reason, transaction_id: result.transId },
        actor_id: admin.id,
        actor_email: admin.email,
      });

      return json({
        success: true,
        kind: result.kind,
        amount: applied,
        transactionId: result.transId,
        plan: Array.isArray(plan) ? plan[0] : plan,
      });
    }

    // ---------------- Order refund ----------------
    if (body.scope === "order") {
      if (!body.orderId) return json({ error: "orderId required" }, 400);

      const { data: order, error: oErr } = await svc
        .from("orders").select("*").eq("id", body.orderId).maybeSingle();
      if (oErr) throw oErr;
      if (!order) return json({ error: "Order not found." }, 404);
      if (!order.payment_transaction_id) {
        return json({ error: "This order has no payment transaction to refund." }, 400);
      }

      const alreadyRefunded = Number(order.refunded_usd ?? 0);
      const refundable = +(Number(order.total_usd) - alreadyRefunded).toFixed(2);
      if (amount > refundable + 0.001) {
        return json({ error: `Only $${refundable.toFixed(2)} is left to refund on this order.` }, 400);
      }

      const result = await refundOrVoid({
        transId: order.payment_transaction_id,
        amount,
      });
      const applied = result.kind === "void" ? refundable : amount;
      const newTotalRefunded = +(alreadyRefunded + applied).toFixed(2);

      await svc.from("order_refunds").insert({
        order_id: order.id,
        amount_usd: applied,
        reason,
        admin_note: body.adminNote?.slice(0, 1000) ?? null,
        transaction_id: order.payment_transaction_id,
        refund_transaction_id: result.transId,
        kind: result.kind,
        status: "succeeded",
        created_by: admin.id,
      });

      await svc.from("orders").update({
        refunded_usd: newTotalRefunded,
        payment_status: newTotalRefunded >= Number(order.total_usd) - 0.001 ? "refunded" : "partially_refunded",
        status: newTotalRefunded >= Number(order.total_usd) - 0.001 ? "cancelled" : order.status,
      }).eq("id", order.id);

      return json({
        success: true,
        kind: result.kind,
        amount: applied,
        transactionId: result.transId,
        totalRefunded: newTotalRefunded,
      });
    }

    return json({ error: "Unsupported refund scope." }, 400);
  } catch (err) {
    const message = (err as Error).message || "Refund failed.";
    console.error("admin-refund error:", message);
    const status = /authenticated|Admin access/i.test(message) ? 401 : 400;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
