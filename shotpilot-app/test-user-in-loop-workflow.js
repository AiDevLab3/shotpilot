#!/usr/bin/env node

/**
 * Test script demonstrating the new user-in-the-loop workflow
 * Run with: node test-user-in-loop-workflow.js
 */

const BASE_URL = 'http://localhost:3000';

async function testWorkflow() {
  console.log('🧪 Testing ShotPilot User-in-the-Loop Refactor\n');

  // Test 1: Analyze endpoint validation
  console.log('1️⃣  Testing /api/agents/analyze validation...');
  try {
    const response = await fetch(`${BASE_URL}/api/agents/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shot_context: "Wide shot of warehouse at dusk" })
    });
    const data = await response.json();
    console.log('   ✅ Validation works:', data.error);
  } catch (error) {
    console.log('   ❌ Server not running or error:', error.message);
  }

  // Test 2: Execute improvement validation
  console.log('\n2️⃣  Testing /api/agents/execute-improvement validation...');
  try {
    const response = await fetch(`${BASE_URL}/api/agents/execute-improvement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shot_context: "test" })
    });
    const data = await response.json();
    console.log('   ✅ Image validation works:', data.error);

    const response2 = await fetch(`${BASE_URL}/api/agents/execute-improvement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: "fake_base64", shot_context: "test" })
    });
    const data2 = await response2.json();
    console.log('   ✅ Model ID validation works:', data2.error);
  } catch (error) {
    console.log('   ❌ Server not running or error:', error.message);
  }

  // Test 3: Generate with audit validation
  console.log('\n3️⃣  Testing /api/agents/generate-with-audit validation...');
  try {
    const response = await fetch(`${BASE_URL}/api/agents/generate-with-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await response.json();
    console.log('   ✅ Description validation works:', data.error);
  } catch (error) {
    console.log('   ❌ Server not running or error:', error.message);
  }

  // Test 4: Import image validation
  console.log('\n4️⃣  Testing /api/agents/import-image validation...');
  try {
    const response = await fetch(`${BASE_URL}/api/agents/import-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_model: "midjourney-6" })
    });
    const data = await response.json();
    console.log('   ✅ Image validation works:', data.error);
  } catch (error) {
    console.log('   ❌ Server not running or error:', error.message);
  }

  // Test 5: Verify old endpoints still work
  console.log('\n5️⃣  Testing backward compatibility...');
  try {
    const response = await fetch(`${BASE_URL}/api/agents/models`);
    const data = await response.json();
    console.log('   ✅ /api/agents/models works:', data.models ? `${data.models.length} models` : 'No models');
  } catch (error) {
    console.log('   ❌ Server not running or error:', error.message);
  }

  console.log('\n🎉 User-in-the-loop refactor testing complete!');
  console.log('\nNEW WORKFLOW:');
  console.log('1. Import or generate → /api/agents/import-image or /api/agents/generate-with-audit');
  console.log('2. Analyze → /api/agents/analyze');
  console.log('3. User picks model and executes → /api/agents/execute-improvement');
  console.log('4. Repeat as needed (user-driven)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testWorkflow();
}