import express from 'express';
import { 
  getCostSummary, 
  getDailyTotal, 
  getProjectTotal, 
  getCostReport, 
  getRawLog, 
  exportCsv 
} from '../services/costTracker.js';

export default function createCostRoutes() {
  const router = express.Router();

  /**
   * GET /api/costs/summary — returns { last_action, daily_total, project_totals }
   * Main endpoint for the UI header banner
   */
  router.get('/api/costs/summary', (req, res) => {
    try {
      const summary = getCostSummary();
      res.json(summary);
    } catch (err) {
      console.error('[costs/summary] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/costs/daily?date= — daily breakdown
   * date: YYYY-MM-DD format, optional (defaults to today)
   */
  router.get('/api/costs/daily', (req, res) => {
    try {
      const { date } = req.query;
      const daily = getDailyTotal(date);
      res.json(daily);
    } catch (err) {
      console.error('[costs/daily] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/costs/project/:id — project breakdown
   */
  router.get('/api/costs/project/:id', (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      const project = getProjectTotal(projectId);
      res.json(project);
    } catch (err) {
      console.error('[costs/project] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/costs/report?from=&to=&groupBy= — flexible reports
   * from, to: YYYY-MM-DD format
   * groupBy: 'day' | 'action' | 'model' | 'provider' | 'project'
   */
  router.get('/api/costs/report', (req, res) => {
    try {
      const { from, to, groupBy } = req.query;
      const report = getCostReport({ from, to, groupBy });
      res.json(report);
    } catch (err) {
      console.error('[costs/report] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/costs/raw?from=&to=&limit=&offset=&action=&model= — raw log
   * Paginated raw log entries with filtering
   */
  router.get('/api/costs/raw', (req, res) => {
    try {
      const { from, to, limit, offset, action, model, projectId } = req.query;
      const options = {
        from,
        to,
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0,
        action,
        model,
        projectId: projectId ? parseInt(projectId) : undefined
      };
      const rawData = getRawLog(options);
      res.json(rawData);
    } catch (err) {
      console.error('[costs/raw] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/costs/export?from=&to= — CSV download
   * Returns CSV file for spreadsheet analysis
   */
  router.get('/api/costs/export', (req, res) => {
    try {
      const { from, to } = req.query;
      const csvData = exportCsv({ from, to });
      const dateRange = from && to ? `_${from}_to_${to}` : `_${new Date().toISOString().split('T')[0]}`;
      const filename = `shotpilot_costs${dateRange}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvData);
    } catch (err) {
      console.error('[costs/export] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}