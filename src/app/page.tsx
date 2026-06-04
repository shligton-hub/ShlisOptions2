import { Activity, ArrowUpRight, Database, Filter, Target } from "lucide-react";
import { currency, number, percent } from "@/components/format";
import { AppShell } from "@/components/shell";
import { Metric, Panel, ProgressBar, ScoreBadge, Section } from "@/components/ui";
import { calculateOptionMath } from "@/lib/options-math";
import { createWatchlistFromOptions, getPositions, getScoredOptions } from "@/lib/market-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [options, positions] = await Promise.all([getScoredOptions(), getPositions()]);
  const watchlist = createWatchlistFromOptions(options);
  const best = options[0];
  const totalPremium = positions.reduce((sum, position) => sum + position.entryPremium * position.contracts * 100, 0);
  const markValue = positions.reduce((sum, position) => sum + position.currentPremium * position.contracts * 100, 0);
  const openPnl = markValue - totalPremium;
  const model = calculateOptionMath({
    stockPrice: best.stockPrice,
    strike: best.strike,
    premium: best.premium,
    targetPrice: best.targetPrice
  });

  return (
    <AppShell>
      <Section id="dashboard" title="Dashboard">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Top Deal Score" value={`${best.score.total}/100`} tone="good" />
          <Metric label="Best Breakeven" value={currency(best.math.breakeven)} />
          <Metric label="Open P/L" value={currency(openPnl)} tone={openPnl >= 0 ? "good" : "bad"} />
          <Metric label="Premium Deployed" value={currency(totalPremium)} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Panel className="overflow-hidden">
            <div className="border-b border-white/10 px-4 py-3">
              <p className="text-sm font-medium text-white">Highest ranked LEAPS candidates</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Ticker</th>
                    <th className="px-4 py-3">Contract</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Breakeven</th>
                    <th className="px-4 py-3">Required Move</th>
                    <th className="px-4 py-3">ROI at Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {options.slice(0, 4).map((option) => (
                    <tr key={option.id} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-white">{option.underlying}</p>
                        <p className="text-xs text-slate-500">{option.companyName}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {currency(option.strike)}C - {option.daysToExpiration} DTE
                      </td>
                      <td className="px-4 py-4">
                        <ScoreBadge score={option.score.total} />
                      </td>
                      <td className="px-4 py-4 text-slate-300">{currency(option.math.breakeven)}</td>
                      <td className="px-4 py-4 text-slate-300">{percent(option.math.requiredMovePct)}</td>
                      <td className="px-4 py-4 text-accent-mint">{percent(option.math.roiPct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Activity className="h-4 w-4 text-accent-mint" />
              Score breakdown
            </div>
            <div className="mt-4 space-y-4">
              {[
                ["Time to expiration", best.score.timeToExpiration, 20],
                ["Breakeven difficulty", best.score.breakevenDifficulty, 20],
                ["Upside reward", best.score.upsideReward, 20],
                ["Premium efficiency", best.score.premiumEfficiency, 15],
                ["Moneyness", best.score.moneyness, 15],
                ["Liquidity", best.score.liquidity, 10]
              ].map(([label, value, max]) => (
                <div key={label.toString()}>
                  <div className="mb-2 flex justify-between text-xs text-slate-400">
                    <span>{label}</span>
                    <span>
                      {value}/{max}
                    </span>
                  </div>
                  <ProgressBar value={Number(value)} max={Number(max)} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </Section>

      <Section
        id="screener"
        title="Deal Screener"
        action={
          <button className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
            <Filter className="h-4 w-4" />
            LEAPS calls
          </button>
        }
      >
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Underlying</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Strike</th>
                  <th className="px-4 py-3">Premium</th>
                  <th className="px-4 py-3">Expiration</th>
                  <th className="px-4 py-3">Intrinsic</th>
                  <th className="px-4 py-3">Extrinsic</th>
                  <th className="px-4 py-3">Target Profit</th>
                  <th className="px-4 py-3">Liquidity</th>
                  <th className="px-4 py-3">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {options.map((option) => (
                  <tr key={option.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">{option.underlying}</p>
                      <p className="max-w-56 truncate text-xs text-slate-500">{option.thesis}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{currency(option.stockPrice)}</td>
                    <td className="px-4 py-4 text-slate-300">{currency(option.strike)}</td>
                    <td className="px-4 py-4 text-slate-300">{currency(option.premium)}</td>
                    <td className="px-4 py-4 text-slate-300">{option.expirationDate}</td>
                    <td className="px-4 py-4 text-slate-300">{currency(option.math.intrinsicValue)}</td>
                    <td className="px-4 py-4 text-slate-300">{currency(option.math.extrinsicValue)}</td>
                    <td className="px-4 py-4 text-accent-mint">{currency(option.math.profitAtTarget)}</td>
                    <td className="px-4 py-4 text-slate-300">{number(option.openInterest)} OI</td>
                    <td className="px-4 py-4">
                      <ScoreBadge score={option.score.total} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </Section>

      <Section id="profit-model" title="Profit Model">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Target className="h-4 w-4 text-accent-gold" />
              Current model
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <ModelCell label="Symbol" value={best.underlying} />
              <ModelCell label="Target" value={currency(best.targetPrice)} />
              <ModelCell label="Strike" value={currency(best.strike)} />
              <ModelCell label="Premium" value={currency(best.premium)} />
              <ModelCell label="Breakeven" value={currency(model.breakeven)} />
              <ModelCell label="Profit" value={currency(model.profitAtTarget)} good />
              <ModelCell label="Required Move" value={percent(model.requiredMovePct)} />
              <ModelCell label="ROI" value={percent(model.roiPct)} good />
            </div>
          </Panel>
          <Panel className="p-4">
            <p className="text-sm font-medium text-white">Target price ladder</p>
            <div className="mt-4 space-y-3">
              {[0.9, 1, 1.1, 1.2, 1.35].map((multiplier) => {
                const target = best.stockPrice * multiplier;
                const row = calculateOptionMath({ stockPrice: best.stockPrice, strike: best.strike, premium: best.premium, targetPrice: target });
                return (
                  <div key={multiplier} className="grid grid-cols-4 items-center gap-3 rounded bg-white/[0.035] px-3 py-3 text-sm">
                    <span className="font-medium text-white">{currency(target)}</span>
                    <span className="text-slate-400">Profit {currency(row.profitAtTarget)}</span>
                    <span className={row.roiPct >= 0 ? "text-accent-mint" : "text-accent-red"}>{percent(row.roiPct)}</span>
                    <ProgressBar value={Math.max(0, row.roiPct)} max={2} />
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </Section>

      <Section id="watchlist" title="Watchlist">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {watchlist.map((item) => (
            <Panel key={item.symbol} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{item.symbol}</p>
                  <p className="text-xs text-slate-500">{item.companyName}</p>
                </div>
                <ScoreBadge score={item.bestScore} />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{item.note}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                <span className="text-slate-500">Move to BE</span>
                <span className="font-medium text-accent-gold">{percent(item.requiredMovePct)}</span>
              </div>
            </Panel>
          ))}
        </div>
      </Section>

      <Section id="positions" title="Positions">
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Contracts</th>
                  <th className="px-4 py-3">Entry</th>
                  <th className="px-4 py-3">Mark</th>
                  <th className="px-4 py-3">P/L</th>
                  <th className="px-4 py-3">Expiration</th>
                  <th className="px-4 py-3">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {positions.map((position) => {
                  const pnl = (position.currentPremium - position.entryPremium) * position.contracts * 100;
                  return (
                    <tr key={position.id} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-white">
                          {position.underlying} {currency(position.strike)}C
                        </p>
                        <p className="text-xs text-slate-500">{position.companyName}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-300">{position.contracts}</td>
                      <td className="px-4 py-4 text-slate-300">{currency(position.entryPremium)}</td>
                      <td className="px-4 py-4 text-slate-300">{currency(position.currentPremium)}</td>
                      <td className={pnl >= 0 ? "px-4 py-4 text-accent-mint" : "px-4 py-4 text-accent-red"}>{currency(pnl)}</td>
                      <td className="px-4 py-4 text-slate-300">{position.expirationDate}</td>
                      <td className="px-4 py-4 text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          {currency(position.targetPrice)}
                          <ArrowUpRight className="h-3.5 w-3.5 text-accent-mint" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Database className="h-4 w-4" />
          PostgreSQL schema includes users, watchlist, option snapshots, positions, scoring results, and analyst targets.
        </div>
      </Section>
    </AppShell>
  );
}

function ModelCell({ label, value, good = false }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded bg-white/[0.035] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={good ? "mt-1 font-semibold text-accent-mint" : "mt-1 font-semibold text-white"}>{value}</p>
    </div>
  );
}
