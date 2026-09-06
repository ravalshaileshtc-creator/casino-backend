import { Router, Request, Response } from 'express';
import { db, User, supabase } from '../database/db';

export const authRouter = Router();

// Register New User (Strict Verification & Supabase Persistence)
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({ success: false, message: 'Name, Mobile and Password are required' });
    }

    const cleanMobile = mobile.trim();

    // 1. Check in Memory
    for (const u of db.users.values()) {
      if (u.mobile === cleanMobile) {
        return res.status(400).json({ success: false, message: 'Mobile number is already registered. Please Login!' });
      }
    }

    // 2. Check in Supabase Cloud
    if (supabase) {
      const { data: existing } = await supabase.from('users').select('id').eq('mobile', cleanMobile).maybeSingle();
      if (existing) {
        return res.status(400).json({ success: false, message: 'Mobile number is already registered in Supabase. Please Login!' });
      }
    }

    const newUserId = `usr_${Date.now().toString().substring(6)}`;
    const newUser: User = {
      id: newUserId,
      name: name.trim(),
      mobile: cleanMobile,
      email: email ? email.trim() : `${cleanMobile}@gamehub.com`,
      wallet_balance: 1000.00, // ₹1,000 Real Welcome Bonus
      bonus_balance: 100.00,
      referral_code: `APEX${cleanMobile.substring(cleanMobile.length - 4)}`,
      vip_level: 1,
      is_banned: false,
      created_at: new Date().toISOString()
    };

    db.users.set(newUser.id, newUser);
    await db.saveUserToSupabase(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully with ₹1,000 Welcome Bonus!',
      data: newUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login (Strict - User MUST be registered, loads real balance from Supabase)
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ success: false, message: 'Mobile and Password are required' });
    }

    const query = mobile.trim();
    let foundUser: User | null = null;

    // 1. Search in Active Memory
    for (const u of db.users.values()) {
      if (u.mobile === query || u.email.toLowerCase() === query.toLowerCase() || u.id === query) {
        foundUser = u;
        break;
      }
    }

    // 2. If not in memory, Search in Supabase Cloud Database!
    if (!foundUser && supabase) {
      const { data: supaUser } = await supabase
        .from('users')
        .select('*')
        .or(`mobile.eq.${query},email.eq.${query}`)
        .maybeSingle();

      if (supaUser) {
        foundUser = {
          id: supaUser.id,
          name: supaUser.name,
          mobile: supaUser.mobile,
          email: supaUser.email,
          wallet_balance: Number(supaUser.wallet_balance),
          bonus_balance: Number(supaUser.bonus_balance || 0),
          referral_code: supaUser.referral_code,
          vip_level: Number(supaUser.vip_level || 1),
          is_banned: Boolean(supaUser.is_banned),
          created_at: supaUser.created_at,
        };
        db.users.set(foundUser.id, foundUser);
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Real-Time Live User Profile & Balance
authRouter.get('/user/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let user = db.users.get(id);

    if (!user && supabase) {
      const { data: supaUser } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      if (supaUser) {
        user = {
          id: supaUser.id,
          name: supaUser.name,
          mobile: supaUser.mobile,
          email: supaUser.email,
          wallet_balance: Number(supaUser.wallet_balance),
          bonus_balance: Number(supaUser.bonus_balance || 0),
          referral_code: supaUser.referral_code,
          vip_level: Number(supaUser.vip_level || 1),
          is_banned: Boolean(supaUser.is_banned),
          created_at: supaUser.created_at,
        };
        db.users.set(user.id, user);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
