import type { ReactNode } from "react";

export function PageHeader({
  eyebrow = "Admin",
  title,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-10">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-[clamp(1.75rem,1.2rem+1.6vw,2.5rem)]">{title}</h1>
        {children}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
