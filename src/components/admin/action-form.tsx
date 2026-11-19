"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/admin/form-message";
import type { AdminActionState } from "@/lib/admin/types";

type Action = (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;

/**
 * A form wired to an admin Server Action with inline feedback. Fields can be passed as
 * server-rendered children; `fields` become hidden inputs (ids and the like).
 */
export function ActionForm({
  action,
  fields,
  children,
  className,
}: {
  action: Action;
  fields?: Record<string, string | number>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {} as AdminActionState);
  return (
    <form action={formAction} className={className}>
      {Object.entries(fields ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={String(value)} />
      ))}
      {children}
      {(state.error || state.success) && (
        <div className="mt-3">
          <FormMessage error={state.error} success={state.success} />
        </div>
      )}
    </form>
  );
}
