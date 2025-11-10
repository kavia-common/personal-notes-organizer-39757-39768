//
// PUBLIC_INTERFACE
/**
 * Initializes safe handling of REACT_APP_* environment variables for CRA.
 *
 * This module ensures that referencing process.env.REACT_APP_* keys will not
 * throw or cause runtime crashes when the variables are undefined. CRA already
 * injects process.env as an object at build time, but in some preview systems
 * empty or missing values can be surprising.
 *
 * Usage:
 *   import './envSafe'; // at the top of index.js
 *
 * It also sets a default port to 3000 for consistency in environments that
 * may provide REACT_APP_PORT.
 */
(function initEnvDefaults() {
  try {
    // Ensure process and process.env exist in the runtime scope.
    if (typeof process !== 'object' || !process) {
      // In CRA this should already be defined; provide a minimal shim for safety.
      // eslint-disable-next-line no-global-assign
      process = {};
    }
    if (typeof process.env !== 'object' || !process.env) {
      process.env = {};
    }

    // Default empty strings for known REACT_APP_* vars to prevent code from
    // crashing if they are accessed.
    const keys = [
      'REACT_APP_API_BASE',
      'REACT_APP_BACKEND_URL',
      'REACT_APP_FRONTEND_URL',
      'REACT_APP_WS_URL',
      'REACT_APP_NODE_ENV',
      'REACT_APP_NEXT_TELEMETRY_DISABLED',
      'REACT_APP_ENABLE_SOURCE_MAPS',
      'REACT_APP_PORT',
      'REACT_APP_TRUST_PROXY',
      'REACT_APP_LOG_LEVEL',
      'REACT_APP_HEALTHCHECK_PATH',
      'REACT_APP_FEATURE_FLAGS',
      'REACT_APP_EXPERIMENTS_ENABLED',
    ];

    keys.forEach((k) => {
      if (typeof process.env[k] === 'undefined') {
        process.env[k] = '';
      }
    });

    // If REACT_APP_PORT is provided but empty, normalize it to '3000'
    // Note: CRA dev server listens on PORT, not REACT_APP_PORT. We don't set PORT here
    // to avoid overriding platform defaults. Keeping this normalization in case app code reads it.
    if (!process.env.REACT_APP_PORT) {
      process.env.REACT_APP_PORT = '3000';
    }
  } catch {
    // Fail-safe: never block the app from starting due to env shaping
  }
})();
