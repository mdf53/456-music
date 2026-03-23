import { useEffect, useMemo, useState } from "react";
import type { FeedItem, Friend, OnboardingStep, TabKey } from "../types";
import { apiClient } from "../services/apiClient";
import { startSpotifyLogin } from "../services/spotifyAuth";
import {
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
  searchTracks,
  type SpotifyArtist,
  type SpotifyTrack
} from "../services/spotifyClient";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "friends", label: "Friends" },
  { key: "home", label: "Home" },
  { key: "profile", label: "Profile" }
];

const friendHistory = [
  {
    id: "fh-1",
    song: "Late Night Drive",
    artist: "Artist Name",
    date: "Today"
  },
  {
    id: "fh-2",
    song: "Morning Glow",
    artist: "Artist Name",
    date: "Yesterday"
  }
];

export function useAppPresenter() {
  const [signedIn, setSignedIn] = useState(false);
  const [onboardingStep, setOnboardingStep] =
    useState<OnboardingStep>("login");
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [hasSharedToday, setHasSharedToday] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [showCaptionPopup, setShowCaptionPopup] = useState(false);
  const [showCommentsPopup, setShowCommentsPopup] = useState(false);
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [suggested, setSuggested] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend>({
    id: "friend-1",
    name: "Friend",
    handle: "friend"
  });
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [profileTab, setProfileTab] = useState<"history" | "favorites">(
    "history"
  );
  const [shareHistory, setShareHistory] = useState<
    Array<{ id: string; song: string; artist: string; date: string }>
  >([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileHandle, setProfileHandle] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [favoriteArtists, setFavoriteArtists] = useState<string[]>([]);
  const [favoriteSongs, setFavoriteSongs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [suggestedTracks, setSuggestedTracks] = useState<SpotifyTrack[]>([]);

  const availableTracks = searchResults.length ? searchResults : topTracks;
  const selectedSong = [...searchResults, ...topTracks].find(
    (song) => song.id === selectedSongId
  );
  const activeFeed = feedItems.find((item) => item.id === activeFeedId);

  useEffect(() => {
    if (!signedIn || !profileHandle) return;
    void loadProfile(profileHandle);
    void loadFeed();
  }, [signedIn, profileHandle]);

  async function loadFeed() {
    try {
      console.log("[presenter] loading feed");
      const posts = await apiClient.getFeed();
      const mapped: FeedItem[] = posts.map((post) => ({
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
      setFeedItems(mapped);
      console.log("[presenter] feed loaded", mapped.length);
    } catch (err) {
      console.warn("[presenter] feed unavailable (server may be offline):", err);
    }
  }

  async function loadProfile(handle: string) {
    console.log("[presenter] loading profile", handle);
    let profile;
    try {
      profile = await apiClient.getProfile(handle);
    } catch (err) {
      console.warn("[presenter] profile unavailable (server may be offline):", err);
      return;
    }
    if (!profile) return;
    setProfileName(profile.name);
    setFavoriteArtists(profile.favoriteArtists.filter(Boolean));
    setFavoriteSongs(profile.favoriteSongs.filter(Boolean));
    const friendProfiles = await Promise.all(
      profile.friends.map(async (friendHandle) => {
        const friendProfile = await apiClient.getProfile(friendHandle);
        return {
          id: friendHandle,
          name: friendProfile?.name ?? friendHandle,
          handle: friendHandle
        };
      })
    );
    setFriends(friendProfiles);
    const allProfiles = await apiClient.listProfiles();
    const suggestions = allProfiles
      .filter((item) => item.profileHandle !== handle)
      .filter(
        (item) => !profile.friends.includes(item.profileHandle)
      )
      .map((item) => ({
        id: item.profileHandle,
        name: item.name,
        handle: item.profileHandle
      }));
    setSuggested(suggestions);
    console.log("[presenter] profile loaded");
  }

  async function syncFavorites(handle: string) {
    console.log("[presenter] syncing favorites");
    const artists = await getTopArtists(6);
    const tracks = await getTopTracks(6);
    setTopArtists(artists);
    const favoriteArtistNames = artists.slice(0, 3).map((a) => a.name);
    const favoriteSongNames = tracks.slice(0, 3).map((t) => t.title);
    setFavoriteArtists(favoriteArtistNames);
    setFavoriteSongs(favoriteSongNames);
    setSuggestedTracks(tracks);
    try {
      await apiClient.setFavoriteArtists(handle, padThree(favoriteArtistNames));
      await apiClient.setFavoriteSongs(handle, padThree(favoriteSongNames));
    } catch {
      console.warn("[presenter] could not persist favorites to server");
    }
    console.log("[presenter] favorites synced");
  }

  const actions = {
    login: async () => {
      try {
        console.log("[presenter] login start");
        setAuthLoading(true);
        setAuthError(null);

        // Step 1 -- Spotify auth (required)
        const user = await startSpotifyLogin();
        console.log("[presenter] spotify user:", user.id);
        const handle = user.id;
        setProfileHandle(handle);
        setProfileName(user.displayName);

        // Step 2 -- Backend sync (best-effort; server may not be running)
        try {
          const existing = await apiClient.getProfile(handle);
          if (!existing) {
            console.log("[presenter] creating profile", handle);
            await apiClient.createProfile({
              name: user.displayName,
              profileHandle: handle
            });
          }
        } catch (e) {
          console.warn("[presenter] backend unreachable, skipping profile sync:", e);
        }

        // Step 3 -- Spotify favorites (best-effort)
        try {
          await syncFavorites(handle);
        } catch (e) {
          console.warn("[presenter] could not sync favorites:", e);
        }

        // Step 4 -- Top tracks for Add Song screen (best-effort)
        try {
          const top = await getTopTracks(10);
          setTopTracks(top);
        } catch (e) {
          console.warn("[presenter] could not load top tracks:", e);
        }

        setOnboardingStep("friends");
        console.log("[presenter] login complete");
      } catch (err) {
        setAuthError((err as Error).message);
        console.error("[presenter] login error:", err);
      } finally {
        setAuthLoading(false);
      }
    },
    continueOnboarding: () => {
      if (onboardingStep === "friends") {
        setOnboardingStep("favorites");
        return;
      }
      setSignedIn(true);
    },
    setActiveTab,
    openAddSong: () => setShowAddSong(true),
    closeAddSong: () => setShowAddSong(false),
    openCaption: () => setShowCaptionPopup(true),
    closeCaption: () => setShowCaptionPopup(false),
    openComments: (feedId: string) => {
      setActiveFeedId(feedId);
      setShowCommentsPopup(true);
    },
    closeComments: () => setShowCommentsPopup(false),
    toggleLike: async (feedId: string) => {
      const target = feedItems.find((item) => item.id === feedId);
      if (!target) return;
      setFeedItems((prev) =>
        prev.map((item) =>
          item.id === feedId
            ? {
                ...item,
                liked: !item.liked,
                likes: item.liked
                  ? Math.max(0, item.likes - 1)
                  : item.likes + 1
              }
            : item
        )
      );
      try {
        if (target.liked) {
          await apiClient.unlikePost(feedId);
        } else {
          await apiClient.likePost(feedId);
        }
      } catch (err) {
        console.error(err);
      }
    },
    acceptRequest: async (friend: Friend) => {
      if (!profileHandle) return;
      await apiClient.addFriend(profileHandle, friend.handle);
      setRequests((prev) => prev.filter((item) => item.id !== friend.id));
      setFriends((prev) => [friend, ...prev]);
    },
    declineRequest: (friend: Friend) => {
      setRequests((prev) => prev.filter((item) => item.id !== friend.id));
    },
    toggleFriend: async (friend: Friend) => {
      if (!profileHandle) return;
      const exists = friends.some((item) => item.id === friend.id);
      if (exists) {
        await apiClient.removeFriend(profileHandle, friend.handle);
      } else {
        await apiClient.addFriend(profileHandle, friend.handle);
      }
      setFriends((prev) => {
        if (exists) {
          return prev.filter((item) => item.id !== friend.id);
        }
        return [friend, ...prev];
      });
    },
    toggleSuggested: async (friend: Friend) => {
      if (!profileHandle) return;
      const exists = friends.some((item) => item.id === friend.id);
      if (exists) {
        await apiClient.removeFriend(profileHandle, friend.handle);
      } else {
        await apiClient.addFriend(profileHandle, friend.handle);
      }
      setFriends((prev) => {
        if (exists) {
          return prev.filter((item) => item.id !== friend.id);
        }
        return [friend, ...prev];
      });
    },
    viewFriend: (friend: Friend) => {
      setSelectedFriend(friend);
      setShowFriendProfile(true);
    },
    closeFriendProfile: () => setShowFriendProfile(false),
    togglePlaylist: () => setShowPlaylistPopup((prev) => !prev),
    setProfileTab,
    setSelectedSongId,
    setCommentDraft,
    postComment: async () => {
      if (!activeFeedId || !commentDraft.trim() || !profileHandle) {
        return;
      }
      const newComment = {
        id: `c-${Date.now()}`,
        user: profileHandle,
        text: commentDraft.trim()
      };
      setFeedItems((prev) =>
        prev.map((item) =>
          item.id === activeFeedId
            ? { ...item, comments: [...item.comments, newComment] }
            : item
        )
      );
      setCommentDraft("");
      try {
        await apiClient.addComment(activeFeedId, {
          authorHandle: profileHandle,
          text: newComment.text
        });
      } catch (err) {
        console.error(err);
      }
    },
    confirmShare: async () => {
      if (!selectedSong || !profileHandle) return;
      setShowCaptionPopup(false);
      setHasSharedToday(true);
      setShowAddSong(false);
      setActiveTab("home");
      setShareHistory((prev) => [
        {
          id: `h-${Date.now()}`,
          song: selectedSong.title,
          artist: selectedSong.artist,
          date: "Today"
        },
        ...prev
      ]);
      try {
        const post = await apiClient.createPost({
          authorHandle: profileHandle,
          title: selectedSong.title,
          artist: selectedSong.artist,
          album: selectedSong.album ?? "",
          albumCover: selectedSong.albumCover,
          previewUrl: selectedSong.previewUrl
        });
        setFeedItems((prev) => [
          {
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
          },
          ...prev
        ]);
      } catch (err) {
        console.error(err);
      }
    },
    setSearchQuery,
    runSearch: async () => {
      if (!searchQuery.trim()) return;
      try {
        setSearchLoading(true);
        const results = await searchTracks(searchQuery.trim(), 10);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }
  };

  return {
    state: {
      tabs,
      friendHistory,
      signedIn,
      onboardingStep,
      activeTab,
      hasSharedToday,
      showAddSong,
      showCaptionPopup,
      showCommentsPopup,
      showFriendProfile,
      showPlaylistPopup,
      selectedSongId,
      friends,
      requests,
      suggested,
      selectedFriend,
      activeFeedId,
      commentDraft,
      profileTab,
      shareHistory,
      feedItems,
      selectedSong,
      activeFeed,
      authLoading,
      authError,
      profileHandle,
      profileName,
      favoriteArtists,
      favoriteSongs,
      searchQuery,
      searchLoading,
      availableTracks,
      topTracks,
      topArtists,
      suggestedTracks
    },
    actions
  };
}

function padThree(values: string[]): [string, string, string] {
  return [values[0] ?? "", values[1] ?? "", values[2] ?? ""];
}
