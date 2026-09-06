// In-Memory / SQL Database Interface with mock seed data for rapid startup
export interface User {
  id: string;
  mobile: string;
  name: string;
  email: string;
  wallet_balance: number;
  bonus_balance: number;
  referral_code: string;
  vip_level: number;
  is_banned: boolean;
  created_at: string;
}

export interface GameSetting {
  game_key: string;
  game_name: string;
  is_enabled: boolean;
  maintenance_mode: boolean;
  rtp_percentage: number;
  house_edge_percentage: number;
  min_bet: number;
  max_bet: number;
  max_win_multiplier: number;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  user_name: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  upi_id?: string;
  utr_number?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  review_note?: string;
}

export interface GameBet {
  id: string;
  user_id: string;
  user_name: string;
  game_type: string;
  round_id: string;
  bet_amount: number;
  multiplier: number;
  payout: number;
  profit: number;
  status: 'won' | 'lost' | 'running';
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  created_at: string;
}

class InMemoryDB {
  users: Map<string, User> = new Map();
  gameSettings: Map<string, GameSetting> = new Map();
  payments: Map<string, PaymentRequest> = new Map();
  bets: GameBet[] = [];
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // Seed Sample Users
    const initialUsers: User[] = [
      { id: 'usr_101', mobile: '+91 9876543210', name: 'Vikram Sharma', email: 'vikram@apex.in', wallet_balance: 45200.50, bonus_balance: 500, referral_code: 'APEXVIKRAM', vip_level: 5, is_banned: false, created_at: new Date(Date.now() - 86400000 * 12).toISOString() },
      { id: 'usr_102', mobile: '+91 9822334455', name: 'Rohit Verma', email: 'rohit@casino.in', wallet_balance: 1240.00, bonus_balance: 100, referral_code: 'ROHIT99', vip_level: 2, is_banned: false, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'usr_103', mobile: '+91 9711223344', name: 'Priya Patel', email: 'priya@gmail.com', wallet_balance: 89000.00, bonus_balance: 2000, referral_code: 'PRIYA88', vip_level: 7, is_banned: false, created_at: new Date(Date.now() - 86400000 * 20).toISOString() },
      { id: 'usr_104', mobile: '+91 9988776655', name: 'Arjun Das', email: 'arjun@outlook.com', wallet_balance: 310.00, bonus_balance: 50, referral_code: 'ARJUNDAS', vip_level: 1, is_banned: false, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'usr_105', mobile: '+91 9123456780', name: 'Sameer Khan', email: 'sam@yahoo.com', wallet_balance: 0.00, bonus_balance: 0, referral_code: 'SAMKHAN', vip_level: 1, is_banned: true, created_at: new Date(Date.now() - 86400000 * 40).toISOString() },
    ];
    for (const u of initialUsers) this.users.set(u.id, u);

    // Seed Game Settings
    const defaultGames: GameSetting[] = [
      { game_key: 'plinko', game_name: 'Plinko Extreme & Neo', is_enabled: true, maintenance_mode: false, rtp_percentage: 98.0, house_edge_percentage: 2.0, min_bet: 10, max_bet: 50000, max_win_multiplier: 1000 },
      { game_key: 'crash', game_name: 'Supersonic Crash', is_enabled: true, maintenance_mode: false, rtp_percentage: 97.0, house_edge_percentage: 3.0, min_bet: 20, max_bet: 100000, max_win_multiplier: 500 },
      { game_key: 'mines', game_name: 'Mines 3D APEX', is_enabled: true, maintenance_mode: false, rtp_percentage: 99.0, house_edge_percentage: 1.0, min_bet: 10, max_bet: 25000, max_win_multiplier: 2400 },
      { game_key: 'luckyball', game_name: 'Lucky Ball 0-9', is_enabled: true, maintenance_mode: false, rtp_percentage: 96.0, house_edge_percentage: 4.0, min_bet: 50, max_bet: 20000, max_win_multiplier: 9 },
      { game_key: 'roulette', game_name: 'European Roulette', is_enabled: true, maintenance_mode: false, rtp_percentage: 97.3, house_edge_percentage: 2.7, min_bet: 10, max_bet: 50000, max_win_multiplier: 36 },
      { game_key: 'slots', game_name: 'Classic Neon Slots', is_enabled: true, maintenance_mode: false, rtp_percentage: 95.5, house_edge_percentage: 4.5, min_bet: 10, max_bet: 10000, max_win_multiplier: 50 },
      { game_key: 'coinflip', game_name: 'Coin Flip 3D', is_enabled: true, maintenance_mode: false, rtp_percentage: 98.0, house_edge_percentage: 2.0, min_bet: 10, max_bet: 20000, max_win_multiplier: 1.98 },
      { game_key: 'dice', game_name: 'Dice Roll Over/Under', is_enabled: true, maintenance_mode: false, rtp_percentage: 99.0, house_edge_percentage: 1.0, min_bet: 10, max_bet: 50000, max_win_multiplier: 98 },
      { game_key: 'dragontower', game_name: 'Dragon Tower', is_enabled: true, maintenance_mode: false, rtp_percentage: 96.5, house_edge_percentage: 3.5, min_bet: 20, max_bet: 15000, max_win_multiplier: 7.2 },
      { game_key: 'penalty', game_name: 'Penalty Shootout', is_enabled: true, maintenance_mode: false, rtp_percentage: 96.0, house_edge_percentage: 4.0, min_bet: 20, max_bet: 20000, max_win_multiplier: 30 },
    ];
    for (const g of defaultGames) this.gameSettings.set(g.game_key, g);

    // Seed Pending Payments
    const initialPayments: PaymentRequest[] = [
      { id: 'pay_dep_01', user_id: 'usr_101', user_name: 'Vikram Sharma', type: 'deposit', amount: 5000, upi_id: 'vikram@oksbi', utr_number: '428819203912', status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: 'pay_dep_02', user_id: 'usr_102', user_name: 'Rohit Verma', type: 'deposit', amount: 1500, upi_id: 'rohit@paytm', utr_number: '428819445129', status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: 'pay_wdr_01', user_id: 'usr_103', user_name: 'Priya Patel', type: 'withdraw', amount: 15000, upi_id: 'priya@icici', status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
      { id: 'pay_wdr_02', user_id: 'usr_104', user_name: 'Arjun Das', type: 'withdraw', amount: 2000, upi_id: 'arjun@ybl', status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 80).toISOString() },
    ];
    for (const p of initialPayments) this.payments.set(p.id, p);

    // Seed Live Bets
    const sampleGames = ['plinko', 'crash', 'mines', 'luckyball'];
    for (let i = 0; i < 25; i++) {
      const g = sampleGames[i % sampleGames.length];
      const betAmt = [50, 100, 250, 500, 1000, 2500][Math.floor(Math.random() * 6)];
      const won = Math.random() > 0.45;
      const mult = won ? +(1.2 + Math.random() * 4).toFixed(2) : 0;
      const payout = won ? +(betAmt * mult).toFixed(2) : 0;
      this.bets.unshift({
        id: `bet_${Date.now() - i * 15000}`,
        user_id: `usr_10${(i % 4) + 1}`,
        user_name: ['Vikram S.', 'Rohit V.', 'Priya P.', 'Arjun D.'][i % 4],
        game_type: g,
        round_id: `rnd_${1000 + i}`,
        bet_amount: betAmt,
        multiplier: mult,
        payout: payout,
        profit: payout - betAmt,
        status: won ? 'won' : 'lost',
        created_at: new Date(Date.now() - i * 35000).toISOString(),
      });
    }

    // Seed Audit Logs
    this.auditLogs.push(
      { id: 'log_01', admin_id: 'super_admin', action: 'RTP_UPDATED', target_type: 'game', target_id: 'crash', details: { old_rtp: 96, new_rtp: 97 }, created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
      { id: 'log_02', admin_id: 'super_admin', action: 'USER_BALANCE_CREDIT', target_type: 'user', target_id: 'usr_101', details: { amount: 5000, reason: 'UPI Manual Bonus' }, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 'log_03', admin_id: 'staff_ops', action: 'GAME_MAINTENANCE_TOGGLE', target_type: 'game', target_id: 'dragontower', details: { state: false }, created_at: new Date(Date.now() - 3600000 * 1).toISOString() }
    );
  }
}

export const db = new InMemoryDB();
