import { Router, Request, Response } from 'express';
import { db, PaymentRequest, supabase } from '../database/db';
import { WalletService } from './wallet.service';

export const paymentsRouter = Router();

// 1. Submit UPI Deposit Request (Player submitted UTR)
paymentsRouter.post('/deposit', async (req: Request, res: Response) => {
  try {
    const { userId, amount, upiId, utrNumber } = req.body;

    if (!userId || !amount || !utrNumber) {
      return res.status(400).json({ success: false, message: 'User ID, Amount and 12-digit UTR are required' });
    }

    const amt = Number(amount);
    if (amt < 100) {
      return res.status(400).json({ success: false, message: 'Minimum deposit amount is ₹100' });
    }

    const user = db.users.get(userId);
    const userName = user ? user.name : 'Player';

    const payId = `DEP_${Date.now().toString().substring(5)}`;
    const newPayment: PaymentRequest = {
      id: payId,
      user_id: userId,
      user_name: userName,
      type: 'deposit',
      amount: amt,
      upiId: upiId || 'UPI App',
      utrNumber: utrNumber.trim(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    db.payments.set(payId, newPayment);
    await db.savePaymentToSupabase(newPayment);

    // Record audit log
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      admin_id: 'SYSTEM',
      action: 'DEPOSIT_SUBMITTED',
      target_type: 'payment',
      target_id: payId,
      details: { amount: amt, utr: utrNumber, userId },
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Deposit request submitted successfully! Admin will verify UTR within 2-5 minutes.',
      data: newPayment
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Submit Withdrawal Request (Bank Card / UPI)
paymentsRouter.post('/withdraw', async (req: Request, res: Response) => {
  try {
    const { userId, amount, upiId, bankInfo } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: 'User ID and Amount are required' });
    }

    const amt = Number(amount);
    if (amt < 200) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is ₹200' });
    }

    const user = db.users.get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.wallet_balance < amt) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance for this withdrawal' });
    }

    // Deduct held amount from user balance
    WalletService.debit(userId, amt, `Withdrawal Request Placed`);

    const payId = `WDR_${Date.now().toString().substring(5)}`;
    const payoutTarget = upiId ? `UPI: ${upiId}` : (bankInfo ? `Bank A/C: ${bankInfo.accountNumber}` : 'Bank Transfer');

    const newPayment: PaymentRequest = {
      id: payId,
      user_id: userId,
      user_name: user.name,
      type: 'withdraw',
      amount: amt,
      upiId: payoutTarget,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    db.payments.set(payId, newPayment);
    await db.savePaymentToSupabase(newPayment);

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted! Funds will be transferred to your account after verification.',
      data: {
        payment: newPayment,
        newBalance: user.wallet_balance
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Get User Transaction & Payment History
paymentsRouter.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const history = Array.from(db.payments.values())
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
