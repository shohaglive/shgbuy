import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  name: string;
  /** DOM id. Defaults to `name`; set it when the same field name appears more than once on a page. */
  id?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
  /** Render a textarea or select instead of an input. */
  as?: "input" | "textarea" | "select";
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  rows?: number;
  step?: string;
  min?: string;
  /** <option> children when `as="select"`. */
  children?: ReactNode;
};

/** Label + control + error, styled with the design system's `.field`. Shared by checkout and admin. */
export function Field({
  label,
  name,
  id: idProp,
  error,
  hint,
  required = true,
  defaultValue = "",
  className,
  as = "input",
  type = "text",
  autoComplete,
  placeholder,
  rows = 4,
  step,
  min,
  children,
}: FieldProps) {
  const id = idProp ?? name;
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: `field ${error ? "border-danger" : ""}`,
  } as const;

  return (
    <div className={className}>
      <label htmlFor={id} className="label mb-2 block">
        {label}
        {!required && <span className="ml-1 normal-case tracking-normal text-ink-subtle">(optional)</span>}
      </label>
      {as === "textarea" ? (
        <textarea {...common} rows={rows} defaultValue={defaultValue} placeholder={placeholder} />
      ) : as === "select" ? (
        // `key` remounts the select when its default changes: React only applies a select's
        // defaultValue on mount, so without it a form reset after an error drops the choice.
        <select key={defaultValue} {...common} defaultValue={defaultValue} autoComplete={autoComplete}>
          {children}
        </select>
      ) : (
        <input
          {...common}
          type={type}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          placeholder={placeholder}
          step={step}
          min={min}
        />
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
