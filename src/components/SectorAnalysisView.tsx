import React, { useState } from 'react';
import { SectorData, StockQuote } from '../types';
import { marketDataService } from '../lib/marketData';
import {
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface SectorAnalysisViewProps {
  sectors: SectorData[];
  onSelectStock: (symbol: string) => void;
}

export type SectorSortOption = 'best' | 'worst' | 'trend' | 'volume';

export const SectorAnalysisView: React.FC<SectorAnalysisViewProps> = ({
  sectors,
  onSelectStock,
}) => {
  const [sortOption, setSortOption] = useState<SectorSortOption>('best');
  const [selectedSectorId, setSelectedSectorId] = useState<string>(sectors[0]?.id || 'it');

  // Sort sectors according to user choice
  const sortedSectors = [...sectors].sort((a, b) => {
    switch (sortOption) {
      case 'best':
        return b.changePercent - a.changePercent;
      case 'worst':
        return a.changePercent - b.changePercent;
      case 'volume':
        return b.volume - a.volume;
      case 'trend':
        return b.signal === 'BULLISH' ? -1 : 1;
      default:
        return 0;
    }
  });

  const activeSector =
    sectors.find((s) => s.id === selectedSectorId) || sectors[0];

  // Retrieve quotes for constituent stocks of active sector
  const constituentQuotes = activeSector
    ? activeSector.stocks
        .map((sym) => marketDataService.getStock(sym))
        .filter((q): q is StockQuote => !!q)
    : [];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Header & Heatmap Sorting Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-sans">
              NSE Sectoral Performance & Industry Radar
            </h2>
            <p className="text-xs text-slate-400">
              Tracking 17 major NSE sectors with automated technical moving averages, RSI, and constituent breakdown.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 px-2">Sort:</span>
            <button
              onClick={() => setSortOption('best')}
              className={`px-2.5 py-1 rounded transition-colors ${
                sortOption === 'best'
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Best Gainers
            </button>
            <button
              onClick={() => setSortOption('worst')}
              className={`px-2.5 py-1 rounded transition-colors ${
                sortOption === 'worst'
                  ? 'bg-slate-800 text-rose-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Laggards
            </button>
            <button
              onClick={() => setSortOption('trend')}
              className={`px-2.5 py-1 rounded transition-colors ${
                sortOption === 'trend'
                  ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strongest Trend
            </button>
            <button
              onClick={() => setSortOption('volume')}
              className={`px-2.5 py-1 rounded transition-colors ${
                sortOption === 'volume'
                  ? 'bg-slate-800 text-purple-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Highest Volume
            </button>
          </div>
        </div>

        {/* 2. Visual Sector Heatmap Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sortedSectors.map((sector) => {
            const isGain = sector.changePercent >= 0;
            const isSelected = activeSector?.id === sector.id;

            // Compute background intensity based on % change
            const intensity = Math.min(1, Math.abs(sector.changePercent) / 2.5);

            return (
              <button
                key={sector.id}
                onClick={() => setSelectedSectorId(sector.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 relative overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-emerald-400 border-transparent shadow-lg'
                    : 'border-slate-800 hover:border-slate-700'
                } ${
                  isGain
                    ? 'bg-emerald-950/40 hover:bg-emerald-950/60'
                    : 'bg-rose-950/40 hover:bg-rose-950/60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-200 font-sans truncate">
                    {sector.name.replace('NIFTY ', '')}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1 rounded ${
                      sector.signal === 'BULLISH'
                        ? 'bg-emerald-900/60 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {sector.signal}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-mono text-slate-400 tabular-nums">
                    ₹{sector.cmp.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                  </div>
                  <div
                    className={`text-sm font-extrabold font-mono tabular-nums flex items-center gap-0.5 mt-0.5 ${
                      isGain ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isGain ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>{isGain ? '+' : ''}{sector.changePercent.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>RSI: {sector.rsi}</span>
                  <span className="text-slate-400 truncate max-w-[80px]">{sector.trend}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Sector Deep-Dive & Constituent Stocks */}
      {activeSector && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-6">
          {/* Active Sector Summary Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-100 font-sans">
                  {activeSector.name}
                </h3>
                <span className="text-xs text-slate-500 font-mono">({activeSector.symbol})</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    activeSector.signal === 'BULLISH'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : activeSector.signal === 'BEARISH'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {activeSector.signal}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Trend: <strong className="text-slate-200 font-mono">{activeSector.trend}</strong> · RSI: <strong className="text-slate-200 font-mono">{activeSector.rsi}</strong>
              </p>
            </div>

            {/* EMA Analysis Card for Sector */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <div
                className={`p-2 rounded border ${
                  activeSector.cmp >= activeSector.ema20
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                    : 'bg-rose-950/40 border-rose-800 text-rose-400'
                }`}
              >
                <span className="text-[10px] text-slate-400 block">EMA 20</span>
                <strong>₹{activeSector.ema20.toFixed(1)}</strong>
              </div>

              <div
                className={`p-2 rounded border ${
                  activeSector.cmp >= activeSector.ema50
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                    : 'bg-rose-950/40 border-rose-800 text-rose-400'
                }`}
              >
                <span className="text-[10px] text-slate-400 block">EMA 50</span>
                <strong>₹{activeSector.ema50.toFixed(1)}</strong>
              </div>

              <div
                className={`p-2 rounded border ${
                  activeSector.cmp >= activeSector.ema200
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                    : 'bg-rose-950/40 border-rose-800 text-rose-400'
                }`}
              >
                <span className="text-[10px] text-slate-400 block">EMA 200</span>
                <strong>₹{activeSector.ema200.toFixed(1)}</strong>
              </div>
            </div>
          </div>

          {/* Constituent Stocks Table */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-slate-200">
              Constituent Stocks ({constituentQuotes.length})
            </h4>

            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-2.5 px-3 font-medium">STOCK</th>
                    <th className="py-2.5 px-3 font-medium text-right">CMP (₹)</th>
                    <th className="py-2.5 px-3 font-medium text-right">DAILY %</th>
                    <th className="py-2.5 px-3 font-medium text-right">EMA 20</th>
                    <th className="py-2.5 px-3 font-medium text-right">EMA 50</th>
                    <th className="py-2.5 px-3 font-medium text-right">EMA 200</th>
                    <th className="py-2.5 px-3 font-medium text-right">RSI (14)</th>
                    <th className="py-2.5 px-3 font-medium text-center">SIGNAL</th>
                    <th className="py-2.5 px-3 font-medium text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {constituentQuotes.map((q) => {
                    const isGain = q.changePercent >= 0;
                    return (
                      <tr key={q.symbol} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-sans">
                          <button
                            onClick={() => onSelectStock(q.symbol)}
                            className="font-bold text-slate-200 hover:text-emerald-400 text-left flex flex-col"
                          >
                            <span>{q.symbol}</span>
                            <span className="text-[11px] text-slate-400 font-normal truncate max-w-[150px]">
                              {q.name}
                            </span>
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-right font-semibold text-slate-100 tabular-nums">
                          ₹{q.cmp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-2.5 px-3 text-right tabular-nums">
                          <span className={`font-semibold ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isGain ? '+' : ''}{q.changePercent.toFixed(2)}%
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right tabular-nums">
                          <span className={q.cmp >= q.indicators.ema20 ? 'text-emerald-400' : 'text-rose-400'}>
                            ₹{q.indicators.ema20.toFixed(1)}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right tabular-nums">
                          <span className={q.cmp >= q.indicators.ema50 ? 'text-emerald-400' : 'text-rose-400'}>
                            ₹{q.indicators.ema50.toFixed(1)}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right tabular-nums">
                          <span className={q.cmp >= q.indicators.ema200 ? 'text-emerald-400' : 'text-rose-400'}>
                            ₹{q.indicators.ema200.toFixed(1)}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-300 font-semibold">
                          {q.indicators.rsi}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              q.indicators.signal === 'BULLISH'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : q.indicators.signal === 'BEARISH'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {q.indicators.signal}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onSelectStock(q.symbol)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans"
                          >
                            Analyze
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
