export type OptionContract = {
  id: string;
  underlying: string;
  companyName: string;
  stockPrice: number;
  strike: number;
  premium: number;
  expirationDate: string;
  delta: number;
  openInterest: number;
  volume: number;
  bid: number;
  ask: number;
  impliedVolatility: number;
  targetPrice: number;
  analystRating: string;
  thesis: string;
};

export type OptionMath = {
  breakeven: number;
  intrinsicValue: number;
  extrinsicValue: number;
  requiredMovePct: number;
  profitAtTarget: number;
  roiPct: number;
};

export type DealScore = {
  total: number;
  timeToExpiration: number;
  breakevenDifficulty: number;
  upsideReward: number;
  premiumEfficiency: number;
  moneyness: number;
  liquidity: number;
};

export type ScoredOption = OptionContract & {
  math: OptionMath;
  score: DealScore;
  daysToExpiration: number;
};

export type WatchlistItem = {
  symbol: string;
  companyName: string;
  stockPrice: number;
  targetPrice: number;
  bestScore: number;
  requiredMovePct: number;
  note: string;
};

export type Position = {
  id: string;
  underlying: string;
  companyName: string;
  contracts: number;
  strike: number;
  expirationDate: string;
  entryPremium: number;
  currentPremium: number;
  stockPrice: number;
  targetPrice: number;
};
