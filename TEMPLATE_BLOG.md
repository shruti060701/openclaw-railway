# Deploy and Host OpenClaw Self-Hosted on Railway

OpenClaw is your personal AI assistant running on your own infrastructure, accessible across WhatsApp, Telegram, Slack, Discord, Signal, iMessage, and 12+ other messaging platforms. Instead of relying on cloud services that log your conversations, OpenClaw keeps everything local while staying connected to the apps you already use every day.

## About Hosting OpenClaw Self-Hosted

Self-hosting OpenClaw means your assistant and entire conversation history remain under your control. Railway handles the infrastructure complexity—managed storage, automatic HTTPS, and zero-config networking—while you keep complete ownership of your data. Deploy the gateway, pair your local devices via the CLI, and start chatting. Your workspace stays private, your model choice stays yours, and your message history never leaves your servers.

## Common Use Cases

- Personal AI assistant across messaging apps you already use
- Always-on team bot with workspace isolation and role-based access
- Privacy-first automation for regulated industries
- Multi-model experimentation without re-architecting
- Local AI for enterprises with strict data residency requirements

## Dependencies for OpenClaw Self-Hosted Hosting

- **Node.js** 24 (recommended) or 22.19+ for runtime
- **Docker** for containerization
- **LLM provider credentials** (OpenAI, Claude, Ollama, etc.)
- **Railway account** for managed hosting
- Optional: **Redis** for caching on high-volume deployments

### Deployment Dependencies

- [OpenClaw GitHub](https://github.com/openclaw/openclaw) — Official repository and source
- [OpenClaw Docs](https://docs.openclaw.ai) — Complete documentation and guides
- [OpenAI API](https://openai.com/api) or [Claude API](https://console.anthropic.com) — LLM provider credentials
- [Railway](https://railway.app) — Managed hosting platform

### Implementation Details

OpenClaw deploys as a Node.js application in a Docker container. The gateway listens on port 18789 and exposes a `/healthz` endpoint for uptime monitoring. All state, configuration, and conversation history is stored in a single persistent volume at `/home/node/.openclaw`. No external database is needed—OpenClaw manages everything in-process using SQLite for reliability and privacy.

## Why Deploy OpenClaw Self-Hosted on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying OpenClaw self-hosted on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
