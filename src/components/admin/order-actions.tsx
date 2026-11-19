"use client";

import { useActionState } from "react";
import { updateOrderStatus } from "@/app/actions/admin/orders";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import type { OrderStatus } from "@/db/schema";
import type { AdminActionState } from "@/lib/admin/types";

/**
 * One persistent form for every fulfilment action. Only the buttons change with the order's status,
 * so the result message survives the status change that the action itself causes.
 */
export function OrderActions({ orderId, orderNumber, status }: { orderId: string; orderNumber: string; status: OrderStatus }) {
  const [state, formAction] = useActionState<AdminActionState, FormData>(updateOrderStatus, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="orderNumber" value={orderNumber} />

      {status === "confirmed" && (
        <>
          <SubmitButton name="to" value="shipped" className="btn btn-primary btn-block" pendingLabel="Updating...">
            Mark as shipped
          </SubmitButton>
          <ConfirmButton
            name="to"
            value="cancelled"
            className="btn btn-secondary btn-block"
            title="Cancel this order?"
            description="The order will be marked cancelled and every item returned to stock. This can't be undone."
            confirmLabel="Cancel order"
          >
            Cancel and restock
          </ConfirmButton>
        </>
      )}
      {status === "shipped" && (
        <SubmitButton name="to" value="delivered" className="btn btn-primary btn-block" pendingLabel="Updating...">
          Mark as delivered
        </SubmitButton>
      )}
      {(status === "delivered" || status === "cancelled") && (
        <p className="text-sm text-ink-muted">This order is {status}; no further changes are possible.</p>
      )}

      <FormMessage error={state.error} success={state.success} />
    </form>
  );
}
