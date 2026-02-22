import { app } from './server/index.js';
import fetch from 'node-fetch';

const PORT = 3001; // Use different port to avoid conflicts

// Start server on different port
const server = app.listen(PORT, '127.0.0.1', async () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  
  try {
    console.log('\n🧪 Testing RAG API endpoints...\n');
    
    // Test 1: Status endpoint
    console.log('📊 Testing GET /api/v2/rag/status...');
    const statusResponse = await fetch(`http://localhost:${PORT}/api/v2/rag/status`);
    const statusData = await statusResponse.json();
    console.log(`   Status: ${statusData.success ? '✅' : '❌'}`);
    console.log(`   Chunks: ${statusData.data?.chunkCount}`);
    console.log(`   Models: ${statusData.data?.modelCount}`);
    
    // Test 2: Query endpoint
    console.log('\n🔍 Testing POST /api/v2/rag/query...');
    const queryResponse = await fetch(`http://localhost:${PORT}/api/v2/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: "Flux 2 prompt syntax",
        model: "flux_2",
        limit: 3
      })
    });
    const queryData = await queryResponse.json();
    console.log(`   Status: ${queryData.success ? '✅' : '❌'}`);
    console.log(`   Results: ${queryData.data?.resultCount}`);
    if (queryData.data?.results?.[0]) {
      console.log(`   First result: ${queryData.data.results[0].metadata.source_file}`);
    }
    
    // Test 3: Model query endpoint
    console.log('\n🤖 Testing POST /api/v2/rag/query/model...');
    const modelResponse = await fetch(`http://localhost:${PORT}/api/v2/rag/query/model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "flux_2",
        categories: ["syntax"],
        limit: 2
      })
    });
    const modelData = await modelResponse.json();
    console.log(`   Status: ${modelData.success ? '✅' : '❌'}`);
    console.log(`   Results: ${modelData.data?.resultCount}`);
    
    // Test 4: Style query endpoint
    console.log('\n🎨 Testing POST /api/v2/rag/query/style...');
    const styleResponse = await fetch(`http://localhost:${PORT}/api/v2/rag/query/style`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        style: "cinematic",
        limit: 2
      })
    });
    const styleData = await styleResponse.json();
    console.log(`   Status: ${styleData.success ? '✅' : '❌'}`);
    console.log(`   Results: ${styleData.data?.resultCount}`);
    
    console.log('\n🎉 All API tests completed!');
    
  } catch (error) {
    console.error('❌ API test error:', error.message);
  } finally {
    // Close server
    server.close(() => {
      console.log('\n🛑 Test server stopped');
      process.exit(0);
    });
  }
});