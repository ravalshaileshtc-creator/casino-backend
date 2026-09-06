import crypto from 'crypto';

export interface LuckyBallRound {
  roundId: string;
  roundNumber: number;
  timeRemaining: number;
  winningNumber?: number;
  status: 'betting' | 'drawing' | 'completed';
  totalBetVolume: number;
  drawHistory: { roundNumber: number; winningNumber: number; timestamp: string }[];
}

export class LuckyBallEngine {
  private static currentRoundNumber = 1042;
  private static timeRemaining = 30;
  private static currentWinningNumber: number | null = null;
  private static status: 'betting' | 'drawing' | 'completed' = 'betting';
  private static drawHistory: { roundNumber: number; winningNumber: number; timestamp: string }[] = [];
  private static roundBets: { userId: string; numberPicked: number; amount: number }[] = [];

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
      } else {
        // Draw round outcome
        this.finishRound();
      }
    }, 1000);
  }

  private static finishRound() {
    // Generate 0-9 winning number cryptographically
    const randomByte = crypto.randomBytes(1)[0];
    const winningNumber = randomByte % 10;

    this.currentWinningNumber = winningNumber;
    this.status = 'completed';

    this.drawHistory.unshift({
      roundNumber: this.currentRoundNumber,
      winningNumber,
      timestamp: new Date().toISOString()
    });
    if (this.drawHistory.length > 50) this.drawHistory.pop();

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

  static placeBet(userId: string, numberPicked: number, amount: number) {
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
  static adminForceDraw(number: number) {
    if (number >= 0 && number <= 9) {
      this.currentWinningNumber = number;
    }
  }
}
