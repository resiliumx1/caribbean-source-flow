import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GripVertical } from "lucide-react";

export const WCE_BUCKET = "retreat-images";

export async function uploadWceImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `wce/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(WCE_BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(WCE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function ImageUploadField({
  value,
  folder,
  onChange,
  label = "Image",
}: {
  value: string | null;
  folder: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="h-14 w-14 rounded object-cover border border-border" />
        ) : (
          <div className="h-14 w-14 rounded border border-dashed border-border" />
        )}
        <input
          type="file"
          accept="image/*"
          className="text-xs"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setErr(null);
            try {
              onChange(await uploadWceImage(file, folder));
            } catch (ex: any) {
              setErr(ex.message ?? "Upload failed");
            }
            setBusy(false);
          }}
        />
      </div>
      {busy && <p className="text-xs text-muted-foreground">Uploading…</p>}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}

/** Minimal native HTML5 drag-to-reorder hook for list rows. */
export function useDragReorder<T extends { id: string }>(
  items: T[],
  onCommit: (ordered: T[]) => void
) {
  const [dragId, setDragId] = useState<string | null>(null);

  const rowProps = (item: T) => ({
    draggable: true,
    onDragStart: () => setDragId(item.id),
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragId || dragId === item.id) return;
      const from = items.findIndex((i) => i.id === dragId);
      const to = items.findIndex((i) => i.id === item.id);
      if (from < 0 || to < 0) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onCommit(next);
    },
    onDragEnd: () => setDragId(null),
    style: { opacity: dragId === item.id ? 0.5 : 1, cursor: "grab" as const },
  });

  return { rowProps, dragId };
}

export function DragHandle() {
  return <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />;
}

export const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";