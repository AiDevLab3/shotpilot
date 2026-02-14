import { Router } from 'express';

export default function createAuthRoutes({ db, requireAuth, getUserCredits, getUsageStats }) {
    const router = Router();

    // Login
    router.post('/api/auth/login', (req, res) => {
        const { email, password } = req.body;

        // MVP: Simple check (In production use bcrypt.compare)
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                credits: user.credits,
                tier: user.tier
            }
        });
    });

    // Get current user session
    router.get('/api/auth/me', (req, res) => {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = db.prepare('SELECT id, email, credits, tier FROM users WHERE id = ?')
            .get(req.session.userId);

        res.json(user);
    });

    // Logout
    router.post('/api/auth/logout', (req, res) => {
        req.session.destroy();
        res.json({ success: true });
    });

    // Get user credits
    router.get('/api/user/credits', requireAuth, (req, res) => {
        try {
            const credits = getUserCredits(db, req.session.userId);
            res.json(credits);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get usage stats
    router.get('/api/user/usage', requireAuth, (req, res) => {
        try {
            const stats = getUsageStats(db, req.session.userId);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
