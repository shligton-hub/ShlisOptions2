import { enrichOption } from "./options-math";
import type { OptionContract, Position, WatchlistItem } from "./types";

export interface MarketDataProvider {
  getLongDatedCalls(): Promise<OptionContract[]>;
}

export class MockMarketDataProvider implements MarketDataProvider {
  async getLongDatedCalls() {
    return mockContracts;
  }
}

export const marketDataProvider: MarketDataProvider = new MockMarketDataProvider();

export async function getScoredOptions() {
  const contracts = await marketDataProvider.getLongDatedCalls();
  return contracts.map(enrichOption).sort((a, b) => b.score.total - a.score.total);
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const options = await getScoredOptions();
  return ["NVDA", "AMZN", "SOFI", "DIS"].map((symbol) => {
    const best = options.find((option) => option.underlying === symbol) ?? options[0];
    return {
      symbol,
      companyName: best.companyName,
      stockPrice: best.stockPrice,
      targetPrice: best.targetPrice,
      bestScore: best.score.total,
      requiredMovePct: best.math.requiredMovePct,
      note: best.thesis
    };
  });
}

export async function getPositions(): Promise<Position[]> {
  return [
    {
      id: "pos_nvda_2027",
      underlying: "NVDA",
      companyName: "NVIDIA",
      contracts: 2,
      strike: 160,
      expirationDate: "2027-01-15",
      entryPremium: 22.1,
      currentPremium: 28.4,
      stockPrice: 142.8,
      targetPrice: 190
    },
    {
      id: "pos_dis_2026",
      underlying: "DIS",
      companyName: "Disney",
      contracts: 4,
      strike: 115,
      expirationDate: "2026-12-18",
      entryPremium: 9.35,
      currentPremium: 8.9,
      stockPrice: 105.6,
      targetPrice: 135
    },
    {
      id: "pos_sofi_2027",
      underlying: "SOFI",
      companyName: "SoFi Technologies",
      contracts: 10,
      strike: 15,
      expirationDate: "2027-01-15",
      entryPremium: 3.15,
      currentPremium: 3.75,
      stockPrice: 13.9,
      targetPrice: 22
    }
  ];
}

const mockContracts: OptionContract[] = [
  {
    id: "nvda_20270115_160c",
    underlying: "NVDA",
    companyName: "NVIDIA",
    stockPrice: 142.8,
    strike: 160,
    premium: 22.1,
    expirationDate: "2027-01-15",
    delta: 0.48,
    openInterest: 8120,
    volume: 1740,
    bid: 21.75,
    ask: 22.45,
    impliedVolatility: 0.49,
    targetPrice: 190,
    analystRating: "Strong Buy",
    thesis: "AI accelerator demand supports a high-upside LEAPS setup."
  },
  {
    id: "amzn_20270115_230c",
    underlying: "AMZN",
    companyName: "Amazon",
    stockPrice: 214.3,
    strike: 230,
    premium: 28.8,
    expirationDate: "2027-01-15",
    delta: 0.51,
    openInterest: 5290,
    volume: 1160,
    bid: 28.1,
    ask: 29.5,
    impliedVolatility: 0.34,
    targetPrice: 285,
    analystRating: "Buy",
    thesis: "Cloud margin expansion plus retail efficiency gives the target room."
  },
  {
    id: "sofi_20270115_15c",
    underlying: "SOFI",
    companyName: "SoFi Technologies",
    stockPrice: 13.9,
    strike: 15,
    premium: 3.15,
    expirationDate: "2027-01-15",
    delta: 0.54,
    openInterest: 11640,
    volume: 3120,
    bid: 3,
    ask: 3.3,
    impliedVolatility: 0.62,
    targetPrice: 22,
    analystRating: "Outperform",
    thesis: "Smaller premium base creates strong torque if profitability keeps improving."
  },
  {
    id: "dis_20261218_115c",
    underlying: "DIS",
    companyName: "Disney",
    stockPrice: 105.6,
    strike: 115,
    premium: 9.35,
    expirationDate: "2026-12-18",
    delta: 0.42,
    openInterest: 3380,
    volume: 690,
    bid: 9.05,
    ask: 9.65,
    impliedVolatility: 0.28,
    targetPrice: 135,
    analystRating: "Buy",
    thesis: "Streaming margin repair can re-rate the equity without heroic assumptions."
  },
  {
    id: "tsla_20270115_260c",
    underlying: "TSLA",
    companyName: "Tesla",
    stockPrice: 188.4,
    strike: 260,
    premium: 31.4,
    expirationDate: "2027-01-15",
    delta: 0.35,
    openInterest: 9340,
    volume: 2260,
    bid: 30.5,
    ask: 32.3,
    impliedVolatility: 0.58,
    targetPrice: 310,
    analystRating: "Neutral",
    thesis: "High reward, but the breakeven asks for a meaningful trend change."
  },
  {
    id: "googl_20261218_210c",
    underlying: "GOOGL",
    companyName: "Alphabet",
    stockPrice: 178.2,
    strike: 210,
    premium: 16.2,
    expirationDate: "2026-12-18",
    delta: 0.38,
    openInterest: 2890,
    volume: 520,
    bid: 15.8,
    ask: 16.65,
    impliedVolatility: 0.31,
    targetPrice: 235,
    analystRating: "Buy",
    thesis: "Attractive premium, but the contract sits farther out of the money."
  }
];
