"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFavoriteSongEntry = normalizeFavoriteSongEntry;
exports.normalizeFavoriteArtistEntry = normalizeFavoriteArtistEntry;
exports.normalizeFavoriteSongsTuple = normalizeFavoriteSongsTuple;
exports.normalizeFavoriteArtistsTuple = normalizeFavoriteArtistsTuple;
exports.normalizeProfileFavorites = normalizeProfileFavorites;
exports.parseFavoriteSongEntryBody = parseFavoriteSongEntryBody;
exports.parseFavoriteArtistEntryBody = parseFavoriteArtistEntryBody;
/** Spotify CDN URLs are stable HTTPS links; we persist them for profile art. */
function normalizeFavoriteSongEntry(raw) {
    if (typeof raw === "string")
        return { title: raw };
    if (raw && typeof raw === "object" && "title" in raw) {
        const o = raw;
        return {
            title: String(o.title ?? ""),
            artist: o.artist != null ? String(o.artist) : undefined,
            albumCoverUrl: o.albumCoverUrl != null
                ? String(o.albumCoverUrl)
                : o.albumCover != null
                    ? String(o.albumCover)
                    : undefined
        };
    }
    return { title: "" };
}
function normalizeFavoriteArtistEntry(raw) {
    if (typeof raw === "string")
        return { name: raw };
    if (raw && typeof raw === "object" && "name" in raw) {
        const o = raw;
        return {
            name: String(o.name ?? ""),
            imageUrl: o.imageUrl != null ? String(o.imageUrl) : undefined
        };
    }
    return { name: "" };
}
function normalizeFavoriteSongsTuple(raw) {
    if (!Array.isArray(raw) || raw.length !== 3) {
        return [{ title: "" }, { title: "" }, { title: "" }];
    }
    return [
        normalizeFavoriteSongEntry(raw[0]),
        normalizeFavoriteSongEntry(raw[1]),
        normalizeFavoriteSongEntry(raw[2])
    ];
}
function normalizeFavoriteArtistsTuple(raw) {
    if (!Array.isArray(raw) || raw.length !== 3) {
        return [{ name: "" }, { name: "" }, { name: "" }];
    }
    return [
        normalizeFavoriteArtistEntry(raw[0]),
        normalizeFavoriteArtistEntry(raw[1]),
        normalizeFavoriteArtistEntry(raw[2])
    ];
}
function normalizeProfileFavorites(profile) {
    return {
        ...profile,
        favoriteSongs: normalizeFavoriteSongsTuple(profile.favoriteSongs),
        favoriteArtists: normalizeFavoriteArtistsTuple(profile.favoriteArtists)
    };
}
function parseFavoriteSongEntryBody(raw) {
    return normalizeFavoriteSongEntry(raw);
}
function parseFavoriteArtistEntryBody(raw) {
    return normalizeFavoriteArtistEntry(raw);
}
