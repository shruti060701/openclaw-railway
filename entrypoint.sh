#!/bin/sh
set -e

# Set Control UI allowed origins to this deployment's actual Railway domain.
# Uses $RAILWAY_PUBLIC_DOMAIN (injected by Railway at runtime) so this works
# for every deployer's own random subdomain, not just one hardcoded value.
openclaw config set gateway.controlUi.allowedOrigins "[\"https://$RAILWAY_PUBLIC_DOMAIN\"]" 2>/dev/null \
  || node dist/index.js config set gateway.controlUi.allowedOrigins "[\"https://$RAILWAY_PUBLIC_DOMAIN\"]"

# Background loop: auto-approve any pending device pairing request.
# Security tradeoff (explicitly chosen for this single-operator template):
# removes the separate device-approval layer. The gateway token is still
# required to reach this point at all - this only skips the second check
# behind it, which normally requires shell access to the gateway host that
# Railway doesn't provide to anyone (including the deployer).
(
  while true; do
    RAW=$(openclaw devices list --json 2>/dev/null || node dist/index.js devices list --json 2>/dev/null || echo '{}')
    echo "[auto-approve] devices list: $RAW"
    IDS=$(node -e '
      let d;
      try { d = JSON.parse(process.argv[1]); } catch (e) { process.exit(0); }
      const pending = d.pending || d.pendingRequests || d.requests || [];
      for (const p of pending) {
        const rid = p.requestId || p.id;
        if (rid) console.log(rid);
      }
    ' "$RAW" 2>/dev/null || true)
    for id in $IDS; do
      echo "[auto-approve] approving $id"
      openclaw devices approve "$id" 2>/dev/null || node dist/index.js devices approve "$id" 2>/dev/null || true
    done
    sleep 1
  done
) &

exec node dist/index.js gateway --bind lan --port 18789 --allow-unconfigured
