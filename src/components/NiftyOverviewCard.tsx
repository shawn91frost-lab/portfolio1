import React from 'react';
import { MarketIndexData } from '../types';
import { TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface NiftyOverviewCardProps {
  nifty: MarketIndexData;
  onOpenChart?: () => void;
}

export const NiftyOverviewCard: React.FC<NiftyOverviewCardProps> = ({
  nifty,
  onOpenChart,
}) => {
  const isPositive = nifty.change >= 0;

  // EMA comparison indicators
  const aboveEma20 = nifty.cmp >= nifty.ema20;
  const aboveEma50 = nifty.cmp >= nifty.ema50;
  const aboveEma200 = nifty.cmp >= nifty.ema200;

  // Trend badge color
  const getTrendStyle = () => {
    if (aboveEma20 && aboveEma50 && aboveEma200) {
      return 'bg-emerald-950/70 border-emerald-800 text-emerald-400';
    }
    if (aboveEma20 && aboveEma50 && !aboveEma200) {
      return 'bg-amber-950/70 border-amber-800 text-amber-400';
    }
    if (!aboveEma20 && !aboveEma50 && !aboveEma200) {
      return 'bg-rose-950/70 border-rose-800 text-rose-400';
    }
    return 'bg-slate-800 border-slate-700 text-slate-300';
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Nifty 50 Price & Change */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-400 tracking-wider">
              BENCHMARK INDEX
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">NSE: ^NSEI</span>
          </div>

          <div className="flex items-baseline gap-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 font-mono tabular-nums">
              {nifty.cmp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <div
              className={`flex items-center gap-1 text-sm sm:text-base font-bold font-mono ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              <span>
                {isPositive ? '+' : ''}
                {nifty.change.toFixed(2)} ({isPositive ? '+' : ''}
                {nifty.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-1">
            <span>Prev Close: <strong className="text-slate-200">₹{nifty.prevClose.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
            <span className="text-slate-700">·</span>
            <span>Day High: <strong className="text-emerald-300">₹{nifty.high.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
            <span className="text-slate-700">·</span>
            <span>Day Low: <strong className="text-rose-300">₹{nifty.low.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
            <span className="text-slate-700">·</span>
            <span>52W High: <strong className="text-slate-200">₹{nifty.week52High.toLocaleString('en-IN')}</strong></span>
            <span className="text-slate-700">·</span>
            <span>52W Low: <strong className="text-slate-200">₹{nifty.week52Low.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Center / Right: Automated EMA Analysis & Visual Status */}
        <div className="flex flex-col gap-3 w-full lg:w-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Automated EMA Analysis
              </span>
            </div>
            <div className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${getTrendStyle()}`}>
              {nifty.trend}
            </div>
          </div>

          {/* EMA Indicators Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* EMA 20 */}
            <div
              className={`p-2.5 rounded-lg border flex flex-col gap-0.5 ${
                aboveEma20
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400'
                  : 'bg-rose-950/40 border-rose-800/80 text-rose-400'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>EMA 20</span>
                <span>{aboveEma20 ? 'Above' : 'Below'}</span>
              </div>
              <div className="text-sm font-bold font-mono tabular-nums">
                ₹{nifty.ema20.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* EMA 50 */}
            <div
              className={`p-2.5 rounded-lg border flex flex-col gap-0.5 ${
                aboveEma50
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400'
                  : 'bg-rose-950/40 border-rose-800/80 text-rose-400'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>EMA 50</span>
                <span>{aboveEma50 ? 'Above' : 'Below'}</span>
              </div>
              <div className="text-sm font-bold font-mono tabular-nums">
                ₹{nifty.ema50.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* EMA 200 */}
            <div
              className={`p-2.5 rounded-lg border flex flex-col gap-0.5 ${
                aboveEma200
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400'
                  : 'bg-rose-950/40 border-rose-800/80 text-rose-400'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>EMA 200</span>
                <span>{aboveEma200 ? 'Above' : 'Below'}</span>
              </div>
              <div className="text-sm font-bold font-mono tabular-nums">
                ₹{nifty.ema200.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
