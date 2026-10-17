import React from 'react';
import { MarketIndexData, StockQuote, MarketBreadth } from '../types';
import { marketDataService } from '../lib/marketData';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Flame,
  Gauge,
  BarChart2,
} from 'lucide-react';

interface MarketOverviewViewProps {
  indices: MarketIndexData[];
  onSelectStock: (symbol: string) => void;
  onSelectIndex: (symbol: string) => void;
}

export const MarketOverviewView: React.FC<MarketOverviewViewProps> = ({
  indices,
  onSelectStock,
  onSelectIndex,
}) => {
  const allStocks = marketDataService.getAllStocks();
  const breadth: MarketBreadth = marketDataService.getMarketBreadth();

  // Top Gainers & Losers
  const sortedByChange = [...allStocks].sort(
    (a, b) => b.changePercent - a.changePercent
  );
  const topGainers = sortedByChange.slice(0, 5);
  const topLosers = sortedByChange.slice(-5).reverse();

  // Volume Leaders & Most Active (Turnover in Cr)
  const sortedByVolume = [...allStocks].sort((a, b) => b.volume - a.volume).slice(0, 5);
  const sortedByTurnover = [...allStocks]
    .sort((a, b) => (b.volume * b.cmp) - (a.volume * a.cmp))
    .slice(0, 5);

  // 52W Highs and Lows
  const near52WHighs = allStocks
    .filter((s) => (s.week52High - s.cmp) / s.week52High <= 0.03)
    .slice(0, 5);
  const near52WLows = allStocks
    .filter((s) => (s.cmp - s.week52Low) / s.week52Low <= 0.05)
    .slice(0, 5);

  const advancePercent =
    breadth.advances + breadth.declines + breadth.unchanged > 0
      ? (breadth.advances / (breadth.advances + breadth.declines + breadth.unchanged)) * 100
      : 50;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Major Benchmark Indices Grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Key Benchmark & Sectoral Indices</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live NSE Feed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {indices.map((idx) => {
            const isGain = idx.change >= 0;
            return (
              <div
                key={idx.symbol}
                onClick={() => onSelectIndex(idx.symbol)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700 cursor-pointer transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{idx.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500">{idx.symbol}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      idx.trend.includes('BULLISH')
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : idx.trend === 'BEARISH'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {idx.trend}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                    {idx.cmp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <div
                    className={`flex items-center gap-0.5 text-xs font-bold font-mono ${
                      isGain ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isGain ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>
                      {isGain ? '+' : ''}{idx.change.toFixed(2)} ({isGain ? '+' : ''}{idx.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500 block">EMA 20</span>
                    <strong className={idx.cmp >= idx.ema20 ? 'text-emerald-400' : 'text-rose-400'}>
                      ₹{idx.ema20.toFixed(0)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">EMA 50</span>
                    <strong className={idx.cmp >= idx.ema50 ? 'text-emerald-400' : 'text-rose-400'}>
                      ₹{idx.ema50.toFixed(0)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">EMA 200</span>
                    <strong className={idx.cmp >= idx.ema200 ? 'text-emerald-400' : 'text-rose-400'}>
                      ₹{idx.ema200.toFixed(0)}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Market Breadth & Internal Sentiment */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">NSE Market Breadth</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            A/D Ratio: <strong className="text-emerald-400">{breadth.adRatio}</strong>
          </span>
        </div>

        {/* Visual Advance / Decline Ratio Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="w-full bg-rose-950/80 rounded-full h-3 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-3 transition-all duration-500"
              style={{ width: `${advancePercent}%` }}
              title={`Advances: ${breadth.advances}`}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-emerald-400 font-semibold">
              ▲ Advances: {breadth.advances} ({advancePercent.toFixed(1)}%)
            </span>
            <span className="text-slate-400">
              ■ Unchanged: {breadth.unchanged}
            </span>
            <span className="text-rose-400 font-semibold">
              ▼ Declines: {breadth.declines} ({(100 - advancePercent).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Market Movers: Top Gainers, Top Losers, Most Active */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Top Gainers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              TOP GAINERS
            </span>
            <span className="text-[10px] font-mono text-slate-500">NSE</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-800/40">
            {topGainers.map((s) => (
              <button
                key={s.symbol}
                onClick={() => onSelectStock(s.symbol)}
                className="py-2 flex items-center justify-between text-left hover:bg-slate-800/40 px-1 rounded transition-colors"
              >
                <div>
                  <span className="font-bold text-slate-200 text-xs font-mono block">{s.symbol}</span>
                  <span className="text-[10px] text-slate-500 font-mono">₹{s.cmp.toFixed(2)}</span>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-400">
                  +{s.changePercent.toFixed(2)}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              TOP LOSERS
            </span>
            <span className="text-[10px] font-mono text-slate-500">NSE</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-800/40">
            {topLosers.map((s) => (
              <button
                key={s.symbol}
                onClick={() => onSelectStock(s.symbol)}
                className="py-2 flex items-center justify-between text-left hover:bg-slate-800/40 px-1 rounded transition-colors"
              >
                <div>
                  <span className="font-bold text-slate-200 text-xs font-mono block">{s.symbol}</span>
                  <span className="text-[10px] text-slate-500 font-mono">₹{s.cmp.toFixed(2)}</span>
                </div>
                <span className="text-xs font-bold font-mono text-rose-400">
                  {s.changePercent.toFixed(2)}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Most Active by Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              VOLUME LEADERS
            </span>
            <span className="text-[10px] font-mono text-slate-500">Shares</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-800/40">
            {sortedByVolume.map((s) => (
              <button
                key={s.symbol}
                onClick={() => onSelectStock(s.symbol)}
                className="py-2 flex items-center justify-between text-left hover:bg-slate-800/40 px-1 rounded transition-colors"
              >
                <div>
                  <span className="font-bold text-slate-200 text-xs font-mono block">{s.symbol}</span>
                  <span className="text-[10px] text-slate-500 font-mono">₹{s.cmp.toFixed(2)}</span>
                </div>
                <span className="text-xs font-medium font-mono text-slate-300">
                  {(s.volume / 1000000).toFixed(2)}M
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 52-Week High Breakouts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5" />
              52W BREAKOUT ZONE
            </span>
            <span className="text-[10px] font-mono text-slate-500">&lt;3% to ATH</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-800/40">
            {near52WHighs.map((s) => (
              <button
                key={s.symbol}
                onClick={() => onSelectStock(s.symbol)}
                className="py-2 flex items-center justify-between text-left hover:bg-slate-800/40 px-1 rounded transition-colors"
              >
                <div>
                  <span className="font-bold text-slate-200 text-xs font-mono block">{s.symbol}</span>
                  <span className="text-[10px] text-slate-500 font-mono">ATH: ₹{s.week52High}</span>
                </div>
                <span className="text-xs font-bold font-mono text-amber-300">
                  ₹{s.cmp.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
