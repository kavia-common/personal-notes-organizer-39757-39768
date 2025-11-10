#!/usr/bin/env node
/**
 * PUBLIC_INTERFACE
 * Dev shim for CRA to map CLI flags (--port, --host) to environment variables
 * that react-scripts start honors (PORT, HOST). Defaults: PORT=3000, HOST=0.0.0.0
 *
 * Usage:
 *   node scripts/dev-shim.js react-scripts start -- --port 3000 --host 0.0.0.0
 * Or via npm script:
 *   npm run dev -- --port 3000 --host 0.0.0.0
 *
 * Notes:
 * - We intentionally avoid using REACT_APP_PORT to prevent conflicts; CRA uses PORT.
 * - Works cross-platform (Windows/macOS/Linux) by setting env in Node before spawn.
 */

const { spawn } = require('child_process');

function parseArgs(argv) {
  const result = { port: undefined, host: undefined, passthrough: [] };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--') {
      // Everything after -- is passthrough
      result.passthrough = result.passthrough.concat(argv.slice(i));
      break;
    }
    if (arg === '--port') {
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        result.port = next;
        i += 2;
        continue;
      }
    }
    if (arg.startsWith('--port=')) {
      result.port = arg.split('=')[1];
      i += 1;
      continue;
    }
    if (arg === '--host') {
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        result.host = next;
        i += 2;
        continue;
      }
    }
    if (arg.startsWith('--host=')) {
      result.host = arg.split('=')[1];
      i += 1;
      continue;
    }
    // Unknown arg; pass through
    result.passthrough.push(arg);
    i += 1;
  }
  return result;
}

function main() {
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);

  // Set defaults if not provided via args or env
  const env = { ...process.env };
  if (!env.PORT) {
    env.PORT = parsed.port || '3000';
  }
  if (!env.HOST) {
    env.HOST = parsed.host || '0.0.0.0';
  }

  // Build command to run: react-scripts start with any passthrough args
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['react-scripts', 'start', ...parsed.passthrough];

  const child = spawn(cmd, args, {
    stdio: 'inherit',
    env,
    shell: false,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main();
