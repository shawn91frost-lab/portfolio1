import { Bar, TechnicalIndicators, AdminSettings } from '../types';

/**
 * Calculate Exponential Moving Average (EMA) for a series of numbers.
 */
export function calculateEMA(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  if (values.length < period) {
    // If not enough data, compute simple average up to current length
    const sum = values.reduce((acc, v) => acc + v, 0);
    return values.map(() => sum / values.length);
  }

  const k = 2 / (period + 1);
  const emaArray: number[] = new Array(values.length);

  // Initial SMA for first `period` elements
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  let currentEma = sum / period;

  for (let i = 0; i < period; i++) {
    emaArray[i] = currentEma;
  }

  for (let i = period; i < values.length; i++) {
    currentEma = values[i] * k + currentEma * (1 - k);
    emaArray[i] = currentEma;
  }

  return emaArray;
}

/**
 * Calculate Relative Strength Index (RSI 14) using Wilder's smoothing.
 */
export function calculateRSI(closes: number[], period: number = 14): number[] {
  if (closes.length <= period) {
    return closes.map(() => 50); // neutral baseline if insufficient history
  }

  const rsi: number[] = new Array(closes.length).fill(50);
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) {
    rsi[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    rsi[period] = 100 - 100 / (1 + rs);
  }

  for (let i = period + 1; i < closes.length; i++) {
    const currentGain = gains[i - 1];
    const currentLoss = losses[i - 1];

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = Number((100 - 100 / (1 + rs)).toFixed(2));
    }
  }

  return rsi;
}

/**
 * Calculate MACD (12, 26, 9)
 */
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; hist: number[] } {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdLine.push(fastEMA[i] - slowEMA[i]);
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    histogram.push(macdLine[i] - signalLine[i]);
  }

  return { macd: macdLine, signal: signalLine, hist: histogram };
}

/**
 * Calculate Bollinger Bands (20 periods, 2 standard deviations)
 */
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = calculateEMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    const start = Math.max(0, i - period + 1);
    const slice = closes.slice(start, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;

    const variance =
      slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / slice.length;
    const stdDev = Math.sqrt(variance);

    upper.push(middle[i] + stdDevMultiplier * stdDev);
    lower.push(middle[i] - stdDevMultiplier * stdDev);
  }

  return { upper, middle, lower };
}

/**
 * Calculate Average True Range (ATR 14)
 */
export function calculateATR(bars: Bar[], period: number = 14): number[] {
  if (bars.length < 2) return bars.map(() => 0);

  const tr: number[] = [bars[0].high - bars[0].low];

  for (let i = 1; i < bars.length; i++) {
    const high = bars[i].high;
    const low = bars[i].low;
    const prevClose = bars[i - 1].close;

    const trueRange = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    tr.push(trueRange);
  }

  return calculateEMA(tr, period);
}

/**
 * Evaluate technical indicators and automated bullish/bearish score for a stock or index.
 */
export function computeTechnicalIndicators(
  bars: Bar[],
  cmpOverride?: number,
  adminSettings?: Partial<AdminSettings>
): TechnicalIndicators {
  if (!bars || bars.length === 0) {
    const dummyCmp = cmpOverride || 100;
    return {
      ema20: dummyCmp,
      ema50: dummyCmp,
      ema200: dummyCmp,
      rsi: 50,
      macd: { macd: 0, signal: 0, hist: 0 },
      bollinger: { upper: dummyCmp * 1.05, middle: dummyCmp, lower: dummyCmp * 0.95 },
      atr: dummyCmp * 0.02,
      avgVolume20: 100000,
      volumeRatio: 1,
      prevHigh: dummyCmp,
      prevLow: dummyCmp,
      score: 4,
      signal: 'NEUTRAL',
      trend: 'NEUTRAL',
    };
  }

  const closes = bars.map((b) => b.close);
  const volumes = bars.map((b) => b.volume);
  const lastIndex = bars.length - 1;

  const currentCmp = cmpOverride !== undefined ? cmpOverride : bars[lastIndex].close;
  // Put current price at the end of closes for calculation
  const workingCloses = [...closes];
  workingCloses[lastIndex] = currentCmp;

  const ema20Series = calculateEMA(workingCloses, 20);
  const ema50Series = calculateEMA(workingCloses, 50);
  const ema200Series = calculateEMA(workingCloses, 200);

  const rsiSeries = calculateRSI(workingCloses, 14);
  const macdData = calculateMACD(workingCloses, 12, 26, 9);
  const bbData = calculateBollingerBands(workingCloses, 20, 2);
  const atrSeries = calculateATR(bars, 14);

  const ema20 = Number(ema20Series[lastIndex].toFixed(2));
  const ema50 = Number(ema50Series[lastIndex].toFixed(2));
  const ema200 = Number(ema200Series[lastIndex].toFixed(2));
  const rsi = Number(rsiSeries[lastIndex].toFixed(2));

  const macdVal = Number(macdData.macd[lastIndex].toFixed(2));
  const macdSig = Number(macdData.signal[lastIndex].toFixed(2));
  const macdHist = Number(macdData.hist[lastIndex].toFixed(2));

  const bbUpper = Number(bbData.upper[lastIndex].toFixed(2));
  const bbMiddle = Number(bbData.middle[lastIndex].toFixed(2));
  const bbLower = Number(bbData.lower[lastIndex].toFixed(2));

  const atr = Number(atrSeries[lastIndex].toFixed(2));

  // 20-day average volume
  const volSlice = volumes.slice(Math.max(0, volumes.length - 20));
  const avgVolume20 = Math.round(
    volSlice.reduce((a, b) => a + b, 0) / Math.max(1, volSlice.length)
  );
  const currentVolume = bars[lastIndex].volume;
  const volumeRatio = Number((currentVolume / Math.max(1, avgVolume20)).toFixed(2));

  const prevBar = bars.length > 1 ? bars[bars.length - 2] : bars[0];
  const prevHigh = prevBar.high;
  const prevLow = prevBar.low;

  // Weights (configurable via adminSettings)
  const weights = adminSettings?.weights || {
    priceAboveEma20: 1,
    priceAboveEma50: 1,
    priceAboveEma200: 1,
    ema20Above50: 1,
    ema50Above200: 1,
    rsiBullish: 1,
    macdBullish: 1,
    volumeSurge: 1,
  };

  let score = 0;
  if (currentCmp > ema20) score += weights.priceAboveEma20;
  if (currentCmp > ema50) score += weights.priceAboveEma50;
  if (currentCmp > ema200) score += weights.priceAboveEma200;
  if (ema20 > ema50) score += weights.ema20Above50;
  if (ema50 > ema200) score += weights.ema50Above200;
  if (rsi > (adminSettings?.rsiOversold ? 50 : 50)) score += weights.rsiBullish;
  if (macdVal > macdSig || macdHist > 0) score += weights.macdBullish;
  if (volumeRatio >= 1.05) score += weights.volumeSurge;

  const bullishThreshold = adminSettings?.bullishThreshold ?? 6;
  const neutralThreshold = adminSettings?.neutralThreshold ?? 3;

  let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (score >= bullishThreshold) {
    signal = 'BULLISH';
  } else if (score < neutralThreshold) {
    signal = 'BEARISH';
  } else {
    signal = 'NEUTRAL';
  }

  // Trend determination based on EMAs as requested
  let trend = 'NEUTRAL';
  const above20 = currentCmp > ema20;
  const above50 = currentCmp > ema50;
  const above200 = currentCmp > ema200;

  if (above20 && above50 && above200) {
    trend = 'STRONG BULLISH';
  } else if (above20 && above50 && !above200) {
    trend = 'MEDIUM-TERM BULLISH / LONG-TERM WEAK';
  } else if (!above20 && above50 && above200) {
    trend = 'SHORT-TERM PULLBACK IN BULL RUN';
  } else if (above20 && !above50 && !above200) {
    trend = 'EARLY REVERSAL ATTEMPT';
  } else if (!above20 && !above50 && above200) {
    trend = 'CORRECTION TOWARDS 200 EMA';
  } else if (!above20 && !above50 && !above200) {
    trend = 'BEARISH';
  } else {
    trend = 'CONSOLIDATION';
  }

  return {
    ema20,
    ema50,
    ema200,
    rsi,
    macd: { macd: macdVal, signal: macdSig, hist: macdHist },
    bollinger: { upper: bbUpper, middle: bbMiddle, lower: bbLower },
    atr,
    avgVolume20,
    volumeRatio,
    prevHigh,
    prevLow,
    score,
    signal,
    trend,
  };
}
