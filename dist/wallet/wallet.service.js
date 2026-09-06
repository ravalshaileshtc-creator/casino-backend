"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const db_1 = require("../database/db");
class WalletService {
    static getBalance(userId) {
        const user = db_1.db.users.get(userId);
        if (!user)
            throw new Error('User not found');
        return user.wallet_balance;
    }
    static debit(userId, amount, remark = 'Game Bet') {
        const user = db_1.db.users.get(userId);
        if (!user)
            throw new Error('User not found');
        if (user.is_banned)
            throw new Error('Account is suspended');
        if (user.wallet_balance < amount)
            throw new Error('Insufficient wallet balance');
        const before = user.wallet_balance;
        user.wallet_balance = +(user.wallet_balance - amount).toFixed(2);
        const after = user.wallet_balance;
        db_1.db.users.set(userId, user);
        db_1.db.saveUserToSupabase(user);
        // Save transaction to Supabase
        db_1.db.savePaymentToSupabase({
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
    static credit(userId, amount, remark = 'Game Win / Deposit') {
        const user = db_1.db.users.get(userId);
        if (!user)
            throw new Error('User not found');
        const before = user.wallet_balance;
        user.wallet_balance = +(user.wallet_balance + amount).toFixed(2);
        const after = user.wallet_balance;
        db_1.db.users.set(userId, user);
        db_1.db.saveUserToSupabase(user);
        // Save transaction to Supabase
        db_1.db.savePaymentToSupabase({
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
    static adminAdjustBalance(adminId, userId, amount, type, reason) {
        const user = db_1.db.users.get(userId);
        if (!user)
            throw new Error('User not found');
        if (type === 'credit') {
            this.credit(userId, amount, `Admin Credit: ${reason}`);
        }
        else {
            if (user.wallet_balance < amount)
                throw new Error('Debit amount exceeds current user balance');
            this.debit(userId, amount, `Admin Debit: ${reason}`);
        }
        db_1.db.auditLogs.unshift({
            id: `log_${Date.now()}`,
            admin_id: adminId,
            action: `USER_BALANCE_${type.toUpperCase()}`,
            target_type: 'user',
            target_id: userId,
            details: { amount, reason, finalBalance: user.wallet_balance },
            created_at: new Date().toISOString()
        });
        return { success: true, user: db_1.db.users.get(userId) };
    }
}
exports.WalletService = WalletService;
