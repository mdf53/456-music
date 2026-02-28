# Keep In Tune

Music sharing app inspired by daily prompts, built with React Native and Node.js.

## Repo layout
- `apps/mobile`: Expo React Native app
- `apps/server`: Express API server

## Quick start
### Mobile
1. `cd apps/mobile`
2. `npm run start`

### Server
1. `cd apps/server`
2. `npm run dev`

## Current basics
- Sign in screen (placeholder)
- Home feed with a demo song card
- Comments view
- Add song screen with music source placeholders
- Friends list and profile placeholders
- API server with `/health`, `/v1/ping`, `/v1/feed`

## Node version note
- Expo SDK 54 expects Node 20+. The mobile start script includes a small polyfill so it can run on Node 18, but upgrading to Node 20 is still recommended.
