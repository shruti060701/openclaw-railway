#!/bin/sh
set -e

# Set Control UI allowed origins to this deployment's actual Railway domain.
# Uses $RAILWAY_PUBLIC_DOMAIN (injected by Railway at runtime) so this works
# for every deployer's own random subdomain, not just one hardcoded value.
openclaw config set gateway.controlUi.allowedOrigins "[\"https://$RAILWAY_PUBLIC_DOMAIN\"]" 2>/dev/null \
  || node dist/index.js config set gateway.controlUi.allowedOrigins "[\"https://$RAILWAY_PUBLIC_DOMAIN\"]"

# The wrapper (wrapper/server.js) owns the public port from here on: it
# spawns the real gateway on an internal-only port, proxies everything
# through to it, and adds the password-gated /setup page for approving new
# device pairing requests.
exec node wrapper/server.js
