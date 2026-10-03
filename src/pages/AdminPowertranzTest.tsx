import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { toast } from "sonner";

// Card numbers and expected outcomes are PowerTranz's documented staging test cases.
const TEST_CARDS = [
  { label: "Visa (approve)", pan: "4333333333332222" },
  { label: "Mastercard (approve)", pan: "5333333333332222" },
  { label: "Visa (decline test)", pan: "4012000000020121" },
];

type LogRow = {
  id: string; order_id: string; card_brand: string | null; card_last4: string | null;
  approved: boolean; iso_response_code: string | null; response_message: string | null;
  transaction_identifier: string | null; created_at: string;
};

const nextYear = String((new Date().getFullYear() + 2) % 100).padStart(2, "0");
const newOrderId = () => `MK-PTZ-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export default function AdminPowertranzTest() {
  const [form, setForm] = useState({
    cardNumber: TEST_CARDS[0].pan, expiryMonth: "12", expiryYear: nextYear, cvv: "123",
    cardholderName: "Test Cardholder", amount: "1.00", currency: "USD",
    line1: "1 Test Street", city: "Soufriere", postalCode: "00000", countryCode: "662",
    email: "info@mountkailashslu.com",
  });
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<LogRow[]>([]);
  const [last, setLast] = useState<Record<string, unknown> | null>(null);

  const loadLog = async () => {
    const { data } = await supabase.from("powertranz_test_log").select("*").order("created_at", { ascending: false }).limit(50);
    setLog((data as LogRow[]) ?? []);
  };
  useEffect(() => { loadLog(); }, []);

  const run = async (pan?: string) => {
    setBusy(true);
    const cardNumber = (pan ?? form.cardNumber).replace(/\D/g, "");
    if (pan) setForm((f) => ({ ...f, cardNumber: pan }));
    const { data, error } = await supabase.functions.invoke("powertranz-sale", {
      body: {
        amount: Number(form.amount), currency: form.currency, orderId: newOrderId(),
        cardNumber, expiryMonth: form.expiryMonth, expiryYear: form.expiryYear, cvv: form.cvv,
        cardholderName: form.cardholderName,
        billing: { firstName: "Test", lastName: "Cardholder", line1: form.line1, city: form.city,
          postalCode: form.postalCode, countryCode: form.countryCode, email: form.email },
      },
    });
    setBusy(false);
    if (error) {
      let msg = error.message;
      try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* */ }
      toast.error(msg);
    } else {
      setLast((data as Record<string, unknown>) ?? null);
      toast[data.approved ? "success" : "error"](`${data.approved ? "Approved" : "Declined"} — ISO ${data.isoResponseCode ?? "?"}`);
    }
    loadLog();
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <Helmet><title>PowerTranz Staging Test</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div>
        <h1 className="text-2xl font-semibold">PowerTranz staging test</h1>
        <p className="text-sm text-muted-foreground">Staging only. Card numbers and CVV are never stored — only brand and last 4.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TEST_CARDS.map((c) => (
          <Button key={c.pan} disabled={busy} onClick={() => run(c.pan)} variant={c.label.includes("decline") ? "outline" : "default"}>
            Run {c.label} •••• {c.pan.slice(-4)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border rounded-lg p-4">
        <div className="col-span-2"><Label>Card number</Label><Input value={form.cardNumber} onChange={set("cardNumber")} autoComplete="off" /></div>
        <div><Label>Exp MM</Label><Input value={form.expiryMonth} onChange={set("expiryMonth")} /></div>
        <div><Label>Exp YY</Label><Input value={form.expiryYear} onChange={set("expiryYear")} /></div>
        <div><Label>CVV</Label><Input value={form.cvv} onChange={set("cvv")} autoComplete="off" /></div>
        <div className="col-span-2"><Label>Cardholder</Label><Input value={form.cardholderName} onChange={set("cardholderName")} /></div>
        <div><Label>Amount</Label><Input value={form.amount} onChange={set("amount")} /></div>
        <div><Label>Currency</Label><Input value={form.currency} onChange={set("currency")} /></div>
        <div className="col-span-2"><Label>Address</Label><Input value={form.line1} onChange={set("line1")} /></div>
        <div><Label>City</Label><Input value={form.city} onChange={set("city")} /></div>
        <div><Label>Postal</Label><Input value={form.postalCode} onChange={set("postalCode")} /></div>
        <div className="col-span-2 md:col-span-4"><Button disabled={busy} onClick={() => run()}>{busy ? "Running…" : "Run with form values"}</Button></div>
      </div>

      {last && (
        <div className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Response from PowerTranz</h2>
            <Button size="sm" variant="outline" onClick={() => copy(JSON.stringify(last.raw ?? last, null, 2))}>
              <Copy className="h-4 w-4 mr-1" /> Copy response
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sending merchant ID {String(last.merchantIdMasked ?? "—")} ({String(last.merchantIdLength ?? "?")} chars),
            password {String(last.passwordLength ?? "?")} chars, gateway key {last.gatewayKeySent ? "sent" : "not sent"}
            {" "}→ {String(last.endpoint ?? "—")}
          </p>
          <pre className="text-xs bg-muted rounded p-3 overflow-x-auto max-h-80 whitespace-pre-wrap break-all">
            {JSON.stringify(last.raw ?? last, null, 2)}
          </pre>
        </div>
      )}

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr className="text-left">
            <th className="p-2">Time</th><th className="p-2">Order</th><th className="p-2">Card</th>
            <th className="p-2">Result</th><th className="p-2">ISO</th><th className="p-2">Transaction ID</th>
          </tr></thead>
          <tbody>
            {log.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2 font-mono text-xs">{r.order_id}</td>
                <td className="p-2">{r.card_brand} •••• {r.card_last4}</td>
                <td className="p-2">
                  <span className={r.approved ? "text-primary font-medium" : "text-destructive font-medium"}>{r.approved ? "Approved" : "Declined"}</span>
                  {r.response_message && <div className="text-xs text-muted-foreground">{r.response_message}</div>}
                </td>
                <td className="p-2">{r.iso_response_code ?? "—"}</td>
                <td className="p-2">
                  {r.transaction_identifier && (
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs break-all">{r.transaction_identifier}</span>
                      <Button size="icon" variant="ghost" aria-label="Copy transaction ID" onClick={() => copy(r.transaction_identifier!)}><Copy className="h-4 w-4" /></Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!log.length && <tr><td className="p-4 text-muted-foreground" colSpan={6}>No runs yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
