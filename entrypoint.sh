#!/bin/sh
set -e

# Set Control UI allowed origins to this deployment's actual Railway domain.
# Uses $RAILWAY_PUBLIC_DOMAIN (injected by Railway at runtime) so this works
# for every deployer's own random subdomain, not just one hardcoded value.
openclaw config set gateway.controlUi.allowedOrigins "[\"https://$RAILWAY_PUBLIC_DOMAIN\"]" 2>/dev/null \
  || node dist/index.js config set gateway.controlUi.allowedOrigins "[\"https://$RAILWAY_PUBLIC_DOMAIN\"]"

# Inject the /setup banner + auto-reconnect listener into the served
# Control UI HTML. Static assets aren't on the persistent volume, so this
# file is always pristine at container start and needs re-injecting every
# boot. The exact path isn't documented, so find it by content.
INDEX_HTML=$(grep -rl "gateway-runtime" / --include="*.html" 2>/dev/null | head -1)
if [ -n "$INDEX_HTML" ]; then
  node /inject-control-ui-extras.js "$INDEX_HTML" || echo "[inject-control-ui-extras] failed, continuing without it"
else
  echo "[inject-control-ui-extras] could not locate index.html, skipping"
fi

# The wrapper (wrapper/server.js) owns the public port from here on: it
# spawns the real gateway on an internal-only port, proxies everything
# through to it, and adds the password-gated /setup page for approving new
# device pairing requests.
exec node wrapper/server.js
