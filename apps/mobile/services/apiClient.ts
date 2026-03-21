import type { FavoriteArtistEntry, FavoriteSongEntry } from "../types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type { FavoriteArtistEntry, FavoriteSongEntry };

function ph(handle: string): string {
  return encodeURIComponent(handle);
}

/** On-device builds often need your PC's LAN IP, not localhost. */
const REQUEST_TIMEOUT_MS = 15_000;

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {})
      },
      ...options,
      signal: controller.signal
    });
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      const hint =
        API_BASE_URL.includes("localhost") || API_BASE_URL.includes("127.0.0.1")
          ? " On a physical phone, set EXPO_PUBLIC_API_BASE_URL to http://YOUR_COMPUTER_IP:4000 (same Wi‑Fi)."
          : "";
      const error = new Error(`Request timed out — server not reachable at ${API_BASE_URL}.${hint}`);
      (error as any).status = 408;
      throw error;
    }
    const error = new Error(
      `Network error (${err?.message ?? "fetch failed"}). Check EXPO_PUBLIC_API_BASE_URL and Wi‑Fi.`
    );
    (error as any).status = 0;
    throw error;
  }
  clearTimeout(timer);
  if (res.status === 204) {
    return undefined as T;
  }
  if (!res.ok) {
    const text = await res.text();
    let message = text || "Request failed";
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j && typeof j.error === "string") message = j.error;
    } catch {
      /* plain text body */
    }
    const error = new Error(message);
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

export type ApiPost = {
  _id: string;
  authorHandle: string;
  title: string;
  artist: string;
  album: string;
  albumCover?: string;
  previewUrl?: string;
  spotifyTrackId?: string;
  caption?: string;
  likes: number;
  comments: Array<{ authorHandle: string; text: string; createdAt: string }>;
};

export type ApiProfile = {
  name: string;
  profileHandle: string;
  spotifyUserId?: string;
  friends: string[];
  favoriteArtists: [FavoriteArtistEntry, FavoriteArtistEntry, FavoriteArtistEntry];
  favoriteSongs: [FavoriteSongEntry, FavoriteSongEntry, FavoriteSongEntry];
};

export const apiClient = {
  async getFeed() {
    const data = await request<{ items: ApiPost[] }>("/v1/posts");
    return data.items;
  },
  async createPost(payload: {
    authorHandle: string;
    title: string;
    artist: string;
    album: string;
    albumCover?: string;
    previewUrl?: string;
    spotifyTrackId?: string;
    caption?: string;
  }) {
    return request<ApiPost>("/v1/posts", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async addComment(postId: string, payload: { authorHandle: string; text: string }) {
    return request(`/v1/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async likePost(postId: string) {
    return request(`/v1/posts/${postId}/like`, { method: "POST" });
  },
  async unlikePost(postId: string) {
    return request(`/v1/posts/${postId}/like`, { method: "DELETE" });
  },
  async getProfile(handle: string): Promise<ApiProfile | null> {
    try {
      return await request<ApiProfile>(`/v1/profiles/${handle}`);
    } catch (err) {
      if ((err as any).status === 404) return null;
      throw err;
    }
  },

  /** Existing user: find profile by Spotify OAuth user id (public @handle may differ). */
  async getProfileBySpotifyUserId(
    spotifyUserId: string
  ): Promise<ApiProfile | null> {
    try {
      return await request<ApiProfile>(
        `/v1/profiles/by-spotify/${encodeURIComponent(spotifyUserId)}`
      );
    } catch (err) {
      if ((err as any).status === 404) return null;
      throw err;
    }
  },
  async createProfile(payload: {
    name: string;
    profileHandle: string;
    spotifyUserId?: string;
  }) {
    return request<ApiProfile>("/v1/profiles", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  /**
   * Let's Go: set @handle using Spotify user id in the body (reliable vs URL encoding).
   * Creates profile if missing (e.g. login couldn't reach server).
   */
  async completeOnboardingBySpotify(payload: {
    spotifyUserId: string;
    profileHandle: string;
    name: string;
  }) {
    return request<ApiProfile>("/v1/profiles/by-spotify/handle", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async updateProfile(handle: string, payload: Partial<ApiProfile>) {
    return request<ApiProfile>(`/v1/profiles/${ph(handle)}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  async renameProfileHandle(currentHandle: string, newHandle: string) {
    return request<ApiProfile>(
      `/v1/profiles/${encodeURIComponent(currentHandle)}/handle`,
      {
        method: "PATCH",
        body: JSON.stringify({ newHandle })
      }
    );
  },
  async setFavoriteArtists(
    handle: string,
    artists: [FavoriteArtistEntry, FavoriteArtistEntry, FavoriteArtistEntry]
  ) {
    return request(`/v1/profiles/${ph(handle)}/favorite-artists`, {
      method: "PUT",
      body: JSON.stringify({ artists })
    });
  },
  async setFavoriteSongs(
    handle: string,
    songs: [FavoriteSongEntry, FavoriteSongEntry, FavoriteSongEntry]
  ) {
    return request(`/v1/profiles/${ph(handle)}/favorite-songs`, {
      method: "PUT",
      body: JSON.stringify({ songs })
    });
  },
  async addFriend(handle: string, friendHandle: string) {
    return request(`/v1/profiles/${ph(handle)}/friends`, {
      method: "POST",
      body: JSON.stringify({ friendHandle })
    });
  },
  async removeFriend(handle: string, friendHandle: string) {
    return request(
      `/v1/profiles/${ph(handle)}/friends/${ph(friendHandle)}`,
      {
        method: "DELETE"
      }
    );
  },
  async listProfiles(limit = 100) {
    const data = await request<{ items: ApiProfile[] }>(
      `/v1/profiles?limit=${limit}`
    );
    return data.items;
  }
};
