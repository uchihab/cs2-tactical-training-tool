"use client";

import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Overlay + painel genérico usado pelos formulários do Playbook. */
export function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-200">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-500 underline underline-offset-2"
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
