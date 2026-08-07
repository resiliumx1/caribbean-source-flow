import { useMemo, useState } from "react";
import {
  CalendarX2, Clock, ExternalLink, Mail, RefreshCw, Search, Video, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Tables } from "@/integrations/supabase/types";
import { fullMoment, moneyUsd } from "@/lib/consultation-utils";

type Booking = Tables<"consultation_bookings">;
type Practitioner = Tables<"consultation_practitioners">;
type Service = Tables<"consultation_services">;
type CalendlyEvent = Tables<"consultation_calendly_events">;

export type PaymentState = "paid" | "awaiting" | "refunded" | "cancelled" | "none";

const PAYMENT_LABEL: Record<PaymentState, string> = {
  paid: "Paid",
  awaiting: "Awaiting payment",
  refunded: "Refunded",
  cancelled: "Cancelled",
  none: "No payment recorded",
};

const PAYMENT_TONE: Record<PaymentState, string> = {
  paid: "bg-emerald-100 text-emerald-900 border-emerald-300",
  awaiting: "bg-amber-100 text-amber-900 border-amber-300",
  refunded: "bg-sky-100 text-sky-900 border-sky-300",
  cancelled: "bg-neutral-200 text-neutral-700 border-neutral-300",
  none: "bg-neutral-100 text-neutral-600 border-neutral-300",
};

const STATUS_TONE: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-900 border-emerald-300",
  pending_payment: "bg-amber-100 text-amber-900 border-amber-300",
  completed: "bg-sky-100 text-sky-900 border-sky-300",
  cancelled: "bg-neutral-200 text-neutral-700 border-neutral-300",
  no_show: "bg-rose-100 text-rose-900 border-rose-300",
};

type Row = {
  id: string;
  source: "site" | "calendly";
  startsAt: string;
  endsAt: string;
  name: string;
  email: string;
  phone: string | null;
  reference: string;
  serviceName: string;
  practitionerId: string | null;
  practitionerName: string;
  mode: string;
  status: string;
  payment: PaymentState;
  amount: number;
  customerTimezone: string | null;
  joinUrl: string | null;
  booking?: Booking;
  calendly?: CalendlyEvent;
};

function paymentOf(b: Booking): PaymentState {
  const paid = Boolean(b.payment_transaction_id);
  if (b.status === "cancelled" || b.status === "no_show") return paid ? "refunded" : "cancelled";
  if (b.status === "pending_payment") return "awaiting";
  if (paid || Number(b.amount) > 0) return "paid";
  return "none";
}

type DatePreset = "all" | "today" | "next7" | "month" | "past" | "custom";

export default function BookingsTable({
  bookings, calendlyEvents, services, practitioners, tz,
  busyId, onReschedule, onAction, onCreateZoom, onSync, syncing, lastSync,
}: {
  bookings: Booking[];
  calendlyEvents: CalendlyEvent[];
  services: Service[];
  practitioners: Practitioner[];
  tz: string;
  busyId: string | null;
  onReschedule: (b: Booking) => void;
  onAction: (id: string, body: Record<string, unknown>, okMessage: string) => void;
  onCreateZoom: (b: Booking) => void;
  onSync: () => void;
  syncing: boolean;
  lastSync: string | null;
}) {
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState<DatePreset>("next7");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [organizer, setOrganizer] = useState("all");
  const [payment, setPayment] = useState<"all" | PaymentState>("all");
  const [detail, setDetail] = useState<Row | null>(null);

  const serviceName = (id: string | null) =>
    services.find((s) => s.id === id)?.name ?? "Consultation";
  const practitionerName = (id: string | null) =>
    practitioners.find((p) => p.id === id)?.name ?? "—";

  const rows: Row[] = useMemo(() => {
    const site: Row[] = bookings.map((b) => ({
      id: b.id,
      source: "site",
      startsAt: b.starts_at,
      endsAt: b.ends_at,
      name: b.customer_name,
      email: b.customer_email,
      phone: b.customer_phone,
      reference: b.booking_reference,
      serviceName: serviceName(b.service_id),
      practitionerId: b.practitioner_id,
      practitionerName: practitionerName(b.practitioner_id),
      mode: b.mode === "online" ? "Online" : "In person",
      status: b.status,
      payment: paymentOf(b),
      amount: Number(b.amount) || 0,
      customerTimezone: b.customer_timezone,
      joinUrl: b.zoom_join_url,
      booking: b,
    }));

    const imported: Row[] = calendlyEvents.map((e) => ({
      id: e.id,
      source: "calendly",
      startsAt: e.starts_at,
      endsAt: e.ends_at,
      name: e.invitee_name || "Calendly invitee",
      email: e.invitee_email || "—",
      phone: null,
      reference: "Calendly",
      serviceName: e.event_name || "Calendly session",
      practitionerId: null,
      practitionerName: e.organizer_name || "Calendly host",
      mode: e.location_type?.includes("zoom") ? "Online" : "—",
      status: e.status === "canceled" ? "cancelled" : "confirmed",
      payment: "none",
      amount: 0,
      customerTimezone: e.invitee_timezone,
      joinUrl: e.join_url,
      calendly: e,
    }));

    return [...site, ...imported].sort(
      (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );
  }, [bookings, calendlyEvents, services, practitioners]);

  const filtered = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 86_400_000;
    const in7 = startOfToday + 7 * 86_400_000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    const q = search.trim().toLowerCase();

    return rows.filter((r) => {
      const t = new Date(r.startsAt).getTime();

      if (preset === "today" && (t < startOfToday || t >= endOfToday)) return false;
      if (preset === "next7" && (t < startOfToday || t >= in7)) return false;
      if (preset === "month" && (t < startOfMonth || t >= startOfNextMonth)) return false;
      if (preset === "past" && t >= now.getTime()) return false;
      if (preset === "custom") {
        if (from && t < new Date(`${from}T00:00:00`).getTime()) return false;
        if (to && t > new Date(`${to}T23:59:59`).getTime()) return false;
      }

      if (organizer !== "all") {
        if (organizer === "calendly") {
          if (r.source !== "calendly") return false;
        } else if (r.practitionerId !== organizer) return false;
      }

      if (payment !== "all" && r.payment !== payment) return false;

      if (q) {
        const hay = `${r.name} ${r.email} ${r.reference} ${r.serviceName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, preset, from, to, organizer, payment, search]);

  const total = filtered.reduce((sum, r) => sum + r.amount, 0);
  const dirty = preset !== "next7" || organizer !== "all" || payment !== "all" || search || from || to;

  const clear = () => {
    setPreset("next7"); setOrganizer("all"); setPayment("all");
    setSearch(""); setFrom(""); setTo("");
  };

  return (
    <div className="space-y-4">
      {/* ── toolbar ── */}
      <div className="rounded-xl border p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 min-h-[44px]"
                placeholder="Name, email or reference"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="min-w-[160px]">
            <Label className="text-xs">Date</Label>
            <Select value={preset} onValueChange={(v) => setPreset(v as DatePreset)}>
              <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="next7">Next 7 days</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="past">Past sessions</SelectItem>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[190px]">
            <Label className="text-xs">Organizer</Label>
            <Select value={organizer} onValueChange={setOrganizer}>
              <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All organizers</SelectItem>
                {practitioners.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
                <SelectItem value="calendly">Calendly hosts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[180px]">
            <Label className="text-xs">Payment status</Label>
            <Select value={payment} onValueChange={(v) => setPayment(v as PaymentState | "all")}>
              <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="awaiting">Awaiting payment</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="none">No payment recorded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {preset === "custom" && (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" className="mt-1 min-h-[44px]" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" className="mt-1 min-h-[44px]" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} session{filtered.length === 1 ? "" : "s"} · {moneyUsd(total)} booked value
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {dirty && (
              <Button variant="ghost" size="sm" className="min-h-[40px]" onClick={clear}>
                <X className="w-4 h-4 mr-1.5" /> Clear filters
              </Button>
            )}
            {lastSync && (
              <span className="text-xs text-muted-foreground">
                Last Calendly sync {fullMoment(lastSync, tz)}
              </span>
            )}
            <Button variant="outline" className="min-h-[44px]" onClick={onSync} disabled={syncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing…" : "Sync from Calendly"}
            </Button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          No consultations match these filters.
        </div>
      ) : (
        <>
          {/* ── table (≥768px) ── */}
          <div className="hidden md:block rounded-xl border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={`${r.source}-${r.id}`}>
                    <TableCell className="align-middle">
                      <div className="font-medium">{fullMoment(r.startsAt, tz)}</div>
                      <Badge variant="outline" className={`mt-1 ${STATUS_TONE[r.status] ?? ""}`}>
                        {r.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div>{r.serviceName}</div>
                      <div className="text-xs text-muted-foreground">{r.mode}</div>
                    </TableCell>
                    <TableCell className="align-middle">{r.practitionerName}</TableCell>
                    <TableCell className="align-middle">
                      <Badge variant="outline" className={PAYMENT_TONE[r.payment]}>
                        {PAYMENT_LABEL[r.payment]}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      {r.amount > 0 ? moneyUsd(r.amount) : "—"}
                    </TableCell>
                    <TableCell className="align-middle">
                      <Badge variant="outline">{r.source === "site" ? "Site" : "Calendly"}</Badge>
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      <Button size="sm" variant="outline" className="min-h-[40px]" onClick={() => setDetail(r)}>
                        {r.source === "site" ? "Manage" : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── cards (<768px) ── */}
          <div className="md:hidden space-y-3">
            {filtered.map((r) => (
              <div key={`m-${r.source}-${r.id}`} className="rounded-xl border p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={STATUS_TONE[r.status] ?? ""}>
                    {r.status.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="outline" className={PAYMENT_TONE[r.payment]}>
                    {PAYMENT_LABEL[r.payment]}
                  </Badge>
                  <Badge variant="outline">{r.source === "site" ? "Site" : "Calendly"}</Badge>
                </div>
                <p className="text-sm">
                  <Clock className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                  {fullMoment(r.startsAt, tz)}
                </p>
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-muted-foreground break-words">{r.email}</p>
                <p className="text-sm">
                  {r.serviceName} · {r.practitionerName}
                  {r.amount > 0 ? ` · ${moneyUsd(r.amount)}` : ""}
                </p>
                <Button variant="outline" className="w-full min-h-[44px]" onClick={() => setDetail(r)}>
                  {r.source === "site" ? "Manage session" : "View session"}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── detail / actions ── */}
      <Dialog open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p>{fullMoment(detail.startsAt, tz)} ({tz})</p>
                {detail.customerTimezone && (
                  <p className="text-muted-foreground">
                    Their time {fullMoment(detail.startsAt, detail.customerTimezone)}
                  </p>
                )}
                <p className="text-muted-foreground">
                  {detail.reference} · {detail.email}
                  {detail.phone ? ` · ${detail.phone}` : ""}
                </p>
                <p className="text-muted-foreground">
                  {detail.serviceName} · {detail.practitionerName} · {detail.mode}
                </p>
                {detail.joinUrl && (
                  <a href={detail.joinUrl} target="_blank" rel="noreferrer"
                     className="inline-flex items-center gap-1.5 text-sm underline">
                    <Video className="w-4 h-4" /> Join link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {detail.source === "calendly" ? (
                <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  Imported from Calendly and read-only here. Reschedule or cancel it in Calendly,
                  then run the sync again.
                </p>
              ) : detail.booking && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="min-h-[40px]"
                      disabled={busyId === detail.id || detail.booking.status === "cancelled"}
                      onClick={() => { onReschedule(detail.booking!); setDetail(null); }}>
                      Reschedule
                    </Button>
                    <Button size="sm" variant="outline" className="min-h-[40px]"
                      disabled={busyId === detail.id || detail.booking.status === "cancelled"}
                      onClick={() => {
                        onAction(detail.id, {
                          action: "cancel", booking_id: detail.id, send_email: true,
                          reason: "Cancelled by Mount Kailash",
                        }, "Booking cancelled");
                        setDetail(null);
                      }}>
                      <CalendarX2 className="w-4 h-4 mr-1.5" /> Cancel
                    </Button>
                    <Button size="sm" variant="outline" className="min-h-[40px]" disabled={busyId === detail.id}
                      onClick={() => onAction(detail.id, {
                        action: "resend_email", booking_id: detail.id, email_type: "confirmation",
                      }, "Confirmation resent")}>
                      <Mail className="w-4 h-4 mr-1.5" /> Resend confirmation
                    </Button>
                    {detail.booking.mode === "online" && !detail.booking.zoom_join_url && (
                      <Button size="sm" variant="outline" className="min-h-[40px]" disabled={busyId === detail.id}
                        onClick={() => onCreateZoom(detail.booking!)}>
                        Create video room
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs">Session status</Label>
                    <Select
                      value={detail.booking.status}
                      onValueChange={(v) => onAction(detail.id, {
                        action: "set_status", booking_id: detail.id, status: v,
                      }, "Status updated")}
                    >
                      <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["confirmed", "completed", "cancelled", "no_show"].map((s) => (
                          <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="detail-notes" className="text-xs">Internal notes</Label>
                    <Textarea
                      id="detail-notes" rows={3} className="mt-1"
                      defaultValue={detail.booking.internal_notes ?? ""}
                      onBlur={(e) => {
                        if (e.target.value !== (detail.booking!.internal_notes ?? "")) {
                          onAction(detail.id, {
                            action: "update_notes", booking_id: detail.id, internal_notes: e.target.value,
                          }, "Notes saved");
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}