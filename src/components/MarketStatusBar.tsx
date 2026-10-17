import React, { useState, useEffect } from 'react';
import { getIndianMarketStatus, MarketCalendarStatus } from '../lib/marketData';
import { RefreshCw, Clock, Globe } from 'lucide-react';

interface MarketStatusBarProps {
  lastUpdated: string;
  onRefreshTick: () => void;
  isAutoRefreshActive: boolean;
  onToggleAutoRefresh: () => void;
}

export const MarketStatusBar: React.FC<MarketStatusBarProps> = ({
  lastUpdated,
  onRefreshTick,
  isAutoRefreshActive,
  onToggleAutoRefresh,
}) => {
  const [marketStatus, setMarketStatus] = useState<MarketCalendarStatus>(getIndianMarketStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setMarketStatus(getIndianMarketStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = () => {
    switch (marketStatus.status) {
      case 'MARKET OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            MARKET OPEN (09:15 - 15:30 IST)
          </span>
        );
      case 'PRE-MARKET':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            PRE-MARKET (09:00 - 09:08 IST)
          </span>
        );
      case 'AFTER MARKET':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-sky-950 text-sky-400 border border-sky-800">
            AFTER MARKET SESSION
          </span>
        );
      case 'MARKET CLOSED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800">
            MARKET CLOSED
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-slate-950/80 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-300 font-mono">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>NSE / BSE</span>
        </div>
        <span className="text-slate-700">|</span>
        {getStatusBadge()}
        <span className="text-slate-700 hidden sm:inline">|</span>
        <div className="flex items-center gap-1 text-slate-400 font-mono hidden sm:flex">
          <Clock className="w-3.5 h-3.5" />
          <span>IST: {marketStatus.istTimeString}</span>
        </div>
        {marketStatus.status === 'MARKET CLOSED' && (
          <span className="text-slate-500 text-[11px] hidden md:inline">
            ({marketStatus.nextOpenString})
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-slate-400 font-mono">
        <span className="text-[11px]">Last updated: <strong className="text-slate-200">{lastUpdated || 'Live'}</strong></span>

        <button
          onClick={onToggleAutoRefresh}
          className={`px-2 py-0.5 rounded border text-[11px] transition-colors ${
            isAutoRefreshActive
              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
          title="Toggle live price tick stream"
        >
          {isAutoRefreshActive ? 'Live Stream: ON' : 'Live Stream: PAUSED'}
        </button>

        <button
          onClick={onRefreshTick}
          className="p-1 rounded hover:bg-slate-800 text-slate-300 transition-colors"
          title="Manual Market Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
