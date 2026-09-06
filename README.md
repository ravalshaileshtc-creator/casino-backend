# GameHub Casino Scalable Real-time Backend

Production-ready Node.js, Express, TypeScript, and WebSocket backend powering Plinko, Crash, Mines, Lucky Ball 0-9, and the Super Admin Panel.

## Features
- Real-time WebSockets on `/ws` (Crash flight stream, Lucky Ball 30s countdown, Live bets ticker)
- Server-side cryptographic RNG game engines (Plinko 16-row HMAC SHA-256, Crash provably fair, Mines 5x5 reveal validator)
- Super Admin REST APIs on `/api/v1/admin` (Dashboard KPIs, User Balance Credit/Debit, RTP & House edge controls, UPI approval desk)
- Health check on `/health`

## Build & Run
```bash
npm install
npm run build
npm start
```
