"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function StoreDrawer({ id, label, side, open, onDismiss, children }: {
  id: string;
  label: string;
  side: "left" | "right";
  open: boolean;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const panel = dialog.current;
    if (!panel) return;
    if (open && !panel.open) panel.showModal();
    if (!open && panel.open) panel.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      id={id}
      aria-label={label}
      data-side={side}
      className={`store-drawer fixed inset-y-0 m-0 h-dvh max-h-none w-[calc(100%-1rem)] overflow-hidden bg-white text-stone-900 shadow-xl ${side === "left" ? "left-0 right-auto max-w-xs" : "right-0 left-auto max-w-md"}`}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      {open && children}
    </dialog>
  );
}
