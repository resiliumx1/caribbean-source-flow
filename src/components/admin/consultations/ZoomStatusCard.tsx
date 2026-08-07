import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Video, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ZoomStatus {
  configured: boolean;
  reachable: boolean | null;
  error: string | null;
  hosts: { id: string; name: string; zoom_user_email: string | null; is_active: boolean }[];
  hosts_missing_email: number;
  upcoming_online: number;
  upcoming_missing_link: number;
  missing: { id: string; reference: string; starts_at: string; error: string | null }[];
}

/** Live health of the Zoom connection, shown above the bookings table. */
export function ZoomStatusCard({ onRefreshed }: { onRefreshed?: () => void }) {
  const [status, setStatus] = useState<ZoomStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);

  const check = useCallback(async () => {
    setLoading(true);
    setFailure(null);
    const { data, error } = await supabase.functions.invoke("consultation-admin", {
      body: { action: "zoom_status" },
    });
    if (error || data?.error) setFailure(data?.error || error?.message || "Could not read Zoom status");
    else setStatus(data as ZoomStatus);
    setLoading(false);
    onRefreshed?.();
  }, [onRefreshed]);

  useEffect(() => { void check(); }, [check]);

  const healthy = status?.configured && status.reachable === true;
  const tone = failure || (status && !healthy)
    ? "border-amber-300 bg-amber-50"
    : "border-emerald-300 bg-emerald-50";

  return (
    <div className={`rounded-xl border p-4 ${loading && !status ? "" : tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Video className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-medium">Zoom connection</h2>
            {loading && !status ? (
              <Skeleton className="mt-2 h-4 w-56" />
            ) : failure ? (
              <p className="mt-1 text-sm text-amber-900">{failure}</p>
            ) : status ? (
              <div className="mt-1 space-y-1 text-sm">
                <p className="flex items-center gap-1.5">
                  {healthy
                    ? <><CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        Connected — links are created automatically when a session is paid for.</>
                    : !status.configured
                      ? <><XCircle className="h-4 w-4 text-amber-700" />
                          Not configured. Add the Zoom credentials to create links automatically.</>
                      : <><AlertTriangle className="h-4 w-4 text-amber-700" />
                          Credentials saved but Zoom rejected them. {status.error ?? ""}</>}
                </p>
                <p className="text-muted-foreground">
                  {status.hosts.filter((h) => h.zoom_user_email).map((h) => `${h.name} → ${h.zoom_user_email}`).join(" · ")
                    || "No practitioner has a Zoom host email set yet."}
                </p>
                <p className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  <span>{status.upcoming_online} upcoming online session{status.upcoming_online === 1 ? "" : "s"}</span>
                  {status.upcoming_missing_link > 0 ? (
                    <Badge variant="outline" className="border-amber-400 bg-white text-amber-900">
                      {status.upcoming_missing_link} without a link
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-400 bg-white text-emerald-900">
                      all have links
                    </Badge>
                  )}
                </p>
                {status.missing.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Needs a link: {status.missing.map((m) => m.reference).join(", ")}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <Button variant="outline" size="sm" className="min-h-[40px] bg-white"
          onClick={() => { void check(); }} disabled={loading}>
          {loading
            ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            : <RefreshCw className="mr-1.5 h-4 w-4" />}
          Re-check
        </Button>
      </div>
    </div>
  );
}

export default ZoomStatusCard;