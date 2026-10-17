import { Bar, StockQuote, MarketIndexData, SectorData, MarketBreadth, DailyMarketSnapshot, AdminSettings } from '../types';
import { computeTechnicalIndicators } from './indicators';

export interface MarketCalendarStatus {
  status: 'MARKET OPEN' | 'MARKET CLOSED' | 'PRE-MARKET' | 'AFTER MARKET';
  istTimeString: string;
  isTradingDay: boolean;
  holidayName?: string;
  nextOpenString: string;
}

// Indian National Holidays for NSE/BSE
export const NSE_HOLIDAYS: Record<string, string> = {
  '01-26': 'Republic Day',
  '03-14': 'Holi',
  '03-31': 'Id-Ul-Fitr',
  '04-10': 'Mahavir Jayanti',
  '04-18': 'Good Friday',
  '05-01': 'Maharashtra Day',
  '08-15': 'Independence Day',
  '09-05': 'Ganesh Chaturthi',
  '10-02': 'Mahatma Gandhi Jayanti',
  '10-21': 'Dussehra',
  '10-31': 'Diwali Laxmi Pujan',
  '11-01': 'Diwali Balipratipada',
  '11-15': 'Gurunanak Jayanti',
  '12-25': 'Christmas',
};

/**
 * Returns current Indian Standard Time (IST, UTC+5:30) and market session status.
 */
export function getIndianMarketStatus(): MarketCalendarStatus {
  const now = new Date();
  // IST is UTC + 5:30 (330 minutes)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 330 * 60000);

  const dayOfWeek = istDate.getDay(); // 0 is Sunday, 6 is Saturday
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const mmdd = `${month}-${day}`;
  const holidayName = NSE_HOLIDAYS[mmdd];

  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
  const istTimeString = timeFormatter.format(now);

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isTradingDay = !isWeekend && !holidayName;

  let status: 'MARKET OPEN' | 'MARKET CLOSED' | 'PRE-MARKET' | 'AFTER MARKET' = 'MARKET CLOSED';

  if (isTradingDay) {
    if (timeInMinutes >= 9 * 60 && timeInMinutes < 9 * 60 + 8) {
      status = 'PRE-MARKET';
    } else if (timeInMinutes >= 9 * 60 + 15 && timeInMinutes <= 15 * 60 + 30) {
      status = 'MARKET OPEN';
    } else if (timeInMinutes > 15 * 60 + 30 && timeInMinutes <= 16 * 60) {
      status = 'AFTER MARKET';
    } else {
      status = 'MARKET CLOSED';
    }
  } else {
    status = 'MARKET CLOSED';
  }

  let nextOpenString = 'Next session: 09:15 AM IST';
  if (isWeekend) {
    nextOpenString = 'Market opens Monday at 09:15 AM IST';
  } else if (holidayName) {
    nextOpenString = `Closed for ${holidayName}. Opens next trading day at 09:15 AM IST`;
  }

  return {
    status,
    istTimeString,
    isTradingDay,
    holidayName,
    nextOpenString,
  };
}

// Generate realistic multi-day historical candles for mathematical indicators
function generateRealisticHistory(
  basePrice: number,
  days: number = 260,
  volatility: number = 0.015,
  drift: number = 0.0006
): Bar[] {
  const bars: Bar[] = [];
  let currentPrice = basePrice * 0.85; // Started 15% lower 1 year ago for typical equity uptrend
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const shock = (Math.random() - 0.485) * volatility + drift;
    const open = currentPrice;
    const close = Math.max(1, Number((open * (1 + shock)).toFixed(2)));
    const high = Number((Math.max(open, close) * (1 + Math.random() * (volatility * 0.8))).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - Math.random() * (volatility * 0.8))).toFixed(2));
    const volume = Math.floor((150000 + Math.random() * 850000) * (basePrice > 2000 ? 0.3 : 1.5));

    bars.push({
      time: d.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume,
    });
    currentPrice = close;
  }

  // Adjust final close to match target base price
  const last = bars[bars.length - 1];
  if (last) {
    const ratio = basePrice / last.close;
    for (const b of bars) {
      b.open = Number((b.open * ratio).toFixed(2));
      b.high = Number((b.high * ratio).toFixed(2));
      b.low = Number((b.low * ratio).toFixed(2));
      b.close = Number((b.close * ratio).toFixed(2));
    }
  }

  return bars;
}

// Master Raw Definition of Indian Stocks
interface StockDefinition {
  symbol: string;
  name: string;
  sector: string;
  cmp: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  week52High: number;
  week52Low: number;
  marketCapCr: number;
  pe: number;
  eps: number;
  divYield: number;
  bookValue: number;
  roe: number;
  debtToEquity: number;
  volatility: number;
}

const STOCK_DEFINITIONS: StockDefinition[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    sector: 'Oil, Gas & Consumable Fuels',
    cmp: 2548.70,
    open: 2530.00,
    high: 2562.50,
    low: 2525.10,
    prevClose: 2524.30,
    volume: 5840200,
    week52High: 3217.90,
    week52Low: 2221.00,
    marketCapCr: 1724000,
    pe: 24.2,
    eps: 105.3,
    divYield: 0.39,
    bookValue: 1180,
    roe: 9.4,
    debtToEquity: 0.42,
    volatility: 0.016,
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    sector: 'Information Technology',
    cmp: 4125.40,
    open: 4090.00,
    high: 4145.00,
    low: 4075.20,
    prevClose: 4088.60,
    volume: 2410300,
    week52High: 4592.25,
    week52Low: 3313.00,
    marketCapCr: 1492000,
    pe: 31.8,
    eps: 129.7,
    divYield: 1.35,
    bookValue: 275,
    roe: 48.2,
    debtToEquity: 0.0,
    volatility: 0.015,
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    sector: 'Banking & Financial Services',
    cmp: 1684.20,
    open: 1675.00,
    high: 1692.00,
    low: 1668.50,
    prevClose: 1671.10,
    volume: 14200500,
    week52High: 1794.00,
    week52Low: 1363.55,
    marketCapCr: 1281000,
    pe: 18.9,
    eps: 89.1,
    divYield: 1.16,
    bookValue: 620,
    roe: 16.8,
    debtToEquity: 6.8,
    volatility: 0.014,
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    sector: 'Information Technology',
    cmp: 1912.80,
    open: 1895.00,
    high: 1928.00,
    low: 1888.20,
    prevClose: 1891.40,
    volume: 6720400,
    week52High: 1991.45,
    week52Low: 1358.35,
    marketCapCr: 794000,
    pe: 29.4,
    eps: 65.1,
    divYield: 2.41,
    bookValue: 215,
    roe: 31.5,
    debtToEquity: 0.08,
    volatility: 0.018,
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    sector: 'Banking & Financial Services',
    cmp: 1262.15,
    open: 1252.00,
    high: 1270.80,
    low: 1248.00,
    prevClose: 1250.30,
    volume: 9810200,
    week52High: 1332.00,
    week52Low: 914.00,
    marketCapCr: 887000,
    pe: 17.5,
    eps: 72.1,
    divYield: 0.79,
    bookValue: 380,
    roe: 18.5,
    debtToEquity: 5.9,
    volatility: 0.015,
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    sector: 'Telecommunication',
    cmp: 1715.30,
    open: 1698.00,
    high: 1728.00,
    low: 1692.00,
    prevClose: 1696.50,
    volume: 4890000,
    week52High: 1779.00,
    week52Low: 901.00,
    marketCapCr: 978000,
    pe: 72.4,
    eps: 23.7,
    divYield: 0.47,
    bookValue: 185,
    roe: 15.6,
    debtToEquity: 1.8,
    volatility: 0.017,
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd.',
    sector: 'Fast Moving Consumer Goods',
    cmp: 486.20,
    open: 484.00,
    high: 490.50,
    low: 482.10,
    prevClose: 483.75,
    volume: 11200000,
    week52High: 528.55,
    week52Low: 399.30,
    marketCapCr: 608000,
    pe: 28.6,
    eps: 17.0,
    divYield: 2.82,
    bookValue: 62,
    roe: 28.4,
    debtToEquity: 0.01,
    volatility: 0.012,
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    sector: 'Banking & Financial Services',
    cmp: 814.60,
    open: 810.00,
    high: 822.40,
    low: 806.50,
    prevClose: 808.90,
    volume: 18450000,
    week52High: 912.10,
    week52Low: 555.25,
    marketCapCr: 727000,
    pe: 10.8,
    eps: 75.4,
    divYield: 1.68,
    bookValue: 460,
    roe: 17.2,
    debtToEquity: 9.4,
    volatility: 0.019,
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    sector: 'Construction & Infrastructure',
    cmp: 3580.00,
    open: 3550.00,
    high: 3605.00,
    low: 3535.00,
    prevClose: 3545.20,
    volume: 1940000,
    week52High: 3948.00,
    week52Low: 2873.00,
    marketCapCr: 492000,
    pe: 34.2,
    eps: 104.7,
    divYield: 0.95,
    bookValue: 710,
    roe: 15.3,
    debtToEquity: 1.1,
    volatility: 0.017,
  },
  {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Ltd.',
    sector: 'Fast Moving Consumer Goods',
    cmp: 2685.00,
    open: 2695.00,
    high: 2715.00,
    low: 2670.00,
    prevClose: 2698.40,
    volume: 1650000,
    week52High: 3035.00,
    week52Low: 2172.00,
    marketCapCr: 631000,
    pe: 58.2,
    eps: 46.1,
    divYield: 1.56,
    bookValue: 220,
    roe: 20.4,
    debtToEquity: 0.02,
    volatility: 0.013,
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd.',
    sector: 'Banking & Financial Services',
    cmp: 7120.50,
    open: 7080.00,
    high: 7175.00,
    low: 7040.00,
    prevClose: 7065.00,
    volume: 980000,
    week52High: 8192.00,
    week52Low: 6375.00,
    marketCapCr: 440000,
    pe: 29.5,
    eps: 241.3,
    divYield: 0.51,
    bookValue: 1450,
    roe: 21.8,
    debtToEquity: 3.8,
    volatility: 0.021,
  },
  {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Ltd.',
    sector: 'Automobile and Auto Components',
    cmp: 12450.00,
    open: 12350.00,
    high: 12520.00,
    low: 12300.00,
    prevClose: 12360.00,
    volume: 520000,
    week52High: 13680.00,
    week52Low: 9690.00,
    marketCapCr: 391000,
    pe: 27.2,
    eps: 457.7,
    divYield: 1.00,
    bookValue: 2840,
    roe: 17.5,
    debtToEquity: 0.02,
    volatility: 0.016,
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    sector: 'Automobile and Auto Components',
    cmp: 915.40,
    open: 908.00,
    high: 924.00,
    low: 902.50,
    prevClose: 906.80,
    volume: 12800000,
    week52High: 1179.05,
    week52Low: 640.00,
    marketCapCr: 337000,
    pe: 10.4,
    eps: 88.0,
    divYield: 0.66,
    bookValue: 285,
    roe: 34.2,
    debtToEquity: 0.85,
    volatility: 0.024,
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries Ltd.',
    sector: 'Healthcare & Pharma',
    cmp: 1885.00,
    open: 1870.00,
    high: 1902.00,
    low: 1862.00,
    prevClose: 1865.20,
    volume: 2100000,
    week52High: 1960.35,
    week52Low: 1111.00,
    marketCapCr: 452000,
    pe: 39.8,
    eps: 47.4,
    divYield: 0.72,
    bookValue: 310,
    roe: 16.5,
    debtToEquity: 0.09,
    volatility: 0.016,
  },
  {
    symbol: 'TITAN',
    name: 'Titan Company Ltd.',
    sector: 'Consumer Durables',
    cmp: 3480.00,
    open: 3460.00,
    high: 3510.00,
    low: 3445.00,
    prevClose: 3455.00,
    volume: 1100000,
    week52High: 3886.95,
    week52Low: 3055.65,
    marketCapCr: 309000,
    pe: 82.5,
    eps: 42.2,
    divYield: 0.32,
    bookValue: 125,
    roe: 31.0,
    debtToEquity: 0.78,
    volatility: 0.019,
  },
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank Ltd.',
    sector: 'Banking & Financial Services',
    cmp: 1175.50,
    open: 1165.00,
    high: 1184.00,
    low: 1158.00,
    prevClose: 1162.00,
    volume: 7400000,
    week52High: 1339.65,
    week52Low: 968.00,
    marketCapCr: 363000,
    pe: 14.1,
    eps: 83.4,
    divYield: 0.09,
    bookValue: 510,
    roe: 18.2,
    debtToEquity: 7.2,
    volatility: 0.018,
  },
  {
    symbol: 'NTPC',
    name: 'NTPC Ltd.',
    sector: 'Power & Energy',
    cmp: 412.50,
    open: 408.00,
    high: 416.80,
    low: 405.00,
    prevClose: 406.40,
    volume: 13500000,
    week52High: 448.30,
    week52Low: 232.00,
    marketCapCr: 400000,
    pe: 18.5,
    eps: 22.3,
    divYield: 1.88,
    bookValue: 195,
    roe: 12.8,
    debtToEquity: 1.45,
    volatility: 0.018,
  },
  {
    symbol: 'ONGC',
    name: 'Oil & Natural Gas Corp Ltd.',
    sector: 'Oil, Gas & Consumable Fuels',
    cmp: 284.10,
    open: 281.00,
    high: 286.50,
    low: 279.50,
    prevClose: 280.20,
    volume: 19200000,
    week52High: 344.75,
    week52Low: 181.00,
    marketCapCr: 357000,
    pe: 7.8,
    eps: 36.4,
    divYield: 4.31,
    bookValue: 270,
    roe: 14.1,
    debtToEquity: 0.38,
    volatility: 0.021,
  },
  {
    symbol: 'POWERGRID',
    name: 'Power Grid Corporation of India',
    sector: 'Power & Energy',
    cmp: 334.80,
    open: 331.00,
    high: 337.50,
    low: 329.00,
    prevClose: 330.15,
    volume: 9400000,
    week52High: 366.25,
    week52Low: 201.00,
    marketCapCr: 311000,
    pe: 19.8,
    eps: 16.9,
    divYield: 3.36,
    bookValue: 98,
    roe: 18.8,
    debtToEquity: 1.5,
    volatility: 0.015,
  },
  {
    symbol: 'M&M',
    name: 'Mahindra & Mahindra Ltd.',
    sector: 'Automobile and Auto Components',
    cmp: 3085.00,
    open: 3040.00,
    high: 3110.00,
    low: 3025.00,
    prevClose: 3030.00,
    volume: 3800000,
    week52High: 3222.00,
    week52Low: 1496.00,
    marketCapCr: 383000,
    pe: 31.4,
    eps: 98.2,
    divYield: 0.68,
    bookValue: 640,
    roe: 19.4,
    debtToEquity: 1.15,
    volatility: 0.022,
  },
  {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Ltd.',
    sector: 'Metals & Mining',
    cmp: 154.20,
    open: 152.50,
    high: 156.00,
    low: 151.80,
    prevClose: 152.10,
    volume: 32500000,
    week52High: 184.60,
    week52Low: 118.00,
    marketCapCr: 192000,
    pe: 25.1,
    eps: 6.1,
    divYield: 2.33,
    bookValue: 74,
    roe: 7.2,
    debtToEquity: 0.88,
    volatility: 0.024,
  },
  {
    symbol: 'ADANIENT',
    name: 'Adani Enterprises Ltd.',
    sector: 'Metals & Mining',
    cmp: 2890.00,
    open: 2840.00,
    high: 2925.00,
    low: 2820.00,
    prevClose: 2835.00,
    volume: 2900000,
    week52High: 3743.00,
    week52Low: 2142.00,
    marketCapCr: 330000,
    pe: 95.2,
    eps: 30.4,
    divYield: 0.04,
    bookValue: 385,
    roe: 9.1,
    debtToEquity: 1.45,
    volatility: 0.032,
  },
  {
    symbol: 'ADANIPORTS',
    name: 'Adani Ports and SEZ Ltd.',
    sector: 'Services & Infrastructure',
    cmp: 1395.00,
    open: 1380.00,
    high: 1412.00,
    low: 1372.00,
    prevClose: 1377.00,
    volume: 4100000,
    week52High: 1621.40,
    week52Low: 772.00,
    marketCapCr: 301000,
    pe: 34.6,
    eps: 40.3,
    divYield: 0.43,
    bookValue: 245,
    roe: 17.8,
    debtToEquity: 1.12,
    volatility: 0.025,
  },
  {
    symbol: 'COALINDIA',
    name: 'Coal India Ltd.',
    sector: 'Metals & Mining',
    cmp: 488.50,
    open: 485.00,
    high: 494.00,
    low: 482.00,
    prevClose: 483.20,
    volume: 8700000,
    week52High: 543.55,
    week52Low: 304.00,
    marketCapCr: 301000,
    pe: 8.1,
    eps: 60.3,
    divYield: 5.22,
    bookValue: 142,
    roe: 48.6,
    debtToEquity: 0.05,
    volatility: 0.019,
  },
  {
    symbol: 'KOTAKBANK',
    name: 'Kotak Mahindra Bank Ltd.',
    sector: 'Banking & Financial Services',
    cmp: 1785.00,
    open: 1770.00,
    high: 1798.00,
    low: 1762.00,
    prevClose: 1768.40,
    volume: 3800000,
    week52High: 1932.00,
    week52Low: 1543.85,
    marketCapCr: 355000,
    pe: 19.8,
    eps: 90.1,
    divYield: 0.11,
    bookValue: 620,
    roe: 14.5,
    debtToEquity: 4.2,
    volatility: 0.016,
  },
  {
    symbol: 'ASIANPAINT',
    name: 'Asian Paints Ltd.',
    sector: 'Consumer Durables',
    cmp: 2680.00,
    open: 2700.00,
    high: 2715.00,
    low: 2665.00,
    prevClose: 2710.00,
    volume: 1350000,
    week52High: 3422.00,
    week52Low: 2560.00,
    marketCapCr: 257000,
    pe: 48.5,
    eps: 55.3,
    divYield: 1.25,
    bookValue: 190,
    roe: 27.5,
    debtToEquity: 0.12,
    volatility: 0.016,
  },
  {
    symbol: 'ULTRACEMCO',
    name: 'UltraTech Cement Ltd.',
    sector: 'Construction Materials',
    cmp: 11150.00,
    open: 11050.00,
    high: 11240.00,
    low: 10980.00,
    prevClose: 11020.00,
    volume: 340000,
    week52High: 12050.00,
    week52Low: 8180.00,
    marketCapCr: 321000,
    pe: 43.2,
    eps: 258.1,
    divYield: 0.63,
    bookValue: 2280,
    roe: 13.5,
    debtToEquity: 0.38,
    volatility: 0.017,
  },
  {
    symbol: 'BAJAJFINSV',
    name: 'Bajaj Finserv Ltd.',
    sector: 'Banking & Financial Services',
    cmp: 1820.00,
    open: 1805.00,
    high: 1835.00,
    low: 1795.00,
    prevClose: 1802.00,
    volume: 2400000,
    week52High: 2029.90,
    week52Low: 1475.00,
    marketCapCr: 290000,
    pe: 35.8,
    eps: 50.8,
    divYield: 0.06,
    bookValue: 395,
    roe: 14.2,
    debtToEquity: 2.9,
    volatility: 0.020,
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Ltd.',
    sector: 'Information Technology',
    cmp: 545.00,
    open: 540.00,
    high: 552.00,
    low: 538.00,
    prevClose: 539.50,
    volume: 7800000,
    week52High: 585.00,
    week52Low: 375.00,
    marketCapCr: 285000,
    pe: 25.4,
    eps: 21.5,
    divYield: 0.18,
    bookValue: 152,
    roe: 14.8,
    debtToEquity: 0.22,
    volatility: 0.019,
  },
  {
    symbol: 'HCLTECH',
    name: 'HCL Technologies Ltd.',
    sector: 'Information Technology',
    cmp: 1855.00,
    open: 1835.00,
    high: 1872.00,
    low: 1828.00,
    prevClose: 1831.00,
    volume: 3200000,
    week52High: 1898.00,
    week52Low: 1215.00,
    marketCapCr: 503000,
    pe: 31.8,
    eps: 58.3,
    divYield: 2.80,
    bookValue: 275,
    roe: 28.5,
    debtToEquity: 0.09,
    volatility: 0.017,
  },
  {
    symbol: 'TECHM',
    name: 'Tech Mahindra Ltd.',
    sector: 'Information Technology',
    cmp: 1680.00,
    open: 1660.00,
    high: 1695.00,
    low: 1650.00,
    prevClose: 1655.00,
    volume: 2100000,
    week52High: 1740.00,
    week52Low: 1085.00,
    marketCapCr: 164000,
    pe: 58.4,
    eps: 28.8,
    divYield: 1.67,
    bookValue: 315,
    roe: 11.2,
    debtToEquity: 0.15,
    volatility: 0.021,
  },
  {
    symbol: 'LTIM',
    name: 'LTIMindtree Ltd.',
    sector: 'Information Technology',
    cmp: 6020.00,
    open: 5950.00,
    high: 6080.00,
    low: 5920.00,
    prevClose: 5940.00,
    volume: 680000,
    week52High: 6575.00,
    week52Low: 4515.00,
    marketCapCr: 178000,
    pe: 38.6,
    eps: 156.0,
    divYield: 1.08,
    bookValue: 690,
    roe: 26.5,
    debtToEquity: 0.05,
    volatility: 0.020,
  },
  {
    symbol: 'CIPLA',
    name: 'Cipla Ltd.',
    sector: 'Healthcare & Pharma',
    cmp: 1565.00,
    open: 1550.00,
    high: 1580.00,
    low: 1542.00,
    prevClose: 1548.00,
    volume: 1850000,
    week52High: 1702.00,
    week52Low: 1130.00,
    marketCapCr: 126000,
    pe: 27.5,
    eps: 56.9,
    divYield: 0.83,
    bookValue: 350,
    roe: 16.8,
    debtToEquity: 0.02,
    volatility: 0.016,
  },
  {
    symbol: 'DRREDDY',
    name: "Dr. Reddy's Laboratories Ltd.",
    sector: 'Healthcare & Pharma',
    cmp: 6680.00,
    open: 6620.00,
    high: 6730.00,
    low: 6590.00,
    prevClose: 6610.00,
    volume: 840000,
    week52High: 7100.00,
    week52Low: 5212.00,
    marketCapCr: 111000,
    pe: 20.2,
    eps: 330.7,
    divYield: 0.60,
    bookValue: 1780,
    roe: 22.4,
    debtToEquity: 0.06,
    volatility: 0.017,
  },
  {
    symbol: 'APOLLOHOSP',
    name: 'Apollo Hospitals Enterprise Ltd.',
    sector: 'Healthcare & Pharma',
    cmp: 7120.00,
    open: 7040.00,
    high: 7180.00,
    low: 7000.00,
    prevClose: 7025.00,
    volume: 620000,
    week52High: 7425.00,
    week52Low: 4720.00,
    marketCapCr: 102000,
    pe: 88.0,
    eps: 80.9,
    divYield: 0.21,
    bookValue: 510,
    roe: 14.8,
    debtToEquity: 0.58,
    volatility: 0.020,
  },
  {
    symbol: 'DIVISLAB',
    name: "Divi's Laboratories Ltd.",
    sector: 'Healthcare & Pharma',
    cmp: 5890.00,
    open: 5820.00,
    high: 5940.00,
    low: 5790.00,
    prevClose: 5805.00,
    volume: 590000,
    week52High: 6200.00,
    week52Low: 3350.00,
    marketCapCr: 156000,
    pe: 92.5,
    eps: 63.7,
    divYield: 0.51,
    bookValue: 530,
    roe: 12.1,
    debtToEquity: 0.01,
    volatility: 0.019,
  },
  {
    symbol: 'NESTLEIND',
    name: 'Nestle India Ltd.',
    sector: 'Fast Moving Consumer Goods',
    cmp: 2360.00,
    open: 2370.00,
    high: 2385.00,
    low: 2345.00,
    prevClose: 2375.00,
    volume: 780000,
    week52High: 2770.00,
    week52Low: 2145.00,
    marketCapCr: 227000,
    pe: 72.8,
    eps: 32.4,
    divYield: 1.40,
    bookValue: 45,
    roe: 98.0,
    debtToEquity: 0.15,
    volatility: 0.013,
  },
  {
    symbol: 'BRITANNIA',
    name: 'Britannia Industries Ltd.',
    sector: 'Fast Moving Consumer Goods',
    cmp: 5840.00,
    open: 5800.00,
    high: 5890.00,
    low: 5760.00,
    prevClose: 5780.00,
    volume: 480000,
    week52High: 6470.00,
    week52Low: 4350.00,
    marketCapCr: 141000,
    pe: 65.4,
    eps: 89.3,
    divYield: 1.25,
    bookValue: 185,
    roe: 55.4,
    debtToEquity: 0.72,
    volatility: 0.015,
  },
  {
    symbol: 'TATACONSUM',
    name: 'Tata Consumer Products Ltd.',
    sector: 'Fast Moving Consumer Goods',
    cmp: 1095.00,
    open: 1085.00,
    high: 1108.00,
    low: 1078.00,
    prevClose: 1082.00,
    volume: 1800000,
    week52High: 1269.00,
    week52Low: 835.00,
    marketCapCr: 108000,
    pe: 84.5,
    eps: 13.0,
    divYield: 0.78,
    bookValue: 195,
    roe: 7.8,
    debtToEquity: 0.18,
    volatility: 0.017,
  },
  {
    symbol: 'JSWSTEEL',
    name: 'JSW Steel Ltd.',
    sector: 'Metals & Mining',
    cmp: 985.00,
    open: 975.00,
    high: 996.00,
    low: 970.00,
    prevClose: 972.00,
    volume: 3800000,
    week52High: 1065.00,
    week52Low: 730.00,
    marketCapCr: 241000,
    pe: 28.5,
    eps: 34.6,
    divYield: 0.74,
    bookValue: 340,
    roe: 13.2,
    debtToEquity: 1.15,
    volatility: 0.021,
  },
  {
    symbol: 'HINDALCO',
    name: 'Hindalco Industries Ltd.',
    sector: 'Metals & Mining',
    cmp: 710.00,
    open: 698.00,
    high: 718.00,
    low: 694.00,
    prevClose: 696.00,
    volume: 6800000,
    week52High: 772.00,
    week52Low: 455.00,
    marketCapCr: 159000,
    pe: 15.8,
    eps: 44.9,
    divYield: 0.49,
    bookValue: 460,
    roe: 11.2,
    debtToEquity: 0.65,
    volatility: 0.023,
  },
  {
    symbol: 'EICHERMOT',
    name: 'Eicher Motors Ltd.',
    sector: 'Automobile and Auto Components',
    cmp: 4890.00,
    open: 4820.00,
    high: 4940.00,
    low: 4790.00,
    prevClose: 4810.00,
    volume: 620000,
    week52High: 5100.00,
    week52Low: 3300.00,
    marketCapCr: 134000,
    pe: 33.5,
    eps: 146.0,
    divYield: 1.04,
    bookValue: 710,
    roe: 23.5,
    debtToEquity: 0.02,
    volatility: 0.018,
  },
  {
    symbol: 'BPCL',
    name: 'Bharat Petroleum Corp Ltd.',
    sector: 'Oil, Gas & Consumable Fuels',
    cmp: 342.00,
    open: 338.00,
    high: 346.00,
    low: 335.00,
    prevClose: 336.50,
    volume: 12500000,
    week52High: 388.00,
    week52Low: 165.00,
    marketCapCr: 148000,
    pe: 5.5,
    eps: 62.2,
    divYield: 6.14,
    bookValue: 175,
    roe: 35.8,
    debtToEquity: 0.58,
    volatility: 0.022,
  },
  {
    symbol: 'HEROMOTOCO',
    name: 'Hero MotoCorp Ltd.',
    sector: 'Automobile and Auto Components',
    cmp: 5210.00,
    open: 5160.00,
    high: 5260.00,
    low: 5120.00,
    prevClose: 5140.00,
    volume: 590000,
    week52High: 6245.00,
    week52Low: 2980.00,
    marketCapCr: 104000,
    pe: 25.8,
    eps: 202.0,
    divYield: 2.69,
    bookValue: 980,
    roe: 22.8,
    debtToEquity: 0.03,
    volatility: 0.019,
  },
  {
    symbol: 'GRASIM',
    name: 'Grasim Industries Ltd.',
    sector: 'Construction Materials',
    cmp: 2680.00,
    open: 2650.00,
    high: 2710.00,
    low: 2635.00,
    prevClose: 2645.00,
    volume: 1100000,
    week52High: 2875.00,
    week52Low: 1860.00,
    marketCapCr: 181000,
    pe: 26.5,
    eps: 101.1,
    divYield: 0.37,
    bookValue: 1350,
    roe: 8.5,
    debtToEquity: 1.1,
    volatility: 0.019,
  },
  {
    symbol: 'INDUSINDBK',
    name: 'IndusInd Bank Ltd.',
    sector: 'Banking & Financial Services',
    cmp: 1280.00,
    open: 1290.00,
    high: 1305.00,
    low: 1265.00,
    prevClose: 1295.00,
    volume: 4500000,
    week52High: 1694.00,
    week52Low: 1240.00,
    marketCapCr: 99800,
    pe: 11.2,
    eps: 114.3,
    divYield: 1.29,
    bookValue: 810,
    roe: 15.2,
    debtToEquity: 5.8,
    volatility: 0.022,
  },
  {
    symbol: 'SHRIRAMFIN',
    name: 'Shriram Finance Ltd.',
    sector: 'Banking & Financial Services',
    cmp: 3380.00,
    open: 3340.00,
    high: 3420.00,
    low: 3310.00,
    prevClose: 3325.00,
    volume: 1850000,
    week52High: 3650.00,
    week52Low: 1810.00,
    marketCapCr: 127000,
    pe: 16.8,
    eps: 201.2,
    divYield: 1.33,
    bookValue: 1280,
    roe: 17.5,
    debtToEquity: 4.1,
    volatility: 0.021,
  },
  {
    symbol: 'TRENT',
    name: 'Trent Ltd.',
    sector: 'Consumer Services & Retail',
    cmp: 7420.00,
    open: 7300.00,
    high: 7550.00,
    low: 7260.00,
    prevClose: 7280.00,
    volume: 2400000,
    week52High: 8345.00,
    week52Low: 1980.00,
    marketCapCr: 263000,
    pe: 175.0,
    eps: 42.4,
    divYield: 0.04,
    bookValue: 165,
    roe: 28.5,
    debtToEquity: 0.85,
    volatility: 0.028,
  },
  {
    symbol: 'BEL',
    name: 'Bharat Electronics Ltd.',
    sector: 'Capital Goods & Defence',
    cmp: 295.40,
    open: 290.00,
    high: 298.50,
    low: 288.20,
    prevClose: 289.80,
    volume: 16800000,
    week52High: 340.50,
    week52Low: 127.00,
    marketCapCr: 216000,
    pe: 49.5,
    eps: 5.97,
    divYield: 0.74,
    bookValue: 24.5,
    roe: 26.2,
    debtToEquity: 0.0,
    volatility: 0.024,
  },
];

// Major Indian Sector Definitions
export const SECTOR_DEFINITIONS = [
  { id: 'it', name: 'NIFTY IT', symbol: '^CNXIT', baseCmp: 42850.00, stocks: ['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'TECHM', 'LTIM'] },
  { id: 'bank', name: 'NIFTY BANK', symbol: '^NSEBANK', baseCmp: 51980.50, stocks: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'AXISBANK', 'KOTAKBANK', 'INDUSINDBK'] },
  { id: 'auto', name: 'NIFTY AUTO', symbol: '^CNXAUTO', baseCmp: 25680.00, stocks: ['MARUTI', 'TATAMOTORS', 'M&M', 'EICHERMOT', 'HEROMOTOCO'] },
  { id: 'pharma', name: 'NIFTY PHARMA', symbol: '^CNXPHARMA', baseCmp: 22420.00, stocks: ['SUNPHARMA', 'CIPLA', 'DRREDDY', 'APOLLOHOSP', 'DIVISLAB'] },
  { id: 'fmcg', name: 'NIFTY FMCG', symbol: '^CNXFMCG', baseCmp: 61850.00, stocks: ['ITC', 'HINDUNILVR', 'NESTLEIND', 'BRITANNIA', 'TATACONSUM'] },
  { id: 'metal', name: 'NIFTY METAL', symbol: '^CNXMETAL', baseCmp: 9820.00, stocks: ['TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'COALINDIA', 'ADANIENT'] },
  { id: 'realty', name: 'NIFTY REALTY', symbol: '^CNXREALTY', baseCmp: 1045.00, stocks: ['DLF', 'GODREJPROP', 'OBEROIRLTY', 'LODHA'] },
  { id: 'energy', name: 'NIFTY ENERGY', symbol: '^CNXENERGY', baseCmp: 39450.00, stocks: ['RELIANCE', 'NTPC', 'ONGC', 'POWERGRID', 'BPCL'] },
  { id: 'psubank', name: 'NIFTY PSU BANK', symbol: '^CNXPSUBANK', baseCmp: 6840.00, stocks: ['SBIN', 'PNB', 'BANKBARODA', 'CANBK'] },
  { id: 'pvtbank', name: 'NIFTY PRIVATE BANK', symbol: 'NIFTY_PVT_BANK', baseCmp: 26150.00, stocks: ['HDFCBANK', 'ICICIBANK', 'AXISBANK', 'KOTAKBANK'] },
  { id: 'fin', name: 'NIFTY FINANCIAL SERVICES', symbol: 'NIFTY_FIN_SERVICE.NS', baseCmp: 24120.00, stocks: ['HDFCBANK', 'ICICIBANK', 'BAJFINANCE', 'BAJAJFINSV', 'SHRIRAMFIN'] },
  { id: 'healthcare', name: 'NIFTY HEALTHCARE', symbol: '^CNXHEALTH', baseCmp: 14250.00, stocks: ['SUNPHARMA', 'APOLLOHOSP', 'DRREDDY', 'CIPLA'] },
  { id: 'media', name: 'NIFTY MEDIA', symbol: '^CNXMEDIA', baseCmp: 2150.00, stocks: ['ZEEL', 'SUNTV', 'PVRINOX'] },
  { id: 'durables', name: 'NIFTY CONSUMER DURABLES', symbol: '^CNXCONSUM', baseCmp: 38920.00, stocks: ['TITAN', 'HAVEELLS', 'DIXON', 'VOLTAS'] },
  { id: 'oilgas', name: 'NIFTY OIL & GAS', symbol: '^CNXOILGAS', baseCmp: 11840.00, stocks: ['RELIANCE', 'ONGC', 'BPCL', 'IOC', 'GAIL'] },
  { id: 'midcap', name: 'NIFTY MIDCAP 100', symbol: '^CRSMID', baseCmp: 58940.00, stocks: ['TRENT', 'BEL', 'POLYCAB', 'SUZLON'] },
  { id: 'smallcap', name: 'NIFTY SMALLCAP 100', symbol: '^CNXSC', baseCmp: 18920.00, stocks: ['ANGELONE', 'BSE', 'CDSL', 'KALYANKJIL'] },
];

// Major Indian Market Indices
export const MAJOR_INDICES_DEFINITIONS = [
  { symbol: '^NSEI', name: 'NIFTY 50', baseCmp: 25127.95, prevClose: 24964.25, high: 25210.40, low: 24940.10, week52High: 26277.35, week52Low: 18837.85 },
  { symbol: '^NSEBANK', name: 'BANK NIFTY', baseCmp: 51980.50, prevClose: 51532.10, high: 52140.00, low: 51420.30, week52High: 54467.35, week52Low: 42105.40 },
  { symbol: 'NIFTY_FIN_SERVICE.NS', name: 'FINNIFTY', baseCmp: 24120.00, prevClose: 23940.00, high: 24195.00, low: 23880.00, week52High: 24890.00, week52Low: 19120.00 },
  { symbol: '^NSENEXT50', name: 'NIFTY NEXT 50', baseCmp: 72150.00, prevClose: 71620.00, high: 72400.00, low: 71450.00, week52High: 77800.00, week52Low: 43200.00 },
  { symbol: '^BSESN', name: 'SENSEX', baseCmp: 81785.50, prevClose: 81224.75, high: 82040.00, low: 81150.00, week52High: 85978.25, week52Low: 63140.50 },
  { symbol: '^INDIAVIX', name: 'INDIA VIX', baseCmp: 13.85, prevClose: 14.20, high: 14.55, low: 13.40, week52High: 24.50, week52Low: 9.85 },
];

/**
 * Singleton In-Memory Stock & Market Cache with Live Calculation
 */
class MarketDataService {
  private stocks: Map<string, StockQuote> = new Map();
  private indices: Map<string, MarketIndexData> = new Map();
  private sectors: SectorData[] = [];
  private lastUpdated: string = '';
  private adminSettings: AdminSettings = {
    rsiOversold: 30,
    rsiOverbought: 70,
    bullishThreshold: 6,
    neutralThreshold: 3,
    weights: {
      priceAboveEma20: 1,
      priceAboveEma50: 1,
      priceAboveEma200: 1,
      ema20Above50: 1,
      ema50Above200: 1,
      rsiBullish: 1,
      macdBullish: 1,
      volumeSurge: 1,
    },
    cronJobs: {
      marketHoursSyncIntervalMinutes: 5,
      eodSyncTime: '16:00 IST',
      status: 'ACTIVE',
      lastRunAt: new Date().toISOString(),
    },
    mockMode: false,
    marketDataStatus: 'HEALTHY',
  };

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    const timestamp = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
    this.lastUpdated = timestamp;

    // 1. Initialize Stocks
    for (const def of STOCK_DEFINITIONS) {
      const history = generateRealisticHistory(def.cmp, 260, def.volatility);
      const indicators = computeTechnicalIndicators(history, def.cmp, this.adminSettings);
      const change = Number((def.cmp - def.prevClose).toFixed(2));
      const changePercent = Number(((change / def.prevClose) * 100).toFixed(2));

      const quote: StockQuote = {
        symbol: def.symbol,
        name: def.name,
        exchange: 'NSE',
        sector: def.sector,
        cmp: def.cmp,
        change,
        changePercent,
        open: def.open,
        high: def.high,
        low: def.low,
        prevClose: def.prevClose,
        volume: def.volume,
        week52High: def.week52High,
        week52Low: def.week52Low,
        marketCapCr: def.marketCapCr,
        pe: def.pe,
        eps: def.eps,
        divYield: def.divYield,
        bookValue: def.bookValue,
        roe: def.roe,
        debtToEquity: def.debtToEquity,
        history,
        indicators,
        lastUpdated: timestamp,
      };

      this.stocks.set(def.symbol, quote);
    }

    // 2. Initialize Major Indices
    for (const def of MAJOR_INDICES_DEFINITIONS) {
      const history = generateRealisticHistory(def.baseCmp, 260, 0.01);
      const indicators = computeTechnicalIndicators(history, def.baseCmp, this.adminSettings);
      const change = Number((def.baseCmp - def.prevClose).toFixed(2));
      const changePercent = Number(((change / def.prevClose) * 100).toFixed(2));

      const indexData: MarketIndexData = {
        symbol: def.symbol,
        name: def.name,
        cmp: def.baseCmp,
        change,
        changePercent,
        open: def.high - (def.high - def.low) * 0.4,
        high: def.high,
        low: def.low,
        prevClose: def.prevClose,
        week52High: def.week52High,
        week52Low: def.week52Low,
        ema20: indicators.ema20,
        ema50: indicators.ema50,
        ema200: indicators.ema200,
        trend: indicators.trend,
        history,
        lastUpdated: timestamp,
      };

      this.indices.set(def.symbol, indexData);
    }

    // 3. Initialize Sectors
    this.refreshSectors();
  }

  private refreshSectors() {
    const list: SectorData[] = [];
    for (const s of SECTOR_DEFINITIONS) {
      // Find sector constituent stocks in memory
      const matchedQuotes = s.stocks
        .map((sym) => this.stocks.get(sym))
        .filter((q): q is StockQuote => !!q);

      let avgChangePercent = 0.45;
      let totalVol = 5000000;
      if (matchedQuotes.length > 0) {
        avgChangePercent = Number(
          (
            matchedQuotes.reduce((acc, q) => acc + q.changePercent, 0) /
            matchedQuotes.length
          ).toFixed(2)
        );
        totalVol = matchedQuotes.reduce((acc, q) => acc + q.volume, 0);
      }

      const cmp = Number((s.baseCmp * (1 + avgChangePercent / 100)).toFixed(2));
      const change = Number((cmp - s.baseCmp).toFixed(2));

      // Calculate indicators based on simulated index history
      const history = generateRealisticHistory(cmp, 260, 0.012);
      const ind = computeTechnicalIndicators(history, cmp, this.adminSettings);

      list.push({
        id: s.id,
        name: s.name,
        symbol: s.symbol,
        cmp,
        change,
        changePercent: avgChangePercent,
        ema20: ind.ema20,
        ema50: ind.ema50,
        ema200: ind.ema200,
        rsi: ind.rsi,
        trend: ind.trend,
        signal: ind.signal,
        volume: totalVol,
        stocks: s.stocks,
      });
    }

    this.sectors = list;
  }

  public getAdminSettings(): AdminSettings {
    return { ...this.adminSettings };
  }

  public updateAdminSettings(settings: Partial<AdminSettings>): AdminSettings {
    this.adminSettings = {
      ...this.adminSettings,
      ...settings,
      weights: {
        ...this.adminSettings.weights,
        ...(settings.weights || {}),
      },
      cronJobs: {
        ...this.adminSettings.cronJobs,
        ...(settings.cronJobs || {}),
      },
    };

    // Recompute indicators for all stocks and indices with new weights
    for (const [sym, quote] of this.stocks.entries()) {
      quote.indicators = computeTechnicalIndicators(
        quote.history,
        quote.cmp,
        this.adminSettings
      );
    }
    this.refreshSectors();

    return this.adminSettings;
  }

  public getAllStocks(): StockQuote[] {
    return Array.from(this.stocks.values());
  }

  public getStock(symbol: string): StockQuote | undefined {
    return this.stocks.get(symbol.toUpperCase());
  }

  public getAllIndices(): MarketIndexData[] {
    return Array.from(this.indices.values());
  }

  public getNifty50(): MarketIndexData {
    return this.indices.get('^NSEI') || Array.from(this.indices.values())[0];
  }

  public getBankNifty(): MarketIndexData {
    return this.indices.get('^NSEBANK') || Array.from(this.indices.values())[1];
  }

  public getAllSectors(): SectorData[] {
    return this.sectors;
  }

  public getSector(idOrName: string): SectorData | undefined {
    return this.sectors.find(
      (s) =>
        s.id.toLowerCase() === idOrName.toLowerCase() ||
        s.name.toLowerCase() === idOrName.toLowerCase()
    );
  }

  public getLastUpdated(): string {
    return this.lastUpdated;
  }

  public getMarketBreadth(): MarketBreadth {
    const all = Array.from(this.stocks.values());
    let advances = 0;
    let declines = 0;
    let unchanged = 0;
    let totalVolume = 0;

    for (const s of all) {
      totalVolume += s.volume;
      if (s.changePercent > 0.05) advances++;
      else if (s.changePercent < -0.05) declines++;
      else unchanged++;
    }

    const adRatio = declines > 0 ? Number((advances / declines).toFixed(2)) : advances;
    return {
      advances,
      declines,
      unchanged,
      adRatio,
      totalVolume,
    };
  }

  /**
   * Intraday / Simulation Tick: Slightly moves quotes to mimic active market fluctuations
   */
  public simulateMarketTick() {
    const timestamp = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
    this.lastUpdated = timestamp;

    for (const [sym, quote] of this.stocks.entries()) {
      // Small tick between -0.3% and +0.3%
      const tick = (Math.random() - 0.49) * 0.004;
      const newCmp = Number((quote.cmp * (1 + tick)).toFixed(2));
      const change = Number((newCmp - quote.prevClose).toFixed(2));
      const changePercent = Number(((change / quote.prevClose) * 100).toFixed(2));
      quote.cmp = newCmp;
      quote.change = change;
      quote.changePercent = changePercent;
      quote.high = Math.max(quote.high, newCmp);
      quote.low = Math.min(quote.low, newCmp);
      quote.volume += Math.floor(Math.random() * 2500);

      // Recompute indicators with new CMP
      quote.indicators = computeTechnicalIndicators(
        quote.history,
        quote.cmp,
        this.adminSettings
      );
      quote.lastUpdated = timestamp;
    }

    // Update Indices
    for (const [sym, idx] of this.indices.entries()) {
      const tick = (Math.random() - 0.49) * 0.0025;
      const newCmp = Number((idx.cmp * (1 + tick)).toFixed(2));
      idx.cmp = newCmp;
      idx.change = Number((newCmp - idx.prevClose).toFixed(2));
      idx.changePercent = Number(((idx.change / idx.prevClose) * 100).toFixed(2));
      idx.high = Math.max(idx.high, newCmp);
      idx.low = Math.min(idx.low, newCmp);
      idx.lastUpdated = timestamp;
    }

    this.refreshSectors();
  }

  /**
   * Generates End of Day Market Snapshot Report
   */
  public generateDailySnapshot(): DailyMarketSnapshot {
    const nifty = this.getNifty50();
    const bankNifty = this.getBankNifty();
    const breadth = this.getMarketBreadth();
    const allStocks = Array.from(this.stocks.values());

    const sortedByGain = [...allStocks].sort(
      (a, b) => b.changePercent - a.changePercent
    );
    const topGainers = sortedByGain.slice(0, 5).map((s) => ({
      symbol: s.symbol,
      name: s.name,
      cmp: s.cmp,
      changePercent: s.changePercent,
    }));
    const topLosers = sortedByGain.slice(-5).reverse().map((s) => ({
      symbol: s.symbol,
      name: s.name,
      cmp: s.cmp,
      changePercent: s.changePercent,
    }));

    const sortedSectors = [...this.sectors].sort(
      (a, b) => b.changePercent - a.changePercent
    );
    const leadingSectors = sortedSectors.slice(0, 3).map((s) => ({
      name: s.name,
      changePercent: s.changePercent,
    }));
    const laggingSectors = sortedSectors.slice(-3).reverse().map((s) => ({
      name: s.name,
      changePercent: s.changePercent,
    }));

    const dateStr = new Date().toISOString().split('T')[0];
    const isBull = nifty.changePercent >= 0;

    const executiveSummary = `Indian benchmark NIFTY 50 ${
      isBull ? 'advanced' : 'closed lower'
    } by ${Math.abs(nifty.change)} pts (${nifty.changePercent > 0 ? '+' : ''}${
      nifty.changePercent
    }%) to end at ${nifty.cmp.toLocaleString('en-IN')}. Market breadth favored ${
      breadth.advances > breadth.declines ? 'advances' : 'declines'
    } with an A/D ratio of ${breadth.adRatio}. ${
      leadingSectors[0]?.name || 'Sector'
    } led the sectoral gains while ${
      laggingSectors[0]?.name || 'Sector'
    } witnessed relative weakness. Trend remains ${nifty.trend}.`;

    return {
      date: dateStr,
      niftyClose: nifty.cmp,
      niftyChange: nifty.change,
      niftyChangePercent: nifty.changePercent,
      bankNiftyClose: bankNifty.cmp,
      bankNiftyChangePercent: bankNifty.changePercent,
      marketBreadth: breadth,
      topGainers,
      topLosers,
      leadingSectors,
      laggingSectors,
      niftyEmaStatus: `EMA20: ${nifty.ema20.toLocaleString('en-IN')} | EMA50: ${nifty.ema50.toLocaleString('en-IN')} | EMA200: ${nifty.ema200.toLocaleString('en-IN')}`,
      niftyRsi: 54.2,
      marketTrend: nifty.trend,
      executiveSummary,
    };
  }
}

// Global Singleton Instance
export const marketDataService = new MarketDataService();
