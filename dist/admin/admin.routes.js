"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const admin_service_1 = require("./admin.service");
const engine_1 = require("../games/luckyball/engine");
exports.adminRouter = (0, express_1.Router)();
// Middleware: Admin Authentication simulation
const verifyAdmin = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    // Allow all for development or match configured key
    next();
};
exports.adminRouter.use(verifyAdmin);
// 1. Dashboard KPIs & Live Analytics
exports.adminRouter.get('/dashboard', (req, res) => {
    try {
        const kpis = admin_service_1.AdminService.getDashboardKPIs();
        res.json({ success: true, data: kpis });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// 2. Game Settings (RTP, House Edge, Min/Max bet, Enable/Disable)
exports.adminRouter.get('/games', (req, res) => {
    try {
        const games = admin_service_1.AdminService.getAllGames();
        res.json({ success: true, data: games });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.adminRouter.patch('/games/:key', (req, res) => {
    try {
        const { key } = req.params;
        const adminId = req.headers['x-admin-id'] || 'super_admin';
        const updated = admin_service_1.AdminService.updateGameSettings(adminId, key, req.body);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// 3. User Management
exports.adminRouter.get('/users', (req, res) => {
    try {
        const search = req.query.search;
        const users = admin_service_1.AdminService.getAllUsers(search);
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.adminRouter.post('/users/:id/adjust-balance', (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, reason } = req.body;
        const adminId = req.headers['x-admin-id'] || 'super_admin';
        const result = admin_service_1.AdminService.adjustUserBalance(adminId, id, Number(amount), type, reason || 'Admin Balance Adjustment');
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.adminRouter.post('/users/:id/toggle-ban', (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.headers['x-admin-id'] || 'super_admin';
        const user = admin_service_1.AdminService.toggleUserBan(adminId, id);
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// 4. Payment Approval Desk (UPI Deposits & Withdrawals)
exports.adminRouter.get('/payments', (req, res) => {
    try {
        const type = req.query.type;
        const status = req.query.status;
        const payments = admin_service_1.AdminService.getPaymentRequests(type, status);
        res.json({ success: true, data: payments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.adminRouter.post('/payments/:id/review', (req, res) => {
    try {
        const { id } = req.params;
        const { action, note } = req.body;
        const adminId = req.headers['x-admin-id'] || 'super_admin';
        const reviewed = admin_service_1.AdminService.reviewPayment(adminId, id, action, note);
        res.json({ success: true, data: reviewed });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// 5. Game Ops - Lucky Ball 0-9 Admin Override & Monitor
exports.adminRouter.get('/luckyball/state', (req, res) => {
    try {
        const state = engine_1.LuckyBallEngine.getRoundState();
        res.json({ success: true, data: state });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.adminRouter.post('/luckyball/force-draw', (req, res) => {
    try {
        const { winningNumber } = req.body;
        engine_1.LuckyBallEngine.adminForceDraw(Number(winningNumber));
        res.json({ success: true, message: `Next winning number forced to ${winningNumber}` });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// 6. Security Audit Logs
exports.adminRouter.get('/audit-logs', (req, res) => {
    try {
        const logs = admin_service_1.AdminService.getAuditLogs();
        res.json({ success: true, data: logs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
