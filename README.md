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
2. Once deployed, open your Railway domain in a browser — you'll land on the OpenClaw Control UI dashboard
3. Copy the `OPENCLAW_GATEWAY_TOKEN` value from your Railway service's Variables tab, paste it into the "Gateway Token" field, and click Connect
4. **First connection only:** you'll see a "Device pairing required" message — this is expected. Wait ~2 seconds (this template auto-approves pairing requests) and click Connect again. It'll connect normally from then on.
5. Add your LLM provider API keys (Claude, OpenAI, etc.) via Railway environment variables, then start chatting across any connected channel

The default gateway runs on port 18789 and exposes:
- **Gateway API** on port 18789 (main AI interface)
- **Bridge** on port 18790 (inter-service communication)
- **Microsoft Teams integration** on port 3978

## Notes

- **Persistence**: State is stored in `/home/node/.openclaw` volume. Railway persists this automatically.
- **API Keys**: Add your LLM provider credentials (Claude, OpenAI, etc.) via Railway environment variables.
- **Pairing**: This template auto-approves device pairing requests (Railway provides no way to run the normal `openclaw devices approve` CLI command against a deployed container). Your first-ever Connect click will show "Device pairing required" — that's expected, just click Connect again a couple seconds later.
- **Multi-device**: Once paired, any device can connect to the same gateway and share the workspace.
- **Open Source**: MIT licensed. Source code available at [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw).
