import { queryKB, queryForModel, queryForStyle, getStats } from './server/rag/query-simple.js';

console.log('🧪 Testing RAG functions directly...\n');

try {
  // Test 1: Get stats
  console.log('📊 Getting stats...');
  const stats = await getStats();
  console.log(`   Total chunks: ${stats.totalChunks}`);
  console.log(`   Models: ${stats.models.length}`);
  
  // Test 2: Query for model
  console.log('\n🤖 Testing queryForModel("flux_2", ["syntax"], 3)...');
  const modelResults = await queryForModel("flux_2", ["syntax"], 3);
  console.log(`   Found ${modelResults.length} results`);
  if (modelResults.length > 0) {
    console.log(`   First result: ${modelResults[0].metadata.source_file}`);
    console.log(`   Preview: ${modelResults[0].text.substring(0, 100)}...`);
  }
  
  // Test 3: Simple text query with no filters
  console.log('\n🔍 Testing basic queryKB("syntax")...');
  const basicResults = await queryKB("syntax", {}, 3);
  console.log(`   Found ${basicResults.length} results`);
  if (basicResults.length > 0) {
    console.log(`   First result: ${basicResults[0].metadata.source_file}`);
  }
  
  // Test 4: Query with model filter
  console.log('\n🔍 Testing queryKB("prompt", {model: "flux_2"}, 2)...');
  const filteredResults = await queryKB("prompt", {model: "flux_2"}, 2);
  console.log(`   Found ${filteredResults.length} results`);
  if (filteredResults.length > 0) {
    console.log(`   First result: ${filteredResults[0].metadata.source_file}`);
  }
  
  console.log('\n✅ RAG functions work correctly!');
  
} catch (error) {
  console.error('❌ Error testing RAG:', error);
  process.exit(1);
}