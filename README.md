# Cuzzo's Options Terminal

A dark-mode dashboard for evaluating long-dated call options and LEAPS.

## Features

- Dashboard overview for top deals, breakeven, open P/L, and premium deployed
- Deal Screener with intrinsic value, extrinsic value, required move, target profit, liquidity, and scoring
- Profit Model with breakeven, profit at target, ROI, and target ladder
- Watchlist and Positions views
- Mock market data service designed for future providers like Tradier, Polygon/Massive, Finnhub, or Alpha Vantage
- Prisma schema for PostgreSQL tables: users, watchlist, option snapshots, positions, scoring results, and analyst targets

## Core Formulas

- Breakeven = strike + premium
- Intrinsic value = max(stock price - strike, 0)
- Extrinsic value = premium - intrinsic value
- Required move % = (breakeven - stock price) / stock price
- Profit at target = max(target price - strike, 0) - premium
- ROI % = profit / premium

## Stack

- Next.js
- Tailwind CSS
- PostgreSQL
- Prisma

## Getting Started

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm dev
```

Open `http://127.0.0.1:3000`.

## Database

Set `DATABASE_URL` in `.env`, then run:

```bash
pnpm prisma:push
```
