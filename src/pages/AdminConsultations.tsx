import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowDown, ArrowUp, Copy, Loader2, Plus, RefreshCw, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";
import { fullMoment, moneyUsd } from "@/lib/consultation-utils";
import BookingsTable from "@/components/admin/consultations/BookingsTable";
import ZoomStatusCard from "@/components/admin/consultations/ZoomStatusCard";

type Booking = Tables<"consultation_bookings">;
type Service = Tables<"consultation_services">;
type Practitioner = Tables<"consultation_practitioners">;
type Window = Tables<"consultation_availability">;
type Override = Tables<"consultation_availability_overrides">;
type CalendlyEvent = Tables<"consultation_calendly_events">;

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ICON_CHOICES = ["leaf", "clipboard-list", "repeat", "mountain"];

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

const STATUS_TONE: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-900 border-emerald-300",
  pending_payment: "bg-amber-100 text-amber-900 border-amber-300",
  completed: "bg-sky-100 text-sky-900 border-sky-300",
  cancelled: "bg-neutral-200 text-neutral-700 border-neutral-300",
  no_show: "bg-rose-100 text-rose-900 border-rose-300",
};

async function adminAction(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("consultation-admin", { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export default function AdminConsultations() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [calendlyEvents, setCalendlyEvents] = useState<CalendlyEvent[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [windows, setWindows] = useState<Window[]>([]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [newStart, setNewStart] = useState("");
  const [syncing] = useState(false);

  const practitioner = practitioners[0];
  const tz = practitioner?.timezone ?? "America/St_Lucia";

  const load = async () => {
    setLoading(true);
    const [b, s, p, w, o, c] = await Promise.all([
      supabase.from("consultation_bookings").select("*").order("starts_at", { ascending: true }),
      supabase.from("consultation_services").select("*").order("display_order"),
      supabase.from("consultation_practitioners").select("*").order("display_order"),
      supabase.from("consultation_availability").select("*").order("day_of_week"),
      supabase.from("consultation_availability_overrides").select("*").order("date"),
      supabase.from("consultation_calendly_events").select("*").order("starts_at", { ascending: false }),
    ]);
    for (const r of [b, s, p, w, o, c]) if (r.error) toast.error(r.error.message);
    setBookings((b.data as Booking[]) ?? []);
    setServices((s.data as Service[]) ?? []);
    setPractitioners((p.data as Practitioner[]) ?? []);
    setWindows((w.data as Window[]) ?? []);
    setOverrides((o.data as Override[]) ?? []);
    setCalendlyEvents((c.data as CalendlyEvent[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const lastSync = calendlyEvents.reduce<string | null>(
    (latest, e) => (!latest || e.synced_at > latest ? e.synced_at : latest),
    null,
  );

  const createZoomRoom = async (b: Booking) => {
    setBusyId(b.id);
    const { data, error } = await supabase.functions.invoke("zoom-create-meeting", {
      body: { booking_id: b.id },
    });
    if (error || data?.error) toast.error(data?.error || error?.message);
    else { toast.success("Video room created"); await load(); }
    setBusyId(null);
  };

  /** Send our branded confirmation for a session that came in through Calendly. */
  const sendCalendlyConfirmation = async (ev: any) => {
    setBusyId(ev.id);
    const { data, error } = await supabase.functions.invoke("consultation-calendly-sync", {
      body: { action: "send_confirmation", calendly_event_uri: ev.calendly_event_uri },
    });
    if (error || data?.error) toast.error(data?.error || error?.message || "Could not send the confirmation");
    else { toast.success(`Confirmation sent to ${data?.sent_to ?? "the client"}`); await load(); }
    setBusyId(null);
  };

  const run = async (id: string, body: Record<string, unknown>, okMessage: string) => {
    setBusyId(id);
    try {
      await adminAction(body);
      toast.success(okMessage);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  /* ── Manual booking form ── */
  const [manual, setManual] = useState({
    service_id: "", start: "", mode: "online", customer_name: "",
    customer_email: "", customer_phone: "", notes: "", skip_payment: true, amount: "",
  });
  const [manualSaving, setManualSaving] = useState(false);

  const createManual = async () => {
    if (!manual.service_id || !manual.start || !manual.customer_name || !manual.customer_email) {
      return toast.error("Service, time, name and email are required");
    }
    setManualSaving(true);
    try {
      await adminAction({
        action: "create",
        service_id: manual.service_id,
        start: new Date(manual.start).toISOString(),
        mode: manual.mode,
        customer_name: manual.customer_name,
        customer_email: manual.customer_email,
        customer_phone: manual.customer_phone || undefined,
        notes: manual.notes || undefined,
        skip_payment: manual.skip_payment,
        amount: manual.amount ? Number(manual.amount) : undefined,
        send_email: true,
      });
      toast.success("Booking created and confirmation sent");
      setManualOpen(false);
      setManual({ ...manual, start: "", customer_name: "", customer_email: "", customer_phone: "", notes: "" });
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Could not create the booking");
    } finally {
      setManualSaving(false);
    }
  };

  /* ── Service and practitioner editing ── */
  const saveRow = async (
    table: "consultation_services" | "consultation_practitioners",
    id: string,
    patch: Record<string, unknown>,
  ) => {
    setBusyId(id);
    const { error } = await supabase.from(table).update(patch as never).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); await load(); }
    setBusyId(null);
  };

  /** Move a session type up or down by swapping display_order with its neighbour. */
  const reorderService = async (service: Service, direction: -1 | 1) => {
    const ordered = [...services].sort((a, b) => a.display_order - b.display_order);
    const i = ordered.findIndex((s) => s.id === service.id);
    const other = ordered[i + direction];
    if (!other) return;
    setBusyId(service.id);
    const [a, b] = [
      supabase.from("consultation_services").update({ display_order: other.display_order }).eq("id", service.id),
      supabase.from("consultation_services").update({ display_order: service.display_order }).eq("id", other.id),
    ];
    const results = await Promise.all([a, b]);
    const failed = results.find((r) => r.error);
    if (failed?.error) toast.error(failed.error.message);
    await load();
    setBusyId(null);
  };

  /** Copy a session type so a new one can be built from an existing shape. */
  const duplicateService = async (service: Service) => {
    setBusyId(service.id);
    const { id, created_at, updated_at, ...rest } = service as Record<string, unknown> as Service & Record<string, unknown>;
    const { error } = await supabase.from("consultation_services").insert({
      ...(rest as never),
      name: `${service.name} (copy)`,
      slug: `${service.slug}-copy-${Date.now().toString(36)}`,
      display_order: services.length + 1,
      is_active: false,
    } as never);
    if (error) toast.error(error.message);
    else { toast.success("Copied. The copy is hidden until you switch it on."); await load(); }
    setBusyId(null);
  };

  const openQuestions = services.filter((s) => s.admin_note);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Consultations</h1>
          <p className="text-sm text-muted-foreground">
            Private sessions with {practitioner?.name ?? "the practitioner"} · times shown in {tz}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="min-h-[44px]" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button className="min-h-[44px]" onClick={() => setManualOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add booking
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="service">Session types</TabsTrigger>
          <TabsTrigger value="practitioner">Practitioner</TabsTrigger>
        </TabsList>

        {/* ───────── Bookings ───────── */}
        <TabsContent value="bookings" className="space-y-4 pt-4">
          <ZoomStatusCard />
          <BookingsTable
            bookings={bookings}
            calendlyEvents={calendlyEvents}
            services={services}
            practitioners={practitioners}
            tz={tz}
            busyId={busyId}
            onReschedule={(b) => { setRescheduleTarget(b); setNewStart(""); }}
            onAction={(id, body, msg) => { void run(id, body, msg); }}
            onCreateZoom={(b) => { void createZoomRoom(b); }}
            onSendCalendlyConfirmation={(e) => { void sendCalendlyConfirmation(e); }}
            syncing={syncing}
            lastSync={lastSync}
          />
        </TabsContent>

        {/* ───────── Availability ───────── */}
        <TabsContent value="availability" className="space-y-6 pt-4">
          <div className="rounded-xl border p-4">
            <h2 className="font-medium mb-1">Weekly windows</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Open hours in {tz}. Slots are generated inside these windows.
            </p>
            <div className="space-y-2">
              {windows.map((w) => (
                <div key={w.id} className="flex flex-wrap items-center gap-2">
                  <Select
                    value={String(w.day_of_week)}
                    onValueChange={async (v) => {
                      const { error } = await supabase.from("consultation_availability")
                        .update({ day_of_week: Number(v) }).eq("id", w.id);
                      if (error) toast.error(error.message);
                      else { toast.success("Day updated"); await load(); }
                    }}
                  >
                    <SelectTrigger className="w-[140px] min-h-[44px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="time" defaultValue={w.start_time.slice(0, 5)} className="w-[130px] min-h-[44px]"
                    onBlur={async (e) => {
                      const { error } = await supabase.from("consultation_availability")
                        .update({ start_time: e.target.value }).eq("id", w.id);
                      error ? toast.error(error.message) : toast.success("Window updated");
                    }} />
                  <span className="text-muted-foreground">to</span>
                  <Input type="time" defaultValue={w.end_time.slice(0, 5)} className="w-[130px] min-h-[44px]"
                    onBlur={async (e) => {
                      const { error } = await supabase.from("consultation_availability")
                        .update({ end_time: e.target.value }).eq("id", w.id);
                      error ? toast.error(error.message) : toast.success("Window updated");
                    }} />
                  <div className="flex items-center gap-2 ml-2">
                    <Switch checked={w.is_active} onCheckedChange={async (v) => {
                      const { error } = await supabase.from("consultation_availability")
                        .update({ is_active: v }).eq("id", w.id);
                      error ? toast.error(error.message) : await load();
                    }} />
                    <span className="text-sm text-muted-foreground">{w.is_active ? "Open" : "Closed"}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="min-h-[40px]" onClick={async () => {
                    const { error } = await supabase.from("consultation_availability").delete().eq("id", w.id);
                    error ? toast.error(error.message) : await load();
                  }}>Remove</Button>
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="mt-4 min-h-[44px]" onClick={async () => {
              if (!practitioner) return;
              const { error } = await supabase.from("consultation_availability").insert({
                practitioner_id: practitioner.id, day_of_week: 2,
                start_time: "14:00", end_time: "17:00",
              });
              error ? toast.error(error.message) : await load();
            }}>
              <Plus className="w-4 h-4 mr-2" /> Add a window
            </Button>
          </div>

          <div className="rounded-xl border p-4">
            <h2 className="font-medium mb-1">Date exceptions</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Block a day off, or open a day that is normally closed.
            </p>
            <div className="space-y-2">
              {overrides.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="w-28">{o.date}</span>
                  <Badge variant="outline" className={o.is_available
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : "bg-rose-100 text-rose-900 border-rose-300"}>
                    {o.is_available ? "Open" : "Closed"}
                  </Badge>
                  {o.is_available && o.start_time && (
                    <span className="text-muted-foreground">
                      {o.start_time.slice(0, 5)}–{o.end_time?.slice(0, 5)}
                    </span>
                  )}
                  {o.reason && <span className="text-muted-foreground">{o.reason}</span>}
                  <Button size="sm" variant="ghost" className="min-h-[40px]" onClick={async () => {
                    const { error } = await supabase.from("consultation_availability_overrides")
                      .delete().eq("id", o.id);
                    error ? toast.error(error.message) : await load();
                  }}>Remove</Button>
                </div>
              ))}
            </div>
            <NewOverride practitionerId={practitioner?.id} onDone={load} />
          </div>
        </TabsContent>

        {/* ───────── Categories ───────── */}
        <TabsContent value="categories" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            The four cards someone sees first. Session types are filed underneath them.
          </p>
          {categories.map((c) => (
            <CategoryEditor
              key={c.id} category={c} busy={busyId === c.id}
              serviceCount={services.filter((s) => s.category_id === c.id).length}
              onSave={(patch) => saveRow("consultation_categories", c.id, patch)}
              onDelete={async () => {
                const { error } = await supabase.from("consultation_categories").delete().eq("id", c.id);
                error ? toast.error(error.message) : await load();
              }}
            />
          ))}
          <Button variant="outline" className="min-h-[44px]" onClick={async () => {
            const order = (categories.at(-1)?.display_order ?? 0) + 1;
            const { error } = await supabase.from("consultation_categories").insert({
              name: "New category", slug: `new-category-${Date.now().toString(36)}`,
              description: "", icon: "leaf", display_order: order, is_active: false,
            });
            error ? toast.error(error.message) : await load();
          }}>
            <Plus className="w-4 h-4 mr-2" /> Add a category
          </Button>
        </TabsContent>

        {/* ───────── Service ───────── */}
        <TabsContent value="service" className="space-y-4 pt-4">
          {services.map((s) => (
            <ServiceEditor key={s.id} service={s} categories={categories} busy={busyId === s.id}
              onSave={(patch) => saveRow("consultation_services", s.id, patch)}
              onDelete={async () => {
                const { error } = await supabase.from("consultation_services").delete().eq("id", s.id);
                error ? toast.error(error.message) : await load();
              }} />
          ))}
          <Button variant="outline" className="min-h-[44px]" disabled={!practitioner} onClick={async () => {
            const { error } = await supabase.from("consultation_services").insert({
              name: "New session type", slug: `new-session-${Date.now().toString(36)}`,
              description: "", duration_minutes: 60, buffer_before_minutes: 0, buffer_after_minutes: 0,
              price_usd: 300, price_xcd: 810, mode: "both",
              practitioner_id: practitioner!.id,
              category_id: categories[0]?.id ?? null,
              min_notice_hours: 24, max_advance_days: 60,
              display_order: services.length + 1, is_active: false,
            });
            error ? toast.error(error.message) : await load();
          }}>
            <Plus className="w-4 h-4 mr-2" /> Add a session type
          </Button>
        </TabsContent>

        {/* ───────── Practitioner ───────── */}
        <TabsContent value="practitioner" className="space-y-4 pt-4">
          {practitioners.map((p) => (
            <PractitionerEditor key={p.id} practitioner={p} busy={busyId === p.id}
              onSave={(patch) => saveRow("consultation_practitioners", p.id, patch)} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Manual booking */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add a booking</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Session type</Label>
              <Select value={manual.service_id} onValueChange={(v) => setManual({ ...manual, service_id: v })}>
                <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue placeholder="Choose" /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start ({tz})</Label>
              <Input type="datetime-local" className="mt-1 min-h-[44px]" value={manual.start}
                onChange={(e) => setManual({ ...manual, start: e.target.value })} />
            </div>
            <div>
              <Label>Format</Label>
              <Select value={manual.mode} onValueChange={(v) => setManual({ ...manual, mode: v })}>
                <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in_person">In person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <Input className="mt-1 min-h-[44px]" value={manual.customer_name}
                  onChange={(e) => setManual({ ...manual, customer_name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" className="mt-1 min-h-[44px]" value={manual.customer_email}
                  onChange={(e) => setManual({ ...manual, customer_email: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input className="mt-1 min-h-[44px]" value={manual.customer_phone}
                onChange={(e) => setManual({ ...manual, customer_phone: e.target.value })} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea rows={3} className="mt-1" value={manual.notes}
                onChange={(e) => setManual({ ...manual, notes: e.target.value })} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={manual.skip_payment}
                onCheckedChange={(v) => setManual({ ...manual, skip_payment: v })} />
              <span className="text-sm">Mark as already settled (no card taken)</span>
            </div>
            {!manual.skip_payment && (
              <div>
                <Label>Amount owed (USD)</Label>
                <Input type="number" className="mt-1 min-h-[44px]" value={manual.amount}
                  onChange={(e) => setManual({ ...manual, amount: e.target.value })} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="min-h-[44px]" onClick={() => setManualOpen(false)}>Cancel</Button>
            <Button className="min-h-[44px]" disabled={manualSaving} onClick={createManual}>
              {manualSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule */}
      <Dialog open={!!rescheduleTarget} onOpenChange={(o) => !o && setRescheduleTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Move this consultation</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            {rescheduleTarget && fullMoment(rescheduleTarget.starts_at, tz)} — choose a new start in {tz}.
          </p>
          <Input type="datetime-local" className="min-h-[44px]" value={newStart}
            onChange={(e) => setNewStart(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" className="min-h-[44px]" onClick={() => setRescheduleTarget(null)}>
              Keep current time
            </Button>
            <Button className="min-h-[44px]" disabled={!newStart}
              onClick={async () => {
                const target = rescheduleTarget!;
                setRescheduleTarget(null);
                await run(target.id, {
                  action: "reschedule", booking_id: target.id,
                  start: new Date(newStart).toISOString(), send_email: true,
                }, "Consultation moved and the customer notified");
              }}>
              Move session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Sub-editors ── */

function NewOverride({ practitionerId, onDone }: { practitionerId?: string; onDone: () => void }) {
  const [date, setDate] = useState("");
  const [available, setAvailable] = useState(false);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("16:00");
  const [reason, setReason] = useState("");

  return (
    <div className="mt-4 flex flex-wrap items-end gap-3">
      <div>
        <Label className="text-xs">Date</Label>
        <Input type="date" className="mt-1 min-h-[44px] w-[170px]" value={date}
          onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="flex items-center gap-2 pb-2.5">
        <Switch checked={available} onCheckedChange={setAvailable} />
        <span className="text-sm">{available ? "Open specially" : "Closed"}</span>
      </div>
      {available && (
        <>
          <div>
            <Label className="text-xs">From</Label>
            <Input type="time" className="mt-1 min-h-[44px] w-[120px]" value={start}
              onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="time" className="mt-1 min-h-[44px] w-[120px]" value={end}
              onChange={(e) => setEnd(e.target.value)} />
          </div>
        </>
      )}
      <div>
        <Label className="text-xs">Reason</Label>
        <Input className="mt-1 min-h-[44px] w-[200px]" value={reason}
          onChange={(e) => setReason(e.target.value)} />
      </div>
      <Button size="sm" className="min-h-[44px]" disabled={!date || !practitionerId} onClick={async () => {
        const { error } = await supabase.from("consultation_availability_overrides").insert({
          practitioner_id: practitionerId!, date, is_available: available,
          start_time: available ? start : null, end_time: available ? end : null,
          reason: reason || null,
        });
        if (error) toast.error(error.message);
        else { toast.success("Exception added"); setDate(""); setReason(""); onDone(); }
      }}>
        <Plus className="w-4 h-4 mr-2" /> Add exception
      </Button>
    </div>
  );
}

function ServiceEditor({
  service, categories, busy, onSave, onDelete,
}: {
  service: Service;
  categories: Category[];
  busy: boolean;
  onSave: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const [f, setF] = useState({
    name: service.name,
    category_id: service.category_id ?? "none",
    display_order: String(service.display_order ?? 0),
    description: service.description ?? "",
    long_description: service.long_description ?? "",
    duration_minutes: String(service.duration_minutes),
    price_usd: String(service.price_usd),
    mode: service.mode,
    min_notice_hours: String(service.min_notice_hours),
    max_advance_days: String(service.max_advance_days),
    buffer_before_minutes: String(service.buffer_before_minutes),
    buffer_after_minutes: String(service.buffer_after_minutes),
    is_active: service.is_active,
  });

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>Name</Label>
          <Input className="mt-1 min-h-[44px]" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><Label>Category</Label>
          <Select value={f.category_id} onValueChange={(v) => setF({ ...f, category_id: v })}>
            <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Not filed</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select></div>
        <div><Label>Format offered</Label>
          <Select value={f.mode} onValueChange={(v) => setF({ ...f, mode: v })}>
            <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Online or in person</SelectItem>
              <SelectItem value="online">Online only</SelectItem>
              <SelectItem value="in_person">In person only</SelectItem>
            </SelectContent>
          </Select></div>
        <div><Label>Order within the category</Label>
          <Input type="number" className="mt-1 min-h-[44px]" value={f.display_order}
            onChange={(e) => setF({ ...f, display_order: e.target.value })} /></div>
      </div>
      <div><Label>Short description</Label>
        <Textarea rows={2} className="mt-1" value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div><Label>Full description</Label>
        <Textarea rows={4} className="mt-1" value={f.long_description}
          onChange={(e) => setF({ ...f, long_description: e.target.value })} /></div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><Label>Minutes</Label>
          <Input type="number" className="mt-1 min-h-[44px]" value={f.duration_minutes}
            onChange={(e) => setF({ ...f, duration_minutes: e.target.value })} /></div>
        <div><Label>Price USD</Label>
          <Input type="number" className="mt-1 min-h-[44px]" value={f.price_usd}
            onChange={(e) => setF({ ...f, price_usd: e.target.value })} /></div>
        <div><Label>Notice hours</Label>
          <Input type="number" className="mt-1 min-h-[44px]" value={f.min_notice_hours}
            onChange={(e) => setF({ ...f, min_notice_hours: e.target.value })} /></div>
        <div><Label>Book ahead (days)</Label>
          <Input type="number" className="mt-1 min-h-[44px]" value={f.max_advance_days}
            onChange={(e) => setF({ ...f, max_advance_days: e.target.value })} /></div>
        <div><Label>Buffer before</Label>
          <Input type="number" className="mt-1 min-h-[44px]" value={f.buffer_before_minutes}
            onChange={(e) => setF({ ...f, buffer_before_minutes: e.target.value })} /></div>
        <div><Label>Buffer after</Label>
          <Input type="number" className="mt-1 min-h-[44px]" value={f.buffer_after_minutes}
            onChange={(e) => setF({ ...f, buffer_after_minutes: e.target.value })} /></div>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} />
        <span className="text-sm">{f.is_active ? "Bookable on the site" : "Hidden"}</span>
      </div>
      <Button className="min-h-[44px]" disabled={busy} onClick={() => {
        const priceUsd = Number(f.price_usd);
        onSave({
          name: f.name,
          category_id: f.category_id === "none" ? null : f.category_id,
          display_order: Number(f.display_order) || 0,
          description: f.description || null,
          long_description: f.long_description || null,
          duration_minutes: Number(f.duration_minutes),
          price_usd: priceUsd,
          price_xcd: +(priceUsd * 2.7).toFixed(2),
          mode: f.mode,
          min_notice_hours: Number(f.min_notice_hours),
          max_advance_days: Number(f.max_advance_days),
          buffer_before_minutes: Number(f.buffer_before_minutes),
          buffer_after_minutes: Number(f.buffer_after_minutes),
          is_active: f.is_active,
        });
      }}>
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Save session type
      </Button>
      <Button variant="ghost" className="min-h-[44px] ml-2 text-destructive" disabled={busy}
        onClick={() => { if (confirm(`Remove "${service.name}"?`)) onDelete(); }}>
        Remove
      </Button>
      <p className="text-xs text-muted-foreground">
        XCD is kept in step automatically at the 2.7 rate used across the store.
      </p>
    </div>
  );
}

function CategoryEditor({
  category, serviceCount, busy, onSave, onDelete,
}: {
  category: Category;
  serviceCount: number;
  busy: boolean;
  onSave: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const [f, setF] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    icon: category.icon ?? "leaf",
    display_order: String(category.display_order),
    is_active: category.is_active,
  });

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>Name</Label>
          <Input className="mt-1 min-h-[44px]" value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><Label>Web address slug</Label>
          <Input className="mt-1 min-h-[44px]" value={f.slug}
            onChange={(e) => setF({ ...f, slug: e.target.value })} /></div>
        <div><Label>Icon</Label>
          <Select value={f.icon} onValueChange={(v) => setF({ ...f, icon: v })}>
            <SelectTrigger className="mt-1 min-h-[44px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ICON_CHOICES.map((i) => <SelectItem key={i} value={i}>{i.replace(/-/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select></div>
        <div><Label>Display order</Label>
          <Input type="number" className="mt-1 min-h-[44px]" value={f.display_order}
            onChange={(e) => setF({ ...f, display_order: e.target.value })} /></div>
      </div>
      <div><Label>One line description</Label>
        <Textarea rows={2} className="mt-1" value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div className="flex flex-wrap items-center gap-3">
        <Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} />
        <span className="text-sm">{f.is_active ? "Shown on the site" : "Hidden"}</span>
        <Badge variant="outline">
          {serviceCount} session type{serviceCount === 1 ? "" : "s"}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="min-h-[44px]" disabled={busy} onClick={() => onSave({
          name: f.name,
          slug: slugify(f.slug || f.name),
          description: f.description || null,
          icon: f.icon,
          display_order: Number(f.display_order) || 0,
          is_active: f.is_active,
        })}>
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save category
        </Button>
        <Button variant="ghost" className="min-h-[44px] text-destructive" disabled={busy}
          onClick={() => { if (confirm(`Remove "${category.name}"?`)) onDelete(); }}>
          Remove
        </Button>
      </div>
    </div>
  );
}

function PractitionerEditor({
  practitioner, busy, onSave,
}: { practitioner: Practitioner; busy: boolean; onSave: (patch: Record<string, unknown>) => void }) {
  const [f, setF] = useState({
    name: practitioner.name,
    title: practitioner.title ?? "",
    bio: practitioner.bio ?? "",
    photo_url: practitioner.photo_url ?? "",
    timezone: practitioner.timezone,
    zoom_user_email: practitioner.zoom_user_email ?? "",
    is_active: practitioner.is_active,
  });

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label>Name</Label>
          <Input className="mt-1 min-h-[44px]" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><Label>Title</Label>
          <Input className="mt-1 min-h-[44px]" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        <div><Label>Timezone</Label>
          <Input className="mt-1 min-h-[44px]" value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })} /></div>
        <div><Label>Zoom account email</Label>
          <Input className="mt-1 min-h-[44px]" value={f.zoom_user_email}
            onChange={(e) => setF({ ...f, zoom_user_email: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label>Photo URL</Label>
          <Input className="mt-1 min-h-[44px]" value={f.photo_url}
            onChange={(e) => setF({ ...f, photo_url: e.target.value })} /></div>
      </div>
      <div><Label>Biography</Label>
        <Textarea rows={5} className="mt-1" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></div>
      <div className="flex items-center gap-3">
        <Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} />
        <span className="text-sm">{f.is_active ? "Taking bookings" : "Not taking bookings"}</span>
      </div>
      <Button className="min-h-[44px]" disabled={busy} onClick={() => onSave({
        name: f.name,
        title: f.title || null,
        bio: f.bio || null,
        photo_url: f.photo_url || null,
        timezone: f.timezone,
        zoom_user_email: f.zoom_user_email || null,
        is_active: f.is_active,
      })}>
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Save practitioner
      </Button>
      <p className="text-xs text-muted-foreground">
        Zoom rooms are only created when Zoom credentials are configured and this email is set.
      </p>
    </div>
  );
}
