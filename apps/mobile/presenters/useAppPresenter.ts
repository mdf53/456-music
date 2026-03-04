import { useMemo, useState } from "react";
import type { FeedItem, Friend, OnboardingStep, TabKey } from "../types";

export function useAppPresenter() {
  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "friends", label: "Friends" },
    { key: "home", label: "Home" },
    { key: "profile", label: "Profile" }
  ];

  const demoSongs = [
    { id: "song-1", title: "Song Title", artist: "Artist Name" },
    { id: "song-2", title: "Song Title", artist: "Artist Name" },
    { id: "song-3", title: "Song Title", artist: "Artist Name" }
  ];

  const demoFriends: Friend[] = [
    { id: "friend-1", name: "John Smith", handle: "@jsmith" },
    { id: "friend-2", name: "Jane Doe", handle: "@janedoe" }
  ];

  const friendRequests: Friend[] = [
    { id: "request-1", name: "Jack Black", handle: "@jackblack" },
    { id: "request-2", name: "Bob Carroll", handle: "@bobby" }
  ];

  const suggestedFriends: Friend[] = [
    { id: "suggest-1", name: "Bob Carroll", handle: "@bobby" },
    { id: "suggest-2", name: "Sarah Lee", handle: "@sarahlee" }
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
  const [friends, setFriends] = useState<Friend[]>(demoFriends);
  const [requests, setRequests] = useState<Friend[]>(friendRequests);
  const [suggested] = useState<Friend[]>(suggestedFriends);
  const [selectedFriend, setSelectedFriend] = useState(demoFriends[0]);
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [profileTab, setProfileTab] = useState<"history" | "favorites">(
    "history"
  );
  const [shareHistory, setShareHistory] = useState<
    Array<{ id: string; song: string; artist: string; date: string }>
  >([
    { id: "h-1", song: "Song Title", artist: "Artist", date: "Today" },
    { id: "h-2", song: "Song Title", artist: "Artist", date: "Yesterday" }
  ]);

  const initialFeedItems = useMemo<FeedItem[]>(
    () => [
      {
        id: "feed-1",
        user: "keepintune",
        song: "Song Name",
        artist: "Artist Name",
        caption: "Check out my song!",
        liked: false,
        likes: 12,
        comments: [
          { id: "c-1", user: "janedoe", text: "Love this!" },
          { id: "c-2", user: "sam", text: "On repeat." }
        ]
      },
      {
        id: "feed-2",
        user: "janedoe",
        song: "Song Name",
        artist: "Artist Name",
        caption: "This is my favorite right now.",
        liked: true,
        likes: 28,
        comments: [{ id: "c-3", user: "matt", text: "Great pick." }]
      }
    ],
    []
  );
  const [feedItems, setFeedItems] = useState<FeedItem[]>(initialFeedItems);

  const selectedSong = demoSongs.find((song) => song.id === selectedSongId);
  const activeFeed = feedItems.find((item) => item.id === activeFeedId);

  const actions = {
    login: () => setOnboardingStep("landing"),
    continueOnboarding: () => setSignedIn(true),
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
    toggleLike: (feedId: string) => {
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
    },
    acceptRequest: (friend: Friend) => {
      setRequests((prev) => prev.filter((item) => item.id !== friend.id));
      setFriends((prev) => [friend, ...prev]);
    },
    declineRequest: (friend: Friend) => {
      setRequests((prev) => prev.filter((item) => item.id !== friend.id));
    },
    toggleFriend: (friend: Friend) => {
      setFriends((prev) => {
        const exists = prev.some((item) => item.id === friend.id);
        if (exists) {
          return prev.filter((item) => item.id !== friend.id);
        }
        return [friend, ...prev];
      });
    },
    toggleSuggested: (friend: Friend) => {
      setFriends((prev) => {
        const exists = prev.some((item) => item.id === friend.id);
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
    postComment: () => {
      if (!activeFeedId || !commentDraft.trim()) {
        return;
      }
      const newComment = {
        id: `c-${Date.now()}`,
        user: "you",
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
    },
    confirmShare: () => {
      setShowCaptionPopup(false);
      setHasSharedToday(true);
      setShowAddSong(false);
      setActiveTab("home");
      if (selectedSong) {
        setShareHistory((prev) => [
          {
            id: `h-${Date.now()}`,
            song: selectedSong.title,
            artist: selectedSong.artist,
            date: "Today"
          },
          ...prev
        ]);
      }
    }
  };

  return {
    state: {
      tabs,
      demoSongs,
      demoFriends,
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
      activeFeed
    },
    actions
  };
}
