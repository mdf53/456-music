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

const { expo } = require("./app.json");

// Local dev talks to a LAN-IP/localhost server over plain HTTP; production
// builds must use HTTPS, so these exceptions only apply outside production.
const isProductionBuild = process.env.EAS_BUILD_PROFILE === "production";

module.exports = {
  expo: isProductionBuild
    ? expo
    : {
        ...expo,
        ios: {
          ...expo.ios,
          infoPlist: {
            NSAppTransportSecurity: { NSAllowsLocalNetworking: true }
          }
        },
        android: {
          ...expo.android,
          usesCleartextTraffic: true
        }
      }
};
