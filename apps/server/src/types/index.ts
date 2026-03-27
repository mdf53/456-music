import { ObjectId } from "mongodb";

export interface Comment {
  /** Stored for legacy docs + for display fallback */
  authorHandle?: string;
  /** Unique per Spotify account (internal), never shown to users */
  authorSpotifyUserId?: string;
  text: string;
  createdAt: Date;
  /** Internal: Spotify account ids who liked the comment */
  likedBy?: string[];
}

export interface Post {
  _id?: ObjectId;
  authorHandle?: string;
  /** Unique per Spotify account (internal), never shown to users */
  authorSpotifyUserId?: string;
  title: string;
  artist: string;
  album: string;
  albumCover?: string;
  previewUrl?: string;
  spotifyTrackId?: string;
  caption?: string;
  likes: number;
  /** Internal: array of Spotify account ids who liked the post */
  likedBy?: string[];
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

/** One document per Spotify account: profile picture keyed by `spotifyUserId`. */
export interface ProfilePhotoDoc {
  _id?: ObjectId;
  spotifyUserId: string;
  /** Raw base64 (no data-URL prefix). */
  imageBase64: string;
  mimeType: string;
  updatedAt: Date;
}

export interface Profile {
  _id?: ObjectId;
  /** Spotify user id from OAuth — stable account key. */
  spotifyUserId?: string;
  name: string;
  /** Public @handle (may differ from spotifyUserId). */
  profileHandle: string;
  friends: string[];
  /** Handles that sent this user a friend request (incoming, pending). */
  friendRequestsReceived?: string[];
  /** Handles this user sent a friend request to (outgoing, pending). */
  friendRequestsSent?: string[];
  favoriteArtists: [FavoriteArtistEntry, FavoriteArtistEntry, FavoriteArtistEntry];
  favoriteSongs: [FavoriteSongEntry, FavoriteSongEntry, FavoriteSongEntry];
  createdAt: Date;
}
