import { Router } from 'express';

export default function createConversationRoutes({ db, requireAuth }) {
    const router = Router();

    // Get conversation + messages for a project
    router.get('/api/projects/:projectId/conversation', requireAuth, (req, res) => {
        try {
            const { projectId } = req.params;
            const userId = req.session.userId;

            // Verify project access
            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
            if (!project) return res.status(404).json({ error: 'Project not found' });
            if (project.user_id && project.user_id !== userId) {
                return res.status(403).json({ error: 'Access denied' });
            }

            const conversation = db.prepare('SELECT * FROM conversations WHERE project_id = ?').get(projectId);
            if (!conversation) {
                return res.json({ exists: false, messages: [], mode: 'initial', scriptContent: '', targetModel: null });
            }

            const messages = db.prepare(
                'SELECT * FROM conversation_messages WHERE conversation_id = ? ORDER BY id ASC'
            ).all(conversation.id);

            // Parse metadata JSON for each message
            const parsed = messages.map(m => ({
                role: m.role,
                content: m.content,
                ...(m.metadata ? JSON.parse(m.metadata) : {}),
            }));

            res.json({
                exists: true,
                messages: parsed,
                mode: conversation.mode || 'initial',
                scriptContent: conversation.script_content || '',
                targetModel: conversation.target_model || null,
            });
        } catch (error) {
            console.error('[conversation] Load error:', error.message);
            res.status(500).json({ error: error.message });
        }
    });

    // Save a message to the conversation (creates conversation if needed)
    router.post('/api/projects/:projectId/conversation/messages', requireAuth, (req, res) => {
        try {
            const { projectId } = req.params;
            const { role, content, metadata, mode, scriptContent, targetModel } = req.body;

            if (!role || !content) {
                return res.status(400).json({ error: 'role and content required' });
            }

            // Upsert conversation
            let conversation = db.prepare('SELECT * FROM conversations WHERE project_id = ?').get(projectId);
            if (!conversation) {
                db.prepare(`
                    INSERT INTO conversations (project_id, mode, script_content, target_model)
                    VALUES (?, ?, ?, ?)
                `).run(projectId, mode || 'initial', scriptContent || '', targetModel || null);
                conversation = db.prepare('SELECT * FROM conversations WHERE project_id = ?').get(projectId);
            } else {
                // Update session state
                db.prepare(`
                    UPDATE conversations
                    SET mode = ?, script_content = ?, target_model = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(mode || conversation.mode, scriptContent ?? conversation.script_content, targetModel ?? conversation.target_model, conversation.id);
            }

            // Insert message
            const metadataStr = metadata ? JSON.stringify(metadata) : null;
            const result = db.prepare(`
                INSERT INTO conversation_messages (conversation_id, role, content, metadata)
                VALUES (?, ?, ?, ?)
            `).run(conversation.id, role, content, metadataStr);

            res.json({ id: result.lastInsertRowid, saved: true });
        } catch (error) {
            console.error('[conversation] Save message error:', error.message);
            res.status(500).json({ error: error.message });
        }
    });

    // Replace all messages (used after compaction)
    router.put('/api/projects/:projectId/conversation/messages', requireAuth, (req, res) => {
        try {
            const { projectId } = req.params;
            const { messages, mode, scriptContent, targetModel } = req.body;

            if (!Array.isArray(messages)) {
                return res.status(400).json({ error: 'messages array required' });
            }

            let conversation = db.prepare('SELECT * FROM conversations WHERE project_id = ?').get(projectId);
            if (!conversation) {
                db.prepare(`
                    INSERT INTO conversations (project_id, mode, script_content, target_model)
                    VALUES (?, ?, ?, ?)
                `).run(projectId, mode || 'initial', scriptContent || '', targetModel || null);
                conversation = db.prepare('SELECT * FROM conversations WHERE project_id = ?').get(projectId);
            }

            // Delete all existing messages and replace
            db.prepare('DELETE FROM conversation_messages WHERE conversation_id = ?').run(conversation.id);

            const insert = db.prepare(`
                INSERT INTO conversation_messages (conversation_id, role, content, metadata)
                VALUES (?, ?, ?, ?)
            `);

            const insertAll = db.transaction((msgs) => {
                for (const msg of msgs) {
                    const { role, content, ...rest } = msg;
                    const metadata = Object.keys(rest).length > 0 ? JSON.stringify(rest) : null;
                    insert.run(conversation.id, role, content, metadata);
                }
            });
            insertAll(messages);

            // Update session state
            db.prepare(`
                UPDATE conversations
                SET mode = ?, script_content = ?, target_model = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(mode || conversation.mode, scriptContent ?? conversation.script_content, targetModel ?? conversation.target_model, conversation.id);

            res.json({ replaced: true, count: messages.length });
        } catch (error) {
            console.error('[conversation] Replace messages error:', error.message);
            res.status(500).json({ error: error.message });
        }
    });

    // Clear/reset conversation
    router.delete('/api/projects/:projectId/conversation', requireAuth, (req, res) => {
        try {
            const { projectId } = req.params;
            const conversation = db.prepare('SELECT * FROM conversations WHERE project_id = ?').get(projectId);
            if (conversation) {
                db.prepare('DELETE FROM conversation_messages WHERE conversation_id = ?').run(conversation.id);
                db.prepare('UPDATE conversations SET mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                    .run('initial', conversation.id);
            }
            res.json({ cleared: true });
        } catch (error) {
            console.error('[conversation] Clear error:', error.message);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
