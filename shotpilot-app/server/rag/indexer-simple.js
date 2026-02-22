import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const KB_DIR = path.join(__dirname, '../../kb');

// Initialize SQLite table for RAG chunks
function initRAGTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rag_chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chunk_id TEXT UNIQUE,
      text TEXT NOT NULL,
      source_file TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      header TEXT,
      chunk_index INTEGER,
      tokens INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create FTS5 table for full-text search
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS rag_chunks_fts USING fts5(
      chunk_id,
      text,
      source_file,
      model,
      category,
      type,
      header,
      content=rag_chunks,
      content_rowid=id
    )
  `);
  
  // Trigger to keep FTS table in sync
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS rag_chunks_ai AFTER INSERT ON rag_chunks BEGIN
      INSERT INTO rag_chunks_fts(rowid, chunk_id, text, source_file, model, category, type, header)
      VALUES (NEW.id, NEW.chunk_id, NEW.text, NEW.source_file, NEW.model, NEW.category, NEW.type, NEW.header);
    END;
  `);
  
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS rag_chunks_ad AFTER DELETE ON rag_chunks BEGIN
      INSERT INTO rag_chunks_fts(rag_chunks_fts, rowid, chunk_id, text, source_file, model, category, type, header)
      VALUES('delete', OLD.id, OLD.chunk_id, OLD.text, OLD.source_file, OLD.model, OLD.category, OLD.type, OLD.header);
    END;
  `);
}

// Utility function to estimate tokens (rough approximation: 1 token ≈ 4 characters)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Extract model from filename
function extractModelFromFilename(filename) {
  // Handle both formats: "02_Model_Flux_2.md" and "flux_2/Prompting_Mastery.md"
  if (filename.includes('/')) {
    const modelDir = filename.split('/')[filename.split('/').length - 2];
    return modelDir.replace(/_/g, '_');
  }
  
  const match = filename.match(/02_Model_(.+)\.md$/);
  if (match) {
    return match[1].toLowerCase().replace(/_/g, '_');
  }
  
  return 'general';
}

// Extract category from filename and content
function extractCategory(filename, content) {
  const lower = filename.toLowerCase();
  
  if (lower.includes('core_') || lower.includes('principles')) return 'principles';
  if (lower.includes('pack_')) return 'pack';
  if (lower.includes('translation')) return 'translation';
  if (lower.includes('model_')) {
    // Determine sub-category from content
    const contentLower = content.toLowerCase();
    if (contentLower.includes('syntax') || contentLower.includes('prompt structure')) return 'syntax';
    if (contentLower.includes('avoid') || contentLower.includes('common issues') || contentLower.includes('troubleshoot')) return 'failures';
    if (contentLower.includes('tip') || contentLower.includes('best practice')) return 'tips';
    if (contentLower.includes('style') || contentLower.includes('aesthetic')) return 'style';
    return 'syntax'; // default for model files
  }
  
  return 'principles'; // default
}

// Extract type from filename and content
function extractType(filename, content) {
  const lower = filename.toLowerCase();
  const contentLower = content.toLowerCase();
  
  if (lower.includes('pack_')) return 'pack';
  if (lower.includes('core_') || lower.includes('translation')) return 'core';
  if (lower.includes('model_')) {
    if (contentLower.includes('video') || contentLower.includes('motion') || contentLower.includes('animation')) {
      return 'video_model';
    }
    if (contentLower.includes('image') || contentLower.includes('photo') || contentLower.includes('picture')) {
      return 'image_model';
    }
    // Check if utility-focused
    if (contentLower.includes('upscale') || contentLower.includes('edit') || contentLower.includes('enhance')) {
      return 'utility';
    }
    return 'image_model'; // default for models
  }
  
  return 'core';
}

// Chunk text by markdown headers
function chunkByHeaders(content, sourceFile) {
  const lines = content.split('\n');
  const chunks = [];
  let currentChunk = '';
  let currentHeader = '';
  let inFrontmatter = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip frontmatter
    if (line.trim() === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (inFrontmatter) continue;
    
    // Check for headers (## or ###)
    const headerMatch = line.match(/^(#{2,3})\s+(.+)/);
    
    if (headerMatch) {
      // Save previous chunk if it has content
      if (currentChunk.trim() && estimateTokens(currentChunk) > 50) {
        chunks.push({
          text: currentChunk.trim(),
          header: currentHeader,
          tokens: estimateTokens(currentChunk)
        });
      }
      
      // Start new chunk
      currentHeader = headerMatch[2];
      currentChunk = line + '\n';
    } else {
      currentChunk += line + '\n';
    }
    
    // If current chunk is getting too long (~500 tokens), split it
    if (estimateTokens(currentChunk) > 600) {
      chunks.push({
        text: currentChunk.trim(),
        header: currentHeader,
        tokens: estimateTokens(currentChunk)
      });
      currentChunk = '';
    }
  }
  
  // Add final chunk
  if (currentChunk.trim() && estimateTokens(currentChunk) > 50) {
    chunks.push({
      text: currentChunk.trim(),
      header: currentHeader,
      tokens: estimateTokens(currentChunk)
    });
  }
  
  return chunks;
}

// Find all markdown files recursively
function findMarkdownFiles(dir) {
  let files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main indexing function
async function indexKnowledgeBase() {
  try {
    console.log('🔍 Starting knowledge base indexing (SQLite FTS)...');
    
    // Initialize RAG table
    initRAGTable();
    
    // Clear existing data
    db.exec('DELETE FROM rag_chunks');
    console.log('🗑️  Cleared existing data');
    
    // Find all markdown files
    const files = findMarkdownFiles(KB_DIR);
    console.log(`📚 Found ${files.length} markdown files`);
    
    let totalChunks = 0;
    let totalTokens = 0;
    const modelStats = {};
    const categoryStats = {};
    
    const insertStmt = db.prepare(`
      INSERT INTO rag_chunks (chunk_id, text, source_file, model, category, type, header, chunk_index, tokens)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Process each file
    for (const filePath of files) {
      const relativePath = path.relative(KB_DIR, filePath);
      console.log(`📖 Processing: ${relativePath}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const chunks = chunkByHeaders(content, relativePath);
      
      if (chunks.length === 0) continue;
      
      // Extract metadata
      const model = extractModelFromFilename(relativePath);
      const category = extractCategory(relativePath, content);
      const type = extractType(relativePath, content);
      
      // Track stats
      modelStats[model] = (modelStats[model] || 0) + chunks.length;
      categoryStats[category] = (categoryStats[category] || 0) + chunks.length;
      
      // Insert chunks
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkId = `${relativePath}_chunk_${i}`;
        
        insertStmt.run(
          chunkId,
          chunk.text,
          relativePath,
          model,
          category,
          type,
          chunk.header || '',
          i,
          chunk.tokens
        );
      }
      
      totalChunks += chunks.length;
      totalTokens += chunks.reduce((sum, chunk) => sum + chunk.tokens, 0);
    }
    
    console.log('\n✅ Indexing complete!');
    console.log(`📊 Stats:`);
    console.log(`   Total chunks: ${totalChunks}`);
    console.log(`   Estimated tokens: ${totalTokens.toLocaleString()}`);
    console.log(`   Average tokens per chunk: ${Math.round(totalTokens / totalChunks)}`);
    
    console.log(`\n🤖 Chunks per model:`);
    Object.entries(modelStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([model, count]) => {
        console.log(`   ${model}: ${count} chunks`);
      });
    
    console.log(`\n📂 Chunks per category:`);
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} chunks`);
      });
    
    return {
      totalChunks,
      totalTokens,
      modelStats,
      categoryStats,
      indexedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error during indexing:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  indexKnowledgeBase()
    .then(() => {
      console.log('🎉 Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed:', error);
      process.exit(1);
    });
}

export { indexKnowledgeBase };