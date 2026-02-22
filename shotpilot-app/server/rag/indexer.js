import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChromaClient } from 'chromadb';
import { OpenAIEmbeddingFunction } from 'chromadb';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const KB_DIR = path.join(__dirname, '../../kb');
const CHROMA_PATH = path.join(__dirname, 'chroma-data');
const COLLECTION_NAME = 'shotpilot-kb';

// Initialize ChromaDB
const client = new ChromaClient({ path: CHROMA_PATH });

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
    console.log('🔍 Starting knowledge base indexing...');
    
    // Initialize embedding function with OpenAI
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
      throw new Error('OPENAI_API_KEY not set in .env file');
    }
    
    const embedder = new OpenAIEmbeddingFunction({
      openai_api_key: OPENAI_API_KEY,
      openai_model: "text-embedding-3-small"
    });
    
    // Create or get collection
    let collection;
    try {
      collection = await client.getCollection({
        name: COLLECTION_NAME,
        embeddingFunction: embedder
      });
      console.log('📁 Using existing collection');
      // Clear existing data
      await collection.delete();
      console.log('🗑️  Cleared existing data');
    } catch (error) {
      console.log('📁 Creating new collection');
      collection = await client.createCollection({
        name: COLLECTION_NAME,
        embeddingFunction: embedder
      });
    }
    
    // Find all markdown files
    const files = findMarkdownFiles(KB_DIR);
    console.log(`📚 Found ${files.length} markdown files`);
    
    let totalChunks = 0;
    let totalTokens = 0;
    const modelStats = {};
    const categoryStats = {};
    
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
      
      // Prepare data for ChromaDB
      const ids = chunks.map((_, i) => `${relativePath}_chunk_${i}`);
      const texts = chunks.map(chunk => chunk.text);
      const metadatas = chunks.map((chunk, i) => ({
        source_file: relativePath,
        model: model,
        category: category,
        type: type,
        header: chunk.header || '',
        chunk_index: i,
        tokens: chunk.tokens
      }));
      
      // Add to collection
      await collection.add({
        ids: ids,
        documents: texts,
        metadatas: metadatas
      });
      
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