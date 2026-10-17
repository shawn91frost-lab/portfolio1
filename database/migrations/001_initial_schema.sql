-- ====================================================================
-- NiftyPulse: Multi-User Indian Stock Portfolio & Market Terminal
-- Supabase PostgreSQL Initial Schema & Row-Level-Security (RLS) Migration
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE risk_profile AS ENUM ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE');
CREATE TYPE transaction_type AS ENUM ('BUY', 'SELL', 'DIVIDEND', 'BONUS', 'SPLIT');
CREATE TYPE alert_condition AS ENUM (
  'PRICE_ABOVE',
  'PRICE_BELOW',
  'CROSS_EMA200',
  'CROSS_EMA50',
  'CROSS_EMA20',
  'RSI_BELOW_30',
  'RSI_ABOVE_70',
  'SIGNAL_BEARISH_TO_BULLISH',
  'SIGNAL_BULLISH_TO_BEARISH'
);
CREATE TYPE alert_status AS ENUM ('ACTIVE', 'TRIGGERED', 'DISABLED');
CREATE TYPE holding_tag AS ENUM (
  'Long term',
  'Swing',
  'Investment',
  'Trading',
  'High conviction',
  'Watch'
);

-- 3. PROFILES (Linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  phone TEXT,
  bio TEXT,
  risk_profile risk_profile DEFAULT 'MODERATE',
  is_verified BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"emailAlerts": true, "dailyMarketReport": true, "stopLossAlerts": true, "targetAlerts": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. PORTFOLIOS
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Primary Portfolio',
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. PORTFOLIO HOLDINGS
CREATE TABLE portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  quantity NUMERIC(14, 4) NOT NULL CHECK (quantity > 0),
  buy_price NUMERIC(14, 2) NOT NULL CHECK (buy_price > 0),
  purchase_date DATE NOT NULL,
  brokerage NUMERIC(10, 2) DEFAULT 0,
  stop_loss NUMERIC(14, 2),
  target_1 NUMERIC(14, 2),
  target_2 NUMERIC(14, 2),
  target_3 NUMERIC(14, 2),
  notes TEXT,
  tag holding_tag DEFAULT 'Investment',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_holdings_user ON portfolio_holdings(user_id);
CREATE INDEX idx_holdings_symbol ON portfolio_holdings(symbol);

-- 6. TRANSACTIONS LEDGER
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  type transaction_type NOT NULL,
  date DATE NOT NULL,
  quantity NUMERIC(14, 4) NOT NULL CHECK (quantity > 0),
  price NUMERIC(14, 2) NOT NULL CHECK (price >= 0),
  charges NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tx_user ON transactions(user_id);
CREATE INDEX idx_tx_symbol ON transactions(symbol);
CREATE INDEX idx_tx_date ON transactions(date DESC);

-- 7. WATCHLISTS & WATCHLIST ITEMS
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(watchlist_id, symbol)
);

CREATE INDEX idx_wl_items_watchlist ON watchlist_items(watchlist_id);

-- 8. PRICE & TECHNICAL ALERTS
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  stock_name TEXT NOT NULL,
  condition alert_condition NOT NULL,
  target_value NUMERIC(14, 2),
  status alert_status DEFAULT 'ACTIVE' NOT NULL,
  email_notification BOOLEAN DEFAULT TRUE,
  triggered_at TIMESTAMPTZ,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_alerts_user_status ON alerts(user_id, status);

-- 9. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifs_user ON notifications(user_id, read);

-- 10. PUBLIC SHARED MARKET DATA (Read-only for all authenticated users)
CREATE TABLE stocks (
  symbol TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  exchange TEXT DEFAULT 'NSE' NOT NULL,
  sector TEXT NOT NULL,
  market_cap_cr NUMERIC(16, 2),
  pe NUMERIC(8, 2),
  eps NUMERIC(8, 2),
  div_yield NUMERIC(6, 2),
  book_value NUMERIC(10, 2),
  roe NUMERIC(6, 2),
  debt_to_equity NUMERIC(6, 2),
  last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE daily_market_snapshots (
  date DATE PRIMARY KEY,
  nifty_close NUMERIC(12, 2) NOT NULL,
  nifty_change NUMERIC(10, 2) NOT NULL,
  nifty_change_percent NUMERIC(6, 2) NOT NULL,
  bank_nifty_close NUMERIC(12, 2) NOT NULL,
  bank_nifty_change_percent NUMERIC(6, 2) NOT NULL,
  advances INT NOT NULL,
  declines INT NOT NULL,
  unchanged INT NOT NULL,
  ad_ratio NUMERIC(6, 2) NOT NULL,
  executive_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_market_snapshots ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile; Admins can view all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Portfolios: Strictly isolated to owner
CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Holdings: User A can NEVER view or mutate User B's holdings
CREATE POLICY "Users can view own holdings"
  ON portfolio_holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings"
  ON portfolio_holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings"
  ON portfolio_holdings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings"
  ON portfolio_holdings FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions: Strictly isolated to owner
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Watchlists & Items: Strictly isolated to owner
CREATE POLICY "Users can view own watchlists"
  ON watchlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlists"
  ON watchlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists"
  ON watchlists FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own watchlist items"
  ON watchlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist items"
  ON watchlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist items"
  ON watchlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- Alerts & Notifications: Strictly isolated to owner
CREATE POLICY "Users can manage own alerts"
  ON alerts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id);

-- Market wide data: Publicly readable by all authenticated users
CREATE POLICY "Public stocks catalog is readable"
  ON stocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Daily snapshots are readable"
  ON daily_market_snapshots FOR SELECT
  TO authenticated
  USING (true);
