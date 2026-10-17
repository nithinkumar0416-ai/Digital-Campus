/**
 * EduFAZE AI — Backend AI Status Endpoint
 * Returns connection and configuration status of the AI Provider without exposing sensitive keys.
 */

const fs = require('fs');
const path = require('path');

// Auto-load .env file if present
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
      // Ignore
    }
  }
})();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-key');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const serverKey = (process.env.GEMINI_API_KEY || '').trim();
  const headerKey = (req.headers['x-gemini-key'] || '').trim();
  const activeKey = serverKey || headerKey;
  const isConfigured = Boolean(activeKey && activeKey !== 'your_gemini_api_key_here');
  const rawModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const model = rawModel.trim().replace(/^models\//, '');

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'ok',
    connected: isConfigured,
    provider: 'Google Gemini',
    model: model,
    source: serverKey ? 'server_environment' : (headerKey ? 'session_header' : 'none'),
    message: isConfigured 
      ? 'AI Assistant Connected' 
      : 'AI Not Connected (Configure GEMINI_API_KEY)'
  }));
};
