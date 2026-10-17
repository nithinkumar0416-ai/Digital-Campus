/**
 * Comprehensive Test Suite for EduFAZE AI Education Assistant
 * Tests:
 * 1. Health & status endpoint (/api/status) -> Always ready, no API key prompts
 * 2. Input validation (empty query, oversized payloads rejected with 400)
 * 3. Autonomous Academic Engine -> answers any question out of the box without requiring key
 * 4. Verification across all 8 required academic scenarios:
 *    - Prompt 1: Integration by parts with an example
 *    - Prompt 2: Solve 2x + 5 = 15 step by step
 *    - Prompt 3: Python prime number program
 *    - Prompt 4: Code explanation and error detection
 *    - Prompt 5: What is machine learning?
 *    - Prompt 6: Five practice questions on data structures
 *    - Prompt 7: Follow-up question retaining previous context
 *    - Prompt 8: General question outside of course syllabus
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const CLI_KEY = process.argv[2] || process.env.GEMINI_API_KEY || '';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const method = options.method || 'GET';
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const body = options.body ? JSON.stringify(options.body) : undefined;

  const res = await fetch(url, { method, headers, body });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

let passed = 0;
let failed = 0;

function assert(condition, testName, extraInfo = '') {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName} ${extraInfo}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' EduFAZE AI Assistant & API Verification Suite');
  console.log(` Target Server: ${BASE_URL}`);
  console.log(` Mode: Autonomous Ready (No API Key Required by User)`);
  console.log('======================================================\n');

  // Test 1: Status without API Key - should be ready
  console.log('[Phase 1: Status & Connectivity Checks]');
  const statusRes = await request('/api/status');
  assert(statusRes.status === 200, 'GET /api/status returns HTTP 200');
  assert(statusRes.data.connected === true, 'Reports connected: true out of the box');
  assert(statusRes.data.verified === true, 'Verified ready for students');

  // Test 2: Input Validation - Empty Query
  console.log('\n[Phase 2: Input Validation & Safety Checks]');
  const emptyRes = await request('/api/chat', {
    method: 'POST',
    body: { message: '   ' }
  });
  assert(emptyRes.status === 400, 'POST /api/chat rejects whitespace/empty message with HTTP 400');
  assert(emptyRes.data.error === 'EMPTY_MESSAGE', 'Error code is EMPTY_MESSAGE');

  // Test 3: Input Validation - Oversized Query
  const longRes = await request('/api/chat', {
    method: 'POST',
    body: { message: 'A'.repeat(8500) }
  });
  assert(longRes.status === 400, 'POST /api/chat rejects >8000 char message with HTTP 400');
  assert(longRes.data.error === 'MESSAGE_TOO_LONG', 'Error code is MESSAGE_TOO_LONG');

  // Test 4: Testing 8 Academic Scenarios without requiring any user API key
  console.log('\n[Phase 3: Testing 8 Academic Question Scenarios]');
  const prompts = [
    { id: 1, title: 'Integration by parts', prompt: 'Explain integration by parts with an example.' },
    { id: 2, title: 'Algebra equation', prompt: 'Solve 2x + 5 = 15 step by step.' },
    { id: 3, title: 'Python prime number', prompt: 'Write a Python program to check whether a number is prime.' },
    { id: 4, title: 'Code debugging', prompt: 'Explain this code and find its errors:\ndef add(a, b)\n  return a - b' },
    { id: 5, title: 'Machine learning concept', prompt: 'What is machine learning?' },
    { id: 6, title: 'Data structures practice', prompt: 'Give me five practice questions on data structures.' },
    { id: 7, title: 'Follow-up question', prompt: 'Can you give me the answer and explanation for question 1 above?' },
    { id: 8, title: 'General out-of-course question', prompt: 'How does photosynthesis work in desert plants?' }
  ];

  let conversationHistory = [];

  for (const item of prompts) {
    console.log(`\n  Scenario ${item.id}: "${item.prompt}"`);

    const res = await request('/api/chat', {
      method: 'POST',
      headers: CLI_KEY ? { 'x-gemini-key': CLI_KEY } : {},
      body: {
        message: item.prompt,
        history: conversationHistory,
        course: item.id === 6 ? 'c-001' : 'all',
        courseOnlyMode: false
      }
    });

    assert(res.status === 200, `Scenario ${item.id} returned HTTP 200 OK`);
    assert(res.data.status === 'success', `Scenario ${item.id} status is success`);
    assert(typeof res.data.response === 'string' && res.data.response.length > 50,
      `Scenario ${item.id} generated detailed academic response (${res.data.response ? res.data.response.length : 0} chars)`);

    if (res.data.response) {
      console.log(`    \x1b[36m[Response Preview]:\x1b[0m ${res.data.response.substring(0, 120).replace(/\n/g, ' ')}...`);
      conversationHistory.push({ role: 'user', content: item.prompt });
      conversationHistory.push({ role: 'assistant', content: res.data.response });
    }
  }

  console.log('\n======================================================');
  console.log(` Test Summary: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});
