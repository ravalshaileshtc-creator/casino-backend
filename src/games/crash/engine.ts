import crypto from 'crypto';

export interface CrashRound {
  roundId: string;
  crashPoint: number;
  serverSeed: string;
  hash: string;
  startedAt: number;
  status: 'betting' | 'flying' | 'crashed';
}

export class CrashEngine {
  private static houseEdge = 0.03; // 3% house edge (97% RTP)

  static setHouseEdge(edgePercentage: number) {
    this.houseEdge = Math.max(0.01, Math.min(0.15, edgePercentage / 100));
  }

  static generateCrashPoint(seed?: string): { crashPoint: number; serverSeed: string; hash: string } {
    const serverSeed = seed || crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(serverSeed).digest('hex');

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
