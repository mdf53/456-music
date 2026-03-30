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

/** Local calendar day [midnight, next midnight) for the device timezone. */
export function getLocalCalendarDayBounds(now = new Date()): { after: Date; before: Date } {
  const after = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const before = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return { after, before };
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
  liked?: boolean;
  createdAt?: string;
  comments: Array<{
    authorHandle: string;
    text: string;
    createdAt: string;
    liked?: boolean;
    likes?: number;
  }>;
};

export type ApiProfile = {
  name: string;
  profileHandle: string;
  spotifyUserId?: string;
  friends: string[];
  friendRequestsReceived?: string[];
  friendRequestsSent?: string[];
  favoriteArtists: [FavoriteArtistEntry, FavoriteArtistEntry, FavoriteArtistEntry];
  favoriteSongs: [FavoriteSongEntry, FavoriteSongEntry, FavoriteSongEntry];
};

export const apiClient = {
  async getFeed(viewerSpotifyUserId?: string | null) {
    const params = new URLSearchParams();
    if (viewerSpotifyUserId?.trim()) {
      params.set("viewerSpotifyUserId", viewerSpotifyUserId.trim());
    }
    const { after, before } = getLocalCalendarDayBounds();
    params.set("after", after.toISOString());
    params.set("before", before.toISOString());
    const qs = params.toString();
    const data = await request<{ items: ApiPost[] }>(`/v1/posts?${qs}`);
    return data.items;
  },
  async createPost(payload: {
    authorHandle: string;
    authorSpotifyUserId: string;
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
  async addComment(
    postId: string,
    payload: { authorHandle?: string; authorSpotifyUserId: string; text: string }
  ) {
    return request(`/v1/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async likeComment(
    postId: string,
    commentIndex: number,
    viewerSpotifyUserId: string
  ): Promise<{ liked: boolean; likes: number }> {
    return request(`/v1/posts/${postId}/comments/${commentIndex}/like`, {
      method: "POST",
      body: JSON.stringify({ viewerSpotifyUserId })
    });
  },
  async unlikeComment(
    postId: string,
    commentIndex: number,
    viewerSpotifyUserId: string
  ): Promise<{ liked: boolean; likes: number }> {
    return request(`/v1/posts/${postId}/comments/${commentIndex}/like`, {
      method: "DELETE",
      body: JSON.stringify({ viewerSpotifyUserId })
    });
  },
  async likePost(
    postId: string,
    viewerSpotifyUserId: string
  ): Promise<{ liked: boolean; likes: number }> {
    return request<{ liked: boolean; likes: number }>(`/v1/posts/${postId}/like`, {
      method: "POST",
      body: JSON.stringify({ viewerSpotifyUserId })
    });
  },
  async unlikePost(
    postId: string,
    viewerSpotifyUserId: string
  ): Promise<{ liked: boolean; likes: number }> {
    return request<{ liked: boolean; likes: number }>(`/v1/posts/${postId}/like`, {
      method: "DELETE",
      body: JSON.stringify({ viewerSpotifyUserId })
    });
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

  /** Onboarding: Spotify user ids you follow → app profiles (batch). */
  async resolveProfilesBySpotifyIds(spotifyUserIds: string[]): Promise<ApiProfile[]> {
    if (spotifyUserIds.length === 0) return [];
    const data = await request<{ items: ApiProfile[] }>(
      "/v1/profiles/resolve-spotify-accounts",
      {
        method: "POST",
        body: JSON.stringify({ spotifyUserIds })
      }
    );
    return data.items;
  },

  async getPostsByAuthor(authorHandle: string): Promise<ApiPost[]> {
    const data = await request<{ items: ApiPost[] }>(
      `/v1/posts/author/${encodeURIComponent(authorHandle)}`
    );
    return data.items;
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
  },

  /** Friends of friends of this user (for suggested friends). */
  async getFriendsOfFriendsSuggestions(handle: string): Promise<ApiProfile[]> {
    const data = await request<{ items: ApiProfile[] }>(
      `/v1/profiles/${ph(handle)}/friends-of-friends`
    );
    return data.items;
  },

  async searchProfiles(query: string, limit = 20) {
    const q = encodeURIComponent(query.trim());
    const data = await request<{ items: ApiProfile[] }>(
      `/v1/profiles/lookup?q=${q}&limit=${limit}`
    );
    return data.items;
  },

  async sendFriendRequest(fromHandle: string, toHandle: string) {
    return request<{ sent: boolean }>(`/v1/profiles/${ph(fromHandle)}/friend-requests`, {
      method: "POST",
      body: JSON.stringify({ toHandle })
    });
  },

  async acceptFriendRequest(accepterHandle: string, requesterHandle: string) {
    return request<ApiProfile>(
      `/v1/profiles/${ph(accepterHandle)}/friend-requests/${ph(requesterHandle)}/accept`,
      { method: "POST" }
    );
  },

  async declineFriendRequest(declinerHandle: string, requesterHandle: string) {
    return request<void>(
      `/v1/profiles/${ph(declinerHandle)}/friend-requests/${ph(requesterHandle)}`,
      { method: "DELETE" }
    );
  },

  async getProfilePhoto(spotifyUserId: string): Promise<{
    imageBase64: string;
    mimeType: string;
  } | null> {
    try {
      return await request<{ imageBase64: string; mimeType: string }>(
        `/v1/profile-photos/by-spotify/${encodeURIComponent(spotifyUserId)}`
      );
    } catch (err) {
      if ((err as any).status === 404) return null;
      throw err;
    }
  },

  async putProfilePhoto(
    spotifyUserId: string,
    payload: { imageBase64: string; mimeType: string }
  ): Promise<{ imageBase64: string; mimeType: string }> {
    return request(`/v1/profile-photos/by-spotify/${encodeURIComponent(spotifyUserId)}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  /** Resolve stored avatars for a list of public @handles (batch). */
  async batchProfilePhotos(handles: string[]): Promise<{
    photos: Record<string, { imageBase64: string; mimeType: string }>;
  }> {
    return request(`/v1/profile-photos/batch`, {
      method: "POST",
      body: JSON.stringify({ handles })
    });
  }
};
