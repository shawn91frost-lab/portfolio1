import React, { useState } from 'react';
import { CalculatedHolding, PortfolioHolding, StockQuote } from '../types';
import { marketDataService } from '../lib/marketData';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  ShieldAlert,
  Trash2,
  Edit2,
  Download,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  X,
  Tag,
} from 'lucide-react';

interface PortfolioViewProps {
  holdings: CalculatedHolding[];
  onAddHolding: (holding: Omit<PortfolioHolding, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateHolding: (id: string, updates: Partial<PortfolioHolding>) => void;
  onDeleteHolding: (id: string) => void;
  onSelectStock: (symbol: string) => void;
  onExportCSV: () => void;
  onOpenImportModal: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  holdings,
  onAddHolding,
  onUpdateHolding,
  onDeleteHolding,
  onSelectStock,
  onExportCSV,
  onOpenImportModal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<CalculatedHolding | null>(null);

  // Form State
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [buyPrice, setBuyPrice] = useState<number>(100);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [brokerage, setBrokerage] = useState<number>(20);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [target1, setTarget1] = useState<string>('');
  const [target2, setTarget2] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [tag, setTag] = useState<PortfolioHolding['tag']>('Investment');
  const [symbolSearchQuery, setSymbolSearchQuery] = useState('');

  // Available stocks for autocomplete
  const allStocks = marketDataService.getAllStocks();
  const searchResults = symbolSearchQuery.trim()
    ? allStocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(symbolSearchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(symbolSearchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  // Summary Metrics
  const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
  const currentTotalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnl = currentTotalValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const todayPnl = holdings.reduce((sum, h) => sum + h.dayPnl, 0);

  // Best & Worst Performer
  const sortedByPnl = [...holdings].sort((a, b) => b.pnlPercent - a.pnlPercent);
  const bestStock = sortedByPnl[0];
  const worstStock = sortedByPnl[sortedByPnl.length - 1];

  // Sector breakdown
  const sectorMap: Record<string, number> = {};
  for (const h of holdings) {
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.currentValue;
  }
  const sectorList = Object.entries(sectorMap)
    .map(([name, val]) => ({
      name,
      value: val,
      percent: currentTotalValue > 0 ? (val / currentTotalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Stop Loss & Target Warnings Count
  const stopLossWarnings = holdings.filter(
    (h) => h.status === 'STOP_LOSS_NEAR' || h.status === 'STOP_LOSS_HIT'
  );
  const targetWarnings = holdings.filter(
    (h) => h.status === 'TARGET_NEAR' || h.status === 'PROFIT_TARGET_HIT'
  );

  const handleSelectSymbol = (quote: StockQuote) => {
    setSymbol(quote.symbol);
    setBuyPrice(quote.cmp);
    setSymbolSearchQuery(`${quote.symbol} - ${quote.name}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || quantity <= 0 || buyPrice <= 0) return;

    const quote = marketDataService.getStock(symbol);

    if (editingHolding) {
      onUpdateHolding(editingHolding.id, {
        symbol: symbol.toUpperCase(),
        name: quote?.name || symbol,
        sector: quote?.sector || 'General',
        quantity: Number(quantity),
        buyPrice: Number(buyPrice),
        purchaseDate,
        brokerage: Number(brokerage),
        stopLoss: stopLoss ? Number(stopLoss) : undefined,
        target1: target1 ? Number(target1) : undefined,
        target2: target2 ? Number(target2) : undefined,
        notes,
        tag,
      });
    } else {
      onAddHolding({
        symbol: symbol.toUpperCase(),
        name: quote?.name || symbol,
        sector: quote?.sector || 'General',
        quantity: Number(quantity),
        buyPrice: Number(buyPrice),
        purchaseDate,
        brokerage: Number(brokerage),
        stopLoss: stopLoss ? Number(stopLoss) : undefined,
        target1: target1 ? Number(target1) : undefined,
        target2: target2 ? Number(target2) : undefined,
        notes,
        tag,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setIsAddModalOpen(false);
    setEditingHolding(null);
    setSymbol('');
    setSymbolSearchQuery('');
    setQuantity(10);
    setBuyPrice(100);
    setBrokerage(20);
    setStopLoss('');
    setTarget1('');
    setTarget2('');
    setNotes('');
    setTag('Investment');
  };

  const startEdit = (h: CalculatedHolding) => {
    setEditingHolding(h);
    setSymbol(h.symbol);
    setSymbolSearchQuery(`${h.symbol} - ${h.name}`);
    setQuantity(h.quantity);
    setBuyPrice(h.buyPrice);
    setPurchaseDate(h.purchaseDate);
    setBrokerage(h.brokerage || 0);
    setStopLoss(h.stopLoss ? String(h.stopLoss) : '');
    setTarget1(h.target1 ? String(h.target1) : '');
    setTarget2(h.target2 ? String(h.target2) : '');
    setNotes(h.notes || '');
    setTag(h.tag || 'Investment');
    setIsAddModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Top Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Invested */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400">TOTAL INVESTED</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
              ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-1">
            Across {holdings.length} stocks
          </span>
        </div>

        {/* Current Portfolio Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400">CURRENT VALUE</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
              ₹{currentTotalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-1">
            Real-time market valuation
          </span>
        </div>

        {/* Total P/L */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400">OVERALL P/L</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalPnl >= 0 ? '+' : ''}₹
              {totalPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span
              className={`text-xs font-bold font-mono ${
                totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ({totalPnl >= 0 ? '+' : ''}
              {totalPnlPercent.toFixed(2)}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono mt-1">
            Total unrealized gain/loss
          </span>
        </div>

        {/* Today's P/L */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400">TODAY'S P/L</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                todayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {todayPnl >= 0 ? '+' : ''}₹
              {todayPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="text-[11px] font-mono mt-1 flex items-center justify-between text-slate-400">
            <span>
              Best: <strong className="text-emerald-400">{bestStock ? `${bestStock.symbol} (+${bestStock.pnlPercent}%)` : '-'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Stop Loss & Target Warnings Bar (if any triggered) */}
      {(stopLossWarnings.length > 0 || targetWarnings.length > 0) && (
        <div className="bg-slate-900/90 border border-amber-800/60 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Automated Risk Alert: Active Stop-Loss / Target Triggers Detected</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {stopLossWarnings.map((h) => (
              <span
                key={h.id}
                className={`px-2.5 py-1 rounded border font-mono ${
                  h.status === 'STOP_LOSS_HIT'
                    ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                    : 'bg-amber-950/80 border-amber-800 text-amber-300'
                }`}
              >
                {h.symbol}: {h.status === 'STOP_LOSS_HIT' ? 'STOP LOSS HIT' : 'STOP LOSS NEAR'} (CMP: ₹{h.cmp} | SL: ₹{h.stopLoss})
              </span>
            ))}
            {targetWarnings.map((h) => (
              <span
                key={h.id}
                className="px-2.5 py-1 rounded border font-mono bg-emerald-950/80 border-emerald-800 text-emerald-300"
              >
                {h.symbol}: {h.status === 'PROFIT_TARGET_HIT' ? 'TARGET 1 HIT' : 'TARGET 1 NEAR'} (CMP: ₹{h.cmp} | Target: ₹{h.target1})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. Visual Charts Grid: Stock Allocation, Sector Allocation, P/L by Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Allocation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">Portfolio Allocation by Stock</h4>
            <span className="text-xs text-slate-500 font-mono">{holdings.length} Positions</span>
          </div>

          <div className="flex flex-col gap-2.5 mt-2 max-h-56 overflow-y-auto pr-1">
            {holdings.map((h) => (
              <div key={h.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-slate-200">{h.symbol}</span>
                  <span className="text-slate-400">
                    ₹{h.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({h.allocationPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, h.allocationPercent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">Sector Diversification</h4>
            <span className="text-xs text-slate-500 font-mono">{sectorList.length} Sectors</span>
          </div>

          <div className="flex flex-col gap-2.5 mt-2 max-h-56 overflow-y-auto pr-1">
            {sectorList.map((s) => (
              <div key={s.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 truncate max-w-[160px]">{s.name}</span>
                  <span className="text-slate-400">{s.percent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sky-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, s.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profit / Loss by Stock */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">Holding Performance (P/L %)</h4>
            <span className="text-xs text-slate-500 font-mono">Ranked</span>
          </div>

          <div className="flex flex-col gap-2 mt-2 max-h-56 overflow-y-auto pr-1">
            {sortedByPnl.map((h) => {
              const isGain = h.pnl >= 0;
              return (
                <div key={h.id} className="flex items-center justify-between text-xs font-mono py-1 border-b border-slate-800/40">
                  <span className="font-semibold text-slate-300">{h.symbol}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      ₹{h.pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        isGain ? 'bg-emerald-950/60 text-emerald-400' : 'bg-rose-950/60 text-rose-400'
                      }`}
                    >
                      {isGain ? '+' : ''}{h.pnlPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Portfolio Holdings Table & Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        {/* Table Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Holdings Inventory</h3>
            <p className="text-xs text-slate-400">Real-time CMP updates with automated stop-loss and profit target execution.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenImportModal}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={onExportCSV}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {holdings.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">No stocks in your portfolio yet</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Your portfolio is currently empty and isolated in your private vault. Add your first stock holding or import from CSV.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs"
            >
              Add First Stock
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-medium">STOCK / SYMBOL</th>
                  <th className="py-2.5 px-3 font-medium text-right">QTY</th>
                  <th className="py-2.5 px-3 font-medium text-right">AVG BUY</th>
                  <th className="py-2.5 px-3 font-medium text-right">INVESTED</th>
                  <th className="py-2.5 px-3 font-medium text-right">CMP (₹)</th>
                  <th className="py-2.5 px-3 font-medium text-right">CURR VALUE</th>
                  <th className="py-2.5 px-3 font-medium text-right">OVERALL P/L</th>
                  <th className="py-2.5 px-3 font-medium text-right">DAY P/L</th>
                  <th className="py-2.5 px-3 font-medium">STOP LOSS</th>
                  <th className="py-2.5 px-3 font-medium">TARGET 1</th>
                  <th className="py-2.5 px-3 font-medium">STATUS</th>
                  <th className="py-2.5 px-3 font-medium text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {holdings.map((h) => {
                  const isGain = h.pnl >= 0;
                  const isDayGain = h.dayPnl >= 0;

                  return (
                    <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Stock Symbol & Tag */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <button
                            onClick={() => onSelectStock(h.symbol)}
                            className="font-bold text-slate-200 hover:text-emerald-400 transition-colors text-left font-sans flex items-center gap-1.5"
                          >
                            <span>{h.symbol}</span>
                            {h.tag && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                · {h.tag}
                              </span>
                            )}
                          </button>
                          <span className="text-[11px] text-slate-400 font-sans truncate max-w-[140px]">
                            {h.name}
                          </span>
                        </div>
                      </td>

                      {/* Qty */}
                      <td className="py-3 px-3 text-right font-medium text-slate-200 tabular-nums">
                        {h.quantity}
                      </td>

                      {/* Avg Buy */}
                      <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                        ₹{h.buyPrice.toFixed(2)}
                      </td>

                      {/* Invested */}
                      <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                        ₹{h.invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>

                      {/* CMP */}
                      <td className="py-3 px-3 text-right font-semibold text-slate-100 tabular-nums">
                        ₹{h.cmp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Current Value */}
                      <td className="py-3 px-3 text-right font-semibold text-slate-100 tabular-nums">
                        ₹{h.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>

                      {/* Overall P/L */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isGain ? '+' : ''}₹{h.pnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                          <span className={`text-[10px] ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ({isGain ? '+' : ''}{h.pnlPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </td>

                      {/* Day P/L */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span className={`font-medium ${isDayGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isDayGain ? '+' : ''}₹{h.dayPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </td>

                      {/* Stop Loss */}
                      <td className="py-3 px-3 text-slate-400 tabular-nums">
                        {h.stopLoss ? `₹${h.stopLoss}` : '-'}
                      </td>

                      {/* Target 1 */}
                      <td className="py-3 px-3 text-slate-400 tabular-nums">
                        {h.target1 ? `₹${h.target1}` : '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            h.status === 'PROFIT_TARGET_HIT'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : h.status === 'STOP_LOSS_HIT'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : h.status === 'STOP_LOSS_NEAR'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : h.status === 'TARGET_NEAR'
                              ? 'bg-sky-950 text-sky-300 border border-sky-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {h.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(h)}
                            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                            title="Edit Holding"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteHolding(h.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Holding"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Holding Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={resetForm}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-100">
              {editingHolding ? 'Edit Portfolio Position' : 'Add Stock to Portfolio'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Specify your buy parameters, stop loss, and targets for automated position tracking.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-4 flex flex-col gap-4 text-xs font-sans">
              {/* Symbol Autocomplete */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-slate-300 font-medium">Search NSE Stock Symbol</label>
                <input
                  type="text"
                  placeholder="e.g. RELIANCE, TCS, INFY"
                  value={symbolSearchQuery}
                  onChange={(e) => {
                    setSymbolSearchQuery(e.target.value);
                    setSymbol(e.target.value.toUpperCase());
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-lg shadow-xl z-20 py-1 max-h-48 overflow-y-auto">
                    {searchResults.map((s) => (
                      <button
                        key={s.symbol}
                        type="button"
                        onClick={() => handleSelectSymbol(s)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-100 font-mono">{s.symbol}</span>
                          <span className="text-[11px] text-slate-400 ml-2">{s.name}</span>
                        </div>
                        <span className="font-mono text-emerald-400">₹{s.cmp}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity & Buy Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 font-medium">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 font-medium">Avg Buy Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Purchase Date & Brokerage */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 font-medium">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 font-medium">Brokerage & Taxes (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={brokerage}
                    onChange={(e) => setBrokerage(parseFloat(e.target.value) || 0)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Stop Loss & Targets */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 font-medium">Stop Loss (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="Optional"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 font-medium">Target 1 (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="Optional"
                    value={target1}
                    onChange={(e) => setTarget1(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 font-medium">Target 2 (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="Optional"
                    value={target2}
                    onChange={(e) => setTarget2(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Tags & Investment Horizon */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-medium">Holding Category / Tag</label>
                <div className="flex flex-wrap gap-2">
                  {(['Long term', 'Swing', 'Investment', 'Trading', 'High conviction', 'Watch'] as const).map(
                    (t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTag(t)}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          tag === t
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                            : 'bg-slate-950 border border-slate-800 text-slate-400'
                        }`}
                      >
                        {t}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Trade Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-medium">Thesis & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Rationale, technical triggers, earnings expectations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
                >
                  {editingHolding ? 'Update Position' : 'Save Holding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
