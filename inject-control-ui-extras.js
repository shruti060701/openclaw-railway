// Injects two small, honest additions into the served Control UI HTML:
//
// 1. A always-visible banner linking to /setup - without this, a deployer
//    who hits "device pairing required" has no on-screen way to discover
//    that a real approval page exists at all (the vendor's own error text
//    only mentions CLI commands that can't be run on Railway).
//
// 2. A BroadcastChannel listener that clicks Connect again automatically
//    when /setup signals a device was just approved. This does NOT bypass
//    any vendor security control: the human still makes the real approval
//    decision themselves on the password-gated /setup page. This only
//    automates the mechanical reconnect that follows an approval that
//    already genuinely happened - unlike an earlier, rejected attempt at
//    this same problem that tried to fake the click before any real human
//    approval had occurred at all.
const fs = require('fs');

const file = process.argv[2];
if (!file) {
  console.error('[inject-control-ui-extras] no file path given');
  process.exit(1);
}

const marker = '<!-- openclaw-railway-extras -->';
let html = fs.readFileSync(file, 'utf8');

if (html.includes(marker)) {
  console.log('[inject-control-ui-extras] already injected, skipping');
  process.exit(0);
}

// The real page's CSP is "script-src 'self'" with no 'unsafe-inline' - an
// inline <script> block gets silently blocked by the browser (verified via
// a local test replicating the exact CSP header before finding this out
// the hard way in production). script-src 'self' DOES allow same-origin
// script *files*, so the listener is served as an external file by the
// wrapper (wrapper/server.js has a route for this) and referenced by src=
// instead of inlined.
const extras = `${marker}
<div id="openclaw-setup-banner" style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#e0554f;color:#fff;text-align:center;padding:8px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;">
  First time connecting? New devices need approval at
  <a href="/setup" target="openclaw-setup" style="color:#fff;text-decoration:underline;font-weight:bold;">/setup</a>
  before Connect will work.
</div>
<script src="/openclaw-railway-listener.js"></script>
`;

html = html.replace('</body>', extras + '</body>');
fs.writeFileSync(file, html);
console.log('[inject-control-ui-extras] injected into', file);
