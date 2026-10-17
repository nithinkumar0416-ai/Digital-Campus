/**
 * EduFAZE AI — Backend AI Status Endpoint
 * Returns connection and configuration status of the AI Provider without exposing sensitive keys.
 */

const fs = require('fs');
const path = require('path');

function sanitizeApiKey(key) {
  if (!key || typeof key !== 'string') return '';
  let clean = key.trim();
  clean = clean.replace(/^(?:export\s+)?(?:GEMINI_API_KEY|GOOGLE_API_KEY|API_KEY)\s*[:=]\s*/i, '');
  clean = clean.replace(/^Bearer\s+/i, '');
  clean = clean.replace(/^&(?:quot|apos);|&(?:quot|apos);$/g, '');
  clean = clean.replace(/^["'`]|["'`]$/g, '');
  clean = clean.replace(/[\r\n\t\s]/g, '').trim();
  return clean;
}

function normalizeModel(name) {
  if (!name) return 'gemini-1.5-flash-latest';
  return name.trim().replace(/^models\//, '');
}

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
          const val = sanitizeApiKey(trimmed.substring(idx + 1));
          if (!process.env[key] && val) {
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

  const serverKey = sanitizeApiKey(process.env.GEMINI_API_KEY);
  const headerKey = sanitizeApiKey(req.headers['x-gemini-key']);
  const activeKey = serverKey || headerKey;
  const isConfigured = Boolean(activeKey && activeKey !== 'your_gemini_api_key_here');
  const rawModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
  const model = normalizeModel(rawModel);

  // Optional real-time key verification when requested (e.g. from UI modal)
  const shouldValidate = req.url && req.url.includes('validate=true');
  if (shouldValidate && isConfigured) {
    try {
      const probeRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(activeKey)}`);
      if (!probeRes.ok) {
        const probeData = await probeRes.json().catch(() => ({}));
        const errMsg = probeData.error?.message || `Google API returned status ${probeRes.status}`;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'error',
          connected: false,
          verified: false,
          error: 'INVALID_API_KEY',
          provider: 'Google Gemini',
          model: model,
          message: 'Google rejected this API key: ' + errMsg + '. Please verify your key at https://aistudio.google.com/app/apikey'
        }));
        return;
      }
    } catch (e) {
      // Ignore network timeout on probe
    }
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'ok',
    connected: isConfigured,
    verified: isConfigured,
    provider: 'Google Gemini',
    model: model,
    source: serverKey ? 'server_environment' : (headerKey ? 'session_header' : 'none'),
    message: isConfigured 
      ? 'AI Assistant Connected' 
      : 'AI Not Connected (Configure GEMINI_API_KEY)'
  }));
};
