import session from 'express-session';

/**
 * Setup express-session
 */
function setupAuth(app) {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        }
    }));
}

/**
 * Require authentication middleware
 */
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please log in to continue'
        });
    }
    next();
}

/**
 * Check if user has sufficient credits
 */
function checkCredits(db) {
    return (req, res, next) => {
        const user = db.prepare('SELECT credits, tier FROM users WHERE id = ?')
            .get(req.session.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.credits < 1) {
            return res.status(403).json({
                error: 'Insufficient credits',
                credits: user.credits,
                tier: user.tier,
                message: 'You need more credits to generate prompts. Upgrade your plan or purchase credits.'
            });
        }

        req.user = user;
        next();
    };
}

export { setupAuth, requireAuth, checkCredits };
