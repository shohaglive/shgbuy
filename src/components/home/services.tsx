import { services } from "@/lib/catalog";

export function Services() {
  return (
    <section aria-label="Our services" className="divider">
      <ul className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-4 lg:py-16">
        {services.map((s) => (
          <li key={s.title}>
            <h3 className="font-sans! text-[0.75rem]! font-medium uppercase tracking-[0.12em]!">{s.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{s.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
