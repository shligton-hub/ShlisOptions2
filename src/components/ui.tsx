import { clsx } from "clsx";

export function Section({ id, title, action, children }: { id: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-5 py-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("rounded border border-white/10 bg-white/[0.045] shadow-terminal", className)}>{children}</div>;
}

export function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const toneClass = {
    neutral: "text-white",
    good: "text-accent-mint",
    warn: "text-accent-gold",
    bad: "text-accent-red"
  }[tone];

  return (
    <Panel className="p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={clsx("mt-2 text-2xl font-semibold", toneClass)}>{value}</p>
    </Panel>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "bg-accent-mint text-surface-950" : score >= 68 ? "bg-accent-gold text-surface-950" : "bg-white/10 text-slate-200";
  return <span className={clsx("inline-flex min-w-14 items-center justify-center rounded px-2 py-1 text-sm font-semibold", color)}>{score}</span>;
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded bg-white/10">
      <div className="h-full rounded bg-accent-cyan" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}
