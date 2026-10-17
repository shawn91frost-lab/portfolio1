import React from 'react';
import { MarketIndexData, CalculatedHolding, SectorData, StockQuote } from '../types';
import { NiftyOverviewCard } from './NiftyOverviewCard';
import { InteractiveChart } from './InteractiveChart';
import { marketDataService } from '../lib/marketData';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Scale,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  nifty: MarketIndexData;
  holdings: CalculatedHolding[];
  sectors: SectorData[];
  onSelectStock: (symbol: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  nifty,
  holdings,
  sectors,
  onSelectStock,
  onNavigateTab,
}) => {
  const bankNifty = marketDataService.getBankNifty();
  const breadth = marketDataService.getMarketBreadth();
  const allStocks = marketDataService.getAllStocks();

  // Portfolio quick metrics
  const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
  const currentTotal = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnl = currentTotal - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const todayPnl = holdings.reduce((sum, h) => sum + h.dayPnl, 0);

  // Highest volume & high conviction stocks
  const topBullish = allStocks.filter((s) => s.indicators.signal === 'BULLISH').slice(0, 4);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. NIFTY 50 Live Benchmark & EMA Analysis Card */}
      <NiftyOverviewCard nifty={nifty} />

      {/* 2. Interactive NIFTY 50 Candlestick Chart with EMAs and Sub-charts */}
      <InteractiveChart
        symbol="^NSEI"
        title="NIFTY 50 Benchmark Interactive Candlestick Chart"
        bars={nifty.history}
        currentPrice={nifty.cmp}
      />

      {/* 3. Two-Column Split: Portfolio Snapshot & Market Breadth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: User Portfolio Live Radar */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Your Isolated Portfolio Status
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('portfolio')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>Manage Portfolio ({holdings.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">TOTAL INVESTED</span>
              <div className="text-base font-bold text-slate-100 mt-1">
                ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">CURRENT VALUE</span>
              <div className="text-base font-bold text-slate-100 mt-1">
                ₹{currentTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">OVERALL P/L</span>
              <div
                className={`text-base font-bold mt-1 ${
                  totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                ({totalPnl >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%)
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">TODAY'S P/L</span>
              <div
                className={`text-base font-bold mt-1 ${
                  todayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {todayPnl >= 0 ? '+' : ''}₹{todayPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Real-time tick</span>
            </div>
          </div>

          {/* Holdings Mini-List */}
          <div className="flex flex-col divide-y divide-slate-800/50 mt-1">
            {holdings.slice(0, 4).map((h) => (
              <div
                key={h.id}
                onClick={() => onSelectStock(h.symbol)}
                className="py-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-800/30 px-1 rounded transition-colors"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 font-mono">{h.symbol}</span>
                    <span className="text-[11px] text-slate-400 font-sans">({h.quantity} shares)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Buy: ₹{h.buyPrice} · CMP: ₹{h.cmp}
                  </span>
                </div>

                <div className="flex flex-col items-end font-mono">
                  <span
                    className={`font-bold ${
                      h.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {h.pnl >= 0 ? '+' : ''}₹{h.pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                  <span
                    className={`text-[10px] ${
                      h.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ({h.pnl >= 0 ? '+' : ''}{h.pnlPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Key Benchmarks & Sentiment */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>BANK NIFTY Index</span>
            </h3>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
                ₹{bankNifty.cmp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`text-xs font-bold font-mono ${
                  bankNifty.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {bankNifty.change >= 0 ? '+' : ''}{bankNifty.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
              <span>EMA 20: ₹{bankNifty.ema20.toFixed(0)}</span>
              <span>·</span>
              <span>EMA 200: ₹{bankNifty.ema200.toFixed(0)}</span>
            </div>
          </div>

          {/* Market Breadth */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>Market Breadth</span>
              </span>
              <span className="text-emerald-400">Ratio {breadth.adRatio}</span>
            </div>

            <div className="w-full bg-rose-950/80 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-2"
                style={{
                  width: `${(breadth.advances / Math.max(1, breadth.advances + breadth.declines)) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400">{breadth.advances} Adv</span>
              <span className="text-rose-400">{breadth.declines} Dec</span>
            </div>
          </div>

          {/* High conviction algorithmic signals */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/60">
            <span className="text-xs font-semibold text-slate-300">
              Top Algorithmic Bullish Radar
            </span>
            <div className="flex flex-wrap gap-1.5">
              {topBullish.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => onSelectStock(s.symbol)}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <span className="font-bold">{s.symbol}</span>
                  <span className="text-emerald-400 text-[10px]">Score {s.indicators.score}/8</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sector Quick Pulse Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">Sectoral Pulse Heatmap</h3>
          </div>
          <button
            onClick={() => onNavigateTab('sectors')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>All 17 Sectors</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {sectors.slice(0, 6).map((s) => {
            const isGain = s.changePercent >= 0;
            return (
              <button
                key={s.id}
                onClick={() => onNavigateTab('sectors')}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between gap-1 transition-colors ${
                  isGain
                    ? 'bg-emerald-950/30 border-emerald-900/60 hover:bg-emerald-950/50'
                    : 'bg-rose-950/30 border-rose-900/60 hover:bg-rose-950/50'
                }`}
              >
                <span className="text-xs font-semibold text-slate-200 font-sans truncate">
                  {s.name.replace('NIFTY ', '')}
                </span>
                <div
                  className={`text-sm font-bold font-mono tabular-nums flex items-center gap-0.5 ${
                    isGain ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isGain ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{isGain ? '+' : ''}{s.changePercent.toFixed(2)}%</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">RSI: {s.rsi}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
