export type BadgeTone = "neutral" | "ink" | "accent" | "danger";

const TONES: Record<BadgeTone, string> = {
  neutral: "text-ink-muted",
  ink: "text-ink",
  accent: "text-accent",
  danger: "text-danger",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return <span className={`badge ${TONES[tone]}`}>{children}</span>;
}
