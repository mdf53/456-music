import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? "";

/**
 * Build the redirect URI dynamically for the current environment.
 *
 * - Web:         http://localhost:PORT           (popup flow)
 * - Expo Go:     exp://IP:PORT/--/spotify-auth   (deep-link, NOT a project URL)
 * - Dev build:   keepintune://spotify-auth        (custom scheme)
 *
 * The non-empty `path` is critical for Expo Go: it adds the "/--/" separator
 * so Expo Go routes the redirect as a deep link instead of trying to reload
 * the entire project (which was causing the java.io.IOException).
 */
const REDIRECT_URI = (() => {
  if (Platform.OS === "web") {
    // For web: http://localhost:8081/callback — Spotify allows http://localhost
    return "http://localhost:8081/callback";
  }
  const raw = AuthSession.makeRedirectUri({
    scheme: "keepintune",
    path: "spotify-auth"
  });
  // Expo Go on some SDK versions uses expo:// but Spotify needs exp://
  return raw.replace(/^expo:\/\//, "exp://");
})();

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: TOKEN_ENDPOINT
};

const STORAGE_KEYS = {
  accessToken: "spotify.accessToken",
  refreshToken: "spotify.refreshToken",
  expiresAt: "spotify.expiresAt",
  userId: "spotify.userId",
  displayName: "spotify.displayName"
} as const;

const SCOPES = ["user-read-email", "user-read-private", "user-top-read"];

type TokenPayload = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

type StoredTokens = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  userId?: string;
  displayName?: string;
};

export type SpotifyUser = {
  id: string;
  displayName: string;
};

// Log once on startup so the user knows what to register in Spotify Dashboard
console.log(
  `\n===== SPOTIFY REDIRECT URI =====\nRegister this exact URI in your Spotify Dashboard:\n${REDIRECT_URI}\n================================\n`
);

function ensureClientId() {
  if (!CLIENT_ID) {
    throw new Error("Missing EXPO_PUBLIC_SPOTIFY_CLIENT_ID");
  }
}

async function saveTokens(tokens: StoredTokens) {
  await SecureStore.setItemAsync(STORAGE_KEYS.accessToken, tokens.accessToken);
  if (tokens.refreshToken) {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.refreshToken,
      tokens.refreshToken
    );
  }
  await SecureStore.setItemAsync(
    STORAGE_KEYS.expiresAt,
    String(tokens.expiresAt)
  );
  if (tokens.userId) {
    await SecureStore.setItemAsync(STORAGE_KEYS.userId, tokens.userId);
  }
  if (tokens.displayName) {
    await SecureStore.setItemAsync(
      STORAGE_KEYS.displayName,
      tokens.displayName
    );
  }
}

async function getStoredTokens(): Promise<StoredTokens | null> {
  const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.accessToken);
  if (!accessToken) return null;
  const refreshToken = await SecureStore.getItemAsync(
    STORAGE_KEYS.refreshToken
  );
  const expiresAtRaw = await SecureStore.getItemAsync(STORAGE_KEYS.expiresAt);
  const expiresAt = Number(expiresAtRaw || 0);
  const userId = await SecureStore.getItemAsync(STORAGE_KEYS.userId);
  const displayName = await SecureStore.getItemAsync(STORAGE_KEYS.displayName);
  return {
    accessToken,
    refreshToken,
    expiresAt,
    userId: userId ?? undefined,
    displayName: displayName ?? undefined
  };
}

async function exchangeToken(body: URLSearchParams): Promise<TokenPayload> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spotify token error: ${errorText}`);
  }
  return response.json();
}

export async function startSpotifyLogin(): Promise<SpotifyUser> {
  ensureClientId();
  console.log("[spotifyAuth] starting login");
  console.log("[spotifyAuth] redirect URI:", REDIRECT_URI);
  console.log("[spotifyAuth] platform:", Platform.OS);

  const request = new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    scopes: SCOPES,
    responseType: AuthSession.ResponseType.Code,
    redirectUri: REDIRECT_URI,
    usePKCE: true
  });

  const authUrl = await request.makeAuthUrlAsync(DISCOVERY);
  console.log("[spotifyAuth] auth url:", authUrl.substring(0, 120) + "...");

  let result: AuthSession.AuthSessionResult;
  try {
    // useProxy is intentionally omitted (deprecated in SDK 50+)
    result = await request.promptAsync(DISCOVERY);
  } catch (err) {
    console.error("[spotifyAuth] promptAsync error:", err);
    throw err;
  }

  console.log("[spotifyAuth] auth result type:", result.type);
  if (result.type !== "success" || !result.params?.code) {
    const msg =
      result.type === "error"
        ? `Spotify auth error: ${result.params?.error_description ?? result.params?.error ?? "unknown"}`
        : "Spotify authentication cancelled";
    throw new Error(msg);
  }

  console.log("[spotifyAuth] got auth code, exchanging for token...");
  const tokenPayload = await exchangeToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code: result.params.code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: request.codeVerifier ?? ""
    })
  );

  const expiresAt = Date.now() + tokenPayload.expires_in * 1000;
  await saveTokens({
    accessToken: tokenPayload.access_token,
    refreshToken: tokenPayload.refresh_token ?? null,
    expiresAt
  });

  console.log("[spotifyAuth] token saved, fetching profile...");
  const user = await fetchSpotifyUser(tokenPayload.access_token);
  await saveTokens({
    accessToken: tokenPayload.access_token,
    refreshToken: tokenPayload.refresh_token ?? null,
    expiresAt,
    userId: user.id,
    displayName: user.displayName
  });

  console.log("[spotifyAuth] login complete for:", user.displayName);
  return user;
}

async function fetchSpotifyUser(accessToken: string): Promise<SpotifyUser> {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Spotify profile error: ${errorText}`);
  }
  const data = await res.json();
  return {
    id: data.id,
    displayName: data.display_name || data.id
  };
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getStoredTokens();
  if (!tokens) return null;
  if (Date.now() < tokens.expiresAt - 60_000) {
    return tokens.accessToken;
  }
  if (!tokens.refreshToken) return null;
  ensureClientId();
  const refreshed = await exchangeToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
      client_id: CLIENT_ID
    })
  );
  const expiresAt = Date.now() + refreshed.expires_in * 1000;
  await saveTokens({
    accessToken: refreshed.access_token,
    refreshToken: tokens.refreshToken,
    expiresAt,
    userId: tokens.userId,
    displayName: tokens.displayName
  });
  return refreshed.access_token;
}

export async function getStoredUser(): Promise<SpotifyUser | null> {
  const tokens = await getStoredTokens();
  if (!tokens?.userId) return null;
  return {
    id: tokens.userId,
    displayName: tokens.displayName ?? tokens.userId
  };
}

export async function clearSpotifySession() {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.expiresAt);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.userId);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.displayName);
}
