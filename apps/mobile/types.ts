export type TabKey = "home" | "friends" | "profile";

export type OnboardingStep = "login" | "landing";

export type CommentItem = {
  id: string;
  user: string;
  text: string;
};

export type FeedItem = {
  id: string;
  user: string;
  song: string;
  artist: string;
  album?: string;
  albumCover?: string;
  previewUrl?: string;
  caption: string;
  liked: boolean;
  likes: number;
  comments: CommentItem[];
};

export type Friend = {
  id: string;
  name: string;
  handle: string;
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
