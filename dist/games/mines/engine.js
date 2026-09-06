"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinesEngine = void 0;
const crypto_1 = __importDefault(require("crypto"));
class MinesEngine {
    static sessions = new Map();
    static createSession(userId, betAmount, minesCount) {
        if (minesCount < 1 || minesCount > 24)
            throw new Error('Invalid mines count');
        if (betAmount <= 0)
            throw new Error('Invalid bet amount');
        // Shuffle 25 positions (0-24) using Fisher-Yates and cryptographic random
        const positions = Array.from({ length: 25 }, (_, i) => i);
        for (let i = positions.length - 1; i > 0; i--) {
            const randByte = crypto_1.default.randomBytes(1)[0];
            const j = randByte % (i + 1);
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        const minePositions = positions.slice(0, minesCount);
        const sessionId = `mines_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const session = {
            sessionId,
            userId,
            betAmount,
            minesCount,
            minePositions,
            revealedIndices: [],
            currentMultiplier: 1.0,
            isGameOver: false,
            isCashedOut: false,
            payout: 0,
            createdAt: Date.now()
        };
        this.sessions.set(sessionId, session);
        return {
            sessionId,
            currentMultiplier: 1.0
        };
    }
    static calculateMultiplier(revealedCount, minesCount) {
        let mult = 1.0;
        const rtp = 0.99; // 99% RTP
        for (let i = 0; i < revealedCount; i++) {
            mult *= (25 - i) / (25 - minesCount - i);
        }
        return Math.floor(mult * rtp * 100) / 100;
    }
    static revealTile(sessionId, tileIndex) {
        const session = this.sessions.get(sessionId);
        if (!session || session.isGameOver || session.isCashedOut) {
            throw new Error('Invalid or expired game session');
        }
        if (session.revealedIndices.includes(tileIndex)) {
            throw new Error('Tile already revealed');
        }
        if (session.minePositions.includes(tileIndex)) {
            // Stepped on mine! Game over
            session.isGameOver = true;
            session.payout = 0;
            return {
                isMine: true,
                currentMultiplier: 0,
                minePositions: session.minePositions,
                isGameOver: true
            };
        }
        session.revealedIndices.push(tileIndex);
        const newMult = this.calculateMultiplier(session.revealedIndices.length, session.minesCount);
        session.currentMultiplier = newMult;
        // Check if all safe tiles found
        const allSafeFound = session.revealedIndices.length === (25 - session.minesCount);
        if (allSafeFound) {
            session.isGameOver = true;
            session.isCashedOut = true;
            session.payout = Math.floor(session.betAmount * session.currentMultiplier * 100) / 100;
        }
        return {
            isMine: false,
            currentMultiplier: session.currentMultiplier,
            minePositions: allSafeFound ? session.minePositions : undefined,
            isGameOver: session.isGameOver
        };
    }
    static cashout(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || session.isGameOver || session.isCashedOut) {
            throw new Error('Cannot cashout');
        }
        if (session.revealedIndices.length === 0) {
            throw new Error('Must reveal at least one tile before cashout');
        }
        session.isGameOver = true;
        session.isCashedOut = true;
        session.payout = Math.floor(session.betAmount * session.currentMultiplier * 100) / 100;
        return {
            payout: session.payout,
            multiplier: session.currentMultiplier,
            minePositions: session.minePositions
        };
    }
}
exports.MinesEngine = MinesEngine;
