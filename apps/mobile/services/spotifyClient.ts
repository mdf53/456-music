import { getValidAccessToken } from "./spotifyAuth";

export type SpotifyTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumCover?: string;
  previewUrl?: string;
};

export type SpotifyArtist = {
  id: string;
  name: string;
  imageUrl?: string;
};

/**
 * Spotify Search API: limit range is 0–10 only (not 50).
 * Values above 10 return 400 "Invalid limit".
 * @see https://developer.spotify.com/documentation/web-api/reference/search
 */
function clampSpotifySearchLimit(limit?: number): number {
  const n = Math.floor(Number(limit));
  if (!Number.isFinite(n) || n < 1) return 10;
  return Math.min(10, n);
}

async function spotifyFetch<T>(path: string): Promise<T> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error("Not authenticated with Spotify");
  }
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Spotify API error: ${errorText}`);
  }
  return res.json();
}

export async function getMe() {
  return spotifyFetch("/me");
}

export async function getTopArtists(limit = 3): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<{ items: Array<any> }>(
    `/me/top/artists?limit=${limit}`
  );
  return data.items.map((artist) => ({
    id: artist.id,
    name: artist.name,
    imageUrl: artist.images?.[0]?.url
  }));
}

export async function getTopTracks(limit = 10): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ items: Array<any> }>(
    `/me/top/tracks?limit=${limit}`
  );
  return data.items.map(mapTrack);
}

export async function searchTracks(query: string, limit = 10) {
  const q = query.trim();
  if (!q) return [];
  const lim = clampSpotifySearchLimit(limit);
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("type", "track");
  params.set("limit", String(lim));
  params.set("offset", "0");
  const data = await spotifyFetch<{ tracks: { items: Array<any> } }>(
    `/search?${params.toString()}`
  );
  return (data.tracks?.items ?? []).filter(Boolean).map(mapTrack);
}

export async function searchArtists(query: string, limit = 10): Promise<SpotifyArtist[]> {
  const q = query.trim();
  if (!q) return [];
  const lim = clampSpotifySearchLimit(limit);
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("type", "artist");
  params.set("limit", String(lim));
  params.set("offset", "0");
  const data = await spotifyFetch<{ artists: { items: Array<any> } }>(
    `/search?${params.toString()}`
  );
  return (data.artists?.items ?? []).filter(Boolean).map((artist) => ({
    id: artist.id,
    name: artist.name,
    imageUrl: artist.images?.[0]?.url
  }));
}

export async function getTrack(id: string): Promise<SpotifyTrack> {
  const data = await spotifyFetch<any>(`/tracks/${id}`);
  return mapTrack(data);
}

export async function getRecentlyPlayed(limit = 10): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ items: Array<{ track: any }> }>(
    `/me/player/recently-played?limit=${limit}`
  );
  return data.items.map((item) => mapTrack(item.track));
}

function mapTrack(track: any): SpotifyTrack {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists?.map((a: any) => a.name).join(", ") ?? "",
    album: track.album?.name ?? "",
    albumCover: track.album?.images?.[0]?.url,
    previewUrl: track.preview_url ?? undefined
  };
}
