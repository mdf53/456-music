/**
 * Loads apps/mobile/.env before Expo reads EXPO_PUBLIC_* (helps monorepo / tooling).
 * After changing .env, restart Metro: npm run dev:mobile:clear
 */
const path = require("path");
try {
  require("dotenv").config({ path: path.join(__dirname, ".env") });
} catch {
  /* optional dep path */
}

module.exports = require("./app.json");
