"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  kind: ToastKind;
};

type ToastContextValue = {
  toast: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev, { id, message, kind }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl animate-slide-in-right",
              item.kind === "success" &&
                "border-emerald-500/35 bg-slate-950/90 text-emerald-50",
              item.kind === "error" &&
                "border-red-500/35 bg-slate-950/90 text-red-50",
              item.kind === "info" &&
                "border-slate-600/50 bg-slate-950/90 text-slate-100"
            )}
          >
            {item.kind === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            ) : item.kind === "error" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            ) : (
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
            )}
            <p className="flex-1 text-sm leading-snug">{item.message}</p>
            <button
              type="button"
              className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
              onClick={() =>
                setItems((prev) => prev.filter((t) => t.id !== item.id))
              }
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (_message: string, _kind?: ToastKind) => {
        /* no-op outside provider */
      },
    };
  }
  return ctx;
}
