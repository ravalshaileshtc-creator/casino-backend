-- GameHub Super Admin & Multi-Game Database Schema
-- Compatible with PostgreSQL, CockroachDB, and Supabase

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    mobile VARCHAR(20) UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120),
    wallet_balance NUMERIC(12, 2) DEFAULT 1000.00,
    bonus_balance NUMERIC(12, 2) DEFAULT 0.00,
    referral_code VARCHAR(30) UNIQUE,
    referred_by VARCHAR(64),
    vip_level INT DEFAULT 1,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Wallet Transactions (Ledger)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- deposit, withdraw, bet, win, bonus, admin_adjustment
    amount NUMERIC(12, 2) NOT NULL,
    balance_before NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    reference_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, rejected
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Game Rounds Table
CREATE TABLE IF NOT EXISTS game_rounds (
    id VARCHAR(64) PRIMARY KEY,
    game_type VARCHAR(40) NOT NULL, -- plinko, crash, mines, luckyball, etc.
    server_seed VARCHAR(128) NOT NULL,
    client_seed VARCHAR(128) NOT NULL,
    nonce INT DEFAULT 0,
    result_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'finished', -- active, finished, cancelled
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 4. Game Bets Table
CREATE TABLE IF NOT EXISTS game_bets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    game_type VARCHAR(40) NOT NULL,
    round_id VARCHAR(64),
    bet_amount NUMERIC(12, 2) NOT NULL,
    multiplier NUMERIC(8, 2) DEFAULT 0.00,
    payout NUMERIC(12, 2) DEFAULT 0.00,
    profit NUMERIC(12, 2) DEFAULT 0.00,
    bet_details JSONB,
    status VARCHAR(20) DEFAULT 'won', -- won, lost, cashed_out, running
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Admin Game Settings (Dynamic Control & RTP)
CREATE TABLE IF NOT EXISTS admin_game_settings (
    game_key VARCHAR(40) PRIMARY KEY,
    game_name VARCHAR(60) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    rtp_percentage NUMERIC(5, 2) DEFAULT 97.00,
    house_edge_percentage NUMERIC(5, 2) DEFAULT 3.00,
    min_bet NUMERIC(12, 2) DEFAULT 10.00,
    max_bet NUMERIC(12, 2) DEFAULT 100000.00,
    max_win_multiplier NUMERIC(10, 2) DEFAULT 1000.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Payment Requests (UPI Deposit & Withdraw Approvals)
CREATE TABLE IF NOT EXISTS payment_requests (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- deposit, withdraw
    amount NUMERIC(12, 2) NOT NULL,
    upi_id VARCHAR(100),
    utr_number VARCHAR(100),
    bank_account_info JSONB,
    screenshot_url TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by VARCHAR(64),
    review_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 7. Admin Audit & Activity Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    admin_id VARCHAR(64) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50), -- user, game, payment, system
    target_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
