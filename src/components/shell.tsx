import { BarChart3, BriefcaseBusiness, Calculator, Gauge, LayoutDashboard, Search, Star } from "lucide-react";
import Link from "next/link";

const nav = [
  { href: "#dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "#screener", label: "Deal Screener", icon: Search },
  { href: "#profit-model", label: "Profit Model", icon: Calculator },
  { href: "#watchlist", label: "Watchlist", icon: Star },
  { href: "#positions", label: "Positions", icon: BriefcaseBusiness }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(61,214,245,0.12),transparent_32rem),linear-gradient(180deg,#080b10,#0d121a_45%,#080b10)]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-surface-950/80 px-5 py-6 backdrop-blur xl:block">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded bg-accent-mint text-surface-950">
            <Gauge className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-accent-mint">Cuzzo's</p>
            <h1 className="text-lg font-semibold">Options Terminal</h1>
          </div>
        </div>
        <nav className="mt-9 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 left-5 right-5 rounded border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4 text-accent-cyan" />
            API-ready mock mode
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">Provider interface is ready for Tradier, Polygon/Massive, Finnhub, or Alpha Vantage.</p>
        </div>
      </aside>
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 xl:ml-72 xl:px-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-accent-mint">Long calls and LEAPS</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Cuzzo's Options Terminal</h2>
          </div>
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
            <span className="h-2 w-2 rounded-full bg-accent-mint" />
            Mock market feed live
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
