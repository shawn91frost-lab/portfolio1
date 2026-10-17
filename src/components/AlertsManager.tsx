import React, { useState } from 'react';
import { PriceAlert, AlertCondition, InAppNotification } from '../types';
import { marketDataService } from '../lib/marketData';
import {
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Zap,
  Play,
  Pause,
  X,
} from 'lucide-react';

interface AlertsManagerProps {
  alerts: PriceAlert[];
  notifications: InAppNotification[];
  onCreateAlert: (alert: Omit<PriceAlert, 'id' | 'userId' | 'createdAt' | 'status'>) => void;
  onDeleteAlert: (id: string) => void;
  onToggleAlertStatus: (id: string) => void;
  onEvaluateAlertsNow: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  defaultSymbol?: string;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  alerts,
  notifications,
  onCreateAlert,
  onDeleteAlert,
  onToggleAlertStatus,
  onEvaluateAlertsNow,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  defaultSymbol = 'RELIANCE',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [condition, setCondition] = useState<AlertCondition>('PRICE_ABOVE');
  const [targetValue, setTargetValue] = useState<string>('');
  const [emailNotification, setEmailNotification] = useState(true);

  const allStocks = marketDataService.getAllStocks();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol) return;

    onCreateAlert({
      symbol: symbol.toUpperCase(),
      stockName: marketDataService.getStock(symbol)?.name || symbol,
      condition,
      targetValue: targetValue ? parseFloat(targetValue) : undefined,
      emailNotification,
    });

    setIsModalOpen(false);
    setTargetValue('');
  };

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const triggeredAlerts = alerts.filter((a) => a.status === 'TRIGGERED');

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Header & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-sans">
            Real-Time Market Alert Daemon
          </h2>
          <p className="text-xs text-slate-400">
            Set autonomous triggers on CMP levels, EMA 20/50/200 crossovers, RSI oversold/overbought extremes, and signal flips.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onEvaluateAlertsNow}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors font-mono"
            title="Scan active alerts against latest CMP now"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Scan Triggers Now</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Alert</span>
          </button>
        </div>
      </div>

      {/* 2. In-App Notifications Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Alert Notification Feed</h3>
          </div>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={onMarkAllNotificationsRead}
              className="text-xs text-emerald-400 hover:underline font-mono"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">No alerts fired yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-800/50 max-h-56 overflow-y-auto">
            {notifications.slice(0, 8).map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkNotificationRead(n.id)}
                className={`py-2.5 px-2 flex items-start justify-between gap-3 text-xs transition-colors cursor-pointer rounded ${
                  n.read ? 'opacity-65 hover:bg-slate-800/30' : 'bg-slate-800/50 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      n.read ? 'bg-slate-600' : 'bg-emerald-400'
                    }`}
                  />
                  <div>
                    <h5 className="font-semibold text-slate-200 font-sans">{n.title}</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5 font-sans">{n.message}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">{n.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Active and Triggered Alerts Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">
              Active Monitoring Triggers ({activeAlerts.length})
            </h4>
            <span className="text-xs text-emerald-400 font-mono">Live</span>
          </div>

          {activeAlerts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No active alerts. Click "Create Alert" to set price or indicator thresholds.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-800/50">
              {activeAlerts.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 font-mono">{a.symbol}</span>
                      <span className="text-[11px] text-slate-400">· {a.stockName}</span>
                    </div>
                    <span className="text-[11px] text-slate-300 font-mono mt-0.5">
                      {a.condition.replace(/_/g, ' ')} {a.targetValue ? `(₹${a.targetValue})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {a.emailNotification && (
                      <span className="text-slate-500" title="Email dispatch enabled">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <button
                      onClick={() => onToggleAlertStatus(a.id)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                      title="Pause Alert"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAlert(a.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Triggered Alerts History */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">
              Triggered History ({triggeredAlerts.length})
            </h4>
            <span className="text-xs text-slate-500 font-mono">Archived</span>
          </div>

          {triggeredAlerts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No alerts have triggered yet.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-800/50">
              {triggeredAlerts.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 font-mono">{a.symbol}</span>
                      <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[9px] font-mono">
                        TRIGGERED
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {a.message || `${a.condition.replace(/_/g, ' ')} satisfied`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleAlertStatus(a.id)}
                      className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Re-activate Alert"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAlert(a.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Alert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-100">Configure Market Alert</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select stock symbol, threshold condition, and dispatch method.
            </p>

            <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-4 text-xs font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-medium">Select Stock / Index</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="^NSEI">^NSEI — NIFTY 50 Benchmark</option>
                  <option value="^NSEBANK">^NSEBANK — BANK NIFTY</option>
                  {allStocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-medium">Trigger Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as AlertCondition)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
                >
                  <option value="PRICE_ABOVE">Price Crosses Above (₹)</option>
                  <option value="PRICE_BELOW">Price Crosses Below (₹)</option>
                  <option value="CROSS_EMA200">Price Converges with EMA 200</option>
                  <option value="CROSS_EMA50">Price Converges with EMA 50</option>
                  <option value="CROSS_EMA20">Price Converges with EMA 20</option>
                  <option value="RSI_BELOW_30">RSI Drops Below 30 (Oversold)</option>
                  <option value="RSI_ABOVE_70">RSI Crosses Above 70 (Overbought)</option>
                  <option value="SIGNAL_BEARISH_TO_BULLISH">Algorithmic Signal Turns BULLISH</option>
                  <option value="SIGNAL_BULLISH_TO_BEARISH">Algorithmic Signal Turns BEARISH</option>
                </select>
              </div>

              {(condition === 'PRICE_ABOVE' || condition === 'PRICE_BELOW') && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-300 font-medium">Target Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    placeholder="Enter target price..."
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="emailNotif"
                  checked={emailNotification}
                  onChange={(e) => setEmailNotification(e.target.checked)}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-0"
                />
                <label htmlFor="emailNotif" className="text-slate-300 cursor-pointer">
                  Send simulated instant email notification on trigger
                </label>
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
                  Activate Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
