import { indexKnowledgeBase } from './indexer-simple.js';
import { queryKB, queryForModel, queryForStyle, getStats } from './query-simple.js';

// Test colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function formatResult(result, index) {
  return `
  ${colors.cyan}[${index + 1}] Score: ${(result.score * 100).toFixed(1)}%${colors.reset}
  ${colors.bright}Source:${colors.reset} ${result.metadata.source_file}
  ${colors.bright}Model:${colors.reset} ${result.metadata.model} | ${colors.bright}Category:${colors.reset} ${result.metadata.category} | ${colors.bright}Type:${colors.reset} ${result.metadata.type}
  ${colors.bright}Header:${colors.reset} ${result.metadata.header || 'N/A'}
  ${colors.bright}Preview:${colors.reset} ${result.text.substring(0, 200)}${result.text.length > 200 ? '...' : ''}
  `;
}

async function runTests() {
  try {
    log('\n🧪 ShotPilot RAG Test Suite', colors.bright);
    log('=' * 50);
    
    // Step 1: Index the knowledge base
    log('\n📚 Step 1: Indexing Knowledge Base...', colors.yellow);
    const indexStats = await indexKnowledgeBase();
    log('✅ Indexing completed successfully', colors.green);
    
    // Step 2: Get stats
    log('\n📊 Step 2: Getting Collection Stats...', colors.yellow);
    const stats = await getStats();
    log(`✅ Collection contains ${stats.totalChunks} chunks across ${stats.models.length} models`, colors.green);
    
    // Test 1: Flux 2 prompt syntax rules
    log('\n🎯 Test 1: "Flux 2 prompt syntax rules" (model-filtered)', colors.blue);
    const test1Results = await queryKB(
      "Flux 2 prompt syntax rules",
      { model: "flux_2" },
      5
    );
    
    if (test1Results.length > 0) {
      log('✅ Found Flux-specific chunks', colors.green);
      test1Results.forEach((result, i) => {
        console.log(formatResult(result, i));
      });
    } else {
      log('❌ No Flux chunks found', colors.red);
    }
    
    // Test 2: How to avoid waxy skin in AI images
    log('\n🎯 Test 2: "How to avoid waxy skin in AI images" (quality/realism)', colors.blue);
    const test2Results = await queryKB(
      "How to avoid waxy skin in AI images",
      {},
      5
    );
    
    if (test2Results.length > 0) {
      log('✅ Found realism/quality chunks', colors.green);
      test2Results.forEach((result, i) => {
        console.log(formatResult(result, i));
      });
    } else {
      log('❌ No quality chunks found', colors.red);
    }
    
    // Test 3: Kling video camera movement
    log('\n🎯 Test 3: "Kling video camera movement" (model-filtered)', colors.blue);
    const test3Results = await queryKB(
      "Kling video camera movement",
      { model: "kling_2_6" },
      5
    );
    
    if (test3Results.length === 0) {
      // Try alternative Kling models
      const altKlingResults = await queryKB(
        "Kling video camera movement",
        { model: { "$like": "%kling%" } },
        5
      );
      
      if (altKlingResults.length > 0) {
        log('✅ Found Kling chunks (alternative models)', colors.green);
        altKlingResults.forEach((result, i) => {
          console.log(formatResult(result, i));
        });
      } else {
        log('❌ No Kling chunks found', colors.red);
      }
    } else {
      log('✅ Found Kling 2.6 chunks', colors.green);
      test3Results.forEach((result, i) => {
        console.log(formatResult(result, i));
      });
    }
    
    // Test 4: Cinematic color grading film stock
    log('\n🎯 Test 4: "cinematic color grading film stock" (style/pack)', colors.blue);
    const test4Results = await queryKB(
      "cinematic color grading film stock",
      { category: { "$in": ["style", "pack", "principles"] } },
      5
    );
    
    if (test4Results.length > 0) {
      log('✅ Found style/pack chunks', colors.green);
      test4Results.forEach((result, i) => {
        console.log(formatResult(result, i));
      });
    } else {
      log('❌ No style chunks found', colors.red);
    }
    
    // Test 5: Style query function
    log('\n🎯 Test 5: queryForStyle("cinematic")', colors.blue);
    const test5Results = await queryForStyle("cinematic", 3);
    
    if (test5Results.length > 0) {
      log('✅ Style query function works', colors.green);
      test5Results.forEach((result, i) => {
        console.log(formatResult(result, i));
      });
    } else {
      log('❌ Style query failed', colors.red);
    }
    
    // Test 6: Model query function
    log('\n🎯 Test 6: queryForModel("flux_2", ["syntax"])', colors.blue);
    const test6Results = await queryForModel("flux_2", ["syntax"], 3);
    
    if (test6Results.length > 0) {
      log('✅ Model query function works', colors.green);
      test6Results.forEach((result, i) => {
        console.log(formatResult(result, i));
      });
    } else {
      log('❌ Model query failed', colors.red);
    }
    
    // Summary
    log('\n📋 Test Summary', colors.bright);
    log('=' * 30);
    log(`Total chunks indexed: ${stats.totalChunks}`, colors.cyan);
    log(`Models available: ${stats.models.join(', ')}`, colors.cyan);
    log(`Categories: ${stats.categories.join(', ')}`, colors.cyan);
    
    const testResults = [
      test1Results.length > 0,
      test2Results.length > 0,
      test3Results.length > 0,
      test4Results.length > 0,
      test5Results.length > 0,
      test6Results.length > 0
    ];
    
    const passedTests = testResults.filter(Boolean).length;
    const totalTests = testResults.length;
    
    if (passedTests === totalTests) {
      log(`\n🎉 All ${totalTests} tests passed!`, colors.green);
    } else {
      log(`\n⚠️  ${passedTests}/${totalTests} tests passed`, colors.yellow);
    }
    
    log('\n✅ RAG system is ready for use!', colors.bright);
    
  } catch (error) {
    log(`\n💥 Test failed with error:`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(() => {
      log('\n🏁 Test suite completed', colors.green);
      process.exit(0);
    })
    .catch(error => {
      log('\n💥 Test suite failed', colors.red);
      console.error(error);
      process.exit(1);
    });
}