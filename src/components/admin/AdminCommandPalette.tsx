import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { AdminNavGroup } from "./nav-config";

/**
 * Cmd/Ctrl+K palette over every admin destination the signed-in user can reach.
 * Only the groups passed in are searchable, so it can never jump a
 * consultation editor or organiser into a forbidden route.
 */
export function AdminCommandPalette({
  open,
  onOpenChange,
  groups,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: AdminNavGroup[];
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search admin pages…" />
      <CommandList>
        <CommandEmpty>No pages match that search.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.id} heading={group.label}>
            {group.items.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.label} ${group.label} ${item.description}`}
                onSelect={() => {
                  onOpenChange(false);
                  navigate(item.href);
                }}
                className="gap-3 py-2.5"
              >
                <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] text-foreground">{item.label}</span>
                  <span className="block text-[12px] text-muted-foreground truncate">
                    {item.description}
                  </span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}