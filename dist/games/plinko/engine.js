"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlinkoEngine = void 0;
const crypto_1 = __importDefault(require("crypto"));
// 16-row multipliers for each risk profile
const MULTIPLIERS_16 = {
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.1, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
    medium: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    low: [16, 9, 4, 2.5, 2, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 2, 2.5, 4, 9, 16]
};
class PlinkoEngine {
    static resolveDrop(rows = 16, risk = 'high', clientSeed = 'client_default', nonce = 1) {
        const serverSeed = crypto_1.default.randomBytes(32).toString('hex');
        const hash = crypto_1.default.createHmac('sha256', serverSeed).update(`${clientSeed}:${nonce}`).digest('hex');
        const directions = [];
        let rightCount = 0;
        for (let i = 0; i < rows; i++) {
            // 2 hex characters per row step (0-255)
            const subHex = hash.substring(i * 2, i * 2 + 2);
            const val = parseInt(subHex, 16);
            const isRight = val % 2 === 1 ? 1 : 0;
            directions.push(isRight);
            rightCount += isRight;
        }
        const bucketIndex = rightCount;
        const table = MULTIPLIERS_16[risk] || MULTIPLIERS_16.medium;
        const multiplier = table[bucketIndex] ?? table[Math.floor(table.length / 2)];
        return {
            bucketIndex,
            multiplier,
            directions,
            serverSeed,
            clientSeed,
            nonce
        };
    }
}
exports.PlinkoEngine = PlinkoEngine;
