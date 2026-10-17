import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { marketDataService } from '../lib/marketData';
import {
  Receipt,
  Plus,
  Download,
  Calendar,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Coins,
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  onExportCSV: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onAddTransaction,
  onExportCSV,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState<TransactionType>('BUY');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState<number>(10);
  const [price, setPrice] = useState<number>(100);
  const [charges, setCharges] = useState<number>(20);
  const [notes, setNotes] = useState('');

  const allStocks = marketDataService.getAllStocks();

  const handleSelectSymbol = (sym: string) => {
    setSymbol(sym);
    const q = marketDataService.getStock(sym);
    if (q) setPrice(q.cmp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || quantity <= 0 || price <= 0) return;

    const q = marketDataService.getStock(symbol);

    onAddTransaction({
      symbol: symbol.toUpperCase(),
      name: q?.name || symbol,
      type,
      date,
      quantity: Number(quantity),
      price: Number(price),
      charges: Number(charges),
      notes,
    });

    setIsModalOpen(false);
    setSymbol('');
    setNotes('');
  };

  // Summaries
  const totalBuyTrades = transactions.filter((t) => t.type === 'BUY').length;
  const totalSellTrades = transactions.filter((t) => t.type === 'SELL').length;
  const totalDividendsReceived = transactions
    .filter((t) => t.type === 'DIVIDEND')
    .reduce((sum, t) => sum + t.quantity * t.price, 0);
  const totalChargesPaid = transactions.reduce((sum, t) => sum + (t.charges || 0), 0);

  const getTypeBadge = (txType: TransactionType) => {
    switch (txType) {
      case 'BUY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">BUY</span>;
      case 'SELL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">SELL</span>;
      case 'DIVIDEND':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800">DIVIDEND</span>;
      case 'BONUS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-400 border border-purple-800">BONUS</span>;
      case 'SPLIT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">SPLIT</span>;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Header & Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400">TOTAL EXECUTED TRADES</span>
          <span className="text-2xl font-bold font-mono text-slate-100 mt-2">
            {transactions.length}
          </span>
          <span className="text-[11px] font-mono text-slate-500 mt-1">
            {totalBuyTrades} Buys · {totalSellTrades} Sells
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400">DIVIDENDS RECEIVED</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            ₹{totalDividendsReceived.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[11px] font-mono text-slate-500 mt-1">
            Direct payout credits
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400">BROKERAGE & STT PAID</span>
          <span className="text-2xl font-bold font-mono text-slate-200 mt-2">
            ₹{totalChargesPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[11px] font-mono text-slate-500 mt-1">
            Exchange & depository fees
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400">LEDGER INTEGRITY</span>
          <span className="text-sm font-bold font-mono text-emerald-400 mt-2 flex items-center gap-1.5">
            FIFO Audited
          </span>
          <span className="text-[11px] font-mono text-slate-500 mt-1">
            Tax-compliant capital gains
          </span>
        </div>
      </div>

      {/* 2. Transaction Table with Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Trade Ledger & Corporate Actions</h3>
            <p className="text-xs text-slate-400">Every executed buy, sell, bonus issue, and dividend receipt record.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors font-sans"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Ledger</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm font-sans"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Transaction</span>
            </button>
          </div>
        </div>

        {/* Table */}
        {transactions.length === 0 ? (
          <p className="py-12 text-center text-xs text-slate-500">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-medium">DATE</th>
                  <th className="py-2.5 px-3 font-medium">TYPE</th>
                  <th className="py-2.5 px-3 font-medium">SYMBOL</th>
                  <th className="py-2.5 px-3 font-medium text-right">QUANTITY</th>
                  <th className="py-2.5 px-3 font-medium text-right">PRICE (₹)</th>
                  <th className="py-2.5 px-3 font-medium text-right">GROSS AMOUNT</th>
                  <th className="py-2.5 px-3 font-medium text-right">CHARGES</th>
                  <th className="py-2.5 px-3 font-medium">NOTES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {transactions.map((t) => {
                  const grossAmount = t.quantity * t.price;
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-300 tabular-nums">{t.date}</td>
                      <td className="py-3 px-3">{getTypeBadge(t.type)}</td>
                      <td className="py-3 px-3 font-bold text-slate-100">{t.symbol}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-200">{t.quantity}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-300">₹{t.price.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right tabular-nums font-semibold text-slate-100">
                        ₹{grossAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-400">₹{t.charges || 0}</td>
                      <td className="py-3 px-3 text-slate-400 font-sans truncate max-w-xs">{t.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-100">Record Trade or Corporate Action</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add buys, sells, dividend distributions, or bonus issuances.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 font-medium">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BUY">BUY Order</option>
                    <option value="SELL">SELL Order</option>
                    <option value="DIVIDEND">DIVIDEND Receipt</option>
                    <option value="BONUS">BONUS Issue</option>
                    <option value="SPLIT">STOCK SPLIT</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 font-medium">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-medium">Stock Symbol</label>
                <select
                  value={symbol}
                  onChange={(e) => handleSelectSymbol(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">Select stock...</option>
                  {allStocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                  <label className="text-slate-300 font-medium">
                    {type === 'DIVIDEND' ? 'Div / Share (₹)' : 'Price / Share (₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 font-medium">Charges (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={charges}
                    onChange={(e) => setCharges(parseFloat(e.target.value) || 0)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-medium">Notes & Reference</label>
                <input
                  type="text"
                  placeholder="Order ID, exchange trade ref..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
