import path from 'path';
import { fileURLToPath } from 'url';
import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddingFunction } from 'chromadb';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CHROMA_PATH = path.join(__dirname, 'chroma-data');
const COLLECTION_NAME = 'shotpilot-kb';

// Initialize ChromaDB client
const client = new ChromaClient({ path: CHROMA_PATH });

// Initialize OpenAI embedder
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.warn('Warning: OPENAI_API_KEY not properly set in .env file');
}

const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: OPENAI_API_KEY,
  openai_model: "text-embedding-3-small"
});

// Cache for collection
let cachedCollection = null;

// Get collection instance
async function getCollection() {
  if (!cachedCollection) {
    try {
      cachedCollection = await client.getCollection({
        name: COLLECTION_NAME,
        embeddingFunction: embedder
      });
    } catch (error) {
      throw new Error(`Knowledge base not indexed yet. Run 'node server/rag/indexer.js' first.`);
    }
  }
  return cachedCollection;
}

/**
 * Generic knowledge base query with semantic search
 * @param {string} text - Query text
 * @param {Object} filters - Optional metadata filters (ChromaDB where clause)
 * @param {number} limit - Maximum number of results (default: 10)
 * @returns {Array} Array of {text, metadata, score} objects
 */
async function queryKB(text, filters = {}, limit = 10) {
  try {
    const collection = await getCollection();
    
    // Build where clause from filters
    let whereClause = {};
    if (Object.keys(filters).length > 0) {
      whereClause = filters;
    }
    
    const results = await collection.query({
      queryTexts: [text],
      nResults: limit,
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined
    });
    
    // Format results
    if (!results.documents || !results.documents[0]) {
      return [];
    }
    
    return results.documents[0].map((doc, i) => ({
      text: doc,
      metadata: results.metadatas[0][i],
      score: results.distances ? (1 - results.distances[0][i]) : 1.0 // Convert distance to similarity score
    }));
    
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * Get chunks for a specific model
 * @param {string} modelId - Model identifier (e.g., "flux_2", "kling_2_6")
 * @param {Array} categories - Optional array of categories to filter by
 * @param {number} limit - Maximum number of results (default: 20)
 * @returns {Array} Array of {text, metadata, score} objects
 */
async function queryForModel(modelId, categories = [], limit = 20) {
  try {
    const collection = await getCollection();
    
    // Build where clause
    let whereClause = { model: { "$eq": modelId } };
    
    if (categories && categories.length > 0) {
      whereClause.category = { "$in": categories };
    }
    
    // Use a broad query or get all chunks for the model
    const results = await collection.get({
      where: whereClause,
      limit: limit
    });
    
    // Format results (no distance scores for get operations)
    if (!results.documents) {
      return [];
    }
    
    return results.documents.map((doc, i) => ({
      text: doc,
      metadata: results.metadatas[i],
      score: 1.0 // No semantic scoring for direct model queries
    }));
    
  } catch (error) {
    console.error('Model query error:', error);
    throw error;
  }
}

/**
 * Get style-relevant chunks for a project
 * @param {string} projectStyle - Style description (e.g., "cinematic", "documentary", "commercial")
 * @param {number} limit - Maximum number of results (default: 15)
 * @returns {Array} Array of {text, metadata, score} objects
 */
async function queryForStyle(projectStyle, limit = 15) {
  try {
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
    return await queryKB(queryText, {
      category: { "$in": ["style", "pack", "principles"] }
    }, limit);
    
  } catch (error) {
    console.error('Style query error:', error);
    throw error;
  }
}

/**
 * Get collection statistics
 * @returns {Object} Stats about the knowledge base
 */
async function getStats() {
  try {
    const collection = await getCollection();
    
    // Get all documents with metadata
    const results = await collection.get({
      include: ["metadatas"]
    });
    
    if (!results.metadatas) {
      return { totalChunks: 0, models: [], categories: [] };
    }
    
    // Count by model and category
    const modelCounts = {};
    const categoryCounts = {};
    
    results.metadatas.forEach(metadata => {
      const model = metadata.model || 'unknown';
      const category = metadata.category || 'unknown';
      
      modelCounts[model] = (modelCounts[model] || 0) + 1;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return {
      totalChunks: results.metadatas.length,
      models: Object.keys(modelCounts).sort(),
      categories: Object.keys(categoryCounts).sort(),
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