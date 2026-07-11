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
2. Configure your messaging channels (WhatsApp, Telegram, etc.) and AI model API keys during setup
3. Run `openclaw onboard` on your local machine to pair devices and create the admin account
4. Start chatting with your AI assistant across any connected channel

The default gateway runs on port 18789 and exposes:
- **Gateway API** on port 18789 (main AI interface)
- **Bridge** on port 18790 (inter-service communication)
- **Microsoft Teams integration** on port 3978

## Notes

- **Persistence**: State is stored in `/home/node/.openclaw` volume. Railway persists this automatically.
- **API Keys**: Add your LLM provider credentials (Claude, OpenAI, etc.) via Railway environment variables.
- **Pairing**: First-time setup requires running `openclaw gateway` locally and pairing with your Railway instance via the CLI.
- **Multi-device**: Once paired, any device can connect to the same gateway and share the workspace.
- **Open Source**: MIT licensed. Source code available at [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw).
