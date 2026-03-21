import { ObjectId } from "mongodb";

export interface Comment {
  authorHandle: string;
  text: string;
  createdAt: Date;
}

export interface Post {
  _id?: ObjectId;
  authorHandle: string;
  title: string;
  artist: string;
  album: string;
  albumCover?: string;
  previewUrl?: string;
  caption?: string;
  likes: number;
  comments: Comment[];
  createdAt: Date;
}

export interface SavedSong {
  title: string;
  artist: string;
  album?: string;
  albumCover?: string;
  postId?: string;
}

export interface SongCollectionDoc {
  _id?: ObjectId;
  profileHandle: string;
  savedSongs: SavedSong[];
  updatedAt: Date;
}

/** Persisted favorite song (Spotify album art URL is stable CDN HTTPS). */
export interface FavoriteSongEntry {
  title: string;
  artist?: string;
  albumCoverUrl?: string;
}

/** Persisted favorite artist (Spotify artist image URL). */
export interface FavoriteArtistEntry {
  name: string;
  imageUrl?: string;
}

export interface Profile {
  _id?: ObjectId;
  /** Spotify user id from OAuth — stable account key. */
  spotifyUserId?: string;
  name: string;
  /** Public @handle (may differ from spotifyUserId). */
  profileHandle: string;
  friends: string[];
  favoriteArtists: [FavoriteArtistEntry, FavoriteArtistEntry, FavoriteArtistEntry];
  favoriteSongs: [FavoriteSongEntry, FavoriteSongEntry, FavoriteSongEntry];
  createdAt: Date;
}
