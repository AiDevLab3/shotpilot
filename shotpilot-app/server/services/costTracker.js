import { db } from '../database.js';

// Pricing config — easy to update as prices change
const PRICING = {
  // fal.ai models (per image unless noted)
  'fal-ai/flux-2-flex': { per_image: 0.025, name: 'Flux 2 Flex' },
  'fal-ai/flux-2-max': { per_image: 0.05, name: 'Flux 2 Max' },
  'fal-ai/flux-2-klein': { per_image: 0.01, name: 'Flux 2 Klein' },
  'fal-ai/gpt-image-1': { per_image: 0.04, name: 'GPT Image 1' },
  'fal-ai/topaz': { per_image: 0.03, name: 'Topaz Redefine' },
  'fal-ai/genfocus': { per_image: 0.02, name: 'GenFocus DOF' },
  
  // Gemini (per 1K tokens)
  'gemini-3-flash-preview': { per_1k_input: 0.0001, per_1k_output: 0.0004, name: 'Gemini 3 Flash' },
  'gemini-2.5-flash': { per_1k_input: 0.00015, per_1k_output: 0.0006, name: 'Gemini 2.5 Flash' },
  'gemini-2.5-pro': { per_1k_input: 0.00125, per_1k_output: 0.005, name: 'Gemini 2.5 Pro' },
};

/**
 * Calculate estimated cost based on pricing config
 */
function calculateCost(provider, model, inputTokens = 0, outputTokens = 0, imageCount = 0) {
  let cost = 0;
  
  if (provider === 'fal.ai' || provider === 'fal-ai') {
    const modelKey = model.startsWith('fal-ai/') ? model : `fal-ai/${model}`;
    const pricing = PRICING[modelKey];
    if (pricing && pricing.per_image && imageCount > 0) {
      cost = pricing.per_image * imageCount;
    }
  } else if (provider === 'gemini') {
    const pricing = PRICING[model];
    if (pricing && pricing.per_1k_input && pricing.per_1k_output) {
      const inputCost = (inputTokens / 1000) * pricing.per_1k_input;
      const outputCost = (outputTokens / 1000) * pricing.per_1k_output;
      cost = inputCost + outputCost;
    }
  }
  
  return Number(cost.toFixed(6)); // Keep precision for micro-costs
}

/**
 * Log an API call with cost tracking
 * @param {Object} params
 * @param {string} params.provider - 'fal.ai', 'gemini', 'openai'
 * @param {string} params.model - model name
 * @param {string} params.action - action type
 * @param {number} [params.projectId] - project ID
 * @param {number} [params.assetId] - asset ID
 * @param {number} [params.inputTokens] - for LLM calls
 * @param {number} [params.outputTokens] - for LLM calls
 * @param {number} [params.imageCount] - for generation calls
 * @param {number} [params.durationMs] - request duration
 * @param {Object} [params.requestMeta] - request metadata
 * @param {Object} [params.responseMeta] - response metadata
 * @param {string} [params.error] - error message if failed
 * @returns {Object} The log entry with calculated cost
 */
export function logApiCall(params) {
  const {
    provider,
    model,
    action,
    projectId,
    assetId,
    inputTokens = 0,
    outputTokens = 0,
    imageCount = 0,
    durationMs,
    requestMeta,
    responseMeta,
    error
  } = params;

  const estimatedCost = calculateCost(provider, model, inputTokens, outputTokens, imageCount);
  
  try {
    const result = db.prepare(`
      INSERT INTO api_cost_log (
        provider, model, action, project_id, asset_id, 
        input_tokens, output_tokens, image_count, duration_ms,
        estimated_cost_usd, request_meta, response_meta, error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      provider, model, action, projectId || null, assetId || null,
      inputTokens, outputTokens, imageCount, durationMs || null,
      estimatedCost,
      requestMeta ? JSON.stringify(requestMeta) : null,
      responseMeta ? JSON.stringify(responseMeta) : null,
      error || null
    );

    const entry = db.prepare('SELECT * FROM api_cost_log WHERE id = ?').get(result.lastInsertRowid);
    
    console.log(`[costs] ${provider}/${model} ${action} - $${estimatedCost.toFixed(4)} (${inputTokens + outputTokens}t, ${imageCount}img)`);
    
    return entry;
  } catch (err) {
    // Log asynchronously - don't let cost tracking break the main flow
    console.error('[costs] Failed to log API call:', err.message);
    return null;
  }
}

/**
 * Get the most recent log entry with cost
 */
export function getLastActionCost() {
  try {
    return db.prepare(`
      SELECT * FROM api_cost_log 
      WHERE error IS NULL
      ORDER BY timestamp DESC 
      LIMIT 1
    `).get();
  } catch (err) {
    console.error('[costs] Failed to get last action cost:', err.message);
    return null;
  }
}

/**
 * Get daily total costs
 * @param {string} [date] - YYYY-MM-DD format, defaults to today
 * @returns {Object} { total_cost, call_count, breakdown_by_action }
 */
export function getDailyTotal(date) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  try {
    const total = db.prepare(`
      SELECT 
        COALESCE(SUM(estimated_cost_usd), 0) as total_cost,
        COUNT(*) as call_count
      FROM api_cost_log 
      WHERE DATE(timestamp) = ? AND error IS NULL
    `).get(targetDate);

    const breakdown = db.prepare(`
      SELECT 
        action,
        COALESCE(SUM(estimated_cost_usd), 0) as cost,
        COUNT(*) as count
      FROM api_cost_log 
      WHERE DATE(timestamp) = ? AND error IS NULL
      GROUP BY action
      ORDER BY cost DESC
    `).all(targetDate);

    return {
      total_cost: Number(total.total_cost.toFixed(4)),
      call_count: total.call_count,
      breakdown_by_action: breakdown.map(row => ({
        action: row.action,
        cost: Number(row.cost.toFixed(4)),
        count: row.count
      }))
    };
  } catch (err) {
    console.error('[costs] Failed to get daily total:', err.message);
    return { total_cost: 0, call_count: 0, breakdown_by_action: [] };
  }
}

/**
 * Get project total costs
 * @param {number} projectId
 * @returns {Object} { total_cost, call_count, breakdown_by_action, breakdown_by_model }
 */
export function getProjectTotal(projectId) {
  try {
    const total = db.prepare(`
      SELECT 
        COALESCE(SUM(estimated_cost_usd), 0) as total_cost,
        COUNT(*) as call_count
      FROM api_cost_log 
      WHERE project_id = ? AND error IS NULL
    `).get(projectId);

    const actionBreakdown = db.prepare(`
      SELECT 
        action,
        COALESCE(SUM(estimated_cost_usd), 0) as cost,
        COUNT(*) as count
      FROM api_cost_log 
      WHERE project_id = ? AND error IS NULL
      GROUP BY action
      ORDER BY cost DESC
    `).all(projectId);

    const modelBreakdown = db.prepare(`
      SELECT 
        model,
        COALESCE(SUM(estimated_cost_usd), 0) as cost,
        COUNT(*) as count
      FROM api_cost_log 
      WHERE project_id = ? AND error IS NULL
      GROUP BY model
      ORDER BY cost DESC
    `).all(projectId);

    return {
      total_cost: Number(total.total_cost.toFixed(4)),
      call_count: total.call_count,
      breakdown_by_action: actionBreakdown.map(row => ({
        action: row.action,
        cost: Number(row.cost.toFixed(4)),
        count: row.count
      })),
      breakdown_by_model: modelBreakdown.map(row => ({
        model: row.model,
        cost: Number(row.cost.toFixed(4)),
        count: row.count
      }))
    };
  } catch (err) {
    console.error('[costs] Failed to get project total:', err.message);
    return { total_cost: 0, call_count: 0, breakdown_by_action: [], breakdown_by_model: [] };
  }
}

/**
 * Get cost summary for UI header
 * @returns {Object} { last_action, daily_total, project_totals }
 */
export function getCostSummary() {
  try {
    const lastAction = getLastActionCost();
    const dailyTotal = getDailyTotal();

    // Get all projects with costs
    const projectTotals = db.prepare(`
      SELECT 
        project_id,
        COALESCE(SUM(estimated_cost_usd), 0) as total_cost,
        COUNT(*) as call_count
      FROM api_cost_log 
      WHERE project_id IS NOT NULL AND error IS NULL
      GROUP BY project_id
      HAVING total_cost > 0
      ORDER BY total_cost DESC
    `).all().map(row => ({
      project_id: row.project_id,
      total_cost: Number(row.total_cost.toFixed(4)),
      call_count: row.call_count
    }));

    return {
      last_action: lastAction ? {
        cost: Number(lastAction.estimated_cost_usd.toFixed(4)),
        action: lastAction.action,
        model: lastAction.model,
        timestamp: lastAction.timestamp
      } : null,
      daily_total: dailyTotal,
      project_totals: projectTotals
    };
  } catch (err) {
    console.error('[costs] Failed to get cost summary:', err.message);
    return {
      last_action: null,
      daily_total: { total_cost: 0, call_count: 0, breakdown_by_action: [] },
      project_totals: []
    };
  }
}

/**
 * Get flexible cost report for analysis
 * @param {Object} options
 * @param {string} [options.from] - start date YYYY-MM-DD
 * @param {string} [options.to] - end date YYYY-MM-DD
 * @param {string} [options.groupBy] - 'day' | 'action' | 'model' | 'provider' | 'project'
 * @returns {Array} Report data
 */
export function getCostReport(options = {}) {
  const { from, to, groupBy = 'day' } = options;
  
  let whereClause = 'WHERE error IS NULL';
  const params = [];
  
  if (from) {
    whereClause += ' AND DATE(timestamp) >= ?';
    params.push(from);
  }
  
  if (to) {
    whereClause += ' AND DATE(timestamp) <= ?';
    params.push(to);
  }

  let groupField;
  switch (groupBy) {
    case 'day':
      groupField = 'DATE(timestamp)';
      break;
    case 'action':
      groupField = 'action';
      break;
    case 'model':
      groupField = 'model';
      break;
    case 'provider':
      groupField = 'provider';
      break;
    case 'project':
      groupField = 'project_id';
      break;
    default:
      groupField = 'DATE(timestamp)';
  }

  try {
    const query = `
      SELECT 
        ${groupField} as group_key,
        COALESCE(SUM(estimated_cost_usd), 0) as total_cost,
        COUNT(*) as call_count,
        AVG(estimated_cost_usd) as avg_cost
      FROM api_cost_log 
      ${whereClause}
      GROUP BY ${groupField}
      ORDER BY total_cost DESC
    `;

    const results = db.prepare(query).all(...params);

    return results.map(row => ({
      group: row.group_key,
      total_cost: Number(row.total_cost.toFixed(4)),
      call_count: row.call_count,
      avg_cost: Number(row.avg_cost.toFixed(6))
    }));
  } catch (err) {
    console.error('[costs] Failed to get cost report:', err.message);
    return [];
  }
}

/**
 * Get raw log data with filtering and pagination
 * @param {Object} options
 * @param {string} [options.from] - start date
 * @param {string} [options.to] - end date
 * @param {number} [options.limit] - page size
 * @param {number} [options.offset] - offset
 * @param {string} [options.action] - filter by action
 * @param {string} [options.model] - filter by model
 * @param {number} [options.projectId] - filter by project
 * @returns {Array} Raw log entries
 */
export function getRawLog(options = {}) {
  const { from, to, limit = 100, offset = 0, action, model, projectId } = options;
  
  let whereClause = 'WHERE 1=1';
  const params = [];
  
  if (from) {
    whereClause += ' AND DATE(timestamp) >= ?';
    params.push(from);
  }
  
  if (to) {
    whereClause += ' AND DATE(timestamp) <= ?';
    params.push(to);
  }
  
  if (action) {
    whereClause += ' AND action = ?';
    params.push(action);
  }
  
  if (model) {
    whereClause += ' AND model = ?';
    params.push(model);
  }
  
  if (projectId) {
    whereClause += ' AND project_id = ?';
    params.push(projectId);
  }

  try {
    const query = `
      SELECT * FROM api_cost_log 
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;

    return db.prepare(query).all(...params, limit, offset);
  } catch (err) {
    console.error('[costs] Failed to get raw log:', err.message);
    return [];
  }
}

/**
 * Export cost data as CSV string
 * @param {Object} options
 * @param {string} [options.from] - start date
 * @param {string} [options.to] - end date
 * @returns {string} CSV data
 */
export function exportCsv(options = {}) {
  const data = getRawLog({ ...options, limit: 10000, offset: 0 });
  
  if (data.length === 0) {
    return 'timestamp,provider,model,action,project_id,asset_id,input_tokens,output_tokens,image_count,duration_ms,estimated_cost_usd,error\n';
  }
  
  const headers = [
    'timestamp', 'provider', 'model', 'action', 'project_id', 'asset_id',
    'input_tokens', 'output_tokens', 'image_count', 'duration_ms', 'estimated_cost_usd', 'error'
  ];
  
  let csv = headers.join(',') + '\n';
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv += values.join(',') + '\n';
  }
  
  return csv;
}