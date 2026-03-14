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
  const encoded = encodeURIComponent(query);
  const data = await spotifyFetch<{ tracks: { items: Array<any> } }>(
    `/search?type=track&limit=${limit}&q=${encoded}`
  );
  return data.tracks.items.map(mapTrack);
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
