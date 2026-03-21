import type {
  FavoriteArtistEntry,
  FavoriteSongEntry,
  Profile
} from "../types";

/** Spotify CDN URLs are stable HTTPS links; we persist them for profile art. */

export function normalizeFavoriteSongEntry(raw: unknown): FavoriteSongEntry {
  if (typeof raw === "string") return { title: raw };
  if (raw && typeof raw === "object" && "title" in raw) {
    const o = raw as Record<string, unknown>;
    return {
      title: String(o.title ?? ""),
      artist: o.artist != null ? String(o.artist) : undefined,
      albumCoverUrl:
        o.albumCoverUrl != null
          ? String(o.albumCoverUrl)
          : o.albumCover != null
            ? String(o.albumCover)
            : undefined
    };
  }
  return { title: "" };
}

export function normalizeFavoriteArtistEntry(raw: unknown): FavoriteArtistEntry {
  if (typeof raw === "string") return { name: raw };
  if (raw && typeof raw === "object" && "name" in raw) {
    const o = raw as Record<string, unknown>;
    return {
      name: String(o.name ?? ""),
      imageUrl: o.imageUrl != null ? String(o.imageUrl) : undefined
    };
  }
  return { name: "" };
}

export function normalizeFavoriteSongsTuple(
  raw: unknown
): [FavoriteSongEntry, FavoriteSongEntry, FavoriteSongEntry] {
  if (!Array.isArray(raw) || raw.length !== 3) {
    return [{ title: "" }, { title: "" }, { title: "" }];
  }
  return [
    normalizeFavoriteSongEntry(raw[0]),
    normalizeFavoriteSongEntry(raw[1]),
    normalizeFavoriteSongEntry(raw[2])
  ];
}

export function normalizeFavoriteArtistsTuple(
  raw: unknown
): [FavoriteArtistEntry, FavoriteArtistEntry, FavoriteArtistEntry] {
  if (!Array.isArray(raw) || raw.length !== 3) {
    return [{ name: "" }, { name: "" }, { name: "" }];
  }
  return [
    normalizeFavoriteArtistEntry(raw[0]),
    normalizeFavoriteArtistEntry(raw[1]),
    normalizeFavoriteArtistEntry(raw[2])
  ];
}

export function normalizeProfileFavorites(profile: Profile): Profile {
  return {
    ...profile,
    favoriteSongs: normalizeFavoriteSongsTuple(profile.favoriteSongs as unknown),
    favoriteArtists: normalizeFavoriteArtistsTuple(profile.favoriteArtists as unknown)
  };
}

export function parseFavoriteSongEntryBody(raw: unknown): FavoriteSongEntry {
  return normalizeFavoriteSongEntry(raw);
}

export function parseFavoriteArtistEntryBody(raw: unknown): FavoriteArtistEntry {
  return normalizeFavoriteArtistEntry(raw);
}
