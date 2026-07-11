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
| `SETUP_PASSWORD` | Password protecting the `/setup` page, where you approve new device pairing requests. | `${{secret(20)}}` |
| `GATEWAY_INTERNAL_PORT` | Internal-only port the real gateway listens on, behind the wrapper. Not exposed publicly. | `18799` |
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
| `SETUP_PASSWORD` | `${{secret(20)}}` | Auto-generated password for the `/setup` device-approval page |

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

1. Open `https://<domain>/setup`, log in with the `SETUP_PASSWORD` from Railway Variables
2. Click "Open Control UI" (new tab), paste in `OPENCLAW_GATEWAY_TOKEN`, click Connect — this will show "device pairing required" the first time, which is expected
3. Back in the `/setup` tab, the new device shows under "Pending device requests" — click **Approve**
4. Reopen the Control UI tab and click Connect again — it connects normally from here on
5. Add your LLM provider credentials (Claude, OpenAI, etc.) via environment variables in Railway dashboard, restart, and start chatting across any connected channel

---

## 10. Troubleshooting

**Gateway not starting:** Check logs for Node.js errors. Ensure volume is mounted at `/home/node/.openclaw`.

**`EACCES: permission denied, mkdir '/home/node/.openclaw/state'`:** Railway mounts a fresh volume as root-owned, but the upstream image runs as a non-root user by default. The Dockerfile sets `USER root` to fix this — if you fork the template and remove that line, this error comes back.

**`Missing config. Run 'openclaw setup' or set gateway.mode=local...'` on startup:** The gateway hard-exits if it isn't already paired. The start command includes `--allow-unconfigured` so it runs and serves `/healthz` before pairing — don't remove that flag.

**"Browser origin not allowed" when clicking Connect in the Control UI dashboard:** The gateway's Control UI has an origin allowlist and rejects the Railway domain by default. There is no working env var for this (a third-party source claiming `OPENCLAW_GATEWAY_CONTROLUI_ALLOWEDORIGINS` works is wrong — verified via runtime logs that the gateway silently ignores it and auto-seeds a localhost-only default instead). The fix baked into `entrypoint.sh` runs `openclaw config set gateway.controlUi.allowedOrigins "[\"https://$RAILWAY_PUBLIC_DOMAIN\"]"` at container startup, writing directly to the config file the gateway actually reads. If you fork this template and remove `entrypoint.sh`, this error comes back.

**"Device pairing required" — expect this on literally every deployer's first-ever Connect click, not just yours.** Railway provides no way to run `openclaw devices approve <id>` against a deployed container (`railway shell`/`railway connect`/`railway run` are all local-only, none exec into the running container), and OpenClaw has no bootstrap exception for a fresh gateway — so without a fix, this template would be permanently unusable for every single person who deploys it.

**How this template solves it (and why, after two other approaches):** a small Express wrapper (`wrapper/server.js`) sits in front of the real gateway — it owns the public port, spawns the actual OpenClaw gateway on an internal-only loopback port (`GATEWAY_INTERNAL_PORT`), and proxies everything through to it except for `/setup`, which it handles itself. `/setup` is password-gated (`SETUP_PASSWORD`) and shows pending device requests with a real **Approve** button — the deployer clicks it themselves. This is modeled on the pattern used by the most successful competing OpenClaw Railway templates (verified by reading their actual open-source code, e.g. github.com/arjunkomath/openclaw-railway-template, MIT licensed), not invented blind.

Two other approaches were tried and explicitly rejected before landing here, both correctly caught by a security review before being deployed:
- An auto-approve background loop (no human involved at all in approving a device) — too permissive on its own once combined with the second idea below.
- A script injected into the Control UI page that auto-clicks "Connect" again after a pairing rejection, simulating the human's second click. This one's the important lesson: it wasn't a technical bug being routed around, it was **removing OpenClaw's own deliberate security control** (a fresh, consciously-initiated human click is required after every first-time device approval, specifically so a compromised/scripted client can't silently complete pairing with no human ever aware). Combined with the auto-approve loop, the two together would have meant anyone with the valid gateway token connects with zero human involvement at any point. Don't reintroduce either of these — the wrapper is the correct fix because it adds a *real* human action (a password-gated Approve button) rather than removing the existing one.

**Residual friction, and it's expected, not a bug:** the deployer still does a short first-time flow (open `/setup` → open Control U​I → see pending → go back and Approve → reopen Control UI → Connect again). This is the minimum unavoidable interaction, since a browser's unique device identity only exists once it first attempts to connect — nothing can pre-approve an identity that doesn't exist yet. The difference from the raw/undocumented version of this problem is that it's now a guided, labeled setup step instead of an unexplained-looking error.

**Healthcheck failing:** Verify the gateway is listening on 18789. Try `curl http://127.0.0.1:18789/healthz` from inside the container.

**Pairing issues:** Ensure `OPENCLAW_GATEWAY_TOKEN` is set. The token is auto-generated on first startup; check logs for its value.

**Missing credentials:** Add `CLAUDE_AI_SESSION_KEY`, `OPENAI_API_KEY`, or other LLM provider keys via Railway environment variables, then restart the service.
