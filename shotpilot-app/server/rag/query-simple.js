import { db } from '../database.js';

/**
 * Generic knowledge base query with full-text search
 * @param {string} text - Query text
 * @param {Object} filters - Optional metadata filters
 * @param {number} limit - Maximum number of results (default: 10)
 * @returns {Array} Array of {text, metadata, score} objects
 */
function queryKB(text, filters = {}, limit = 10) {
  try {
    // Use simple LIKE search for reliability
    return fallbackQuery(text, filters, limit);
  } catch (error) {
    console.error('Query error:', error);
    return [];
  }
}

/**
 * Fallback query using LIKE when FTS fails
 */
function fallbackQuery(text, filters = {}, limit = 10) {
  let whereClause = 'WHERE (text LIKE ? OR header LIKE ?)';
  let params = [`%${text}%`, `%${text}%`];
  
  if (filters.model) {
    whereClause += ` AND model = ?`;
    params.push(filters.model);
  }
  
  if (filters.category) {
    if (Array.isArray(filters.category)) {
      whereClause += ` AND category IN (${filters.category.map(() => '?').join(',')})`;
      params.push(...filters.category);
    } else {
      whereClause += ` AND category = ?`;
      params.push(filters.category);
    }
  }
  
  if (filters.type) {
    whereClause += ` AND type = ?`;
    params.push(filters.type);
  }
  
  const query = `
    SELECT text, source_file, model, category, type, header, chunk_index, tokens
    FROM rag_chunks
    ${whereClause}
    ORDER BY 
      CASE 
        WHEN header LIKE ? THEN 1 
        WHEN text LIKE ? THEN 2 
        ELSE 3 
      END,
      LENGTH(text)
    LIMIT ?
  `;
  
  // Build final params array: original params + ordering params + limit
  const allParams = [...params, `%${text}%`, `%${text}%`, limit];
  
  const results = db.prepare(query).all(...allParams);
  
  return results.map(row => ({
    text: row.text,
    metadata: {
      source_file: row.source_file,
      model: row.model,
      category: row.category,
      type: row.type,
      header: row.header,
      chunk_index: row.chunk_index,
      tokens: row.tokens
    },
    score: 0.5 // Default score for LIKE search
  }));
}

/**
 * Get chunks for a specific model
 * @param {string} modelId - Model identifier (e.g., "flux_2", "kling_2_6")
 * @param {Array} categories - Optional array of categories to filter by
 * @param {number} limit - Maximum number of results (default: 20)
 * @returns {Array} Array of {text, metadata, score} objects
 */
function queryForModel(modelId, categories = [], limit = 20) {
  let whereClause = 'WHERE model = ?';
  let params = [modelId];
  
  if (categories && categories.length > 0) {
    whereClause += ` AND category IN (${categories.map(() => '?').join(',')})`;
    params.push(...categories);
  }
  
  params.push(limit);
  
  const query = `
    SELECT text, source_file, model, category, type, header, chunk_index, tokens
    FROM rag_chunks
    ${whereClause}
    ORDER BY chunk_index
    LIMIT ?
  `;
  
  const results = db.prepare(query).all(...params);
  
  return results.map(row => ({
    text: row.text,
    metadata: {
      source_file: row.source_file,
      model: row.model,
      category: row.category,
      type: row.type,
      header: row.header,
      chunk_index: row.chunk_index,
      tokens: row.tokens
    },
    score: 1.0 // No semantic scoring for direct model queries
  }));
}

/**
 * Get style-relevant chunks for a project
 * @param {string} projectStyle - Style description (e.g., "cinematic", "documentary", "commercial")
 * @param {number} limit - Maximum number of results (default: 15)
 * @returns {Array} Array of {text, metadata, score} objects
 */
function queryForStyle(projectStyle, limit = 15) {
  // Expand style query with related terms
  const styleQueries = {
    'cinematic': 'cinematic film stock color grading camera movement depth of field',
    'documentary': 'documentary natural lighting handheld realistic authentic',
    'commercial': 'commercial brand clean polished product photography',
    'portrait': 'portrait headshot beauty skin lighting makeup',
    'landscape': 'landscape environment wide shot establishing atmosphere',
    'action': 'action dynamic movement motion blur fast paced',
    'horror': 'horror dark shadows mood lighting atmospheric tension',
    'sci-fi': 'science fiction futuristic technology cyberpunk neon'
  };
  
  const queryText = styleQueries[projectStyle.toLowerCase()] || projectStyle;
  
  // Search with preference for style and pack categories
  return queryKB(queryText, {
    category: ['style', 'pack', 'principles']
  }, limit);
}

/**
 * Get collection statistics
 * @returns {Object} Stats about the knowledge base
 */
function getStats() {
  try {
    // Get total chunks
    const totalChunks = db.prepare('SELECT COUNT(*) as count FROM rag_chunks').get().count;
    
    if (totalChunks === 0) {
      return { totalChunks: 0, models: [], categories: [] };
    }
    
    // Get model counts
    const modelResults = db.prepare(`
      SELECT model, COUNT(*) as count 
      FROM rag_chunks 
      GROUP BY model 
      ORDER BY count DESC
    `).all();
    
    // Get category counts
    const categoryResults = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM rag_chunks 
      GROUP BY category 
      ORDER BY count DESC
    `).all();
    
    const modelCounts = {};
    const categoryCounts = {};
    
    modelResults.forEach(row => {
      modelCounts[row.model] = row.count;
    });
    
    categoryResults.forEach(row => {
      categoryCounts[row.category] = row.count;
    });
    
    return {
      totalChunks,
      models: modelResults.map(row => row.model),
      categories: categoryResults.map(row => row.category),
      modelCounts,
      categoryCounts,
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Stats error:', error);
    throw error;
  }
}

export {
  queryKB,
  queryForModel,
  queryForStyle,
  getStats
};