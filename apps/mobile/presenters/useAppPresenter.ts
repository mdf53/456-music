import { useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import type {
  FavoriteArtistEntry,
  FavoriteSongEntry,
  FeedItem,
  Friend,
  CommentItem,
  OnboardingStep,
  TabKey
} from "../types";
import { apiClient, type ApiProfile } from "../services/apiClient";
import { getStoredProfileImageUrl, startSpotifyLogin } from "../services/spotifyAuth";
import {
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
  getFollowedSpotifyUsers,
  searchTracks,
  searchArtists,
  type SpotifyArtist,
  type SpotifyTrack
} from "../services/spotifyClient";
import { buildDefaultProfileHandleCandidate } from "../utils/defaultProfileHandle";
import { viewerHasSharedSongToday } from "../utils/viewerPostedToday";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "friends", label: "Friends" },
  { key: "home", label: "Home" },
  { key: "profile", label: "Profile" }
];

function formatPostDate(createdAt: unknown): string {
  if (createdAt == null) return "—";
  const d =
    createdAt instanceof Date
      ? createdAt
      : typeof createdAt === "string"
        ? new Date(createdAt)
        : new Date(String(createdAt));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "2-digit"
  });
}

export function useAppPresenter() {
  const [signedIn, setSignedIn] = useState(false);
  const [onboardingStep, setOnboardingStep] =
    useState<OnboardingStep>("login");
  const [activeTab, setActiveTab] = useState<TabKey>("home");
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
  /** Pending friend requests that THIS user has sent (outgoing). */
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
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

  /** Data URL for profile avatar (`data:image/...;base64,...`), or null for green placeholder. */
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [profilePhotoSaving, setProfilePhotoSaving] = useState(false);

  /** Data URLs for other users' avatars, keyed by lowercase @handle. */
  const [friendPhotoByHandle, setFriendPhotoByHandle] = useState<Record<string, string>>({});

  const [friendsRefreshing, setFriendsRefreshing] = useState(false);
  const [profileRefreshing, setProfileRefreshing] = useState(false);
  const [addSongRefreshing, setAddSongRefreshing] = useState(false);
  const [friendViewTab, setFriendViewTab] = useState<"favorites" | "history">("favorites");
  const [friendViewLoading, setFriendViewLoading] = useState(false);
  const [friendViewSongs, setFriendViewSongs] = useState<FavoriteSongEntry[]>([]);
  const [friendViewArtists, setFriendViewArtists] = useState<FavoriteArtistEntry[]>([]);
  const [friendViewHistory, setFriendViewHistory] = useState<
    Array<{ id: string; song: string; artist: string; date: string; albumCover?: string }>
  >([]);
  const [friendViewFriendCount, setFriendViewFriendCount] = useState(0);

  const availableTracks = searchResults.length ? searchResults : topTracks;
  const selectedSong = [...searchResults, ...topTracks].find(
    (song) => song.id === selectedSongId
  );
  const activeFeed = feedItems.find((item) => item.id === activeFeedId);

  const hasSharedToday = useMemo(
    () => viewerHasSharedSongToday(feedItems, profileHandle),
    [feedItems, profileHandle]
  );

  useEffect(() => {
    if (!signedIn || !profileHandle) return;
    void (async () => {
      const { friendHandles } = await loadProfile(profileHandle);
      await loadFeed([profileHandle, ...friendHandles]);
    })();
  }, [signedIn, profileHandle]);

  useEffect(() => {
    if (onboardingStep === "landing" && profileHandle) {
      setOnboardingHandleDraft(profileHandle);
      setOnboardingHandleError(null);
    }
  }, [onboardingStep, profileHandle]);

  useEffect(() => {
    if (!spotifyUserId) {
      setProfilePhotoUri(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const data = await apiClient.getProfilePhoto(spotifyUserId);
        if (cancelled) return;
        if (data?.imageBase64 && data?.mimeType) {
          setProfilePhotoUri(`data:${data.mimeType};base64,${data.imageBase64}`);
          return;
        }
        const spotifyAvatar = await getStoredProfileImageUrl();
        if (cancelled) return;
        setProfilePhotoUri(spotifyAvatar ?? null);
      } catch {
        if (cancelled) return;
        const spotifyAvatar = await getStoredProfileImageUrl();
        if (!cancelled) setProfilePhotoUri(spotifyAvatar ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [spotifyUserId]);

  async function loadFeed(allowedAuthorHandles?: string[]) {
    try {
      console.log("[presenter] loading feed");
      const posts = await apiClient.getFeed(spotifyUserId);
      const fallbackAllowed = profileHandle
        ? [profileHandle, ...friends.map((f) => f.handle)]
        : undefined;
      const allowed = allowedAuthorHandles ?? fallbackAllowed;
      const allowedSet = allowed ? new Set(allowed) : null;
      const filteredPosts = allowedSet
        ? posts.filter((p) => allowedSet.has(p.authorHandle))
        : posts;
      const serverItems: FeedItem[] = filteredPosts.map((post) => ({
        id: post._id,
        user: post.authorHandle,
        song: post.title,
        artist: post.artist,
        album: post.album,
        albumCover: post.albumCover,
        previewUrl: post.previewUrl,
        spotifyTrackId: post.spotifyTrackId,
        caption: post.caption ?? "",
        liked: post.liked ?? false,
        likes: post.likes,
        createdAt:
          post.createdAt != null ? String(post.createdAt) : undefined,
        comments: post.comments.map((comment, index) => ({
          id: `${post._id}-comment-${index}`,
          commentIndex: index,
          user: comment.authorHandle,
          text: comment.text,
          liked: comment.liked ?? false,
          likes: comment.likes ?? 0
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

  async function refreshFriendPhotos(handles: string[]) {
    const unique = [...new Set(handles.map((h) => h.trim().toLowerCase()).filter(Boolean))];
    if (unique.length === 0) return;
    try {
      const { photos } = await apiClient.batchProfilePhotos(unique);
      setFriendPhotoByHandle((prev) => {
        const next = { ...prev };
        for (const [h, data] of Object.entries(photos)) {
          if (data?.imageBase64 && data?.mimeType) {
            next[h] = `data:${data.mimeType};base64,${data.imageBase64}`;
          }
        }
        return next;
      });
    } catch (e) {
      console.warn("[presenter] batch friend photos failed", e);
    }
  }

  async function loadSpotifyOnboardingSuggestions(args: {
    myHandle: string;
    mySpotifyId: string;
    friendHandles: Set<string>;
    outgoingHandles: Set<string>;
  }) {
    try {
      const followed = await getFollowedSpotifyUsers(50);
      const ids = followed
        .filter((u) => u.id !== args.mySpotifyId)
        .map((u) => u.id)
        .slice(0, 40);
      if (ids.length === 0) return;
      const profiles = await apiClient.resolveProfilesBySpotifyIds(ids);
      const next: Friend[] = profiles
        .filter((p) => p.profileHandle && p.profileHandle !== args.myHandle)
        .filter((p) => !args.friendHandles.has(p.profileHandle))
        .map((p) => {
          const h = p.profileHandle as string;
          return {
            id: h,
            name: p.name,
            handle: h,
            pendingOutgoing: args.outgoingHandles.has(h)
          };
        });
      if (next.length > 0) {
        setSuggested(next);
        void refreshFriendPhotos(next.map((f) => f.handle));
      }
    } catch (e) {
      console.warn(
        "[presenter] Spotify suggested friends failed (re-login may be needed for user-follow-read):",
        e
      );
    }
  }

  async function loadFriendViewData(friend: Friend) {
    setFriendViewLoading(true);
    setFriendViewTab("favorites");
    try {
      const [fp, posts] = await Promise.all([
        apiClient.getProfile(friend.handle),
        apiClient.getPostsByAuthor(friend.handle)
      ]);
      if (fp) {
        setFriendViewSongs([...fp.favoriteSongs]);
        setFriendViewArtists([...fp.favoriteArtists]);
        setFriendViewFriendCount(fp.friends?.length ?? 0);
      } else {
        setFriendViewSongs([]);
        setFriendViewArtists([]);
        setFriendViewFriendCount(0);
      }
      setFriendViewHistory(
        posts.map((p) => ({
          id: String(p._id),
          song: p.title,
          artist: p.artist,
          date: formatPostDate(p.createdAt),
          albumCover: p.albumCover
        }))
      );
    } catch (e) {
      console.warn("[presenter] friend profile load failed", e);
      setFriendViewSongs([]);
      setFriendViewArtists([]);
      setFriendViewHistory([]);
      setFriendViewFriendCount(0);
    } finally {
      setFriendViewLoading(false);
    }
  }

  async function loadProfile(handle: string) {
    console.log("[presenter] loading profile", handle);
    let profile;
    try {
      profile = await apiClient.getProfile(handle);
    } catch (err) {
      console.warn("[presenter] profile unavailable (server may be offline):", err);
      return { friendHandles: [], outgoingHandles: [] };
    }
    if (!profile) return { friendHandles: [], outgoingHandles: [] };
    setProfileName(profile.name);
    setFavoriteArtists([...profile.favoriteArtists]);
    setFavoriteSongs([...profile.favoriteSongs]);
    const incoming = profile.friendRequestsReceived ?? [];
    const outgoing = profile.friendRequestsSent ?? [];

    async function resolveAccountId(accountId: string): Promise<{
      handle: string;
      name: string;
    }> {
      // Relationships may be stored as spotify keys (new) or handles (legacy).
      const bySpotify = await apiClient.getProfileBySpotifyUserId(accountId);
      const resolved = bySpotify ?? (await apiClient.getProfile(accountId));
      return {
        handle: resolved?.profileHandle ?? accountId,
        name: resolved?.name ?? accountId
      };
    }

    const friendProfiles = await Promise.all(
      profile.friends.map(async (friendId) => {
        const resolved = await resolveAccountId(friendId);
        return {
          id: resolved.handle,
          name: resolved.name,
          handle: resolved.handle
        };
      })
    );
    setFriends(friendProfiles);

    const requestProfiles = await Promise.all(
      incoming.map(async (requesterId) => {
        const resolved = await resolveAccountId(requesterId);
        return {
          id: resolved.handle,
          name: resolved.name,
          handle: resolved.handle
        };
      })
    );
    setRequests(requestProfiles);

    // pending outgoing UI expects handles, so map spotify-keys -> handles.
    const outgoingResolved = await Promise.all(
      outgoing.map(async (outgoingId) => resolveAccountId(outgoingId))
    );
    const outgoingHandles = outgoingResolved.map((x) => x.handle);
    setOutgoingFriendRequests(outgoingHandles);

    const friendHandlesSet = new Set(friendProfiles.map((f) => f.handle));
    const incomingHandlesSet = new Set(requestProfiles.map((r) => r.handle));
    const outgoingHandlesSet = new Set(outgoingHandles);

    // Populate "Sent Requests" UI (pending requests we sent).
    // This must happen after we derive outgoingHandles (which are always @handles for display).
    const outgoingProfiles = await Promise.all(
      outgoingHandles.map(async (outHandle) => {
        const fp = await apiClient.getProfile(outHandle);
        return {
          id: outHandle,
          name: fp?.name ?? outHandle,
          handle: outHandle
        };
      })
    );
    setSentRequests(outgoingProfiles);

    const allProfiles = await apiClient.listProfiles();
    const suggestions = allProfiles
      .filter((item) => item.profileHandle !== handle)
      .filter((item) => !friendHandlesSet.has(item.profileHandle))
      .filter((item) => !outgoingHandlesSet.has(item.profileHandle))
      .filter((item) => !incomingHandlesSet.has(item.profileHandle))
      .map((item) => ({
        id: item.profileHandle,
        name: item.name,
        handle: item.profileHandle
      }));
    setSuggested(suggestions);
    void refreshFriendPhotos([
      ...friendProfiles.map((f) => f.handle),
      ...requestProfiles.map((r) => r.handle),
      ...outgoingProfiles.map((o) => o.handle),
      ...suggestions.map((s) => s.handle)
    ]);
    try {
      const posts = await apiClient.getPostsByAuthor(handle);
      setShareHistory(
        posts.map((p) => ({
          id: String(p._id),
          song: p.title,
          artist: p.artist,
          date: formatPostDate(p.createdAt),
          albumCover: p.albumCover
        }))
      );
    } catch {
      /* offline — keep existing history */
    }
    console.log("[presenter] profile loaded");
    return {
      friendHandles: friendProfiles.map((f) => f.handle),
      outgoingHandles
    };
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

        // Step 3 -- New user: friendly default @handle (not raw Spotify id)
        let proposed = buildDefaultProfileHandleCandidate(user);
        for (let attempt = 0; attempt < 10; attempt++) {
          const taken = await isHandleTakenByAnotherUser(proposed, user.id, null);
          if (!taken) break;
          proposed = buildDefaultProfileHandleCandidate(user);
        }
        setProfileHandle(proposed);
        setOnboardingHandleDraft(proposed);
        setProfileName(user.displayName);

        try {
          const existing = await apiClient.getProfile(proposed);
          if (!existing) {
            console.log("[presenter] creating profile", proposed);
            await apiClient.createProfile({
              name: user.displayName,
              profileHandle: proposed,
              spotifyUserId: user.id
            });
          }
        } catch (e) {
          console.warn("[presenter] backend unreachable, skipping profile sync:", e);
        }

        // Step 4 -- Spotify favorites for new users (best-effort)
        try {
          await syncFavorites(proposed);
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
        const { friendHandles: friendHandlesList, outgoingHandles } =
          await loadProfile(profile.profileHandle);
        if (spotifyUserId) {
          await loadSpotifyOnboardingSuggestions({
            myHandle: profile.profileHandle,
            mySpotifyId: spotifyUserId,
            friendHandles: new Set(friendHandlesList),
            outgoingHandles: new Set(outgoingHandles)
          });
        }
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
      void loadFeed(
        profileHandle ? [profileHandle, ...friends.map((f) => f.handle)] : undefined
      );
      // If the user was viewing a friend's profile and switches tabs,
      // close it so returning to Friends shows the friends list again.
      if (tab !== "friends") setShowFriendProfile(false);
      if (tab === "profile" && profileHandle) void loadProfile(profileHandle);
    },
    refreshFeed: async () => {
      setFeedRefreshing(true);
      await loadFeed(
        profileHandle ? [profileHandle, ...friends.map((f) => f.handle)] : undefined
      );
      setFeedRefreshing(false);
    },
    openAddSong: () => {
      setSelectedSongId(null);
      setShowAddSong(true);
    },
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
      if (!spotifyUserId) return;
      try {
        const viewerId = spotifyUserId;
        const nextLiked = !target.liked;
        const resp = nextLiked
          ? await apiClient.likePost(feedId, viewerId)
          : await apiClient.unlikePost(feedId, viewerId);
        setFeedItems((prev) =>
          prev.map((item) =>
            item.id === feedId
              ? { ...item, liked: !!resp.liked, likes: resp.likes }
              : item
          )
        );
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
        void refreshFriendPhotos(results.map((r) => r.handle));
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
        // During onboarding, loadProfile rebuilds "suggested" from the server list and drops
        // Spotify-based suggestions — keep the list and show Pending instead.
        if (signedIn) {
          await loadProfile(profileHandle);
        } else {
          setOutgoingFriendRequests((prev) =>
            prev.includes(friend.handle) ? prev : [...prev, friend.handle]
          );
        }
        setFriendSearchResults((prev) =>
          prev.map((f) =>
            f.handle === friend.handle ? { ...f, pendingOutgoing: true } : f
          )
        );
        setSuggested((prev) =>
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
      void refreshFriendPhotos([friend.handle]);
      void loadFriendViewData(friend);
    },
    closeFriendProfile: () => {
      setShowFriendProfile(false);
      setFriendViewHistory([]);
      setFriendViewSongs([]);
      setFriendViewArtists([]);
      setFriendViewFriendCount(0);
      setFriendViewTab("favorites");
    },
    setFriendProfileTab: (tab: "favorites" | "history") => setFriendViewTab(tab),

    refreshFriendsTab: async () => {
      if (!profileHandle) return;
      setFriendsRefreshing(true);
      try {
        await loadProfile(profileHandle);
        if (showFriendProfile) {
          const f = selectedFriend;
          if (f?.handle) await loadFriendViewData(f);
        }
      } finally {
        setFriendsRefreshing(false);
      }
    },
    refreshProfileTab: async () => {
      if (!profileHandle) return;
      setProfileRefreshing(true);
      try {
        await loadProfile(profileHandle);
      } finally {
        setProfileRefreshing(false);
      }
    },
    refreshAddSong: async () => {
      setAddSongRefreshing(true);
      try {
        const top = await getTopTracks(10);
        setTopTracks(top);
      } catch (e) {
        console.warn("[presenter] refreshAddSong failed", e);
      } finally {
        setAddSongRefreshing(false);
      }
    },
    togglePlaylist: () => setShowPlaylistPopup((prev) => !prev),
    setProfileTab,
    setSelectedSongId,
    setCommentDraft,
    setCaptionDraft,
    postComment: async () => {
      if (!activeFeedId || !commentDraft.trim() || !profileHandle) {
        return;
      }
      if (!spotifyUserId) return;
      const currentPost = feedItems.find((item) => item.id === activeFeedId);
      const commentIndex = currentPost?.comments.length ?? 0;
      const newComment = {
        id: `c-${Date.now()}`,
        commentIndex,
        user: profileHandle,
        text: commentDraft.trim(),
        liked: false,
        likes: 0
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
          authorSpotifyUserId: spotifyUserId,
          text: newComment.text
        });
      } catch (err) {
        console.error(err);
      }
    },
    toggleCommentLike: async (comment: CommentItem) => {
      if (!activeFeedId || !spotifyUserId) return;
      const postId = activeFeedId;
      const idx = comment.commentIndex;
      const nextLiked = !comment.liked;
      try {
        const resp = nextLiked
          ? await apiClient.likeComment(postId, idx, spotifyUserId)
          : await apiClient.unlikeComment(postId, idx, spotifyUserId);

        setFeedItems((prev) =>
          prev.map((item) =>
            item.id !== postId
              ? item
              : {
                  ...item,
                  comments: item.comments.map((c) =>
                    c.commentIndex === idx
                      ? { ...c, liked: resp.liked, likes: resp.likes }
                      : c
                  )
                }
          )
        );
      } catch (err) {
        console.error(err);
      }
    },
    confirmShare: async () => {
      if (!selectedSong || !profileHandle || !spotifyUserId) return;
      const localId = `local-${Date.now()}`;
      const nowIso = new Date().toISOString();
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
        comments: [],
        createdAt: nowIso
      };

      setShowCaptionPopup(false);
      setCaptionDraft("");
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
          authorSpotifyUserId: spotifyUserId,
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
            item.id === localId
              ? {
                  ...item,
                  id: post._id,
                  createdAt: post.createdAt ?? item.createdAt
                }
              : item
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
      setOnboardingSpotifySearchOpen(false);
      setOnboardingSpotifyTrackResults([]);
      setOnboardingSpotifyArtistResults([]);
      setOnboardingSpotifySearchError(null);
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
      setOnboardingFavoriteTarget(null);
      setOnboardingSearchQuery("");
    },

    pickOnboardingSearchArtist: async (artist: SpotifyArtist) => {
      const handle = profileHandle;
      if (!handle) return;
      if (onboardingFavoriteTarget?.kind !== "artist") {
        setOnboardingSpotifySearchError("Tap a favorite artist slot first (1–3).");
        return;
      }
      const slot = onboardingFavoriteTarget.index;
      setOnboardingSpotifySearchOpen(false);
      setOnboardingSpotifyTrackResults([]);
      setOnboardingSpotifyArtistResults([]);
      setOnboardingSpotifySearchError(null);
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
      setOnboardingFavoriteTarget(null);
      setOnboardingSearchQuery("");
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
      setProfileSearchOpen(false);
      setProfileSearchTrackResults([]);
      setProfileSearchArtistResults([]);
      setProfileSearchError(null);
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
      setProfileEditTarget(null);
    },

    pickProfileSearchArtist: async (artist: SpotifyArtist) => {
      const handle = profileHandle;
      if (!handle) return;
      if (profileEditTarget?.kind !== "artist") {
        setProfileSearchError("Choose an artist slot first.");
        return;
      }
      const slot = profileEditTarget.index;
      setProfileSearchOpen(false);
      setProfileSearchTrackResults([]);
      setProfileSearchArtistResults([]);
      setProfileSearchError(null);
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
      setProfileEditTarget(null);
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

    pickProfilePhoto: async () => {
      if (!spotifyUserId) return;
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const base64 = asset.base64;
      if (!base64) {
        console.warn("[presenter] image picker did not return base64");
        return;
      }
      let mime = asset.mimeType ?? "image/jpeg";
      if (mime === "image/jpg") mime = "image/jpeg";
      setProfilePhotoSaving(true);
      try {
        await apiClient.putProfilePhoto(spotifyUserId, {
          imageBase64: base64,
          mimeType: mime
        });
        const dataUrl = `data:${mime};base64,${base64}`;
        setProfilePhotoUri(dataUrl);
        if (profileHandle) {
          setFriendPhotoByHandle((prev) => ({
            ...prev,
            [profileHandle.trim().toLowerCase()]: dataUrl
          }));
        }
      } catch (e) {
        console.warn("[presenter] could not save profile photo", e);
      } finally {
        setProfilePhotoSaving(false);
      }
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
        const { friendHandles } = await loadProfile(profile.profileHandle);
        await loadFeed([profile.profileHandle, ...friendHandles]);
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
      sentRequests,
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
      editHandleError,
      profilePhotoUri,
      profilePhotoSaving,
      friendPhotoByHandle,
      friendsRefreshing,
      profileRefreshing,
      addSongRefreshing,
      friendViewTab,
      friendViewLoading,
      friendViewSongs,
      friendViewArtists,
      friendViewHistory,
      friendViewFriendCount
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
