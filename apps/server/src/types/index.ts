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

export interface Profile {
  _id?: ObjectId;
  name: string;
  profileHandle: string;
  friends: string[];
  favoriteArtists: [string, string, string];
  favoriteSongs: [string, string, string];
  createdAt: Date;
}
