export type TabKey = "home" | "friends" | "profile";

export type OnboardingStep = "login" | "landing" | "addFriends";

export type CommentItem = {
  id: string;
  commentIndex: number;
  user: string;
  text: string;
  liked: boolean;
  likes: number;
};

export type FeedItem = {
  id: string;
  user: string;
  song: string;
  artist: string;
  album?: string;
  albumCover?: string;
  previewUrl?: string;
  spotifyTrackId?: string;
  caption: string;
  liked: boolean;
  likes: number;
  comments: CommentItem[];
};

export type Friend = {
  id: string;
  name: string;
  handle: string;
  /** You sent them a request and it’s pending */
  pendingOutgoing?: boolean;
  /** Already in your friends list */
  isFriend?: boolean;
};

/** Matches server — Spotify image URLs stored for profile art. */
export type FavoriteSongEntry = {
  title: string;
  artist?: string;
  albumCoverUrl?: string;
};

export type FavoriteArtistEntry = {
  name: string;
  imageUrl?: string;
};
