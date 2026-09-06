"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuckyBallEngine = void 0;
const crypto_1 = __importDefault(require("crypto"));
class LuckyBallEngine {
    static currentRoundNumber = 1042;
    static timeRemaining = 30;
    static currentWinningNumber = null;
    static status = 'betting';
    static drawHistory = [];
    static roundBets = [];
    static initialize() {
        // Populate past 10 draws
        for (let i = 10; i >= 1; i--) {
            this.drawHistory.push({
                roundNumber: this.currentRoundNumber - i,
                winningNumber: Math.floor(Math.random() * 10),
                timestamp: new Date(Date.now() - i * 30000).toISOString()
            });
        }
        // 1-second interval ticker for synchronized rounds
        setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                if (this.timeRemaining <= 3) {
                    this.status = 'drawing';
                }
            }
            else {
                // Draw round outcome
                this.finishRound();
            }
        }, 1000);
    }
    static finishRound() {
        // Generate 0-9 winning number cryptographically
        const randomByte = crypto_1.default.randomBytes(1)[0];
        const winningNumber = randomByte % 10;
        this.currentWinningNumber = winningNumber;
        this.status = 'completed';
        this.drawHistory.unshift({
            roundNumber: this.currentRoundNumber,
            winningNumber,
            timestamp: new Date().toISOString()
        });
        if (this.drawHistory.length > 50)
            this.drawHistory.pop();
        // Prepare next round
        setTimeout(() => {
            this.currentRoundNumber++;
            this.timeRemaining = 30;
            this.status = 'betting';
            this.currentWinningNumber = null;
            this.roundBets = [];
        }, 3000);
    }
    static getRoundState() {
        return {
            roundNumber: this.currentRoundNumber,
            timeRemaining: this.timeRemaining,
            status: this.status,
            winningNumber: this.currentWinningNumber,
            history: this.drawHistory.slice(0, 15)
        };
    }
    static placeBet(userId, numberPicked, amount) {
        if (this.status !== 'betting' || this.timeRemaining <= 3) {
            throw new Error('Bets are locked for this round');
        }
        if (numberPicked < 0 || numberPicked > 9) {
            throw new Error('Number must be between 0 and 9');
        }
        this.roundBets.push({ userId, numberPicked, amount });
        return { success: true, roundNumber: this.currentRoundNumber };
    }
    // Admin override to force winning number if requested
    static adminForceDraw(number) {
        if (number >= 0 && number <= 9) {
            this.currentWinningNumber = number;
        }
    }
}
exports.LuckyBallEngine = LuckyBallEngine;
