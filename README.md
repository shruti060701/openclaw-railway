# OpenClaw — Self-Hosted Personal AI Assistant on Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/openclaw-railway)

**OpenClaw** is your personal AI assistant running on your own infrastructure. Connect it to WhatsApp, Telegram, Slack, Discord, Signal, iMessage, Microsoft Teams, and 12+ other messaging platforms. It stays on your devices, uses your API keys, and never sends your data to third-party servers.

## Features

- **Multi-channel support** — WhatsApp, Telegram, Slack, Discord, Signal, iMessage, Microsoft Teams, Matrix, Google Chat, Twitch, Nostr, and more
- **Voice & text** — Speak and listen on macOS, iOS, and Android
- **Self-hosted** — Your assistant, your data, your rules
- **Model flexibility** — Works with OpenAI, Claude, local models via Ollama/LM Studio, and other providers
- **Workspace isolation** — Single-user assistant with workspace-scoped configuration
- **Live Canvas** — Render interactive web UI controlled by the assistant
- **Extensible** — Build custom skills and integrate with your tools

## How to Use

1. Click the Deploy button above
2. Once deployed, open `https://<your-domain>/setup` in a browser. Copy the `SETUP_PASSWORD` value from your Railway service's Variables tab and enter it when prompted.
3. On the Setup page, click "Open Control UI" (opens in a new tab). Copy the `OPENCLAW_GATEWAY_TOKEN` value from Variables, paste it into the "Gateway Token" field, and click Connect.
4. **First connection only:** you'll see "Device pairing required." Go back to the Setup tab — your device now shows up under "Pending device requests." Click **Approve**.
5. Reopen the Control UI tab and click Connect again — it'll connect normally from now on.
6. Add your LLM provider API keys (Claude, OpenAI, etc.) via Railway environment variables, then start chatting across any connected channel

Why the extra Setup step exists: Railway gives nobody shell access to a deployed container, so the normal `openclaw devices approve` CLI command used to approve a new device can't be run. The `/setup` page (password-protected, separately from the gateway token) is how you approve your own device instead — it's a real manual step you take once per new device, not an automated bypass.

The default gateway runs on port 18789 and exposes:
- **Gateway API** on port 18789 (main AI interface)
- **Bridge** on port 18790 (inter-service communication)
- **Microsoft Teams integration** on port 3978

## Notes

- **Persistence**: State is stored in `/home/node/.openclaw` volume. Railway persists this automatically.
- **API Keys**: Add your LLM provider credentials (Claude, OpenAI, etc.) via Railway environment variables.
- **Pairing**: New devices are approved manually via the password-protected `/setup` page (see "How to Use" above), since Railway provides no shell access to run `openclaw devices approve` directly against a deployed container.
- **Multi-device**: Once paired, any device can connect to the same gateway and share the workspace.
- **Open Source**: MIT licensed. Source code available at [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw).
