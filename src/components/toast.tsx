"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastKind = "success" | "error" | "info";

export type ToastInput = {
  kind?: ToastKind;
  title: string;
  message?: string;
  /** ms before auto-dismiss; default 4500. Pass 0 to require manual dismiss. */
  duration?: number;
};

type Toast = ToastInput & { id: number };

type Ctx = { toast: (t: ToastInput) => void };
const ToastContext = createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/**
 * Helper for forms backed by useActionState. Watches the action's `pending`
 * flag transition from true → false and fires a success or error toast.
 *
 * Usage:
 *   const [state, action, pending] = useActionState(...);
 *   useToastOnAction(state, pending, {
 *     success: { title: "Profile saved" },
 *     errorTitle: "Couldn't save",
 *   });
 */
export function useToastOnAction(
  state: { ok: boolean; error?: string } | null,
  pending: boolean,
  cfg: {
    success: ToastInput;
    errorTitle?: string;
  },
) {
  const { toast } = useToast();
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && state) {
      if (state.ok) {
        toast({ kind: "success", ...cfg.success });
      } else {
        toast({
          kind: "error",
          title: cfg.errorTitle ?? "Something went wrong",
          message: state.error,
        });
      }
    }
    wasPending.current = pending;
    // We intentionally only react to pending/state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, state]);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = ++counter.current;
      const next: Toast = { ...input, id };
      setToasts((prev) => [...prev, next]);
      const duration = input.duration ?? 4500;
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="fixed inset-x-3 top-3 z-50 flex flex-col items-stretch gap-2 sm:inset-auto sm:top-4 sm:right-4 sm:w-96"
    >
      {toasts.map((t) => (
        <ToastView key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

const KIND_STYLES: Record<
  ToastKind,
  { ring: string; iconColor: string; Icon: typeof CheckCircle }
> = {
  success: {
    ring: "border-[var(--color-success)]/40",
    iconColor: "text-[var(--color-success)]",
    Icon: CheckCircle,
  },
  error: {
    ring: "border-[var(--color-danger)]/40",
    iconColor: "text-[var(--color-danger)]",
    Icon: AlertCircle,
  },
  info: {
    ring: "border-[var(--color-primary)]/40",
    iconColor: "text-[var(--color-primary)]",
    Icon: Info,
  },
};

function ToastView({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const kind = toast.kind ?? "info";
  const { ring, iconColor, Icon } = KIND_STYLES[kind];
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border bg-[var(--color-card)] p-3.5 shadow-lg",
        "animate-[toast-in_180ms_ease-out]",
        ring,
      )}
      style={
        {
          // local keyframe (kept inline to avoid editing globals.css per toast)
        }
      }
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColor)} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{toast.title}</div>
        {toast.message && (
          <div className="mt-0.5 text-sm text-[var(--color-muted)] break-words">
            {toast.message}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-border)]/50"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
