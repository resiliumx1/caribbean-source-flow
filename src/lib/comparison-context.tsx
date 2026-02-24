import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface ComparisonContextType {
  items: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearAll: () => void;
  isInCompare: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const STORAGE_KEY = "kailash_compare";
const EXPIRY_MS = 24 * 60 * 60 * 1000;

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return parsed.items ?? [];
  } catch {
    return [];
  }
}

function saveToStorage(items: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, timestamp: Date.now() }));
}

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  const addToCompare = (id: string) => {
    if (items.includes(id)) return;
    if (items.length >= 3) {
      toast.warning("Maximum 3 items — remove one to add another");
      return;
    }
    setItems((prev) => [...prev, id]);
    toast.success("Added to compare", {
      action: { label: "View", onClick: () => window.location.assign("/compare") },
    });
  };

  const removeFromCompare = (id: string) => {
    setItems((prev) => prev.filter((i) => i !== id));
  };

  const clearAll = () => setItems([]);

  const isInCompare = (id: string) => items.includes(id);

  return (
    <ComparisonContext.Provider value={{ items, addToCompare, removeFromCompare, clearAll, isInCompare }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error("useComparison must be used within ComparisonProvider");
  return ctx;
}
