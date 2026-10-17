/**
 * EduFAZE AI — Backend Chat API Endpoint
 * Handles live Google Gemini LLM inference for the AI Education Assistant.
 * Compatible with both Vercel Serverless Functions and local Node.js server.
 */

const fs = require('fs');
const path = require('path');

// Auto-load .env file if present in project root
(function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.substring(0, idx).trim();
          const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    } catch (e) {
      // Ignore env parsing error
    }
  }
})();

// In-memory rate limiter: max 30 requests per minute per IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

function checkRateLimit(ip) {
  const now = Date.now();
  let clientData = rateLimitMap.get(ip);
  if (!clientData || now - clientData.startTime > RATE_LIMIT_WINDOW_MS) {
    clientData = { startTime: now, count: 1 };
    rateLimitMap.set(ip, clientData);
    return true;
  }
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  clientData.count++;
  return true;
}

// Clean up stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Curriculum knowledge context for course grounding
const COURSE_CURRICULA = {
  'c-001': {
    name: 'Data Structures & Algorithms (CS201)',
    dept: 'Computer Science',
    chapters: [
      'Chapter 1: Arrays, Linked Lists & Memory Layout (O(1) access, O(n) search)',
      'Chapter 2: Sorting Algorithms (Bubble Sort O(n²), Merge Sort O(n log n) stable, QuickSort O(n log n) avg / O(n²) worst-case pivot selection)',
      'Chapter 3: Stacks & Queues (LIFO/FIFO, expression evaluation, recursion trees)',
      'Chapter 4: Graph Traversal (Breadth-First Search via Queue for shortest unweighted paths, Depth-First Search via Stack/recursion for topological sort & cycle detection)',
      'Chapter 5: Trees & Binary Search Trees (In-order, Pre-order, Post-order traversals, AVL balancing)'
    ]
  },
  'c-002': {
    name: 'Calculus II (MA202)',
    dept: 'Mathematics',
    chapters: [
      'Chapter 1: Limits & Continuity (L\'Hopital\'s rule, epsilon-delta foundation)',
      'Chapter 2: Differentiation Review (Power, Product, Quotient, Chain rules, critical points, concavity)',
      'Chapter 3: Integration Techniques (Definite/Indefinite integrals, u-substitution, Integration by Parts ∫u dv = uv - ∫v du, Partial Fraction Decomposition)',
      'Chapter 4: Applications of Definite Integrals (Area between curves, volumes of solids of revolution via disc/washer/shell methods)',
      'Chapter 5: Infinite Sequences & Series (Taylor & Maclaurin series, convergence tests: Ratio, Root, Comparison)'
    ]
  },
  'c-003': {
    name: 'Physics Mechanics (PH101)',
    dept: 'Physics',
    chapters: [
      'Chapter 1: Kinematics in 1D & 2D (Position, velocity, acceleration, projectile motion)',
      'Chapter 2: Newton\'s Laws of Motion (Inertia, F=ma, action-reaction, friction, free-body diagrams)',
      'Chapter 3: Work, Energy & Power (Kinetic & potential energy, conservation of mechanical energy, work-energy theorem)',
      'Chapter 4: Linear Momentum & Collisions (Impulse, elastic vs inelastic collisions, center of mass)',
      'Chapter 5: Rotational Dynamics (Torque τ=Iα, angular momentum, moment of inertia, rolling motion)'
    ]
  },
  'c-004': {
    name: 'Introduction to AI (CS301)',
    dept: 'Computer Science',
    chapters: [
      'Chapter 1: Foundations of Artificial Intelligence & Agent Architecture',
      'Chapter 2: Search Algorithms (A* heuristic search, Minimax with Alpha-Beta pruning)',
      'Chapter 3: Machine Learning Fundamentals (Supervised learning: Regression & Classification; Unsupervised: K-Means, PCA)',
      'Chapter 4: Neural Networks & Deep Learning (Perceptrons, backpropagation, activation functions: ReLU, Sigmoid)',
      'Chapter 5: Natural Language Processing & Modern LLMs (Tokenization, Transformers, Attention mechanism, Prompting)'
    ]
  }
};

/**
 * Build dynamic system instruction with course grounding
 */
function buildSystemInstruction(courseId, courseOnlyMode) {
  let prompt = `You are the EduFAZE AI Education Assistant, an expert, patient, engaging, and comprehensive STEM & general education tutor. You function like ChatGPT with special domain intelligence for college and university students.

Core Principles:
1. Universal Subject Competence: You can answer ANY academic or educational question across mathematics, physics, chemistry, biology, computer science, software engineering, literature, economics, data structures, algorithms, coding, and debugging.
2. Structured & Readable Formatting: Use clean markdown with clear headings (## or ###), bullet points, numbered step-by-step solutions, bold key terms, and markdown tables when comparing concepts.
3. Code Excellence: When writing code (Python, Java, C++, JavaScript, etc.), provide clean, commented, idiomatic code inside fenced code blocks with the language identifier specified (e.g. \`\`\`python). Explain time and space complexity (Big-O) when discussing algorithms.
4. Mathematical Clarity: Show step-by-step derivations for math/physics questions. Use clear mathematical notation (e.g. ∫, ∑, ², √, etc.).
5. Adaptive Explanations: Give intuitive high-level analogies for beginners first, followed by formal technical rigor. If a question is ambiguous or lacks details, answer reasonably and offer helpful clarifying suggestions.
6. Multi-Turn Context: Remember the preceding conversation within this session and seamlessly answer follow-up questions.`;

  if (courseId && courseId !== 'all' && COURSE_CURRICULA[courseId]) {
    const curriculum = COURSE_CURRICULA[courseId];
    prompt += `\n\nActive Enrolled Course Context:
- Course: ${curriculum.name}
- Department: ${curriculum.dept}
- Official Syllabus Coverage:
${curriculum.chapters.map(c => `  * ${c}`).join('\n')}

Grounding Rules:
- When the student's question relates to topics in this course, explicitly connect the explanation to ${curriculum.name} and cite the relevant chapter concepts.
- Prefix grounded curriculum sections with a clear badge like **[📚 Course Context: ${curriculum.name}]** so the student knows it directly reflects their curriculum.`;

    if (courseOnlyMode) {
      prompt += `\n- The student has enabled 'Course-Only Focus Mode'. You must strictly answer questions relating to ${curriculum.name}. If they ask something completely outside this course, politely state that you are in Course-Only mode for ${curriculum.name}, give a brief 1-line general response, and advise them to switch to 'All Courses' mode for general open-domain questions.`;
    } else {
      prompt += `\n- The student is in standard mode. If they ask a general question outside this course (e.g., Python prime numbers, history, economics), answer it completely with full depth, while politely mentioning that it is general knowledge beyond ${curriculum.name}.`;
    }
  } else {
    prompt += `\n\nActive Mode: General Academic & STEM Open Domain (All Courses). Answer any question the student asks with full detail and examples.`;
  }

  return prompt;
}

/**
 * Primary chat handler
 */
async function handleChat(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Handle health/status checks via GET
  if (req.method === 'GET') {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim() || (req.headers['x-gemini-key'] || '').trim();
    const isConfigured = Boolean(apiKey && apiKey !== 'your_gemini_api_key_here');
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'ok',
      connected: isConfigured,
      provider: 'Google Gemini',
      model: model,
      message: isConfigured 
        ? 'AI Assistant Connected via Gemini' 
        : 'AI API Key Not Configured. Set GEMINI_API_KEY on the server or in Settings.'
    }));
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST and GET requests are supported.' }));
    return;
  }

  // Rate Limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  if (!checkRateLimit(clientIp)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait a moment before sending another message (limit: 30 requests/minute).'
    }));
    return;
  }

  // Parse Body
  let bodyStr = '';
  try {
    bodyStr = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
        if (data.length > 256 * 1024) { // Max 256KB
          reject(new Error('PAYLOAD_TOO_LARGE'));
        }
      });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
  } catch (err) {
    res.statusCode = err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message, message: 'Invalid or oversized request body.' }));
    return;
  }

  let body = {};
  try {
    body = JSON.parse(bodyStr || '{}');
  } catch (e) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'INVALID_JSON', message: 'Request body must be valid JSON.' }));
    return;
  }

  const message = (body.message || '').trim();
  const history = Array.isArray(body.history) ? body.history : [];
  const courseId = body.course || 'all';
  const courseOnlyMode = Boolean(body.courseOnlyMode);

  if (!message) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'EMPTY_MESSAGE', message: 'Please provide a non-empty question or message.' }));
    return;
  }

  if (message.length > 8000) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'MESSAGE_TOO_LONG', message: 'Message exceeds maximum length of 8000 characters.' }));
    return;
  }

  // API Key Resolution
  const apiKey = (process.env.GEMINI_API_KEY || '').trim() || (req.headers['x-gemini-key'] || '').trim();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'GEMINI_API_KEY_NOT_CONFIGURED',
      message: 'AI Assistant is not connected. A Google Gemini API key is required to enable live AI responses.',
      setupInstructions: [
        '1. Get a free Google Gemini API key at https://aistudio.google.com/app/apikey',
        '2. Add GEMINI_API_KEY=your_key to your .env file or Vercel Environment Variables',
        '3. Alternatively, click Settings in the sidebar and enter your key in the AI Configuration section',
        '4. Reload the page and ask any question!'
      ]
    }));
    return;
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const systemInstruction = buildSystemInstruction(courseId, courseOnlyMode);

  // Format Multi-Turn Conversation for Gemini
  // Gemini expects: contents = [ { role: 'user' | 'model', parts: [{ text }] }, ... ]
  const contents = [];

  // Limit history to last 10 turns to conserve tokens & maintain fast responses
  const recentHistory = history.slice(-10);
  for (const item of recentHistory) {
    const role = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';
    const text = (item.content || item.text || '').trim();
    if (text) {
      contents.push({
        role: role,
        parts: [{ text: text }]
      });
    }
  }

  // Add the current user message
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  // Execute Gemini Inference
  try {
    let generatedText = '';

    // First attempt: Official @google/generative-ai SDK if available
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction
      });

      const response = await model.generateContent({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });

      const result = await response.response;
      generatedText = result.text();
    } catch (sdkErr) {
      // Direct REST Fallback (Dependency-free fallback using native fetch)
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const payload = {
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048
        }
      };

      const restRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!restRes.ok) {
        const errorData = await restRes.json().catch(() => ({}));
        const errMessage = errorData.error?.message || `Google API returned status ${restRes.status}`;
        if (restRes.status === 400 && errMessage.includes('API_KEY_INVALID')) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'INVALID_API_KEY',
            message: 'The provided Gemini API key is invalid. Please check your key at https://aistudio.google.com/'
          }));
          return;
        }
        if (restRes.status === 429) {
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'QUOTA_EXCEEDED',
            message: 'Gemini free quota exceeded. Please wait a minute before sending another request.'
          }));
          return;
        }
        throw new Error(errMessage);
      }

      const restJson = await restRes.json();
      const candidate = restJson.candidates?.[0];
      generatedText = candidate?.content?.parts?.[0]?.text || '';
    }

    if (!generatedText) {
      throw new Error('No text generated by Gemini.');
    }

    const isCourseRelated = Boolean(courseId && courseId !== 'all' && COURSE_CURRICULA[courseId]);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'success',
      response: generatedText,
      model: modelName,
      provider: 'Google Gemini',
      courseContext: isCourseRelated ? COURSE_CURRICULA[courseId].name : null,
      isCourseMaterial: isCourseRelated
    }));

  } catch (error) {
    console.error('[EduFAZE AI Error]', error.message);
    const msg = error.message || '';
    if (msg.toLowerCase().includes('api key not valid') || msg.includes('API_KEY_INVALID')) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'INVALID_API_KEY',
        message: 'The configured Google Gemini API key is invalid or unauthorized. Please verify your key at https://aistudio.google.com/app/apikey',
        retryable: false
      }));
      return;
    }
    if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Gemini API rate limit reached. Please wait a few seconds before trying again.',
        retryable: true
      }));
      return;
    }
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'INFERENCE_FAILED',
      message: 'Failed to generate response from Google Gemini: ' + msg,
      retryable: true
    }));
  }
}

module.exports = handleChat;
