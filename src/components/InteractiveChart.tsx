import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Bar } from '../types';
import { calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from '../lib/indicators';

interface InteractiveChartProps {
  symbol: string;
  title: string;
  bars: Bar[];
  currentPrice: number;
  height?: number;
}

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  symbol,
  title,
  bars,
  currentPrice,
  height = 440,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [activeSubChart, setActiveSubChart] = useState<'none' | 'rsi' | 'macd'>('rsi');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Slice bars according to selected timeframe
  const filteredBars = useMemo(() => {
    if (!bars || bars.length === 0) return [];
    let count = bars.length;
    switch (timeframe) {
      case '1D':
        count = 15;
        break;
      case '1W':
        count = 25;
        break;
      case '1M':
        count = 40;
        break;
      case '3M':
        count = 75;
        break;
      case '6M':
        count = 130;
        break;
      case '1Y':
        count = 250;
        break;
      case '5Y':
        count = bars.length;
        break;
    }
    return bars.slice(Math.max(0, bars.length - count));
  }, [bars, timeframe]);

  // Indicator series
  const indicators = useMemo(() => {
    if (filteredBars.length === 0) return null;
    const closes = filteredBars.map((b) => b.close);
    const ema20 = calculateEMA(closes, 20);
    const ema50 = calculateEMA(closes, 50);
    const ema200 = calculateEMA(closes, 200);
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes, 12, 26, 9);
    const bb = calculateBollingerBands(closes, 20, 2);

    return { ema20, ema50, ema200, rsi, macd, bb };
  }, [filteredBars]);

  // Canvas Drawing Routine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || filteredBars.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = rect.height;

    // Split vertical space:
    // Sub-chart height (if active) = 90px;
    // Volume area inside main chart = lower 18%;
    const hasSubChart = activeSubChart !== 'none';
    const subHeight = hasSubChart ? 95 : 0;
    const mainHeight = chartHeight - subHeight - 25; // 25px bottom date axis

    ctx.clearRect(0, 0, width, chartHeight);

    // Padding
    const paddingRight = 65;
    const paddingLeft = 10;
    const paddingTop = 20;
    const candleAreaWidth = width - paddingLeft - paddingRight;

    // Price Bounds
    const highPrices = filteredBars.map((b) => b.high);
    const lowPrices = filteredBars.map((b) => b.low);

    if (showBollinger && indicators) {
      highPrices.push(...indicators.bb.upper);
      lowPrices.push(...indicators.bb.lower);
    }

    let minPrice = Math.min(...lowPrices);
    let maxPrice = Math.max(...highPrices);
    const priceRange = Math.max(1, maxPrice - minPrice);
    minPrice -= priceRange * 0.03;
    maxPrice += priceRange * 0.03;
    const fullRange = maxPrice - minPrice;

    const maxVolume = Math.max(...filteredBars.map((b) => b.volume), 1);

    const getY = (price: number) => {
      const normalized = (price - minPrice) / fullRange;
      return paddingTop + (mainHeight - paddingTop) * (1 - normalized);
    };

    const numBars = filteredBars.length;
    const barWidth = Math.max(2, (candleAreaWidth / numBars) * 0.65);
    const barSpacing = candleAreaWidth / numBars;

    // Grid lines for main chart
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const priceSteps = 5;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= priceSteps; i++) {
      const p = minPrice + (fullRange * i) / priceSteps;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      ctx.fillText(`₹${p.toFixed(0)}`, width - paddingRight + 6, y + 3);
    }

    // 1. Draw Volume Bars (lower 20% of main canvas)
    const volumeHeightMax = mainHeight * 0.22;
    for (let i = 0; i < numBars; i++) {
      const b = filteredBars[i];
      const x = paddingLeft + i * barSpacing + barSpacing / 2;
      const vHeight = (b.volume / maxVolume) * volumeHeightMax;
      const isUp = b.close >= b.open;

      ctx.fillStyle = isUp ? 'rgba(34, 197, 94, 0.18)' : 'rgba(239, 68, 68, 0.18)';
      ctx.fillRect(x - barWidth / 2, mainHeight - vHeight, barWidth, vHeight);
    }

    // 2. Draw Bollinger Bands (if enabled)
    if (showBollinger && indicators) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.beginPath();
      for (let i = 0; i < numBars; i++) {
        const x = paddingLeft + i * barSpacing + barSpacing / 2;
        const y = getY(indicators.bb.upper[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let i = numBars - 1; i >= 0; i--) {
        const x = paddingLeft + i * barSpacing + barSpacing / 2;
        const y = getY(indicators.bb.lower[i]);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Band outlines
      const drawLine = (data: number[], color: string, widthLine = 1, dashed = false) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = widthLine;
        ctx.setLineDash(dashed ? [4, 4] : []);
        ctx.beginPath();
        for (let i = 0; i < numBars; i++) {
          const x = paddingLeft + i * barSpacing + barSpacing / 2;
          const y = getY(data[i]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawLine(indicators.bb.upper, 'rgba(56, 189, 248, 0.4)', 1, true);
      drawLine(indicators.bb.lower, 'rgba(56, 189, 248, 0.4)', 1, true);
      drawLine(indicators.bb.middle, 'rgba(56, 189, 248, 0.6)', 1);
    }

    // 3. Draw Candlesticks
    for (let i = 0; i < numBars; i++) {
      const b = filteredBars[i];
      const x = paddingLeft + i * barSpacing + barSpacing / 2;
      const isUp = b.close >= b.open;
      const color = isUp ? '#22c55e' : '#ef4444';

      const openY = getY(b.open);
      const closeY = getY(b.close);
      const highY = getY(b.high);
      const lowY = getY(b.low);

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Candle body
      const topY = Math.min(openY, closeY);
      const bodyH = Math.max(1.5, Math.abs(openY - closeY));
      ctx.fillStyle = color;
      ctx.fillRect(x - barWidth / 2, topY, barWidth, bodyH);
    }

    // 4. Draw EMAs
    const drawEmaLine = (data: number[], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < numBars; i++) {
        const x = paddingLeft + i * barSpacing + barSpacing / 2;
        const y = getY(data[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    if (indicators) {
      if (showEMA20) drawEmaLine(indicators.ema20, '#38bdf8'); // Sky blue
      if (showEMA50) drawEmaLine(indicators.ema50, '#f59e0b'); // Amber
      if (showEMA200) drawEmaLine(indicators.ema200, '#a855f7'); // Purple
    }

    // Current price horizontal guideline
    const currentPriceY = getY(currentPrice);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, currentPriceY);
    ctx.lineTo(width - paddingRight, currentPriceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // CMP badge on right axis
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(width - paddingRight, currentPriceY - 9, 62, 18);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`₹${currentPrice.toFixed(0)}`, width - paddingRight + 31, currentPriceY + 3);

    // 5. Draw Sub-Chart (RSI or MACD)
    if (hasSubChart && indicators) {
      const subTop = chartHeight - subHeight - 20;
      const subBottom = chartHeight - 20;

      // Divider between main chart and sub-chart
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, subTop - 4);
      ctx.lineTo(width - paddingRight, subTop - 4);
      ctx.stroke();

      if (activeSubChart === 'rsi') {
        // RSI (0 - 100)
        const getRsiY = (val: number) => {
          return subBottom - (val / 100) * (subBottom - subTop);
        };

        // 70 and 30 guide zones
        ctx.fillStyle = 'rgba(244, 63, 94, 0.06)';
        ctx.fillRect(paddingLeft, subTop, candleAreaWidth, getRsiY(70) - subTop);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.06)';
        ctx.fillRect(paddingLeft, getRsiY(30), candleAreaWidth, subBottom - getRsiY(30));

        // 70 line
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, getRsiY(70));
        ctx.lineTo(width - paddingRight, getRsiY(70));
        ctx.stroke();

        // 30 line
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)';
        ctx.beginPath();
        ctx.moveTo(paddingLeft, getRsiY(30));
        ctx.lineTo(width - paddingRight, getRsiY(30));
        ctx.stroke();
        ctx.setLineDash([]);

        // Axis labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('70 Overbought', width - paddingRight + 4, getRsiY(70) + 3);
        ctx.fillText('30 Oversold', width - paddingRight + 4, getRsiY(30) + 3);

        // RSI Line
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = 0; i < numBars; i++) {
          const x = paddingLeft + i * barSpacing + barSpacing / 2;
          const y = getRsiY(indicators.rsi[i]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (activeSubChart === 'macd') {
        // MACD Histogram & Signal
        const histVals = indicators.macd.hist;
        const maxMacd = Math.max(...histVals.map(Math.abs), 1);
        const zeroY = subTop + (subBottom - subTop) / 2;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(paddingLeft, zeroY);
        ctx.lineTo(width - paddingRight, zeroY);
        ctx.stroke();

        for (let i = 0; i < numBars; i++) {
          const x = paddingLeft + i * barSpacing + barSpacing / 2;
          const val = indicators.macd.hist[i];
          const h = (Math.abs(val) / maxMacd) * ((subBottom - subTop) / 2);
          ctx.fillStyle = val >= 0 ? '#22c55e' : '#ef4444';
          const y = val >= 0 ? zeroY - h : zeroY;
          ctx.fillRect(x - barWidth / 2, y, barWidth, Math.max(1, h));
        }

        // MACD Line
        const getMacdY = (v: number) => zeroY - (v / maxMacd) * ((subBottom - subTop) / 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (let i = 0; i < numBars; i++) {
          const x = paddingLeft + i * barSpacing + barSpacing / 2;
          const y = getMacdY(indicators.macd.macd[i]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Signal Line
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (let i = 0; i < numBars; i++) {
          const x = paddingLeft + i * barSpacing + barSpacing / 2;
          const y = getMacdY(indicators.macd.signal[i]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    // 6. Date axis at bottom
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const dateInterval = Math.max(1, Math.floor(numBars / 6));

    for (let i = 0; i < numBars; i += dateInterval) {
      const b = filteredBars[i];
      const x = paddingLeft + i * barSpacing + barSpacing / 2;
      const formattedDate = b.time.slice(5); // MM-DD
      ctx.fillText(formattedDate, x, chartHeight - 5);
    }

    // 7. Hover inspection crosshairs
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < numBars) {
      const targetBar = filteredBars[hoverIndex];
      const crossX = paddingLeft + hoverIndex * barSpacing + barSpacing / 2;
      const crossY = getY(targetBar.close);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(crossX, 0);
      ctx.lineTo(crossX, chartHeight - 20);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(paddingLeft, crossY);
      ctx.lineTo(width - paddingRight, crossY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [filteredBars, indicators, showEMA20, showEMA50, showEMA200, showBollinger, activeSubChart, hoverIndex, currentPrice]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || filteredBars.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const paddingLeft = 10;
    const paddingRight = 65;
    const candleAreaWidth = rect.width - paddingLeft - paddingRight;
    const barSpacing = candleAreaWidth / filteredBars.length;

    const index = Math.floor((x - paddingLeft) / barSpacing);
    if (index >= 0 && index < filteredBars.length) {
      setHoverIndex(index);
    } else {
      setHoverIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const inspectedBar = hoverIndex !== null && filteredBars[hoverIndex]
    ? filteredBars[hoverIndex]
    : filteredBars[filteredBars.length - 1];

  const inspectedInd = hoverIndex !== null && indicators
    ? {
        ema20: indicators.ema20[hoverIndex],
        ema50: indicators.ema50[hoverIndex],
        ema200: indicators.ema200[hoverIndex],
        rsi: indicators.rsi[hoverIndex],
      }
    : indicators
    ? {
        ema20: indicators.ema20[indicators.ema20.length - 1],
        ema50: indicators.ema50[indicators.ema50.length - 1],
        ema200: indicators.ema200[indicators.ema200.length - 1],
        rsi: indicators.rsi[indicators.rsi.length - 1],
      }
    : null;

  return (
    <div ref={containerRef} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">{title}</h3>
            <span className="text-xs text-slate-400 font-mono">({symbol})</span>
          </div>
          {inspectedBar && (
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-1">
              <span>Date: <strong className="text-slate-200">{inspectedBar.time}</strong></span>
              <span>O: <strong className="text-slate-200">₹{inspectedBar.open.toFixed(1)}</strong></span>
              <span>H: <strong className="text-slate-200">₹{inspectedBar.high.toFixed(1)}</strong></span>
              <span>L: <strong className="text-slate-200">₹{inspectedBar.low.toFixed(1)}</strong></span>
              <span>C: <strong className={inspectedBar.close >= inspectedBar.open ? 'text-emerald-400' : 'text-rose-400'}>₹{inspectedBar.close.toFixed(1)}</strong></span>
              <span>Vol: <strong className="text-slate-200">{(inspectedBar.volume / 1000).toFixed(0)}k</strong></span>
            </div>
          )}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                timeframe === tf
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Indicator Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 font-mono ${
              showEMA20
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-2 h-0.5 bg-sky-400 inline-block"></span>
            EMA 20 {inspectedInd ? `(${inspectedInd.ema20.toFixed(0)})` : ''}
          </button>

          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 font-mono ${
              showEMA50
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-2 h-0.5 bg-amber-400 inline-block"></span>
            EMA 50 {inspectedInd ? `(${inspectedInd.ema50.toFixed(0)})` : ''}
          </button>

          <button
            onClick={() => setShowEMA200(!showEMA200)}
            className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1.5 font-mono ${
              showEMA200
                ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-2 h-0.5 bg-purple-400 inline-block"></span>
            EMA 200 {inspectedInd ? `(${inspectedInd.ema200.toFixed(0)})` : ''}
          </button>

          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2 py-0.5 rounded border transition-colors font-mono ${
              showBollinger
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}
          >
            BB (20,2)
          </button>
        </div>

        {/* Sub-chart toggle */}
        <div className="flex items-center gap-1 text-slate-400 font-mono">
          <span className="text-[11px] mr-1">Subchart:</span>
          <button
            onClick={() => setActiveSubChart(activeSubChart === 'rsi' ? 'none' : 'rsi')}
            className={`px-2 py-0.5 rounded border text-[11px] ${
              activeSubChart === 'rsi'
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                : 'border-slate-800 text-slate-400'
            }`}
          >
            RSI {inspectedInd ? `(${inspectedInd.rsi.toFixed(1)})` : ''}
          </button>
          <button
            onClick={() => setActiveSubChart(activeSubChart === 'macd' ? 'none' : 'macd')}
            className={`px-2 py-0.5 rounded border text-[11px] ${
              activeSubChart === 'macd'
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                : 'border-slate-800 text-slate-400'
            }`}
          >
            MACD (12,26,9)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full h-[360px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair block"
        />
      </div>
    </div>
  );
};
