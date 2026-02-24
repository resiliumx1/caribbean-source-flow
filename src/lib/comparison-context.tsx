import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface ComparisonContextType {
  items: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearAll: () => void;
  isInCompare: (id: string) => boolean;
  isDismissed: boolean;
  dismiss: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const STORAGE_KEY = "kailash_compare";
const EXPIRY_MS = 24 * 60 * 60 * 1000;

function loadFromStorage(): { items: string[]; dismissed: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], dismissed: false };
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return { items: [], dismissed: false };
    }
    return { items: parsed.items ?? [], dismissed: parsed.dismissed ?? false };
  } catch {
    return { items: [], dismissed: false };
  }
}

function saveToStorage(items: string[], dismissed: boolean) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, dismissed, timestamp: Date.now() }));
}

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage();
  const [items, setItems] = useState<string[]>(stored.items);
  const [isDismissed, setIsDismissed] = useState(stored.dismissed);

  useEffect(() => {
    saveToStorage(items, isDismissed);
  }, [items, isDismissed]);

  const addToCompare = (id: string) => {
    if (items.includes(id)) return;
    if (items.length >= 3) {
      toast.warning("Maximum 3 items — remove one to add another");
      return;
    }
    setItems((prev) => [...prev, id]);
    setIsDismissed(false);
    toast.success("Added to compare", {
      action: { label: "View", onClick: () => window.location.assign("/compare") },
    });
  };

  const removeFromCompare = (id: string) => {
    setItems((prev) => prev.filter((i) => i !== id));
  };

  const clearAll = () => {
    setItems([]);
    setIsDismissed(true);
  };

  const isInCompare = (id: string) => items.includes(id);

  const dismiss = () => setIsDismissed(true);

  return (
    <ComparisonContext.Provider value={{ items, addToCompare, removeFromCompare, clearAll, isInCompare, isDismissed, dismiss }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error("useComparison must be used within ComparisonProvider");
  return ctx;
}
