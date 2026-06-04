import { enrichOption } from "./options-math";
import type { OptionContract, Position, WatchlistItem } from "./types";

const DEFAULT_SYMBOLS = ["NVDA", "AMZN", "SOFI", "DIS", "TSLA", "GOOGL"];
const COMPANY_NAMES: Record<string, string> = {
  AMZN: "Amazon",
  DIS: "Disney",
  GOOGL: "Alphabet",
  NVDA: "NVIDIA",
  SOFI: "SoFi Technologies",
  TSLA: "Tesla"
};

export interface MarketDataProvider {
  getLongDatedCalls(): Promise<OptionContract[]>;
}

export class MockMarketDataProvider implements MarketDataProvider {
  async getLongDatedCalls() {
    return mockContracts;
  }
}

type TradierQuote = {
  symbol: string;
  description?: string;
  last?: number;
  bid?: number;
  ask?: number;
  close?: number;
};

type TradierOption = {
  symbol: string;
  underlying: string;
  option_type: string;
  expiration_date: string;
  strike: number;
  last?: number;
  bid?: number;
  ask?: number;
  volume?: number;
  open_interest?: number;
  greeks?: {
    delta?: number;
    mid_iv?: number;
    smv_vol?: number;
  };
};

export class TradierMarketDataProvider implements MarketDataProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly symbols: string[];

  constructor({
    apiKey = process.env.TRADIER_API_KEY ?? "",
    baseUrl = process.env.TRADIER_BASE_URL ?? "https://api.tradier.com/v1",
    symbols = getConfiguredSymbols()
  } = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.symbols = symbols;
  }

  async getLongDatedCalls() {
    if (!this.apiKey) {
      throw new Error("TRADIER_API_KEY is required for the Tradier market data provider.");
    }

    const quotes = await this.getQuotes(this.symbols);
    const contracts = await Promise.all(
      this.symbols.map(async (symbol) => {
        const quote = quotes.get(symbol);
        if (!quote) {
          return [];
        }

        const expirations = await this.getLongDatedExpirations(symbol);
        const chains = await Promise.all(expirations.slice(0, 2).map((expiration) => this.getOptionChain(symbol, expiration)));
        return chains
          .flat()
          .filter((option) => option.option_type === "call")
          .filter((option) => option.bid || option.ask || option.last)
          .map((option) => this.toContract(option, quote))
          .filter((contract) => contract.premium > 0)
          .sort((a, b) => Math.abs(a.delta - 0.5) - Math.abs(b.delta - 0.5))
          .slice(0, 2);
      })
    );

    const flattened = contracts.flat();
    return flattened.length > 0 ? flattened : mockContracts;
  }

  private async getQuotes(symbols: string[]) {
    const response = await this.request<{ quotes?: { quote?: TradierQuote | TradierQuote[] } }>(
      `/markets/quotes?symbols=${encodeURIComponent(symbols.join(","))}`
    );
    const quotes = asArray(response.quotes?.quote);
    return new Map(quotes.map((quote) => [quote.symbol, quote]));
  }

  private async getLongDatedExpirations(symbol: string) {
    const response = await this.request<{ expirations?: { date?: string | string[] } }>(
      `/markets/options/expirations?symbol=${encodeURIComponent(symbol)}&includeAllRoots=true&strikes=false`
    );
    const dates = asArray(response.expirations?.date);
    const now = new Date();
    return dates
      .filter((date) => {
        const days = (new Date(`${date}T16:00:00-04:00`).getTime() - now.getTime()) / 86_400_000;
        return days >= 180 && days <= 760;
      })
      .sort();
  }

  private async getOptionChain(symbol: string, expiration: string) {
    const response = await this.request<{ options?: { option?: TradierOption | TradierOption[] } }>(
      `/markets/options/chains?symbol=${encodeURIComponent(symbol)}&expiration=${encodeURIComponent(expiration)}&greeks=true`
    );
    return asArray(response.options?.option);
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Tradier request failed with ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  private toContract(option: TradierOption, quote: TradierQuote): OptionContract {
    const stockPrice = quote.last ?? quote.close ?? quote.bid ?? quote.ask ?? 0;
    const bid = option.bid ?? 0;
    const ask = option.ask ?? 0;
    const premium = bid > 0 && ask > 0 ? (bid + ask) / 2 : option.last ?? ask ?? bid;
    const targetPrice = getTargetPrice(option.underlying, stockPrice);

    return {
      id: option.symbol,
      underlying: option.underlying,
      companyName: quote.description || COMPANY_NAMES[option.underlying] || option.underlying,
      stockPrice,
      strike: option.strike,
      premium,
      expirationDate: option.expiration_date,
      delta: option.greeks?.delta ?? 0,
      openInterest: option.open_interest ?? 0,
      volume: option.volume ?? 0,
      bid,
      ask,
      impliedVolatility: option.greeks?.mid_iv ?? option.greeks?.smv_vol ?? 0,
      targetPrice,
      analystRating: "Market data",
      thesis: "Live Tradier quote and options chain data. Target is configurable until analyst APIs are connected."
    };
  }
}

export const marketDataProvider: MarketDataProvider = createMarketDataProvider();

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

function createMarketDataProvider(): MarketDataProvider {
  if ((process.env.MARKET_DATA_PROVIDER ?? "").toLowerCase() === "tradier" || process.env.TRADIER_API_KEY) {
    return new TradierMarketDataProvider();
  }

  return new MockMarketDataProvider();
}

function getConfiguredSymbols() {
  return (process.env.WATCHLIST_SYMBOLS ?? DEFAULT_SYMBOLS.join(","))
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);
}

function getTargetPrice(symbol: string, stockPrice: number) {
  const configured = Number(process.env[`TARGET_${symbol}`]);
  return Number.isFinite(configured) && configured > 0 ? configured : stockPrice * 1.25;
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
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
