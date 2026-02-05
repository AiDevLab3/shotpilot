/**
 * Deduct credit after successful operation
 */
function deductCredit(db, userId, modelName, shotId) {
    try {
        // Start transaction
        const deduct = db.prepare(
            'UPDATE users SET credits = credits - 1 WHERE id = ? AND credits > 0'
        );

        const log = db.prepare(`
      INSERT INTO usage_log (user_id, action, model_name, shot_id, credits_used)
      VALUES (?, 'generate_prompt', ?, ?, 1)
    `);

        const getCredits = db.prepare('SELECT credits FROM users WHERE id = ?');

        // Execute transaction
        // Better-sqlite3 transactions are synchronous
        const result = db.transaction(() => {
            const info = deduct.run(userId);
            if (info.changes === 0) {
                throw new Error('Failed to deduct credit - insufficient balance');
            }
            log.run(userId, modelName, shotId);
            return getCredits.get(userId);
        })();

        return result.credits;

    } catch (error) {
        console.error('Error deducting credit:', error);
        throw error;
    }
}

/**
 * Add credits to user account
 */
function addCredits(db, userId, amount, reason = 'purchase') {
    const update = db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?');
    const log = db.prepare(`
    INSERT INTO usage_log (user_id, action, credits_used)
    VALUES (?, ?, ?)
  `);

    db.transaction(() => {
        update.run(amount, userId);
        log.run(userId, reason, -amount); // Negative = credit added
    })();
}

/**
 * Get user credit balance and tier
 */
function getUserCredits(db, userId) {
    const user = db.prepare('SELECT credits, tier FROM users WHERE id = ?')
        .get(userId);
    return user || { credits: 0, tier: 'free' };
}

/**
 * Get usage stats for user
 */
function getUsageStats(db, userId, days = 30) {
    const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_generations,
      SUM(credits_used) as total_credits_used,
      DATE(created_at) as date
    FROM usage_log
    WHERE user_id = ? 
      AND action = 'generate_prompt'
      AND created_at >= datetime('now', '-${days} days')
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `).all(userId);

    return stats;
}

export {
    deductCredit,
    addCredits,
    getUserCredits,
    getUsageStats
};
