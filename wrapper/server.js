// Thin wrapper around the OpenClaw gateway for Railway deployments.
//
// Why this exists: Railway gives nobody shell access to a deployed
// container, so the normal `openclaw devices approve <id>` CLI flow (used
// to approve a new browser's first-ever Control UI connection) is
// impossible to run. This wrapper moves that approval to a real, explicit
// human action - a password-gated /setup page with an Approve button -
// instead of either (a) requiring CLI access nobody has, or (b)
// auto-approving everything with no human involved at all.
//
// Architecture: this process owns the public port. It spawns the real
// OpenClaw gateway on an internal-only loopback port and proxies
// everything (HTTP + WebSocket) through to it, except for the /setup/*
// routes, which it handles itself.
const path = require('path');
const { spawn, execFile } = require('child_process');
const express = require('express');
const httpProxy = require('http-proxy');

const PUBLIC_PORT = Number(process.env.PORT) || 18789;
const GATEWAY_PORT = Number(process.env.GATEWAY_INTERNAL_PORT) || 18799;
const SETUP_PASSWORD = process.env.SETUP_PASSWORD;

if (!SETUP_PASSWORD) {
  console.error('[wrapper] SETUP_PASSWORD is not set - refusing to start.');
  process.exit(1);
}

// Both PORT and OPENCLAW_GATEWAY_PORT get overridden here: the gateway
// subcommand binds using --port, but CLI helper commands (devices list/
// approve) appear to locate the local gateway via OPENCLAW_GATEWAY_PORT.
// Setting both consistently avoids the CLI accidentally talking to this
// wrapper's own public port instead of the real gateway.
const gatewayEnv = Object.assign({}, process.env, {
  PORT: String(GATEWAY_PORT),
  OPENCLAW_GATEWAY_PORT: String(GATEWAY_PORT),
});

const gateway = spawn(
  'node',
  ['dist/index.js', 'gateway', '--bind', 'loopback', '--port', String(GATEWAY_PORT), '--allow-unconfigured'],
  { env: gatewayEnv, stdio: 'inherit' }
);

gateway.on('exit', (code) => {
  console.error(`[wrapper] gateway process exited (code ${code}); exiting wrapper too`);
  process.exit(code || 1);
});

function runCli(args) {
  return new Promise((resolve) => {
    execFile(
      'node',
      ['dist/index.js', ...args, '--json'],
      { timeout: 15000, env: gatewayEnv },
      (err, stdout, stderr) => {
        if (err && !stdout) {
          resolve({ ok: false, error: (stderr || err.message || '').trim() });
          return;
        }
        try {
          resolve({ ok: true, data: JSON.parse(stdout) });
        } catch (e) {
          resolve({ ok: false, error: 'failed to parse CLI output', raw: stdout });
        }
      }
    );
  });
}

function requireSetupAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const sepIndex = decoded.indexOf(':');
    const password = sepIndex >= 0 ? decoded.slice(sepIndex + 1) : decoded;
    if (password === SETUP_PASSWORD) {
      next();
      return;
    }
  }
  res.set('WWW-Authenticate', 'Basic realm="OpenClaw Setup"');
  res.status(401).send('Authentication required');
}

const app = express();
app.use(express.json());

app.get('/setup', requireSetupAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'setup.html'));
});

app.get('/setup/api/devices', requireSetupAuth, async (req, res) => {
  const result = await runCli(['devices', 'list']);
  res.json(result);
});

app.post('/setup/api/devices/approve', requireSetupAuth, async (req, res) => {
  const requestId = req.body && req.body.requestId;
  if (!requestId) {
    res.status(400).json({ ok: false, error: 'requestId is required' });
    return;
  }
  const result = await runCli(['devices', 'approve', requestId]);
  res.json(result);
});

// Everything else (including the actual Control UI and its WebSocket
// connection) proxies straight through to the real gateway.
const proxy = httpProxy.createProxyServer({
  target: `http://127.0.0.1:${GATEWAY_PORT}`,
  ws: true,
  changeOrigin: false, // preserve the real Host/Origin so allowedOrigins still matches upstream
});

proxy.on('error', (err, req, res) => {
  console.error('[wrapper] proxy error:', err.message);
  if (res && res.writeHead) {
    res.writeHead(502);
    res.end('Gateway unavailable');
  }
});

app.use((req, res) => {
  proxy.web(req, res);
});

const server = app.listen(PUBLIC_PORT, () => {
  console.log(`[wrapper] listening on ${PUBLIC_PORT}, proxying to gateway on 127.0.0.1:${GATEWAY_PORT}`);
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});
