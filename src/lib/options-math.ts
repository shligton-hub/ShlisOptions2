import type { DealScore, OptionContract, OptionMath, ScoredOption } from "./types";

const MS_PER_DAY = 86_400_000;

export function round(value: number, digits = 2) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function daysToExpiration(expirationDate: string, from = new Date("2026-06-03T12:00:00-04:00")) {
  return Math.max(0, Math.ceil((new Date(expirationDate).getTime() - from.getTime()) / MS_PER_DAY));
}

export function calculateOptionMath(contract: Pick<OptionContract, "stockPrice" | "strike" | "premium" | "targetPrice">): OptionMath {
  const breakeven = contract.strike + contract.premium;
  const intrinsicValue = Math.max(contract.stockPrice - contract.strike, 0);
  const extrinsicValue = contract.premium - intrinsicValue;
  const requiredMovePct = (breakeven - contract.stockPrice) / contract.stockPrice;
  const profitAtTarget = Math.max(contract.targetPrice - contract.strike, 0) - contract.premium;
  const roiPct = profitAtTarget / contract.premium;

  return {
    breakeven: round(breakeven),
    intrinsicValue: round(intrinsicValue),
    extrinsicValue: round(extrinsicValue),
    requiredMovePct: round(requiredMovePct, 4),
    profitAtTarget: round(profitAtTarget),
    roiPct: round(roiPct, 4)
  };
}

export function scoreOption(contract: OptionContract): DealScore {
  const math = calculateOptionMath(contract);
  const dte = daysToExpiration(contract.expirationDate);
  const spreadPct = (contract.ask - contract.bid) / contract.premium;
  const moneynessDistance = Math.abs(contract.strike - contract.stockPrice) / contract.stockPrice;
  const premiumToStock = contract.premium / contract.stockPrice;

  const timeToExpiration = Math.round(clamp((dte - 180) / 550, 0, 1) * 20);
  const breakevenDifficulty = Math.round(clamp(1 - math.requiredMovePct / 0.35, 0, 1) * 20);
  const upsideReward = Math.round(clamp(math.roiPct / 2.5, 0, 1) * 20);
  const premiumEfficiency = Math.round(clamp(1 - premiumToStock / 0.22, 0, 1) * 15);
  const moneyness = Math.round(clamp(1 - moneynessDistance / 0.28, 0, 1) * 15);
  const liquidity = Math.round((clamp(contract.openInterest / 4000, 0, 0.65) + clamp(contract.volume / 1200, 0, 0.35)) * 10);

  return {
    total: timeToExpiration + breakevenDifficulty + upsideReward + premiumEfficiency + moneyness + liquidity,
    timeToExpiration,
    breakevenDifficulty,
    upsideReward,
    premiumEfficiency,
    moneyness,
    liquidity: Math.max(0, liquidity - Math.round(clamp(spreadPct - 0.12, 0, 0.2) * 10))
  };
}

export function enrichOption(contract: OptionContract): ScoredOption {
  const score = scoreOption(contract);
  return {
    ...contract,
    math: calculateOptionMath(contract),
    score: {
      ...score,
      total:
        score.timeToExpiration +
        score.breakevenDifficulty +
        score.upsideReward +
        score.premiumEfficiency +
        score.moneyness +
        score.liquidity
    },
    daysToExpiration: daysToExpiration(contract.expirationDate)
  };
}
