const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const REQUEST_TIMEOUT_MS = 5_000;

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
      throw new Error(`Request to ${path} timed out (server unreachable)`);
    }
    throw err;
  }
  clearTimeout(timer);
  if (res.status === 204) {
    return undefined as T;
  }
  if (!res.ok) {
    const text = await res.text();
    const error = new Error(text || "Request failed");
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
  caption?: string;
  likes: number;
  comments: Array<{ authorHandle: string; text: string; createdAt: string }>;
};

export type ApiProfile = {
  name: string;
  profileHandle: string;
  friends: string[];
  favoriteArtists: [string, string, string];
  favoriteSongs: [string, string, string];
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
  async createProfile(payload: { name: string; profileHandle: string }) {
    return request<ApiProfile>("/v1/profiles", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async updateProfile(handle: string, payload: Partial<ApiProfile>) {
    return request<ApiProfile>(`/v1/profiles/${handle}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  async setFavoriteArtists(handle: string, artists: [string, string, string]) {
    return request(`/v1/profiles/${handle}/favorite-artists`, {
      method: "PUT",
      body: JSON.stringify({ artists })
    });
  },
  async setFavoriteSongs(handle: string, songs: [string, string, string]) {
    return request(`/v1/profiles/${handle}/favorite-songs`, {
      method: "PUT",
      body: JSON.stringify({ songs })
    });
  },
  async addFriend(handle: string, friendHandle: string) {
    return request(`/v1/profiles/${handle}/friends`, {
      method: "POST",
      body: JSON.stringify({ friendHandle })
    });
  },
  async removeFriend(handle: string, friendHandle: string) {
    return request(`/v1/profiles/${handle}/friends/${friendHandle}`, {
      method: "DELETE"
    });
  },
  async listProfiles(limit = 100) {
    const data = await request<{ items: ApiProfile[] }>(
      `/v1/profiles?limit=${limit}`
    );
    return data.items;
  }
};
