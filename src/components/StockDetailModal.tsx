import React, { useState } from 'react';
import { StockQuote } from '../types';
import { InteractiveChart } from './InteractiveChart';
import {
  X,
  PieChart,
  BellRing,
  ListFilter,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';

interface StockDetailModalProps {
  stock: StockQuote;
  onClose: () => void;
  onAddToPortfolio: (symbol: string) => void;
  onAddToWatchlist: (symbol: string) => void;
  onCreateAlert: (symbol: string) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  onAddToPortfolio,
  onAddToWatchlist,
  onCreateAlert,
}) => {
  const isPositive = stock.change >= 0;
  const ind = stock.indicators;

  // Signal Checklist
  const checklist = [
    { label: 'CMP > EMA 20', passed: stock.cmp > ind.ema20, value: `₹${stock.cmp} vs ₹${ind.ema20}` },
    { label: 'CMP > EMA 50', passed: stock.cmp > ind.ema50, value: `₹${stock.cmp} vs ₹${ind.ema50}` },
    { label: 'CMP > EMA 200', passed: stock.cmp > ind.ema200, value: `₹${stock.cmp} vs ₹${ind.ema200}` },
    { label: 'EMA 20 > EMA 50 (Golden Trend)', passed: ind.ema20 > ind.ema50, value: `₹${ind.ema20} vs ₹${ind.ema50}` },
    { label: 'EMA 50 > EMA 200 (Macro Bull)', passed: ind.ema50 > ind.ema200, value: `₹${ind.ema50} vs ₹${ind.ema200}` },
    { label: 'RSI > 50 (Positive Momentum)', passed: ind.rsi > 50, value: `RSI ${ind.rsi}` },
    { label: 'MACD Bullish Crossover', passed: ind.macd.macd > ind.macd.signal || ind.macd.hist > 0, value: `Hist ${ind.macd.hist}` },
    { label: 'Volume Surge > 20D Avg', passed: ind.volumeRatio >= 1.05, value: `${ind.volumeRatio}x Avg Vol` },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 flex flex-col gap-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Header Info Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-100 font-sans tracking-tight">
                {stock.name}
              </h2>
              <span className="text-sm font-bold font-mono text-slate-400">({stock.symbol})</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                {stock.exchange}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Sector: <strong className="text-slate-300">{stock.sector}</strong> · Market Cap: ₹{stock.marketCapCr.toLocaleString('en-IN')} Cr
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold font-mono text-slate-100 tabular-nums">
              ₹{stock.cmp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <div
              className={`flex items-center gap-0.5 text-sm font-bold font-mono ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>
                {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* 2. Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pb-2 border-b border-slate-800">
          <button
            onClick={() => onAddToPortfolio(stock.symbol)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <PieChart className="w-4 h-4" />
            <span>Add to Portfolio</span>
          </button>

          <button
            onClick={() => onAddToWatchlist(stock.symbol)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <ListFilter className="w-4 h-4 text-slate-400" />
            <span>Add to Watchlist</span>
          </button>

          <button
            onClick={() => onCreateAlert(stock.symbol)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <BellRing className="w-4 h-4 text-amber-400" />
            <span>Set Price Alert</span>
          </button>
        </div>

        {/* 3. Interactive Candlestick + Volume Chart */}
        <InteractiveChart
          symbol={stock.symbol}
          title={`${stock.name} Interactive Candlestick & Indicator Chart`}
          bars={stock.history}
          currentPrice={stock.cmp}
        />

        {/* 4. Fundamental & Technical Deep-Dive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fundamental Ratios */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Fundamental Health & Valuation</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">P/E Ratio</span>
                <strong className="text-slate-200 text-sm">{stock.pe}</strong>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">EPS (TTM)</span>
                <strong className="text-slate-200 text-sm">₹{stock.eps}</strong>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Dividend Yield</span>
                <strong className="text-emerald-400 text-sm">{stock.divYield}%</strong>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Book Value</span>
                <strong className="text-slate-200 text-sm">₹{stock.bookValue}</strong>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">ROE %</span>
                <strong className="text-slate-200 text-sm">{stock.roe}%</strong>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Debt to Equity</span>
                <strong className="text-slate-200 text-sm">{stock.debtToEquity}</strong>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 font-mono">
              52W Range: <strong className="text-slate-200">₹{stock.week52Low}</strong> — <strong className="text-slate-200">₹{stock.week52High}</strong>
            </div>
          </div>

          {/* Automated Technical Signal Score Engine */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200">
                Algorithmic Signal Breakdown
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300">
                  Score: {ind.score}/8
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    ind.signal === 'BULLISH'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : ind.signal === 'BEARISH'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {ind.signal}
                </span>
              </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono mt-1">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border flex items-center justify-between ${
                    item.passed
                      ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                    <span className="text-[11px] font-sans">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.value}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 font-sans mt-2">
              Note: Signals are algorithmic indicators computed from daily closing bars and do not constitute registered investment advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
