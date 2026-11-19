"use client";

import { useRef } from "react";

/**
 * A button that asks for confirmation in a native <dialog> before submitting its enclosing form.
 * Render it inside a <form action={serverAction}>.
 */
export function ConfirmButton({
  children,
  title,
  description,
  confirmLabel = "Confirm",
  className = "btn btn-secondary",
  name,
  value,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  className?: string;
  /** Sent with the form when the dialog's confirm button submits it. */
  name?: string;
  value?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className={className} onClick={() => ref.current?.showModal()}>
        {children}
      </button>
      <dialog
        ref={ref}
        aria-labelledby="confirm-title"
        className="m-auto w-[min(28rem,calc(100vw-2rem))] border border-ink bg-canvas p-6 text-ink backdrop:bg-black/40"
      >
        <h2 id="confirm-title" className="text-2xl">{title}</h2>
        <p className="mt-3 text-sm text-ink-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn btn-secondary" onClick={() => ref.current?.close()}>
            Cancel
          </button>
          <button type="submit" name={name} value={value} className="btn btn-primary" onClick={() => ref.current?.close()}>
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
