import React, { useState } from 'react';
import { Watchlist, StockQuote } from '../types';
import { marketDataService } from '../lib/marketData';
import {
  Plus,
  Trash2,
  Search,
  ExternalLink,
  BellRing,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';

interface WatchlistViewProps {
  watchlists: Watchlist[];
  onCreateWatchlist: (name: string) => void;
  onDeleteWatchlist: (id: string) => void;
  onAddSymbol: (watchlistId: string, symbol: string) => void;
  onRemoveSymbol: (watchlistId: string, symbol: string) => void;
  onSelectStock: (symbol: string) => void;
  onOpenCreateAlert: (symbol: string) => void;
  onQuickAddToPortfolio: (symbol: string) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlists,
  onCreateWatchlist,
  onDeleteWatchlist,
  onAddSymbol,
  onRemoveSymbol,
  onSelectStock,
  onOpenCreateAlert,
  onQuickAddToPortfolio,
}) => {
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string>(
    watchlists[0]?.id || ''
  );
  const [isCreatingWatchlist, setIsCreatingWatchlist] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeWatchlist =
    watchlists.find((w) => w.id === selectedWatchlistId) || watchlists[0];

  const allStocks = marketDataService.getAllStocks();
  const searchResults = searchQuery.trim()
    ? allStocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleCreateWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatchlistName.trim()) return;
    onCreateWatchlist(newWatchlistName.trim());
    setNewWatchlistName('');
    setIsCreatingWatchlist(false);
  };

  const currentSymbols = activeWatchlist ? activeWatchlist.symbols : [];
  const watchlistQuotes = currentSymbols
    .map((sym) => marketDataService.getStock(sym))
    .filter((q): q is StockQuote => !!q);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header and Watchlist Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-sans">
              Market Watchlists & Automated Technical Radar
            </h2>
            <p className="text-xs text-slate-400">
              Real-time multi-watchlist scanner with dynamic EMA 20/50/200 and algorithmic signals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isCreatingWatchlist ? (
              <button
                onClick={() => setIsCreatingWatchlist(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>New Watchlist</span>
              </button>
            ) : (
              <form onSubmit={handleCreateWatchlist} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Watchlist Name..."
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-semibold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingWatchlist(false)}
                  className="px-2 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Watchlist Segmented Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
          {watchlists.map((wl) => {
            const isSelected = activeWatchlist?.id === wl.id;
            return (
              <div key={wl.id} className="flex items-center group">
                <button
                  onClick={() => setSelectedWatchlistId(wl.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{wl.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({wl.symbols.length})</span>
                </button>
                {watchlists.length > 1 && (
                  <button
                    onClick={() => onDeleteWatchlist(wl.id)}
                    className="p-1 text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 ml-0.5"
                    title="Delete watchlist"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Stock Search to Add to Watchlist */}
        <div className="relative max-w-md">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder={`Search stock to add to ${activeWatchlist?.name || 'Watchlist'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-100 focus:outline-none placeholder:text-slate-500 font-sans"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl z-20 py-1 max-h-56 overflow-y-auto">
              {searchResults.map((s) => {
                const alreadyIn = activeWatchlist?.symbols.includes(s.symbol);
                return (
                  <div
                    key={s.symbol}
                    className="px-3 py-2 hover:bg-slate-900 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-100 font-mono">{s.symbol}</span>
                      <span className="text-slate-400 ml-2">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-300">₹{s.cmp}</span>
                      {alreadyIn ? (
                        <span className="text-[11px] text-slate-500 font-mono">Added</span>
                      ) : (
                        <button
                          onClick={() => {
                            if (activeWatchlist) {
                              onAddSymbol(activeWatchlist.id, s.symbol);
                              setSearchQuery('');
                            }
                          }}
                          className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded hover:bg-emerald-500/30 font-medium"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        {watchlistQuotes.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-sm font-semibold text-slate-300">Watchlist is currently empty</p>
            <p className="text-xs text-slate-500">
              Search for NSE stocks above to monitor real-time CMP and technical indicator crossovers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-medium">STOCK / SECTOR</th>
                  <th className="py-2.5 px-3 font-medium text-right">CMP (₹)</th>
                  <th className="py-2.5 px-3 font-medium text-right">CHANGE</th>
                  <th className="py-2.5 px-3 font-medium text-right">EMA 20</th>
                  <th className="py-2.5 px-3 font-medium text-right">EMA 50</th>
                  <th className="py-2.5 px-3 font-medium text-right">EMA 200</th>
                  <th className="py-2.5 px-3 font-medium text-right">RSI (14)</th>
                  <th className="py-2.5 px-3 font-medium text-center">SCORE</th>
                  <th className="py-2.5 px-3 font-medium text-center">SIGNAL</th>
                  <th className="py-2.5 px-3 font-medium text-right">QUICK ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {watchlistQuotes.map((s) => {
                  const isPositive = s.change >= 0;
                  const above20 = s.cmp >= s.indicators.ema20;
                  const above50 = s.cmp >= s.indicators.ema50;
                  const above200 = s.cmp >= s.indicators.ema200;

                  return (
                    <tr key={s.symbol} className="hover:bg-slate-800/40 transition-colors">
                      {/* Symbol & Name */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <button
                            onClick={() => onSelectStock(s.symbol)}
                            className="font-bold text-slate-200 hover:text-emerald-400 text-left font-sans flex items-center gap-1.5"
                          >
                            <span>{s.symbol}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </button>
                          <span className="text-[11px] text-slate-400 font-sans truncate max-w-[150px]">
                            {s.name}
                          </span>
                        </div>
                      </td>

                      {/* CMP */}
                      <td className="py-3 px-3 text-right font-bold text-slate-100 tabular-nums">
                        ₹{s.cmp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Change */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <div className="flex flex-col items-end">
                          <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPositive ? '+' : ''}{s.change.toFixed(2)}
                          </span>
                          <span className={`text-[10px] ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ({isPositive ? '+' : ''}{s.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </td>

                      {/* EMA 20 with dynamic color */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                            above20
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          ₹{s.indicators.ema20.toFixed(1)}
                        </span>
                      </td>

                      {/* EMA 50 with dynamic color */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                            above50
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          ₹{s.indicators.ema50.toFixed(1)}
                        </span>
                      </td>

                      {/* EMA 200 with dynamic color */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                            above200
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          ₹{s.indicators.ema200.toFixed(1)}
                        </span>
                      </td>

                      {/* RSI */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span
                          className={`font-semibold ${
                            s.indicators.rsi >= 70
                              ? 'text-rose-400 font-bold'
                              : s.indicators.rsi <= 30
                              ? 'text-emerald-400 font-bold'
                              : 'text-slate-300'
                          }`}
                        >
                          {s.indicators.rsi}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3 text-center tabular-nums">
                        <span className="text-slate-300 font-bold">
                          {s.indicators.score}/8
                        </span>
                      </td>

                      {/* Signal */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.indicators.signal === 'BULLISH'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : s.indicators.signal === 'BEARISH'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {s.indicators.signal}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onQuickAddToPortfolio(s.symbol)}
                            className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                            title="Add to Portfolio"
                          >
                            <PieChart className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenCreateAlert(s.symbol)}
                            className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                            title="Create Price Alert"
                          >
                            <BellRing className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (activeWatchlist) {
                                onRemoveSymbol(activeWatchlist.id, s.symbol);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Remove from Watchlist"
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
    </div>
  );
};
