FROM openclaw/openclaw:latest

ENV HOME=/home/node \
    OPENCLAW_HOME=/home/node \
    OPENCLAW_STATE_DIR=/home/node/.openclaw \
    OPENCLAW_CONFIG_PATH=/home/node/.openclaw/openclaw.json \
    OPENCLAW_CONFIG_DIR=/home/node/.openclaw \
    OPENCLAW_WORKSPACE_DIR=/home/node/.openclaw/workspace \
    TERM=xterm-256color

EXPOSE 18789 18790 3978

# Railway mounts fresh volumes as root:root; the upstream image runs as a
# non-root user, which can't mkdir into /home/node/.openclaw on first boot.
USER root

HEALTHCHECK --interval=30s --timeout=5s --retries=5 --start-period=20s \
    CMD node -e "fetch('http://127.0.0.1:18789/healthz').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "(openclaw config set gateway.controlUi.allowedOrigins \"[\\\"https://$RAILWAY_PUBLIC_DOMAIN\\\"]\" 2>/dev/null || node dist/index.js config set gateway.controlUi.allowedOrigins \"[\\\"https://$RAILWAY_PUBLIC_DOMAIN\\\"]\"); exec node dist/index.js gateway --bind lan --port 18789 --allow-unconfigured"]
