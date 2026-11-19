/** Result of an admin Server Action, used with useActionState. */
export type AdminActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<string, string>>;
  /** Echoed back so a form keeps what the admin typed after a validation error. */
  values?: Record<string, string>;
};
