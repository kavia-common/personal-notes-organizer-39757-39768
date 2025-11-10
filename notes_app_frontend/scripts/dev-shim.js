#!/usr/bin/env node
/**
 * PUBLIC_INTERFACE
 * Dev shim for CRA to map CLI flags (--port, --host) to environment variables
 * that react-scripts start honors (PORT, HOST).
 *
 * Defaults: PORT=3000, HOST=0.0.0.0
 *
 * Usage:
 *   npm run dev -- --port 3000 --host 0.0.0.0
 *   or
 *   node scripts/dev-shim.js --port 3000 --host 0.0.0.0
 *
 * Notes:
 * - We intentionally avoid using REACT_APP_PORT to prevent conflicts; CRA uses PORT.
 * - Works cross-platform (Windows/macOS/Linux) by setting env in Node before spawn.
 * - Exits non-zero on spawn failure.
 */

const { spawn } = require('child_process');

function parseArgs(argv) {
  const result = { port: undefined, host: undefined, passthrough: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    // Normalize --key=value style
    if (arg.startsWith('--port=')) {
      result.port = arg.split('=')[1];
      continue;
    }
    if (arg.startsWith('--host=')) {
      result.host = arg.split('=')[1];
      continue;
    }

    // Handle --key value style
    if (arg === '--port') {
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        result.port = next;
        i += 1;
        continue;
      }
    } else if (arg === '--host') {
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        result.host = next;
        i += 1;
        continue;
      }
    } else if (arg === '--') {
      // Ignore explicit separator; CRA doesn't need it via this shim
      // Remaining args after -- are pushed through
      const rest = argv.slice(i + 1);
      result.passthrough.push(...rest);
      break;
    } else {
      // Pass through any other args (e.g., custom flags CRA might ignore)
      result.passthrough.push(arg);
    }
  }
  return result;
}

function main() {
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);

  // Ensure env contains proper HOST and PORT for CRA
  const env = { ...process.env };
  env.PORT = parsed.port || env.PORT || '3000';
  env.HOST = parsed.host || env.HOST || '0.0.0.0';

  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['react-scripts', 'start', ...parsed.passthrough];

  const child = spawn(cmd, args, {
    stdio: 'inherit',
    env,
    shell: false,
  });

  child.on('error', (err) => {
    console.error('[dev-shim] Failed to start dev server:', err && err.message ? err.message : err);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.error(`[dev-shim] Dev server terminated with signal: ${signal}`);
      process.exit(1);
    }
    process.exit(code ?? 0);
  });
}

main();
