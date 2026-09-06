import { Router, Request, Response } from 'express';
import { PlinkoEngine, RiskLevel } from './plinko/engine';
import { CrashEngine } from './crash/engine';
import { MinesEngine } from './mines/engine';
import { LuckyBallEngine } from './luckyball/engine';
import { WalletService } from '../wallet/wallet.service';
import { db } from '../database/db';

export const gamesRouter = Router();

// Plinko Drop Endpoint
gamesRouter.post('/plinko/drop', (req: Request, res: Response) => {
  try {
    const { userId, betAmount, rows, risk, clientSeed, nonce } = req.body;
    WalletService.debit(userId, Number(betAmount), 'Plinko Drop Bet');

    const result = PlinkoEngine.resolveDrop(Number(rows) || 16, (risk as RiskLevel) || 'high', clientSeed, Number(nonce) || 1);
    const payout = +(Number(betAmount) * result.multiplier).toFixed(2);
    const profit = payout - Number(betAmount);

    if (payout > 0) {
      WalletService.credit(userId, payout, `Plinko Win (${result.multiplier}x)`);
    }

    db.bets.unshift({
      id: `bet_${Date.now()}`,
      user_id: userId,
      user_name: db.users.get(userId)?.name || 'Player',
      game_type: 'plinko',
      round_id: `plk_${result.nonce}`,
      bet_amount: Number(betAmount),
      multiplier: result.multiplier,
      payout,
      profit,
      status: payout > Number(betAmount) ? 'won' : 'lost',
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        ...result,
        payout,
        profit,
        balance: WalletService.getBalance(userId)
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Crash Bet Endpoint
gamesRouter.post('/crash/bet', (req: Request, res: Response) => {
  try {
    const { userId, betAmount } = req.body;
    WalletService.debit(userId, Number(betAmount), 'Crash Bet');
    res.json({
      success: true,
      message: 'Bet accepted for upcoming round',
      balance: WalletService.getBalance(userId)
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Mines Start Session
gamesRouter.post('/mines/start', (req: Request, res: Response) => {
  try {
    const { userId, betAmount, minesCount } = req.body;
    WalletService.debit(userId, Number(betAmount), `Mines Game Bet (${minesCount} mines)`);

    const session = MinesEngine.createSession(userId, Number(betAmount), Number(minesCount));
    res.json({
      success: true,
      data: {
        ...session,
        balance: WalletService.getBalance(userId)
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Mines Reveal Tile
gamesRouter.post('/mines/reveal', (req: Request, res: Response) => {
  try {
    const { sessionId, tileIndex } = req.body;
    const result = MinesEngine.revealTile(sessionId, Number(tileIndex));
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Mines Cashout
gamesRouter.post('/mines/cashout', (req: Request, res: Response) => {
  try {
    const { sessionId, userId } = req.body;
    const result = MinesEngine.cashout(sessionId);

    WalletService.credit(userId, result.payout, `Mines Cashout (${result.multiplier}x)`);

    res.json({
      success: true,
      data: {
        ...result,
        balance: WalletService.getBalance(userId)
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Lucky Ball Bet
gamesRouter.post('/luckyball/bet', (req: Request, res: Response) => {
  try {
    const { userId, numberPicked, amount } = req.body;
    WalletService.debit(userId, Number(amount), `Lucky Ball Bet on #${numberPicked}`);
    const result = LuckyBallEngine.placeBet(userId, Number(numberPicked), Number(amount));
    res.json({
      success: true,
      data: {
        ...result,
        balance: WalletService.getBalance(userId)
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});
