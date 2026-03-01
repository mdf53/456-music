import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { PopupSheet } from "./components/PopupSheet";
import { styles } from "./components/styles";
import { AddSongScreen } from "./pages/AddSongScreen";
import { FriendsScreen } from "./pages/FriendsScreen";
import { HomeScreen } from "./pages/HomeScreen";
import { OnboardingFlow } from "./pages/OnboardingFlow";
import { ProfileScreen } from "./pages/ProfileScreen";
import type { FeedItem, Friend, OnboardingStep, TabKey } from "./types";

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

export default function App() {
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

  if (!signedIn) {
    return (
      <OnboardingFlow
        step={onboardingStep}
        onLogin={() => setOnboardingStep("landing")}
        onContinue={() => setSignedIn(true)}
        demoFriends={demoFriends}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>Song of the Day</Text>
          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>@keepintune</Text>
          </View>
        </View>

        <View style={styles.body}>
          {activeTab === "home" && (
            <>
              {showAddSong ? (
                <AddSongScreen
                  selectedSong={selectedSong}
                  songs={demoSongs}
                  onSelectSong={setSelectedSongId}
                  onShare={() => setShowCaptionPopup(true)}
                  onBack={() => setShowAddSong(false)}
                />
              ) : (
                <HomeScreen
                  hasSharedToday={hasSharedToday}
                  feedItems={feedItems}
                  onAddSong={() => setShowAddSong(true)}
                  onOpenComments={(feedId) => {
                    setActiveFeedId(feedId);
                    setShowCommentsPopup(true);
                  }}
                  onToggleLike={(feedId) => {
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
                  }}
                />
              )}
            </>
          )}
          {activeTab === "friends" && (
            <FriendsScreen
              showFriendProfile={showFriendProfile}
              selectedFriend={selectedFriend}
              friends={friends}
              requests={requests}
              suggested={suggested}
              friendHistory={[
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
              ]}
              demoSongs={demoSongs}
              onAcceptRequest={(friend) => {
                setRequests((prev) =>
                  prev.filter((item) => item.id !== friend.id)
                );
                setFriends((prev) => [friend, ...prev]);
              }}
              onDeclineRequest={(friend) => {
                setRequests((prev) =>
                  prev.filter((item) => item.id !== friend.id)
                );
              }}
              onToggleFriend={(friend) => {
                setFriends((prev) => {
                  const exists = prev.some((item) => item.id === friend.id);
                  if (exists) {
                    return prev.filter((item) => item.id !== friend.id);
                  }
                  return [friend, ...prev];
                });
              }}
              onToggleSuggested={(friend) => {
                setFriends((prev) => {
                  const exists = prev.some((item) => item.id === friend.id);
                  if (exists) {
                    return prev.filter((item) => item.id !== friend.id);
                  }
                  return [friend, ...prev];
                });
              }}
              onViewFriend={(friend) => {
                setSelectedFriend(friend);
                setShowFriendProfile(true);
              }}
              onBack={() => setShowFriendProfile(false)}
            />
          )}
          {activeTab === "profile" && (
            <ProfileScreen
              showPlaylistPopup={showPlaylistPopup}
              shareHistory={shareHistory}
              onTogglePlaylist={() =>
                setShowPlaylistPopup((prev) => !prev)
              }
              onToggleProfileTab={setProfileTab}
              profileTab={profileTab}
              demoSongs={demoSongs}
            />
          )}
        </View>

        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const isHome = tab.key === "home";
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tabItem,
                  isActive && styles.tabItemActive,
                  isHome && styles.tabItemHome
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && styles.tabLabelActive,
                    isHome && styles.tabLabelHome
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {showCaptionPopup && (
        <PopupSheet
          title="Caption pop-up"
          onClose={() => setShowCaptionPopup(false)}
        >
          <TextInput
            placeholder="Add a caption"
            placeholderTextColor="#96A1A8"
            style={styles.input}
          />
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
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
            }}
          >
            <Text style={styles.primaryButtonText}>Share Song</Text>
          </Pressable>
        </PopupSheet>
      )}

      {showCommentsPopup && (
        <PopupSheet
          title="Comment Pop-up"
          onClose={() => setShowCommentsPopup(false)}
        >
          {activeFeed?.comments.map((comment) => (
            <View key={comment.id} style={styles.commentBubble}>
              <Text style={styles.commentUser}>@{comment.user}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
          <View style={styles.commentInputRow}>
            <TextInput
              placeholder="Add comment"
              placeholderTextColor="#96A1A8"
              style={[styles.input, styles.commentDraftInput]}
              value={commentDraft}
              onChangeText={setCommentDraft}
            />
            <Pressable
              style={styles.primaryButtonSmall}
              onPress={() => {
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
              }}
            >
              <Text style={styles.primaryButtonText}>Post</Text>
            </Pressable>
          </View>
        </PopupSheet>
      )}
    </SafeAreaView>
  );
}
