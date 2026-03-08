"use client"

import React from "react"

import { useState, useCallback } from "react"
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => string
  removeToast: (id: string) => void
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${toastId++}`
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration
    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />,
    error: <AlertCircle className="w-5 h-5 text-[#D32F2F]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#E65100]" />,
    info: <Info className="w-5 h-5 text-[#0051C3]" />,
  }

  const bgColors: Record<ToastType, string> = {
    success: "bg-[#E8F5E9] border-[#2E7D32]/20",
    error: "bg-[#FFEBEE] border-[#D32F2F]/20",
    warning: "bg-[#FFF3E0] border-[#E65100]/20",
    info: "bg-[#E3F2FD] border-[#0051C3]/20",
  }

  const textColors: Record<ToastType, string> = {
    success: "text-[#1B5E20]",
    error: "text-[#9B2C2C]",
    warning: "text-[#E65100]",
    info: "text-[#00308E]",
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg border ${bgColors[toast.type]} pointer-events-auto shadow-lg animate-in fade-in slide-in-from-right-4 duration-300`}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1">
            <p className={`font-medium text-sm ${textColors[toast.type]}`}>{toast.title}</p>
            {toast.message && <p className={`text-xs mt-1 ${textColors[toast.type]} opacity-90`}>{toast.message}</p>}
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick()
                  onRemove(toast.id)
                }}
                className={`text-xs font-medium mt-2 underline hover:opacity-80 transition-opacity`}
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className={`flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
