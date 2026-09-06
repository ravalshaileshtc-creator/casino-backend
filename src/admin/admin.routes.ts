import { Router, Request, Response } from 'express';
import { AdminService } from './admin.service';
import { LuckyBallEngine } from '../games/luckyball/engine';

export const adminRouter = Router();

// Middleware: Admin Authentication simulation
const verifyAdmin = (req: Request, res: Response, next: Function) => {
  const adminKey = req.headers['x-admin-key'];
  // Allow all for development or match configured key
  next();
};

adminRouter.use(verifyAdmin);

// 1. Dashboard KPIs & Live Analytics
adminRouter.get('/dashboard', (req: Request, res: Response) => {
  try {
    const kpis = AdminService.getDashboardKPIs();
    res.json({ success: true, data: kpis });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Game Settings (RTP, House Edge, Min/Max bet, Enable/Disable)
adminRouter.get('/games', (req: Request, res: Response) => {
  try {
    const games = AdminService.getAllGames();
    res.json({ success: true, data: games });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

adminRouter.patch('/games/:key', (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const adminId = (req.headers['x-admin-id'] as string) || 'super_admin';
    const updated = AdminService.updateGameSettings(adminId, key, req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 3. User Management
adminRouter.get('/users', (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const users = AdminService.getAllUsers(search);
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

adminRouter.post('/users/:id/adjust-balance', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, type, reason } = req.body;
    const adminId = (req.headers['x-admin-id'] as string) || 'super_admin';
    const result = AdminService.adjustUserBalance(adminId, id, Number(amount), type, reason || 'Admin Balance Adjustment');
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

adminRouter.post('/users/:id/toggle-ban', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req.headers['x-admin-id'] as string) || 'super_admin';
    const user = AdminService.toggleUserBan(adminId, id);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 4. Payment Approval Desk (UPI Deposits & Withdrawals)
adminRouter.get('/payments', (req: Request, res: Response) => {
  try {
    const type = req.query.type as any;
    const status = req.query.status as any;
    const payments = AdminService.getPaymentRequests(type, status);
    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

adminRouter.post('/payments/:id/review', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;
    const adminId = (req.headers['x-admin-id'] as string) || 'super_admin';
    const reviewed = AdminService.reviewPayment(adminId, id, action, note);
    res.json({ success: true, data: reviewed });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 5. Game Ops - Lucky Ball 0-9 Admin Override & Monitor
adminRouter.get('/luckyball/state', (req: Request, res: Response) => {
  try {
    const state = LuckyBallEngine.getRoundState();
    res.json({ success: true, data: state });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

adminRouter.post('/luckyball/force-draw', (req: Request, res: Response) => {
  try {
    const { winningNumber } = req.body;
    LuckyBallEngine.adminForceDraw(Number(winningNumber));
    res.json({ success: true, message: `Next winning number forced to ${winningNumber}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 6. Security Audit Logs
adminRouter.get('/audit-logs', (req: Request, res: Response) => {
  try {
    const logs = AdminService.getAuditLogs();
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
