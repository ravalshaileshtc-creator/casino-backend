"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamesRouter = void 0;
const express_1 = require("express");
const engine_1 = require("./plinko/engine");
const engine_2 = require("./mines/engine");
const engine_3 = require("./luckyball/engine");
const wallet_service_1 = require("../wallet/wallet.service");
const db_1 = require("../database/db");
exports.gamesRouter = (0, express_1.Router)();
// Plinko Drop Endpoint
exports.gamesRouter.post('/plinko/drop', (req, res) => {
    try {
        const { userId, betAmount, rows, risk, clientSeed, nonce } = req.body;
        wallet_service_1.WalletService.debit(userId, Number(betAmount), 'Plinko Drop Bet');
        const result = engine_1.PlinkoEngine.resolveDrop(Number(rows) || 16, risk || 'high', clientSeed, Number(nonce) || 1);
        const payout = +(Number(betAmount) * result.multiplier).toFixed(2);
        const profit = payout - Number(betAmount);
        if (payout > 0) {
            wallet_service_1.WalletService.credit(userId, payout, `Plinko Win (${result.multiplier}x)`);
        }
        db_1.db.bets.unshift({
            id: `bet_${Date.now()}`,
            user_id: userId,
            user_name: db_1.db.users.get(userId)?.name || 'Player',
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
                balance: wallet_service_1.WalletService.getBalance(userId)
            }
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// Crash Bet Endpoint
exports.gamesRouter.post('/crash/bet', (req, res) => {
    try {
        const { userId, betAmount } = req.body;
        wallet_service_1.WalletService.debit(userId, Number(betAmount), 'Crash Bet');
        res.json({
            success: true,
            message: 'Bet accepted for upcoming round',
            balance: wallet_service_1.WalletService.getBalance(userId)
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// Mines Start Session
exports.gamesRouter.post('/mines/start', (req, res) => {
    try {
        const { userId, betAmount, minesCount } = req.body;
        wallet_service_1.WalletService.debit(userId, Number(betAmount), `Mines Game Bet (${minesCount} mines)`);
        const session = engine_2.MinesEngine.createSession(userId, Number(betAmount), Number(minesCount));
        res.json({
            success: true,
            data: {
                ...session,
                balance: wallet_service_1.WalletService.getBalance(userId)
            }
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// Mines Reveal Tile
exports.gamesRouter.post('/mines/reveal', (req, res) => {
    try {
        const { sessionId, tileIndex } = req.body;
        const result = engine_2.MinesEngine.revealTile(sessionId, Number(tileIndex));
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// Mines Cashout
exports.gamesRouter.post('/mines/cashout', (req, res) => {
    try {
        const { sessionId, userId } = req.body;
        const result = engine_2.MinesEngine.cashout(sessionId);
        wallet_service_1.WalletService.credit(userId, result.payout, `Mines Cashout (${result.multiplier}x)`);
        res.json({
            success: true,
            data: {
                ...result,
                balance: wallet_service_1.WalletService.getBalance(userId)
            }
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// Lucky Ball Bet
exports.gamesRouter.post('/luckyball/bet', (req, res) => {
    try {
        const { userId, numberPicked, amount } = req.body;
        wallet_service_1.WalletService.debit(userId, Number(amount), `Lucky Ball Bet on #${numberPicked}`);
        const result = engine_3.LuckyBallEngine.placeBet(userId, Number(numberPicked), Number(amount));
        res.json({
            success: true,
            data: {
                ...result,
                balance: wallet_service_1.WalletService.getBalance(userId)
            }
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
