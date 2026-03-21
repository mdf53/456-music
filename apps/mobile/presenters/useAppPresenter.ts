import { useEffect, useMemo, useState } from "react";
import type {
  FavoriteArtistEntry,
  FavoriteSongEntry,
  FeedItem,
  Friend,
  OnboardingStep,
  TabKey
} from "../types";
import { apiClient, type ApiProfile } from "../services/apiClient";
import { startSpotifyLogin } from "../services/spotifyAuth";
import {
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
  searchTracks,
  searchArtists,
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
  const [outgoingFriendRequests, setOutgoingFriendRequests] = useState<string[]>([]);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [friendSearchResults, setFriendSearchResults] = useState<Friend[]>([]);
  const [friendSearchLoading, setFriendSearchLoading] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend>({
    id: "friend-1",
    name: "Friend",
    handle: "friend"
  });
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [captionDraft, setCaptionDraft] = useState("");
  const [feedRefreshing, setFeedRefreshing] = useState(false);
  const [profileTab, setProfileTab] = useState<"history" | "favorites">(
    "history"
  );
  const [shareHistory, setShareHistory] = useState<
    Array<{ id: string; song: string; artist: string; date: string; albumCover?: string }>
  >([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileHandle, setProfileHandle] = useState<string | null>(null);
  /** Spotify OAuth user id — stable key for API `by-spotify/handle` (may differ from public @handle). */
  const [spotifyUserId, setSpotifyUserId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [favoriteArtists, setFavoriteArtists] = useState<FavoriteArtistEntry[]>([]);
  const [favoriteSongs, setFavoriteSongs] = useState<FavoriteSongEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [suggestedTracks, setSuggestedTracks] = useState<SpotifyTrack[]>([]);

  /** Onboarding: search bar + pick a slot + tap result to save favorite */
  const [onboardingSearchQuery, setOnboardingSearchQuery] = useState("");
  const [onboardingFavoriteTarget, setOnboardingFavoriteTarget] = useState<{
    kind: "song" | "artist";
    index: number;
  } | null>(null);
  const [onboardingSpotifySearchOpen, setOnboardingSpotifySearchOpen] =
    useState(false);
  const [onboardingSpotifySearchMode, setOnboardingSpotifySearchMode] = useState<
    "track" | "artist"
  >("track");
  const [onboardingSpotifyTrackResults, setOnboardingSpotifyTrackResults] =
    useState<SpotifyTrack[]>([]);
  const [onboardingSpotifyArtistResults, setOnboardingSpotifyArtistResults] =
    useState<SpotifyArtist[]>([]);
  const [onboardingSpotifySearchLoading, setOnboardingSpotifySearchLoading] =
    useState(false);
  const [onboardingSpotifySearchError, setOnboardingSpotifySearchError] =
    useState<string | null>(null);

  /** Onboarding: customize @handle (saved to server before continuing) */
  const [onboardingHandleDraft, setOnboardingHandleDraft] = useState("");
  const [onboardingHandleError, setOnboardingHandleError] = useState<string | null>(
    null
  );
  const [onboardingHandleSaving, setOnboardingHandleSaving] = useState(false);

  /** Profile tab: replace a favorite song/artist slot via Spotify search */
  const [profileSearchOpen, setProfileSearchOpen] = useState(false);
  const [profileSearchQuery, setProfileSearchQuery] = useState("");
  const [profileSearchMode, setProfileSearchMode] = useState<"track" | "artist">(
    "track"
  );
  const [profileEditTarget, setProfileEditTarget] = useState<{
    kind: "song" | "artist";
    index: number;
  } | null>(null);
  const [profileSearchTrackResults, setProfileSearchTrackResults] = useState<
    SpotifyTrack[]
  >([]);
  const [profileSearchArtistResults, setProfileSearchArtistResults] = useState<
    SpotifyArtist[]
  >([]);
  const [profileSearchLoading, setProfileSearchLoading] = useState(false);
  const [profileSearchError, setProfileSearchError] = useState<string | null>(null);

  /** Profile: tap @handle to rename */
  const [editHandleOpen, setEditHandleOpen] = useState(false);
  const [editHandleDraft, setEditHandleDraft] = useState("");
  const [editHandleSaving, setEditHandleSaving] = useState(false);
  const [editHandleError, setEditHandleError] = useState<string | null>(null);

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

  useEffect(() => {
    if (onboardingStep === "landing" && profileHandle) {
      setOnboardingHandleDraft(profileHandle);
      setOnboardingHandleError(null);
    }
  }, [onboardingStep, profileHandle]);

  async function loadFeed() {
    try {
      console.log("[presenter] loading feed");
      const posts = await apiClient.getFeed();
      const serverItems: FeedItem[] = posts.map((post) => ({
        id: post._id,
        user: post.authorHandle,
        song: post.title,
        artist: post.artist,
        album: post.album,
        albumCover: post.albumCover,
        previewUrl: post.previewUrl,
        spotifyTrackId: post.spotifyTrackId,
        caption: post.caption ?? "",
        liked: false,
        likes: post.likes,
        comments: post.comments.map((comment, index) => ({
          id: `${post._id}-comment-${index}`,
          user: comment.authorHandle,
          text: comment.text
        }))
      }));
      setFeedItems((prev) => {
        const localOnly = prev.filter((item) => item.id.startsWith("local-"));
        if (serverItems.length === 0) return localOnly;
        const serverIds = new Set(serverItems.map((s) => s.id));
        const unsyncedLocal = localOnly.filter((l) => !serverIds.has(l.id));
        return [...unsyncedLocal, ...serverItems];
      });
      console.log("[presenter] feed loaded", serverItems.length);
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
    setFavoriteArtists([...profile.favoriteArtists]);
    setFavoriteSongs([...profile.favoriteSongs]);
    const incoming = profile.friendRequestsReceived ?? [];
    const outgoing = profile.friendRequestsSent ?? [];
    setOutgoingFriendRequests(outgoing);

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

    const requestProfiles = await Promise.all(
      incoming.map(async (requesterHandle) => {
        const fp = await apiClient.getProfile(requesterHandle);
        return {
          id: requesterHandle,
          name: fp?.name ?? requesterHandle,
          handle: requesterHandle
        };
      })
    );
    setRequests(requestProfiles);

    const allProfiles = await apiClient.listProfiles();
    const suggestions = allProfiles
      .filter((item) => item.profileHandle !== handle)
      .filter((item) => !profile.friends.includes(item.profileHandle))
      .filter((item) => !outgoing.includes(item.profileHandle))
      .filter((item) => !incoming.includes(item.profileHandle))
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
    const artistEntries: FavoriteArtistEntry[] = artists.slice(0, 3).map((a) => ({
      name: a.name,
      imageUrl: a.imageUrl
    }));
    const songEntries: FavoriteSongEntry[] = tracks.slice(0, 3).map((t) => ({
      title: t.title,
      artist: t.artist,
      albumCoverUrl: t.albumCover
    }));
    setFavoriteArtists(padThreeArtistTuple(artistEntries));
    setFavoriteSongs(padThreeSongTuple(songEntries));
    setSuggestedTracks(tracks);
    try {
      await apiClient.setFavoriteArtists(handle, padThreeArtistTuple(artistEntries));
      await apiClient.setFavoriteSongs(handle, padThreeSongTuple(songEntries));
      await loadProfile(handle);
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
        setSpotifyUserId(user.id);

        // Step 2 -- If this Spotify account already has a profile, load it and skip onboarding
        let existingBySpotify: ApiProfile | null = null;
        try {
          existingBySpotify = await apiClient.getProfileBySpotifyUserId(user.id);
        } catch (e) {
          console.warn("[presenter] backend unreachable, continuing offline:", e);
        }

        if (existingBySpotify) {
          console.log(
            "[presenter] existing profile for Spotify id →",
            existingBySpotify.profileHandle
          );
          setProfileHandle(existingBySpotify.profileHandle);
          setProfileName(existingBySpotify.name);
          setOnboardingHandleDraft(existingBySpotify.profileHandle);
          try {
            await loadProfile(existingBySpotify.profileHandle);
          } catch (e) {
            console.warn("[presenter] could not load full profile:", e);
          }
          try {
            const top = await getTopTracks(10);
            setTopTracks(top);
            const artists = await getTopArtists(6);
            setTopArtists(artists);
            const tracksSix = await getTopTracks(6);
            setSuggestedTracks(tracksSix);
          } catch (e) {
            console.warn("[presenter] could not load Spotify tops for returning user:", e);
          }
          setSignedIn(true);
          console.log("[presenter] login complete (returning user)");
          return;
        }

        // Step 3 -- New user: seed local state with Spotify id until they pick a @handle
        const handle = user.id;
        setProfileHandle(handle);
        setProfileName(user.displayName);

        try {
          const existing = await apiClient.getProfile(handle);
          if (!existing) {
            console.log("[presenter] creating profile", handle);
            await apiClient.createProfile({
              name: user.displayName,
              profileHandle: handle,
              spotifyUserId: user.id
            });
          }
        } catch (e) {
          console.warn("[presenter] backend unreachable, skipping profile sync:", e);
        }

        // Step 4 -- Spotify favorites for new users (best-effort)
        try {
          await syncFavorites(handle);
        } catch (e) {
          console.warn("[presenter] could not sync favorites:", e);
        }

        // Step 5 -- Top tracks for Add Song screen (best-effort)
        try {
          const top = await getTopTracks(10);
          setTopTracks(top);
        } catch (e) {
          console.warn("[presenter] could not load top tracks:", e);
        }

        setOnboardingStep("landing");
        console.log("[presenter] login complete (new user)");
      } catch (err) {
        setAuthError((err as Error).message);
        console.error("[presenter] login error:", err);
      } finally {
        setAuthLoading(false);
      }
    },
    /** Landing step: save @handle + favorites to server, then go to Add Friends step */
    nextOnboardingLanding: async () => {
      setOnboardingHandleError(null);
      if (!spotifyUserId) {
        setOnboardingHandleError("Missing Spotify session. Please log in again.");
        return;
      }
      const normalized = normalizeOnboardingHandle(onboardingHandleDraft);
      const sameAsCurrent =
        profileHandle !== null &&
        normalizeOnboardingHandle(profileHandle) === normalized;
      if (!sameAsCurrent) {
        const formatErr = getHandleValidationError(normalized);
        if (formatErr) {
          setOnboardingHandleError(formatErr);
          return;
        }
      }
      if (!sameAsCurrent) {
        const taken = await isHandleTakenByAnotherUser(
          normalized,
          spotifyUserId,
          profileHandle
        );
        if (taken) {
          setOnboardingHandleError("That handle is already taken.");
          return;
        }
      }
      setOnboardingHandleSaving(true);
      setOnboardingSpotifySearchOpen(false);
      setOnboardingFavoriteTarget(null);
      setOnboardingSearchQuery("");
      setOnboardingSpotifySearchError(null);
      setOnboardingSpotifyTrackResults([]);
      setOnboardingSpotifyArtistResults([]);
      try {
        const profile = await apiClient.completeOnboardingBySpotify({
          spotifyUserId,
          profileHandle: normalized,
          name: profileName?.trim() || normalized
        });
        setProfileHandle(profile.profileHandle);
        setOnboardingHandleDraft(profile.profileHandle);
        await loadProfile(profile.profileHandle);
        setOnboardingStep("addFriends");
      } catch (err: unknown) {
        const status = (err as { status?: number }).status;
        const message = (err as Error).message ?? "";
        if (status === 409) {
          setOnboardingHandleError("That handle is already taken.");
        } else {
          setOnboardingHandleError(
            message ||
              (status === 500
                ? "Server error — check the API terminal for details."
                : "Couldn't save your profile.")
          );
        }
        console.warn("[presenter] onboarding handle failed:", message, status);
      } finally {
        setOnboardingHandleSaving(false);
      }
    },

    /** Add Friends step: enter the main app */
    finishOnboarding: () => {
      setFriendSearchQuery("");
      setFriendSearchResults([]);
      setSignedIn(true);
    },
    setActiveTab: (tab: TabKey) => {
      setActiveTab(tab);
      void loadFeed();
      if (tab === "profile" && profileHandle) void loadProfile(profileHandle);
    },
    refreshFeed: async () => {
      setFeedRefreshing(true);
      await loadFeed();
      setFeedRefreshing(false);
    },
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
      try {
        await apiClient.acceptFriendRequest(profileHandle, friend.handle);
        await loadProfile(profileHandle);
      } catch (e) {
        console.warn("[presenter] accept friend request failed:", e);
      }
    },
    declineRequest: async (friend: Friend) => {
      if (!profileHandle) return;
      try {
        await apiClient.declineFriendRequest(profileHandle, friend.handle);
        await loadProfile(profileHandle);
      } catch (e) {
        console.warn("[presenter] decline friend request failed:", e);
      }
    },
    toggleFriend: async (friend: Friend) => {
      if (!profileHandle) return;
      try {
        await apiClient.removeFriend(profileHandle, friend.handle);
        await loadProfile(profileHandle);
      } catch (e) {
        console.warn("[presenter] unfriend failed:", e);
      }
    },
    toggleSuggested: async (friend: Friend) => {
      if (!profileHandle) return;
      const exists = friends.some((item) => item.id === friend.id);
      try {
        if (exists) {
          await apiClient.removeFriend(profileHandle, friend.handle);
        } else {
          await apiClient.sendFriendRequest(profileHandle, friend.handle);
        }
        await loadProfile(profileHandle);
      } catch (e) {
        console.warn("[presenter] suggested friend action failed:", e);
      }
    },

    setFriendSearchQuery,

    runFriendSearch: async () => {
      if (!profileHandle) return;
      const q = friendSearchQuery.trim();
      if (!q) {
        setFriendSearchResults([]);
        return;
      }
      setFriendSearchLoading(true);
      try {
        const items = await apiClient.searchProfiles(q);
        const self = profileHandle;
        const friendHandles = new Set(friends.map((f) => f.handle));
        const sent = new Set(outgoingFriendRequests);
        const results: Friend[] = items
          .filter((p) => p.profileHandle !== self)
          .map((p) => ({
            id: p.profileHandle,
            name: p.name,
            handle: p.profileHandle,
            isFriend: friendHandles.has(p.profileHandle),
            pendingOutgoing: sent.has(p.profileHandle)
          }));
        setFriendSearchResults(results);
      } catch (e) {
        console.warn("[presenter] friend search failed:", e);
        setFriendSearchResults([]);
      } finally {
        setFriendSearchLoading(false);
      }
    },

    sendFriendRequest: async (friend: Friend) => {
      if (!profileHandle) return;
      try {
        await apiClient.sendFriendRequest(profileHandle, friend.handle);
        await loadProfile(profileHandle);
        setFriendSearchResults((prev) =>
          prev.map((f) =>
            f.handle === friend.handle ? { ...f, pendingOutgoing: true } : f
          )
        );
      } catch (e) {
        console.warn("[presenter] send friend request failed:", e);
      }
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
    setCaptionDraft,
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
      const localId = `local-${Date.now()}`;
      const newFeedItem: FeedItem = {
        id: localId,
        user: profileHandle,
        song: selectedSong.title,
        artist: selectedSong.artist,
        album: selectedSong.album,
        albumCover: selectedSong.albumCover,
        previewUrl: selectedSong.previewUrl,
        spotifyTrackId: selectedSong.id,
        caption: captionDraft.trim(),
        liked: false,
        likes: 0,
        comments: []
      };

      setShowCaptionPopup(false);
      setCaptionDraft("");
      setHasSharedToday(true);
      setShowAddSong(false);
      setActiveTab("home");
      setFeedItems((prev) => [newFeedItem, ...prev]);
      setShareHistory((prev) => [
        {
          id: localId,
          song: selectedSong.title,
          artist: selectedSong.artist,
          date: "Today",
          albumCover: selectedSong.albumCover
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
          previewUrl: selectedSong.previewUrl,
          spotifyTrackId: selectedSong.id,
          caption: newFeedItem.caption
        });
        setFeedItems((prev) =>
          prev.map((item) =>
            item.id === localId ? { ...item, id: post._id } : item
          )
        );
      } catch (err) {
        console.warn("[presenter] could not save post to server:", err);
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
    },

    setOnboardingSearchQuery,

    setOnboardingHandleDraft,

    selectOnboardingSongSlot: (index: number) => {
      setOnboardingFavoriteTarget({ kind: "song", index });
      setOnboardingSpotifySearchMode("track");
      setOnboardingSearchQuery("");
      setOnboardingSpotifySearchError(null);
      setOnboardingSpotifyTrackResults([]);
      setOnboardingSpotifyArtistResults([]);
      setOnboardingSpotifySearchOpen(true);
    },

    selectOnboardingArtistSlot: (index: number) => {
      setOnboardingFavoriteTarget({ kind: "artist", index });
      setOnboardingSpotifySearchMode("artist");
      setOnboardingSearchQuery("");
      setOnboardingSpotifySearchError(null);
      setOnboardingSpotifyTrackResults([]);
      setOnboardingSpotifyArtistResults([]);
      setOnboardingSpotifySearchOpen(true);
    },

    runOnboardingSpotifySearch: async () => {
      const q = onboardingSearchQuery.trim();
      if (!q) {
        setOnboardingSpotifySearchLoading(false);
        setOnboardingSpotifySearchError("Enter a search.");
        setOnboardingSpotifyTrackResults([]);
        setOnboardingSpotifyArtistResults([]);
        return;
      }
      setOnboardingSpotifySearchLoading(true);
      setOnboardingSpotifySearchError(null);
      setOnboardingSpotifyTrackResults([]);
      setOnboardingSpotifyArtistResults([]);
      try {
        if (onboardingSpotifySearchMode === "track") {
          const results = await searchTracks(q, 10);
          setOnboardingSpotifyTrackResults(results);
        } else {
          const results = await searchArtists(q, 10);
          setOnboardingSpotifyArtistResults(results);
        }
      } catch (err) {
        setOnboardingSpotifySearchError((err as Error).message);
      } finally {
        setOnboardingSpotifySearchLoading(false);
      }
    },

    pickOnboardingSearchTrack: async (track: SpotifyTrack) => {
      const handle = profileHandle;
      if (!handle) return;
      if (onboardingFavoriteTarget?.kind !== "song") {
        setOnboardingSpotifySearchError("Tap a favorite song slot first (1–3).");
        return;
      }
      const slot = onboardingFavoriteTarget.index;
      const triple = padThreeSongTuple(favoriteSongs);
      triple[slot] = {
        title: track.title,
        artist: track.artist,
        albumCoverUrl: track.albumCover
      };
      setFavoriteSongs([...triple]);
      setSuggestedTracks((prev) => {
        const next = prev.length >= 3 ? [...prev] : padThreeTracks(prev);
        next[slot] = track;
        return next;
      });
      try {
        await apiClient.setFavoriteSongs(handle, triple);
        await loadProfile(handle);
      } catch {
        console.warn("[presenter] could not save favorite song to server");
      }
      setOnboardingSpotifySearchOpen(false);
      setOnboardingFavoriteTarget(null);
      setOnboardingSearchQuery("");
      setOnboardingSpotifySearchError(null);
      setOnboardingSpotifyTrackResults([]);
    },

    pickOnboardingSearchArtist: async (artist: SpotifyArtist) => {
      const handle = profileHandle;
      if (!handle) return;
      if (onboardingFavoriteTarget?.kind !== "artist") {
        setOnboardingSpotifySearchError("Tap a favorite artist slot first (1–3).");
        return;
      }
      const slot = onboardingFavoriteTarget.index;
      const triple = padThreeArtistTuple(favoriteArtists);
      triple[slot] = { name: artist.name, imageUrl: artist.imageUrl };
      setFavoriteArtists([...triple]);
      setTopArtists((prev) => {
        const next = prev.length >= 3 ? [...prev] : padThreeArtists(prev);
        next[slot] = artist;
        return next;
      });
      try {
        await apiClient.setFavoriteArtists(handle, triple);
        await loadProfile(handle);
      } catch {
        console.warn("[presenter] could not save favorite artist to server");
      }
      setOnboardingSpotifySearchOpen(false);
      setOnboardingFavoriteTarget(null);
      setOnboardingSearchQuery("");
      setOnboardingSpotifySearchError(null);
      setOnboardingSpotifyArtistResults([]);
    },

    closeOnboardingSpotifySearch: () => {
      setOnboardingSpotifySearchOpen(false);
      setOnboardingFavoriteTarget(null);
      setOnboardingSearchQuery("");
      setOnboardingSpotifySearchError(null);
      setOnboardingSpotifyTrackResults([]);
      setOnboardingSpotifyArtistResults([]);
    },

    openProfileFavoriteSlot: (kind: "song" | "artist", index: number) => {
      setProfileEditTarget({ kind, index });
      setProfileSearchMode(kind === "song" ? "track" : "artist");
      setProfileSearchQuery("");
      setProfileSearchError(null);
      setProfileSearchTrackResults([]);
      setProfileSearchArtistResults([]);
      setProfileSearchOpen(true);
    },

    setProfileSearchQuery,

    setProfileSearchMode,

    runProfileSearch: async () => {
      const q = profileSearchQuery.trim();
      if (!q) {
        setProfileSearchLoading(false);
        setProfileSearchError("Enter a search.");
        setProfileSearchTrackResults([]);
        setProfileSearchArtistResults([]);
        return;
      }
      setProfileSearchLoading(true);
      setProfileSearchError(null);
      setProfileSearchTrackResults([]);
      setProfileSearchArtistResults([]);
      try {
        if (profileSearchMode === "track") {
          const results = await searchTracks(q, 10);
          setProfileSearchTrackResults(results);
        } else {
          const results = await searchArtists(q, 10);
          setProfileSearchArtistResults(results);
        }
      } catch (err) {
        setProfileSearchError((err as Error).message);
      } finally {
        setProfileSearchLoading(false);
      }
    },

    pickProfileSearchTrack: async (track: SpotifyTrack) => {
      const handle = profileHandle;
      if (!handle) return;
      if (profileEditTarget?.kind !== "song") {
        setProfileSearchError("Choose a song slot first.");
        return;
      }
      const slot = profileEditTarget.index;
      const triple = padThreeSongTuple(favoriteSongs);
      triple[slot] = {
        title: track.title,
        artist: track.artist,
        albumCoverUrl: track.albumCover
      };
      setFavoriteSongs([...triple]);
      setSuggestedTracks((prev) => {
        const next = prev.length >= 3 ? [...prev] : padThreeTracks(prev);
        next[slot] = track;
        return next;
      });
      try {
        await apiClient.setFavoriteSongs(handle, triple);
        await loadProfile(handle);
      } catch {
        console.warn("[presenter] could not save favorite song from profile");
      }
      setProfileSearchOpen(false);
      setProfileSearchError(null);
      setProfileEditTarget(null);
      setProfileSearchTrackResults([]);
    },

    pickProfileSearchArtist: async (artist: SpotifyArtist) => {
      const handle = profileHandle;
      if (!handle) return;
      if (profileEditTarget?.kind !== "artist") {
        setProfileSearchError("Choose an artist slot first.");
        return;
      }
      const slot = profileEditTarget.index;
      const triple = padThreeArtistTuple(favoriteArtists);
      triple[slot] = { name: artist.name, imageUrl: artist.imageUrl };
      setFavoriteArtists([...triple]);
      setTopArtists((prev) => {
        const next = prev.length >= 3 ? [...prev] : padThreeArtists(prev);
        next[slot] = artist;
        return next;
      });
      try {
        await apiClient.setFavoriteArtists(handle, triple);
        await loadProfile(handle);
      } catch {
        console.warn("[presenter] could not save favorite artist from profile");
      }
      setProfileSearchOpen(false);
      setProfileSearchError(null);
      setProfileEditTarget(null);
      setProfileSearchArtistResults([]);
    },

    closeProfileSearch: () => {
      setProfileSearchOpen(false);
      setProfileSearchError(null);
      setProfileEditTarget(null);
      setProfileSearchTrackResults([]);
      setProfileSearchArtistResults([]);
    },

    openEditHandle: () => {
      if (!profileHandle) return;
      setProfileSearchOpen(false);
      setEditHandleDraft(profileHandle);
      setEditHandleError(null);
      setEditHandleOpen(true);
    },

    setEditHandleDraft,

    closeEditHandle: () => {
      setEditHandleOpen(false);
      setEditHandleError(null);
    },

    saveEditHandle: async () => {
      if (!profileHandle) return;
      const normalized = normalizeOnboardingHandle(
        editHandleDraft.replace(/^@+/, "")
      );
      if (normalized === profileHandle) {
        setEditHandleOpen(false);
        return;
      }
      const formatErr = getHandleValidationError(normalized);
      if (formatErr) {
        setEditHandleError(formatErr);
        return;
      }
      const taken = await isHandleTakenByAnotherUser(
        normalized,
        spotifyUserId,
        profileHandle
      );
      if (taken) {
        setEditHandleError("That handle is already taken.");
        return;
      }
      setEditHandleSaving(true);
      setEditHandleError(null);
      const oldHandle = profileHandle;
      try {
        const profile = await apiClient.renameProfileHandle(profileHandle, normalized);
        setProfileHandle(profile.profileHandle);
        setOnboardingHandleDraft(profile.profileHandle);
        await loadProfile(profile.profileHandle);
        await loadFeed();
        setFeedItems((prev) =>
          prev.map((item) => ({
            ...item,
            user: item.user === oldHandle ? profile.profileHandle : item.user,
            comments: item.comments.map((c) =>
              c.user === oldHandle ? { ...c, user: profile.profileHandle } : c
            )
          }))
        );
        setEditHandleOpen(false);
      } catch (err: unknown) {
        const status = (err as { status?: number }).status;
        const message = (err as Error).message ?? "";
        if (status === 409) {
          setEditHandleError("That handle is already taken.");
        } else {
          setEditHandleError(
            message || "Couldn't update handle. Check your connection."
          );
        }
        console.warn("[presenter] rename handle failed:", message, status);
      } finally {
        setEditHandleSaving(false);
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
      outgoingFriendRequests,
      friendSearchQuery,
      friendSearchResults,
      friendSearchLoading,
      selectedFriend,
      activeFeedId,
      commentDraft,
      captionDraft,
      feedRefreshing,
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
      suggestedTracks,
      onboardingSearchQuery,
      onboardingFavoriteTarget,
      onboardingSpotifySearchOpen,
      onboardingSpotifySearchMode,
      onboardingSpotifyTrackResults,
      onboardingSpotifyArtistResults,
      onboardingSpotifySearchLoading,
      onboardingSpotifySearchError,
      onboardingHandleDraft,
      onboardingHandleError,
      onboardingHandleSaving,
      profileSearchOpen,
      profileSearchQuery,
      profileSearchMode,
      profileEditTarget,
      profileSearchTrackResults,
      profileSearchArtistResults,
      profileSearchLoading,
      profileSearchError,
      editHandleOpen,
      editHandleDraft,
      editHandleSaving,
      editHandleError
    },
    actions
  };
}

const ONBOARDING_HANDLE_REGEX = /^[a-z0-9_]{3,30}$/;

function normalizeOnboardingHandle(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Format rules for @handle (must match server `isValidProfileHandle`). */
function getHandleValidationError(normalized: string): string | null {
  if (/\s/.test(normalized)) {
    return "Handles can't contain spaces.";
  }
  if (!ONBOARDING_HANDLE_REGEX.test(normalized)) {
    return "Use 3–30 characters: lowercase letters, numbers, and underscores only (no spaces).";
  }
  return null;
}

/**
 * True if `normalizedHandle` is already used by someone else (not the current account).
 * Server still enforces uniqueness (409); this gives immediate feedback when online.
 */
async function isHandleTakenByAnotherUser(
  normalizedHandle: string,
  currentSpotifyUserId: string | null,
  currentProfileHandle: string | null
): Promise<boolean> {
  let existing: ApiProfile | null;
  try {
    existing = await apiClient.getProfile(normalizedHandle);
  } catch {
    return false;
  }
  if (!existing) return false;
  if (
    currentSpotifyUserId &&
    existing.spotifyUserId &&
    existing.spotifyUserId === currentSpotifyUserId
  ) {
    return false;
  }
  if (
    currentProfileHandle &&
    normalizeOnboardingHandle(existing.profileHandle) ===
      normalizeOnboardingHandle(currentProfileHandle)
  ) {
    return false;
  }
  return true;
}

function padThreeSongTuple(
  entries: FavoriteSongEntry[]
): [FavoriteSongEntry, FavoriteSongEntry, FavoriteSongEntry] {
  const e = [...entries];
  while (e.length < 3) e.push({ title: "" });
  return [e[0]!, e[1]!, e[2]!];
}

function padThreeArtistTuple(
  entries: FavoriteArtistEntry[]
): [FavoriteArtistEntry, FavoriteArtistEntry, FavoriteArtistEntry] {
  const e = [...entries];
  while (e.length < 3) e.push({ name: "" });
  return [e[0]!, e[1]!, e[2]!];
}

function padThreeTracks(prev: SpotifyTrack[]): SpotifyTrack[] {
  const placeholders: SpotifyTrack[] = [0, 1, 2].map((i) => ({
    id: `placeholder-track-${i}`,
    title: `Song ${i + 1}`,
    artist: "Tap slot, then search",
    album: ""
  }));
  const base = prev.slice(0, 3);
  return [0, 1, 2].map((i) => base[i] ?? placeholders[i]!);
}

function padThreeArtists(prev: SpotifyArtist[]): SpotifyArtist[] {
  const placeholders: SpotifyArtist[] = [0, 1, 2].map((i) => ({
    id: `placeholder-artist-${i}`,
    name: `Artist ${i + 1}`
  }));
  const base = prev.slice(0, 3);
  return [0, 1, 2].map((i) => base[i] ?? placeholders[i]!);
}
