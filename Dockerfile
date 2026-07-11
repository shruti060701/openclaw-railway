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

# Setup wrapper: proxies to the real gateway (moved to an internal-only
# port) and exposes a password-gated /setup page for approving new device
# pairing requests - the only way to do that at all on Railway, which gives
# nobody shell access to run `openclaw devices approve` directly.
COPY wrapper/package.json wrapper/package-lock.json ./wrapper/
RUN cd wrapper && npm ci --omit=dev
COPY wrapper/server.js ./wrapper/server.js
COPY wrapper/public ./wrapper/public

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

HEALTHCHECK --interval=30s --timeout=5s --retries=5 --start-period=20s \
    CMD node -e "fetch('http://127.0.0.1:18789/healthz').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["/entrypoint.sh"]
