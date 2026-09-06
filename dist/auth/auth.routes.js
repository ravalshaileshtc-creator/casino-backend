"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const db_1 = require("../database/db");
exports.authRouter = (0, express_1.Router)();
// Register New User (Strict Verification)
exports.authRouter.post('/register', async (req, res) => {
    try {
        const { name, mobile, email, password } = req.body;
        if (!name || !mobile || !password) {
            return res.status(400).json({ success: false, message: 'Name, Mobile and Password are required' });
        }
        const cleanMobile = mobile.trim();
        // Check if mobile already exists
        for (const u of db_1.db.users.values()) {
            if (u.mobile === cleanMobile) {
                return res.status(400).json({ success: false, message: 'Mobile number is already registered. Please Login!' });
            }
        }
        const newUserId = `usr_${Date.now().toString().substring(6)}`;
        const newUser = {
            id: newUserId,
            name: name.trim(),
            mobile: cleanMobile,
            email: email ? email.trim() : `${cleanMobile}@gamehub.com`,
            wallet_balance: 1000.00, // ₹1,000 Welcome Bonus
            bonus_balance: 100.00,
            referral_code: `APEX${cleanMobile.substring(cleanMobile.length - 4)}`,
            vip_level: 1,
            is_banned: false,
            created_at: new Date().toISOString()
        };
        db_1.db.users.set(newUser.id, newUser);
        await db_1.db.saveUserToSupabase(newUser);
        res.status(201).json({
            success: true,
            message: 'Account created successfully with ₹1,000 Welcome Bonus!',
            data: newUser
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Login (Strict - User MUST be registered)
exports.authRouter.post('/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;
        if (!mobile || !password) {
            return res.status(400).json({ success: false, message: 'Mobile and Password are required' });
        }
        const query = mobile.trim();
        let foundUser = null;
        for (const u of db_1.db.users.values()) {
            if (u.mobile === query || u.email.toLowerCase() === query.toLowerCase() || u.id === query) {
                foundUser = u;
                break;
            }
        }
        // STRICT CHECK: Reject if user does not exist
        if (!foundUser) {
            return res.status(404).json({
                success: false,
                message: 'Account not found! Aap registered nahi hain. Pehle "Register Now" par click karke account banayein.'
            });
        }
        // Check if banned
        if (foundUser.is_banned) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended by Admin. Contact support.'
            });
        }
        res.json({
            success: true,
            message: 'Login successful!',
            data: foundUser
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
