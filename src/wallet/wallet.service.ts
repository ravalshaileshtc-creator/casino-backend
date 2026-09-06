import { db, User } from '../database/db';

export class WalletService {
  static getBalance(userId: string): number {
    const user = db.users.get(userId);
    if (!user) throw new Error('User not found');
    return user.wallet_balance;
  }

  static debit(userId: string, amount: number, remark: string = 'Game Bet'): { success: boolean; newBalance: number } {
    const user = db.users.get(userId);
    if (!user) throw new Error('User not found');
    if (user.is_banned) throw new Error('Account is suspended');
    if (user.wallet_balance < amount) throw new Error('Insufficient wallet balance');

    const before = user.wallet_balance;
    user.wallet_balance = +(user.wallet_balance - amount).toFixed(2);
    const after = user.wallet_balance;

    db.users.set(userId, user);
    db.saveUserToSupabase(user);

    // Save transaction to Supabase
    db.savePaymentToSupabase({
      id: `tx_${Date.now()}`,
      user_id: userId,
      user_name: user.name,
      type: 'withdraw',
      amount,
      upi_id: 'Wallet Debit',
      status: 'approved',
      created_at: new Date().toISOString()
    });

    return { success: true, newBalance: after };
  }

  static credit(userId: string, amount: number, remark: string = 'Game Win / Deposit'): { success: boolean; newBalance: number } {
    const user = db.users.get(userId);
    if (!user) throw new Error('User not found');

    const before = user.wallet_balance;
    user.wallet_balance = +(user.wallet_balance + amount).toFixed(2);
    const after = user.wallet_balance;

    db.users.set(userId, user);
    db.saveUserToSupabase(user);

    // Save transaction to Supabase
    db.savePaymentToSupabase({
      id: `tx_${Date.now()}`,
      user_id: userId,
      user_name: user.name,
      type: 'deposit',
      amount,
      upi_id: 'Wallet Credit',
      status: 'approved',
      created_at: new Date().toISOString()
    });

    return { success: true, newBalance: after };
  }

  static adminAdjustBalance(adminId: string, userId: string, amount: number, type: 'credit' | 'debit', reason: string) {
    const user = db.users.get(userId);
    if (!user) throw new Error('User not found');

    if (type === 'credit') {
      this.credit(userId, amount, `Admin Credit: ${reason}`);
    } else {
      if (user.wallet_balance < amount) throw new Error('Debit amount exceeds current user balance');
      this.debit(userId, amount, `Admin Debit: ${reason}`);
    }

    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      admin_id: adminId,
      action: `USER_BALANCE_${type.toUpperCase()}`,
      target_type: 'user',
      target_id: userId,
      details: { amount, reason, finalBalance: user.wallet_balance },
      created_at: new Date().toISOString()
    });

    return { success: true, user: db.users.get(userId) };
  }
}
