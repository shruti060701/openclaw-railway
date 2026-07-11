# Railway Template Composer Checklist — OpenClaw

Apply these settings in the Railway template composer when generating the template from the project.

---

## 1. Healthcheck Settings

### openclaw-gateway (main service)
- **Healthcheck Path:** `/healthz`
- **Healthcheck Timeout:** `120` seconds (allows time for initial startup and configuration loading)
- **Variable:** `RAILWAY_HEALTHCHECK_PATH` = `/healthz` with description "Endpoint Railway uses to verify the gateway service is healthy."

---

## 2. Variable Descriptions (Add to EVERY variable)

### openclaw-gateway Variables

| Variable | Description | Default / Reference |
|----------|-------------|---------------------|
| `PORT` | The port the OpenClaw gateway listens on (internal). | `18789` |
| `RAILWAY_HEALTHCHECK_PATH` | Endpoint Railway uses to verify the service is healthy. | `/healthz` |
| `OPENCLAW_GATEWAY_PORT` | Public port for the gateway API. | `18789` |
| `OPENCLAW_BRIDGE_PORT` | Port for inter-service bridge communication. | `18790` |
| `OPENCLAW_MSTEAMS_PORT` | Port for Microsoft Teams webhook integration. | `3978` |
| `OPENCLAW_STATE_DIR` | Directory for gateway state and configuration. | `/home/node/.openclaw` |
| `OPENCLAW_CONFIG_PATH` | Path to the main OpenClaw configuration file. | `/home/node/.openclaw/openclaw.json` |
| `OPENCLAW_CONFIG_DIR` | Directory containing OpenClaw configuration files. | `/home/node/.openclaw` |
| `OPENCLAW_WORKSPACE_DIR` | Directory for workspace data and channel credentials. | `/home/node/.openclaw/workspace` |
| `OPENCLAW_GATEWAY_TOKEN` | Authentication token for the gateway API (auto-generated on first startup). | `${{secret(32)}}` |
| `OPENCLAW_ALLOW_INSECURE_PRIVATE_WS` | Allow insecure WebSocket connections for local development (not recommended for production). | `false` |
| `OPENCLAW_DISABLE_BONJOUR` | Disable Bonjour/mDNS for device discovery (set to 1 to disable in containers). | `1` |
| `OPENCLAW_GATEWAY_CONTROLUI_ALLOWEDORIGINS` | Browser origins allowed to connect to the Control UI dashboard. Must match your Railway domain exactly, or the dashboard's "Connect" button fails with "Browser origin not allowed." | `["https://${{RAILWAY_PUBLIC_DOMAIN}}"]` |
| `CLAUDE_AI_SESSION_KEY` | Claude API session key for Anthropic model access (optional, only if using Claude). | Leave blank for now |
| `CLAUDE_WEB_SESSION_KEY` | Web session key for Claude API (optional). | Leave blank for now |
| `CLAUDE_WEB_COOKIE` | Web cookie for Claude authentication (optional). | Leave blank for now |
| `OPENAI_API_KEY` | API key for OpenAI models like GPT-4o (optional, only if using OpenAI). | Leave blank for now |
| `TZ` | Timezone for the gateway (e.g., UTC, America/New_York). | `UTC` |
| `HOME` | Home directory for the container user. | `/home/node` |
| `OPENCLAW_HOME` | OpenClaw-specific home directory. | `/home/node` |
| `TERM` | Terminal type for output rendering. | `xterm-256color` |

---

## 3. Auto-Injected Variables — Default Values

Railway may auto-inject system variables. Set their defaults to avoid "needs configuration" prompts:

| Variable | Default Value | Mark Optional? |
|----------|---------------|----------------|
| `PORT` | `18789` | Yes |
| `RAILWAY_HEALTHCHECK_PATH` | `/healthz` | Yes |
| `OPENCLAW_GATEWAY_PORT` | `18789` | Yes |
| `OPENCLAW_BRIDGE_PORT` | `18790` | Yes |
| `OPENCLAW_MSTEAMS_PORT` | `3978` | Yes |
| `TZ` | `UTC` | Yes |
| `OPENCLAW_DISABLE_BONJOUR` | `1` | Yes |

---

## 4. Secrets That Must Use `${{secret()}}`

Never hardcode real tokens or credentials from your dev project. Use these template functions:

| Variable | Template Syntax | Purpose |
|----------|-----------------|---------|
| `OPENCLAW_GATEWAY_TOKEN` | `${{secret(32)}}` | Auto-generated API gateway authentication token |

---

## 5. Optional User-Provided Variables

Mark these as **optional** so users aren't forced to provide them (the assistant works without them):

- `CLAUDE_AI_SESSION_KEY` — Only needed if using Claude as the LLM provider
- `CLAUDE_WEB_SESSION_KEY` — Only needed if using Claude web authentication
- `CLAUDE_WEB_COOKIE` — Only needed if using Claude web authentication
- `OPENAI_API_KEY` — Only needed if using OpenAI models
- Other LLM provider credentials (Google Gemini, Groq, etc.)

---

## 6. Volume Configuration

Ensure the following volume is mounted and persistent:

| Mount Path | Purpose | Size |
|-----------|---------|------|
| `/home/node/.openclaw` | Stores gateway state, configuration, workspace data, and conversation history | 2–10 GB recommended |

---

## 7. Port Exposure

The gateway exposes multiple ports:

| Port | Service | Purpose | Expose Publicly? |
|------|---------|---------|-----------------|
| `18789` | Gateway API | Main AI assistant interface | Yes (required) |
| `18790` | Bridge | Inter-service communication | No (internal) |
| `3978` | Microsoft Teams | Teams webhook integration | Yes (if using Teams) |

Only port 18789 needs public exposure for the Railway domain. Ports 18790 and 3978 are optional and for specific integrations.

---

## 8. Post-Deploy Steps

After the template is published, test-deploy from a fresh Railway account (incognito window) to verify:

1. The service comes online within 2 minutes and healthcheck passes
2. `OPENCLAWGATEWAY_TOKEN` is auto-generated (don't show the value in logs)
3. No "needs configuration" prompts appear for system variables
4. Logs show "listening on port 18789" and "gateway started" messages
5. `curl -s -o /dev/null -w "%{http_code}"` to `https://<domain>/healthz` returns `200`

---

## 9. First-Time Setup Flow

After deployment:

1. Note the Railway domain and gateway token from logs
2. On your local machine, run `openclaw onboard --gateway-url <railway-domain>`
3. The CLI will guide you through pairing your devices and configuring channels
4. Add your LLM provider credentials (Claude, OpenAI, etc.) via environment variables in Railway dashboard
5. Restart the service and start chatting with your assistant across any connected channel

---

## 10. Troubleshooting

**Gateway not starting:** Check logs for Node.js errors. Ensure volume is mounted at `/home/node/.openclaw`.

**`EACCES: permission denied, mkdir '/home/node/.openclaw/state'`:** Railway mounts a fresh volume as root-owned, but the upstream image runs as a non-root user by default. The Dockerfile sets `USER root` to fix this — if you fork the template and remove that line, this error comes back.

**`Missing config. Run 'openclaw setup' or set gateway.mode=local...'` on startup:** The gateway hard-exits if it isn't already paired. The start command includes `--allow-unconfigured` so it runs and serves `/healthz` before pairing — don't remove that flag.

**"Browser origin not allowed" when clicking Connect in the Control UI dashboard:** The gateway's Control UI has an origin allowlist and rejects the Railway domain by default. There is no working env var for this (a third-party source claiming `OPENCLAW_GATEWAY_CONTROLUI_ALLOWEDORIGINS` works is wrong — verified via runtime logs that the gateway silently ignores it and auto-seeds a localhost-only default instead). The fix baked into `entrypoint.sh` runs `openclaw config set gateway.controlUi.allowedOrigins "[\"https://$RAILWAY_PUBLIC_DOMAIN\"]"` at container startup, writing directly to the config file the gateway actually reads. If you fork this template and remove `entrypoint.sh`, this error comes back.

**"Device pairing required" — expect this on literally every deployer's first-ever Connect click, not just yours.** Railway provides no way to run `openclaw devices approve <id>` against a deployed container (`railway shell`/`railway connect`/`railway run` are all local-only, none exec into the running container), and OpenClaw has no bootstrap exception for a fresh gateway — so without a fix, this template would be permanently unusable for every single person who deploys it. `entrypoint.sh` runs a background loop that polls `openclaw devices list --json` every 1s and auto-approves any pending request. **Known limitation, not a bug:** OpenClaw's Control UI has no documented auto-retry after a pairing rejection, so the first Connect attempt will still show this error and fail even though it gets auto-approved a moment later — the user has to click Connect a second time, a few seconds after the first, for it to actually connect. This is now documented in the README as an expected first-connect step. **Security tradeoff, explicitly chosen:** this removes the device-approval layer entirely — the gateway token is still required to reach this point, this only skips the check behind it. Acceptable for a single-operator template; reconsider if this image/pattern is reused for anything multi-tenant.

**Healthcheck failing:** Verify the gateway is listening on 18789. Try `curl http://127.0.0.1:18789/healthz` from inside the container.

**Pairing issues:** Ensure `OPENCLAW_GATEWAY_TOKEN` is set. The token is auto-generated on first startup; check logs for its value.

**Missing credentials:** Add `CLAUDE_AI_SESSION_KEY`, `OPENAI_API_KEY`, or other LLM provider keys via Railway environment variables, then restart the service.
