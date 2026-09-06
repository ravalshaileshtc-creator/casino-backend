"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrashEngine = void 0;
const crypto_1 = __importDefault(require("crypto"));
class CrashEngine {
    static houseEdge = 0.03; // 3% house edge (97% RTP)
    static setHouseEdge(edgePercentage) {
        this.houseEdge = Math.max(0.01, Math.min(0.15, edgePercentage / 100));
    }
    static generateCrashPoint(seed) {
        const serverSeed = seed || crypto_1.default.randomBytes(32).toString('hex');
        const hash = crypto_1.default.createHash('sha256').update(serverSeed).digest('hex');
        // Provably fair crash point formula (Stake / Roobet standard)
        const hexSlice = hash.substring(0, 13);
        const num = parseInt(hexSlice, 16);
        const e = Math.pow(2, 52);
        // House edge calculation
        if (num % (1 / this.houseEdge) === 0) {
            return { crashPoint: 1.00, serverSeed, hash }; // Instant crash
        }
        const raw = (100 * e - num * (this.houseEdge * 100)) / (e - num) / 100;
        const crashPoint = Math.max(1.00, Math.floor(raw * 100) / 100);
        return {
            crashPoint,
            serverSeed,
            hash
        };
    }
}
exports.CrashEngine = CrashEngine;
