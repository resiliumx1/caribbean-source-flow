/** Shared interaction kit for the WCE 2026 organiser console.
 *  Feedback, confirmation, tooltips, skeletons and the mobile filter sheet.
 *  Styling lives in src/styles/wce-admin.css. */
import {
  createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, Info, Loader2, SlidersHorizontal, TriangleAlert, X, ChevronDown } from "lucide-react";
import { toast as baseToast } from "@/hooks/use-toast";
import { EmptyOrnament } from "./ui";

/* ------------------------------------------------------------------ toasts */

/** Toast in the WCE palette. Every mutation in this console routes through it. */
export function wceToast(opts: { title: string; description?: string; tone?: "ok" | "error" }) {
  return baseToast({
    title: opts.title,
    description: opts.description,
    className: opts.tone === "error" ? "wce-toast wce-toast-error" : "wce-toast",
    duration: opts.tone === "error" ? 7000 : 3200,
  });
}

/* ------------------------------------------------------- save state / feedback */

export type SaveState = "idle" | "saving" | "saved" | "failed";

/**
 * Wraps a write so every action reports saving → saved → failed. Applies an
 * optimistic patch immediately and rolls it back if the write is rejected.
 */
export function useSaveState() {
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const run = useCallback(
    async <T,>(opts: {
      label: string;
      write: () => Promise<{ error: { message: string } | null } | void>;
      optimistic?: () => void;
      rollback?: () => void;
      onDone?: () => void;
    }): Promise<boolean> => {
      opts.optimistic?.();
      setState("saving");
      setMessage(null);
      try {
        const res = await opts.write();
        const err = res && typeof res === "object" && "error" in res ? res.error : null;
        if (err) throw new Error(err.message);
        setState("saved");
        setMessage(`${opts.label} saved`);
        wceToast({ title: `${opts.label} saved` });
        opts.onDone?.();
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setState("idle"), 2400);
        return true;
      } catch (e) {
        opts.rollback?.();
        const msg = e instanceof Error ? e.message : "Unknown error";
        setState("failed");
        setMessage(msg);
        wceToast({ title: `${opts.label} could not be saved`, description: msg, tone: "error" });
        return false;
      }
    },
    [],
  );

  return { state, message, run, setState };
}

/** Inline saving / saved / failed indicator. Never a silent success. */
export function SaveBadge({ state, message }: { state: SaveState; message?: string | null }) {
  if (state === "idle") return null;
  const tone =
    state === "saving" ? "saving" : state === "saved" ? "saved" : "failed";
  return (
    <span className="wa-savebadge" data-tone={tone} role="status" aria-live="polite">
      {state === "saving" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
      {state === "saved" && <Check className="h-3.5 w-3.5" aria-hidden />}
      {state === "failed" && <TriangleAlert className="h-3.5 w-3.5" aria-hidden />}
      {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : message || "Failed"}
    </span>
  );
}

/* ---------------------------------------------------------------- skeletons */

export function Skeleton({ h = 16, w = "100%", r = 4 }: { h?: number; w?: number | string; r?: number }) {
  return <span className="wa-skel" style={{ height: h, width: w, borderRadius: r }} aria-hidden />;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="wa-panel" role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="wa-skel-row">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} h={13} w={c === 0 ? "38%" : `${Math.max(14, 70 - c * 12)}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 3, lines = 4 }: { count?: number; lines?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="wa-panel">
          <Skeleton h={18} w="42%" />
          <div style={{ height: 10 }} />
          {Array.from({ length: lines }).map((_, l) => (
            <div key={l} style={{ marginBottom: 8 }}>
              <Skeleton h={12} w={`${88 - l * 9}%`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="wa-stat">
          <Skeleton h={10} w="46%" />
          <div style={{ height: 12 }} />
          <Skeleton h={28} w="58%" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ tooltips */

/**
 * Explanatory tooltip. Opens on tap (touch), hover (pointer) and focus, closes
 * on Escape, blur or outside tap. Use sparingly — only where meaning is unclear.
 */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrap = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <span className="wa-tip-wrap" ref={wrap}>
      <button
        type="button"
        className="wa-tip-trigger"
        aria-label={`What does "${label}" mean?`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Info aria-hidden />
      </button>
      {open && (
        <span className="wa-tip" id={id} role="tooltip">
          <strong>{label}</strong>
          <span>{children}</span>
        </span>
      )}
    </span>
  );
}

/** Label plus an InfoTip, for form fields whose meaning is not obvious. */
export function TipLabel({
  children, tip, htmlFor,
}: { children: ReactNode; tip?: ReactNode; htmlFor?: string }) {
  return (
    <span className="wa-tiplabel">
      <label className="wa-field-label" htmlFor={htmlFor}>{children}</label>
      {tip && <InfoTip label={String(children)}>{tip}</InfoTip>}
    </span>
  );
}

/* ------------------------------------------------------------- confirmation */

type ConfirmRequest = {
  title: string;
  /** Must name the specific item being destroyed. */
  item: string;
  body?: string;
  confirmLabel?: string;
  resolve: (ok: boolean) => void;
};

const ConfirmCtx = createContext<((r: Omit<ConfirmRequest, "resolve">) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<ConfirmRequest | null>(null);
  const okRef = useRef<HTMLButtonElement | null>(null);

  const confirm = useCallback(
    (r: Omit<ConfirmRequest, "resolve">) =>
      new Promise<boolean>((resolve) => setReq({ ...r, resolve })),
    [],
  );

  useEffect(() => {
    if (!req) return;
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { req.resolve(false); setReq(null); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [req]);

  const close = (ok: boolean) => { req?.resolve(ok); setReq(null); };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {req && createPortal(
        <div className="wa-confirm-veil wce-admin" role="presentation" onClick={() => close(false)}>
          <div
            className="wa-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="wa-confirm-title"
            aria-describedby="wa-confirm-body"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="wa-confirm-title" className="wa-serif">{req.title}</h2>
            <p id="wa-confirm-body">
              {req.body ? `${req.body} ` : ""}
              This will affect <strong className="wa-confirm-item">{req.item}</strong>. This cannot be undone.
            </p>
            <div className="wa-confirm-actions">
              <button type="button" className="wa-btn wa-btn-ghost" onClick={() => close(false)}>
                Cancel
              </button>
              <button
                ref={okRef}
                type="button"
                className="wa-btn wa-btn-danger"
                onClick={() => close(true)}
              >
                {req.confirmLabel ?? "Delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </ConfirmCtx.Provider>
  );
}

/** Ask before a destructive action, naming the specific item. */
export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  return (
    ctx ??
    (async (r: Omit<ConfirmRequest, "resolve">) =>
      window.confirm(`${r.title}\n\n${r.item}`))
  );
}

/* --------------------------------------------------------- unsaved changes */

/**
 * Warns before a full page unload while a form is dirty. In-app tab switches are
 * guarded by the caller through `guard()`.
 */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBefore = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onBefore);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, [dirty]);

  const guard = useCallback(
    (proceed: () => void) => {
      if (!dirty || window.confirm("You have unsaved changes. Leave without saving?")) proceed();
    },
    [dirty],
  );

  return guard;
}

/** Small "unsaved changes" flag for a dirty form. */
export function DirtyFlag({ dirty }: { dirty: boolean }) {
  if (!dirty) return null;
  return (
    <span className="wa-savebadge" data-tone="dirty" role="status">
      <TriangleAlert className="h-3.5 w-3.5" aria-hidden /> Unsaved changes
    </span>
  );
}

/* --------------------------------------------------------------- filter bar */

/**
 * Filters inline from 768px up; below that they collapse into a single sheet so
 * nothing overflows horizontally.
 */
export function FilterBar({
  children, activeCount = 0, actions,
}: { children: ReactNode; activeCount?: number; actions?: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="wa-filterbar">
      <div className="wa-filters-inline">{children}</div>

      <button
        type="button"
        className="wa-btn wa-btn-ghost wa-filters-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
      </button>

      {actions && <div className="wa-filter-actions">{actions}</div>}

      {open && createPortal(
        <div className="wa-sheet-veil wce-admin" onClick={() => setOpen(false)} role="presentation">
          <div
            className="wa-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wa-sheet-head">
              <span className="wa-label">Filters</span>
              <button type="button" className="wa-icon-btn" aria-label="Close filters" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="wa-sheet-body">{children}</div>
            <div className="wa-sheet-foot">
              <button type="button" className="wa-btn wa-btn-primary" onClick={() => setOpen(false)}>
                Show results
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

/* -------------------------------------------------------------- misc pieces */

/** Row-level "details" expander so mobile cards can hide secondary fields. */
export function Expander({ label = "Details", children }: { label?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="wa-expander">
      <button type="button" className="wa-expander-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <ChevronDown className="h-3.5 w-3.5" aria-hidden style={{ transform: open ? "rotate(180deg)" : undefined }} />
        {open ? `Hide ${label.toLowerCase()}` : label}
      </button>
      {open && <div className="wa-expander-body">{children}</div>}
    </div>
  );
}

export function WarnBadge({ children, tone = "warn" }: { children: ReactNode; tone?: "warn" | "danger" | "ok" }) {
  return <span className="wa-warn" data-tone={tone}><TriangleAlert className="h-3.5 w-3.5" aria-hidden />{children}</span>;
}

/** Empty state with the drawn gold ornament, guidance and the next action. */
export function GuidedEmpty({
  title, line, action,
}: { title: string; line: string; action?: ReactNode }) {
  return (
    <div className="wa-empty">
      <EmptyOrnament />
      <p className="wa-serif" style={{ fontSize: "1.15rem", color: "var(--wa-cream)" }}>{title}</p>
      <p style={{ fontSize: "0.88rem", marginTop: "0.3rem", maxWidth: 420, marginInline: "auto", lineHeight: 1.55 }}>
        {line}
      </p>
      {action && <div style={{ marginTop: "1rem" }}>{action}</div>}
    </div>
  );
}

/** Remembers when the organiser last opened a section, to flag new arrivals. */
export function useLastVisit(key: string) {
  const storeKey = `wce-admin-lastvisit:${key}`;
  const [since] = useState<number>(() => {
    const raw = window.localStorage.getItem(storeKey);
    return raw ? Number(raw) : 0;
  });
  useEffect(() => {
    window.localStorage.setItem(storeKey, String(Date.now()));
  }, [storeKey]);
  return useMemo(() => ({
    since,
    isNew: (iso: string) => since > 0 && new Date(iso).getTime() > since,
  }), [since]);
}
