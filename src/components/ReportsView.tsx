import React, { useState } from 'react';
import { CalculatedHolding, DailyMarketSnapshot } from '../types';
import { marketDataService } from '../lib/marketData';
import {
  FileText,
  Download,
  Upload,
  Printer,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface ReportsViewProps {
  holdings: CalculatedHolding[];
  onExportHoldingsCSV: () => void;
  onExportTransactionsCSV: () => void;
  onOpenImportModal: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  holdings,
  onExportHoldingsCSV,
  onExportTransactionsCSV,
  onOpenImportModal,
}) => {
  const [snapshot] = useState<DailyMarketSnapshot>(marketDataService.generateDailySnapshot());

  const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
  const currentTotal = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnl = currentTotal - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const todayPnl = holdings.reduce((sum, h) => sum + h.dayPnl, 0);

  const sortedHoldings = [...holdings].sort((a, b) => b.pnlPercent - a.pnlPercent);
  const bestStock = sortedHoldings[0];
  const worstStock = sortedHoldings[sortedHoldings.length - 1];

  const nearStopLoss = holdings.filter((h) => h.status === 'STOP_LOSS_NEAR' || h.status === 'STOP_LOSS_HIT');
  const nearTarget = holdings.filter((h) => h.status === 'TARGET_NEAR' || h.status === 'PROFIT_TARGET_HIT');

  const bullishHoldings = holdings.filter((h) => {
    const q = marketDataService.getStock(h.symbol);
    return q?.indicators.signal === 'BULLISH';
  });

  const bearishHoldings = holdings.filter((h) => {
    const q = marketDataService.getStock(h.symbol);
    return q?.indicators.signal === 'BEARISH';
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Controls & Export Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-sans">
            Automated Market Analysis & Portfolio Reporting
          </h2>
          <p className="text-xs text-slate-400">
            Post-market intelligence generated every trading day with individual risk & position analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={onExportHoldingsCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Holdings CSV</span>
          </button>

          <button
            onClick={onExportTransactionsCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Trades CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Automated Daily Market Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">
              End-of-Day Indian Market Summary ({snapshot.date})
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            {snapshot.marketTrend}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
          {snapshot.executiveSummary}
        </p>

        {/* Indices & Breadth Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">NIFTY 50 Settlement</span>
            <div className="text-lg font-bold text-slate-100 mt-1">
              ₹{snapshot.niftyClose.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span
              className={`text-xs font-semibold ${
                snapshot.niftyChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {snapshot.niftyChangePercent >= 0 ? '+' : ''}{snapshot.niftyChangePercent.toFixed(2)}% ({snapshot.niftyChange >= 0 ? '+' : ''}{snapshot.niftyChange} pts)
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">BANK NIFTY Settlement</span>
            <div className="text-lg font-bold text-slate-100 mt-1">
              ₹{snapshot.bankNiftyClose.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span
              className={`text-xs font-semibold ${
                snapshot.bankNiftyChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {snapshot.bankNiftyChangePercent >= 0 ? '+' : ''}{snapshot.bankNiftyChangePercent.toFixed(2)}%
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Market Breadth (Advances / Declines)</span>
            <div className="text-lg font-bold text-slate-100 mt-1">
              {snapshot.marketBreadth.advances} Adv / {snapshot.marketBreadth.declines} Dec
            </div>
            <span className="text-xs text-slate-400">
              A/D Ratio: <strong className="text-emerald-400">{snapshot.marketBreadth.adRatio}</strong>
            </span>
          </div>
        </div>

        {/* Sector Leaders and Laggards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              LEADING SECTOR GAINERS
            </span>
            <div className="flex flex-col gap-1.5 divide-y divide-slate-800/40">
              {snapshot.leadingSectors.map((s) => (
                <div key={s.name} className="flex items-center justify-between pt-1">
                  <span className="text-slate-300 font-sans">{s.name}</span>
                  <span className="text-emerald-400 font-bold">+{s.changePercent.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
            <span className="text-rose-400 font-bold flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              LAGGING SECTORS
            </span>
            <div className="flex flex-col gap-1.5 divide-y divide-slate-800/40">
              {snapshot.laggingSectors.map((s) => (
                <div key={s.name} className="flex items-center justify-between pt-1">
                  <span className="text-slate-300 font-sans">{s.name}</span>
                  <span className="text-rose-400 font-bold">{s.changePercent.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical EMA status */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
          <span>Benchmark Indicators: <strong className="text-slate-100">{snapshot.niftyEmaStatus}</strong></span>
          <span className="text-emerald-400 font-bold">RSI: {snapshot.niftyRsi}</span>
        </div>
      </div>

      {/* 3. User Portfolio Personalized Audit */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
        <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
          Personalized Portfolio Risk & Performance Audit
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">TOTAL PORTFOLIO P/L</span>
            <div
              className={`text-lg font-bold mt-1 ${
                totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] text-slate-400">({totalPnlPercent.toFixed(2)}% net)</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">TODAY'S NET CHANGE</span>
            <div
              className={`text-lg font-bold mt-1 ${
                todayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {todayPnl >= 0 ? '+' : ''}₹{todayPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] text-slate-400">Daily delta</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">BEST PERFORMER</span>
            <div className="text-sm font-bold text-emerald-400 mt-1 truncate">
              {bestStock ? `${bestStock.symbol} (+${bestStock.pnlPercent}%)` : '-'}
            </div>
            <span className="text-[11px] text-slate-400">
              Gain: ₹{bestStock ? bestStock.pnl.toLocaleString('en-IN') : 0}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px]">WORST PERFORMER</span>
            <div className="text-sm font-bold text-rose-400 mt-1 truncate">
              {worstStock ? `${worstStock.symbol} (${worstStock.pnlPercent}%)` : '-'}
            </div>
            <span className="text-[11px] text-slate-400">
              Loss: ₹{worstStock ? worstStock.pnl.toLocaleString('en-IN') : 0}
            </span>
          </div>
        </div>

        {/* Risk Breakdown: Stop loss and targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              STOCKS NEAR STOP LOSS ({nearStopLoss.length})
            </span>
            {nearStopLoss.length === 0 ? (
              <p className="text-slate-500 text-[11px]">No holdings are currently breaching stop loss limits.</p>
            ) : (
              nearStopLoss.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-slate-300">
                  <span className="font-bold">{h.symbol}</span>
                  <span className="text-rose-400 font-semibold">
                    CMP ₹{h.cmp} | SL ₹{h.stopLoss}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-2">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              STOCKS NEAR PROFIT TARGET ({nearTarget.length})
            </span>
            {nearTarget.length === 0 ? (
              <p className="text-slate-500 text-[11px]">No holdings currently within 2% of profit targets.</p>
            ) : (
              nearTarget.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-slate-300">
                  <span className="font-bold">{h.symbol}</span>
                  <span className="text-emerald-400 font-semibold">
                    CMP ₹{h.cmp} | Target ₹{h.target1}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bullish vs Bearish breakdown */}
        <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Portfolio Technical Bias: <strong className="text-emerald-400">{bullishHoldings.length} Bullish</strong> vs <strong className="text-rose-400">{bearishHoldings.length} Bearish</strong>
          </span>
          <span className="text-slate-500 text-[11px]">
            {holdings.length - bullishHoldings.length - bearishHoldings.length} Neutral
          </span>
        </div>
      </div>
    </div>
  );
};
