"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { ApiError } from "@/api/client";
import { HTTPError } from "ky";
import * as T from "@/api/types";

type ToastType = "success" | "error";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  handleError: (err: any) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const success = useCallback((message: string) => addToast(message, "success"), [addToast]);
  const error = useCallback((message: string) => addToast(message, "error"), [addToast]);

  const handleError = useCallback(async (err: any) => {
    console.error('Toast Error Handler:', err);
    let message = "An unexpected error occurred";
    
    if (err instanceof ApiError) {
      message = err.message;
    } else if (err instanceof HTTPError) {
      try {
        // Clone response because it can only be read once
        const data = (await err.response.clone().json()) as T.ErrorResponse;
        if (data?.message) {
          message = data.message;
        } else if (data?.code) {
          message = `Error: ${data.code}`;
        } else {
          message = `Server returned ${err.response.status}: ${err.response.statusText}`;
        }
      } catch {
        message = `Network error (${err.response.status})`;
      }
    } else if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    }

    addToast(message, "error");
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, handleError }}>
      {children}
      {/* Render Toasts globally */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none w-max max-w-[90vw]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
