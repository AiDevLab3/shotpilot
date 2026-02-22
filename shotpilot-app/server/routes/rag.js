import express from 'express';
import { queryKB, queryForModel, queryForStyle, getStats } from '../rag/query-simple.js';
import { indexKnowledgeBase } from '../rag/indexer-simple.js';

const router = express.Router();

// GET /api/v2/rag/status - Get knowledge base status
router.get('/status', async (req, res) => {
  try {
    const stats = await getStats();
    
    res.json({
      success: true,
      data: {
        chunkCount: stats.totalChunks,
        modelCount: stats.models.length,
        models: stats.models,
        categories: stats.categories,
        modelCounts: stats.modelCounts,
        categoryCounts: stats.categoryCounts,
        lastIndexed: stats.lastUpdated,
        status: stats.totalChunks > 0 ? 'ready' : 'empty'
      }
    });
    
  } catch (error) {
    console.error('RAG status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get RAG status'
    });
  }
});

// POST /api/v2/rag/query - Query the knowledge base
router.post('/query', async (req, res) => {
  try {
    const { query, model, category, limit = 10 } = req.body;
    
    // Validate required fields
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query text is required and must be a string'
      });
    }
    
    // Build filters
    const filters = {};
    if (model) filters.model = model;
    if (category) {
      if (Array.isArray(category)) {
        filters.category = { "$in": category };
      } else {
        filters.category = category;
      }
    }
    
    // Validate limit
    const queryLimit = Math.min(Math.max(1, parseInt(limit) || 10), 50);
    
    // Execute query
    const results = await queryKB(query, filters, queryLimit);
    
    res.json({
      success: true,
      data: {
        query: query,
        filters: filters,
        limit: queryLimit,
        resultCount: results.length,
        results: results.map(result => ({
          text: result.text,
          metadata: result.metadata,
          score: Math.round(result.score * 100) / 100, // Round to 2 decimals
          relevance: result.score > 0.8 ? 'high' : result.score > 0.6 ? 'medium' : 'low'
        }))
      }
    });
    
  } catch (error) {
    console.error('RAG query error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Query failed'
    });
  }
});

// POST /api/v2/rag/query/model - Query for a specific model
router.post('/query/model', async (req, res) => {
  try {
    const { model, categories, limit = 20 } = req.body;
    
    if (!model || typeof model !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Model ID is required and must be a string'
      });
    }
    
    const queryLimit = Math.min(Math.max(1, parseInt(limit) || 20), 100);
    const results = await queryForModel(model, categories, queryLimit);
    
    res.json({
      success: true,
      data: {
        model: model,
        categories: categories || [],
        limit: queryLimit,
        resultCount: results.length,
        results: results.map(result => ({
          text: result.text,
          metadata: result.metadata,
          score: Math.round(result.score * 100) / 100
        }))
      }
    });
    
  } catch (error) {
    console.error('RAG model query error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Model query failed'
    });
  }
});

// POST /api/v2/rag/query/style - Query for style-relevant chunks
router.post('/query/style', async (req, res) => {
  try {
    const { style, limit = 15 } = req.body;
    
    if (!style || typeof style !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Style is required and must be a string'
      });
    }
    
    const queryLimit = Math.min(Math.max(1, parseInt(limit) || 15), 50);
    const results = await queryForStyle(style, queryLimit);
    
    res.json({
      success: true,
      data: {
        style: style,
        limit: queryLimit,
        resultCount: results.length,
        results: results.map(result => ({
          text: result.text,
          metadata: result.metadata,
          score: Math.round(result.score * 100) / 100,
          relevance: result.score > 0.8 ? 'high' : result.score > 0.6 ? 'medium' : 'low'
        }))
      }
    });
    
  } catch (error) {
    console.error('RAG style query error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Style query failed'
    });
  }
});

// POST /api/v2/rag/reindex - Re-index the knowledge base
router.post('/reindex', async (req, res) => {
  try {
    console.log('Starting knowledge base re-indexing...');
    const stats = await indexKnowledgeBase();
    
    res.json({
      success: true,
      data: {
        message: 'Knowledge base re-indexed successfully',
        stats: {
          totalChunks: stats.totalChunks,
          totalTokens: stats.totalTokens,
          averageTokensPerChunk: Math.round(stats.totalTokens / stats.totalChunks),
          modelStats: stats.modelStats,
          categoryStats: stats.categoryStats,
          indexedAt: stats.indexedAt
        }
      }
    });
    
  } catch (error) {
    console.error('RAG reindex error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Re-indexing failed'
    });
  }
});

export default router;