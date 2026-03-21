import type { FeedItem, Friend } from "../types";
import { ClientCommunicator } from "./ClientCommunicator";

/**
 * API DTOs aligned with server src/types (Post, Profile, Comment, SongCollectionDoc, SavedSong).
 * Dates come over the wire as ISO strings; _id as string.
 */
type ApiComment = {
  authorHandle: string;
  text: string;
  createdAt: string;
};

type ApiPost = {
  _id: string;
  authorHandle: string;
  title: string;
  artist: string;
  album: string;
  albumCover?: string;
  previewUrl?: string;
  caption?: string;
  likes: number;
  comments: ApiComment[];
  createdAt?: string;
};

type FavoriteSongEntry = {
  title: string;
  artist?: string;
  albumCoverUrl?: string;
};

type FavoriteArtistEntry = {
  name: string;
  imageUrl?: string;
};

type ApiProfile = {
  _id?: string;
  name: string;
  profileHandle: string;
  spotifyUserId?: string;
  friends: string[];
  favoriteArtists: [FavoriteArtistEntry, FavoriteArtistEntry, FavoriteArtistEntry];
  favoriteSongs: [FavoriteSongEntry, FavoriteSongEntry, FavoriteSongEntry];
  createdAt?: string;
};

type ApiSavedSong = {
  title: string;
  artist: string;
  album?: string;
  albumCover?: string;
  postId?: string;
};

type ApiSongCollection = {
  _id?: string;
  profileHandle: string;
  savedSongs: ApiSavedSong[];
  updatedAt: string;
};

export const ServerFacade = {
  // Feed
  async getFeed(): Promise<FeedItem[]> {
    const data = await ClientCommunicator.get<{ items: ApiPost[] }>("/v1/posts");
    return data.items.map((post) => ({
      id: post._id,
      user: post.authorHandle,
      song: post.title,
      artist: post.artist,
      album: post.album,
      albumCover: post.albumCover,
      previewUrl: post.previewUrl,
      caption: post.caption ?? "",
      liked: false,
      likes: post.likes,
      comments: post.comments.map((comment, index) => ({
        id: `${post._id}-comment-${index}`,
        user: comment.authorHandle,
        text: comment.text
      }))
    }));
  },

  async createPost(payload: {
    authorHandle: string;
    title: string;
    artist: string;
    album: string;
    albumCover?: string;
    previewUrl?: string;
    caption?: string;
  }): Promise<FeedItem> {
    const post = await ClientCommunicator.post<ApiPost>("/v1/posts", payload);
    return {
      id: post._id,
      user: post.authorHandle,
      song: post.title,
      artist: post.artist,
      album: post.album,
      albumCover: post.albumCover,
      previewUrl: post.previewUrl,
      caption: post.caption ?? "",
      liked: false,
      likes: post.likes,
      comments: []
    };
  },

  async likePost(postId: string): Promise<void> {
    await ClientCommunicator.post(`/v1/posts/${postId}/like`);
  },

  async unlikePost(postId: string): Promise<void> {
    await ClientCommunicator.delete(`/v1/posts/${postId}/like`);
  },

  async addComment(postId: string, payload: { authorHandle: string; text: string }): Promise<void> {
    await ClientCommunicator.post(`/v1/posts/${postId}/comments`, payload);
  },

  // Profiles (handle encoded in URLs)
  async getProfile(handle: string): Promise<ApiProfile | null> {
    try {
      return await ClientCommunicator.get<ApiProfile>(
        `/v1/profiles/${encodeURIComponent(handle)}`
      );
    } catch (err: any) {
      if (err?.status === 404) return null;
      throw err;
    }
  },

  async getProfileBySpotifyUserId(
    spotifyUserId: string
  ): Promise<ApiProfile | null> {
    try {
      return await ClientCommunicator.get<ApiProfile>(
        `/v1/profiles/by-spotify/${encodeURIComponent(spotifyUserId)}`
      );
    } catch (err: any) {
      if (err?.status === 404) return null;
      throw err;
    }
  },

  async listProfiles(limit = 100): Promise<ApiProfile[]> {
    const data = await ClientCommunicator.get<{ items: ApiProfile[] }>(
      `/v1/profiles?limit=${limit}`
    );
    return data.items;
  },

  async createProfile(payload: {
    name: string;
    profileHandle: string;
    spotifyUserId?: string;
  }): Promise<ApiProfile> {
    return ClientCommunicator.post<ApiProfile>("/v1/profiles", payload);
  },

  async updateProfile(handle: string, payload: Partial<ApiProfile>): Promise<ApiProfile> {
    return ClientCommunicator.patch<ApiProfile>(
      `/v1/profiles/${encodeURIComponent(handle)}`,
      payload
    );
  },

  async setFavoriteArtists(
    handle: string,
    artists: [FavoriteArtistEntry, FavoriteArtistEntry, FavoriteArtistEntry]
  ): Promise<void> {
    await ClientCommunicator.put(
      `/v1/profiles/${encodeURIComponent(handle)}/favorite-artists`,
      { artists }
    );
  },

  async setFavoriteSongs(
    handle: string,
    songs: [FavoriteSongEntry, FavoriteSongEntry, FavoriteSongEntry]
  ): Promise<void> {
    await ClientCommunicator.put(
      `/v1/profiles/${encodeURIComponent(handle)}/favorite-songs`,
      { songs }
    );
  },

  async addFriend(handle: string, friendHandle: string): Promise<void> {
    await ClientCommunicator.post(
      `/v1/profiles/${encodeURIComponent(handle)}/friends`,
      { friendHandle }
    );
  },

  async removeFriend(handle: string, friendHandle: string): Promise<void> {
    await ClientCommunicator.delete(
      `/v1/profiles/${encodeURIComponent(handle)}/friends/${encodeURIComponent(friendHandle)}`
    );
  },

  // Song collections (mirrors server SongCollectionDoc / SavedSong)
  async getSongCollection(profileHandle: string): Promise<ApiSongCollection> {
    return ClientCommunicator.get<ApiSongCollection>(`/v1/collections/${encodeURIComponent(profileHandle)}`);
  },

  async addSavedSong(
    profileHandle: string,
    song: ApiSavedSong
  ): Promise<ApiSongCollection> {
    await ClientCommunicator.post(`/v1/collections/${encodeURIComponent(profileHandle)}/songs`, song);
    return this.getSongCollection(profileHandle);
  },

  async removeSavedSong(profileHandle: string, index: number): Promise<void> {
    await ClientCommunicator.delete(
      `/v1/collections/${encodeURIComponent(profileHandle)}/songs/${index}`
    );
  },

  async setSavedSongs(
    profileHandle: string,
    savedSongs: ApiSavedSong[]
  ): Promise<ApiSongCollection> {
    return ClientCommunicator.put<ApiSongCollection>(
      `/v1/collections/${encodeURIComponent(profileHandle)}/songs`,
      { savedSongs }
    );
  },

  // Helpers tailored for the presenter
  async loadProfileWithSuggestions(handle: string): Promise<{
    profile: ApiProfile;
    friends: Friend[];
    suggestions: Friend[];
  } | null> {
    const profile = await this.getProfile(handle);
    if (!profile) return null;

    const friendProfiles = await Promise.all(
      profile.friends.map(async (friendHandle) => {
        const friendProfile = await this.getProfile(friendHandle);
        return {
          id: friendHandle,
          name: friendProfile?.name ?? friendHandle,
          handle: friendHandle
        };
      })
    );

    const allProfiles = await this.listProfiles();
    const suggestions: Friend[] = allProfiles
      .filter((item) => item.profileHandle !== handle)
      .filter((item) => !profile.friends.includes(item.profileHandle))
      .map((item) => ({
        id: item.profileHandle,
        name: item.name,
        handle: item.profileHandle
      }));

    return { profile, friends: friendProfiles, suggestions };
  }
};

