import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type TabKey = "home" | "friends" | "profile";
type OnboardingStep = "login" | "landing";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "friends", label: "Friends" },
  { key: "home", label: "Home" },
  { key: "profile", label: "Profile" }
];

type CommentItem = {
  id: string;
  user: string;
  text: string;
};

type FeedItem = {
  id: string;
  user: string;
  song: string;
  artist: string;
  caption: string;
  liked: boolean;
  likes: number;
  comments: CommentItem[];
};

const demoSongs = [
  { id: "song-1", title: "Song Title", artist: "Artist Name" },
  { id: "song-2", title: "Song Title", artist: "Artist Name" },
  { id: "song-3", title: "Song Title", artist: "Artist Name" }
];

const demoFriends = [
  { id: "friend-1", name: "John Smith", handle: "@jsmith" },
  { id: "friend-2", name: "Jane Doe", handle: "@janedoe" }
];

const friendRequests = [
  { id: "request-1", name: "Jack Black", handle: "@jackblack" },
  { id: "request-2", name: "Bob Carroll", handle: "@bobby" }
];

const suggestedFriends = [
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
  const [friends, setFriends] =
    useState<Array<{ id: string; name: string; handle: string }>>(
      demoFriends
    );
  const [requests, setRequests] =
    useState<Array<{ id: string; name: string; handle: string }>>(
      friendRequests
    );
  const [suggested, setSuggested] =
    useState<Array<{ id: string; name: string; handle: string }>>(
      suggestedFriends
    );
  const [selectedFriend, setSelectedFriend] = useState(demoFriends[0]);
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
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

type OnboardingFlowProps = {
  step: OnboardingStep;
  onLogin: () => void;
  onContinue: () => void;
};

function OnboardingFlow({ step, onLogin, onContinue }: OnboardingFlowProps) {
  if (step === "login") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.brand}>Welcome to Song of the Day</Text>
          <Pressable onPress={onLogin} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Login with Spotify</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.brand}>Welcome to Song of the Day</Text>
        <Text style={styles.subtitle}>
          Help us get you ready to share your music
        </Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add Friends</Text>
          <View style={styles.row}>
            {demoFriends.map((friend) => (
              <View key={friend.id} style={styles.avatar} />
            ))}
          </View>
          <Text style={styles.sectionTitle}>Customize Favorites</Text>
          <View style={styles.row}>
            {["Song", "Album", "Artist"].map((label) => (
              <View key={label} style={styles.favoriteCard}>
                <View style={styles.favoriteThumb} />
                <Text style={styles.favoriteLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={onContinue} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

type HomeScreenProps = {
  hasSharedToday: boolean;
  feedItems: Array<{
    id: string;
    user: string;
    song: string;
    artist: string;
    caption: string;
    liked: boolean;
    likes: number;
  }>;
  onAddSong: () => void;
  onOpenComments: (feedId: string) => void;
  onToggleLike: (feedId: string) => void;
};

function HomeScreen({
  hasSharedToday,
  feedItems,
  onAddSong,
  onOpenComments,
  onToggleLike
}: HomeScreenProps) {
  if (!hasSharedToday) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.subtitle}>Home is blurred until you share.</Text>
        <View style={styles.blurredCard} />
        <View style={styles.blurredCard} />
        <Pressable onPress={onAddSong} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Share your Song of the Day</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {feedItems.map((item) => (
        <View key={item.id} style={styles.feedCard}>
          <View style={styles.feedHeader}>
            <Text style={styles.feedUser}>@{item.user}</Text>
            <Text style={styles.feedTimestamp}>Today</Text>
          </View>
          <View style={styles.albumCover} />
          <Text style={styles.feedSong}>{item.song}</Text>
          <Text style={styles.feedArtist}>{item.artist}</Text>
          <Text style={styles.feedCaption}>{item.caption}</Text>
          <View style={styles.feedActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => onToggleLike(item.id)}
            >
              <Text style={styles.iconText}>
                {item.liked ? "♥" : "♡"} {item.likes}
              </Text>
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => onOpenComments(item.id)}
            >
              <Text style={styles.iconText}>💬</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

type AddSongScreenProps = {
  selectedSong: { id: string; title: string; artist: string } | undefined;
  onSelectSong: (songId: string) => void;
  onShare: () => void;
  onBack: () => void;
};

function AddSongScreen({
  selectedSong,
  onSelectSong,
  onShare,
  onBack
}: AddSongScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Pressable onPress={onBack} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
      </Pressable>
      <Text style={styles.sectionTitle}>Share your Song of the Day</Text>
      <View style={styles.card}>
        {demoSongs.map((song) => (
          <Pressable
            key={song.id}
            onPress={() => onSelectSong(song.id)}
            style={[
              styles.songRow,
              selectedSong?.id === song.id && styles.songRowActive
            ]}
          >
            <View style={styles.albumThumb} />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{song.title}</Text>
              <Text style={styles.songArtist}>{song.artist}</Text>
            </View>
            <View style={styles.songPick} />
          </Pressable>
        ))}
      </View>
      {selectedSong && (
        <View style={styles.card}>
          <Text style={styles.sectionSubtitle}>Selected Song</Text>
          <Text style={styles.feedSong}>{selectedSong.title}</Text>
          <Text style={styles.feedArtist}>{selectedSong.artist}</Text>
          <Pressable style={styles.primaryButton} onPress={onShare}>
            <Text style={styles.primaryButtonText}>Share Song</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

type FriendsScreenProps = {
  showFriendProfile: boolean;
  selectedFriend: { id: string; name: string; handle: string };
  friends: Array<{ id: string; name: string; handle: string }>;
  requests: Array<{ id: string; name: string; handle: string }>;
  suggested: Array<{ id: string; name: string; handle: string }>;
  onAcceptRequest: (friend: { id: string; name: string; handle: string }) => void;
  onDeclineRequest: (friend: { id: string; name: string; handle: string }) => void;
  onToggleFriend: (friend: { id: string; name: string; handle: string }) => void;
  onToggleSuggested: (friend: { id: string; name: string; handle: string }) => void;
  onViewFriend: (friend: { id: string; name: string; handle: string }) => void;
  onBack: () => void;
};

function FriendsScreen({
  showFriendProfile,
  selectedFriend,
  friends,
  requests,
  suggested,
  onAcceptRequest,
  onDeclineRequest,
  onToggleFriend,
  onToggleSuggested,
  onViewFriend,
  onBack
}: FriendsScreenProps) {
  if (showFriendProfile) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Back to Friends</Text>
        </Pressable>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge} />
          <Text style={styles.profileName}>{selectedFriend.name}</Text>
          <Text style={styles.profileHandle}>{selectedFriend.handle}</Text>
          <Text style={styles.sectionSubtitle}>Friends: 500+</Text>
        </View>
        <Text style={styles.sectionTitle}>Favorite Songs</Text>
        <View style={styles.favoriteRow}>
          {["Song", "Song", "Song"].map((label, index) => (
            <View key={`${label}-${index}`} style={styles.favoriteCard}>
              <View style={styles.favoriteThumb} />
              <Text style={styles.favoriteLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Favorite Artists</Text>
        <View style={styles.favoriteRow}>
          {["Artist", "Artist", "Artist"].map((label, index) => (
            <View key={`${label}-${index}`} style={styles.favoriteCard}>
              <View style={styles.favoriteThumb} />
              <Text style={styles.favoriteLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Friend Requests</Text>
      <View style={styles.card}>
        {requests.length === 0 && (
          <Text style={styles.sectionSubtitle}>No pending requests.</Text>
        )}
        {requests.map((request) => (
          <View key={request.id} style={styles.friendRow}>
            <View style={styles.avatar} />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{request.name}</Text>
              <Text style={styles.friendHandle}>{request.handle}</Text>
            </View>
            <Pressable
              style={styles.primaryButtonSmall}
              onPress={() => onAcceptRequest(request)}
            >
              <Text style={styles.primaryButtonText}>Accept</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => onDeclineRequest(request)}
            >
              <Text style={styles.secondaryButtonText}>Decline</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Friends</Text>
      <View style={styles.card}>
        {friends.length === 0 && (
          <Text style={styles.sectionSubtitle}>No friends yet.</Text>
        )}
        {friends.map((friend) => (
          <View key={friend.id} style={styles.friendRow}>
            <Pressable
              style={styles.friendInfoRow}
              onPress={() => onViewFriend(friend)}
            >
              <View style={styles.avatar} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendHandle}>{friend.handle}</Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => onToggleFriend(friend)}
            >
              <Text style={styles.secondaryButtonText}>Unfriend</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Suggested</Text>
      <View style={styles.card}>
        {suggested.map((friend) => {
          const isFriend = friends.some((item) => item.id === friend.id);
          return (
            <View key={friend.id} style={styles.friendRow}>
              <View style={styles.avatar} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendHandle}>{friend.handle}</Text>
              </View>
              <Pressable
                style={isFriend ? styles.secondaryButton : styles.primaryButtonSmall}
                onPress={() => onToggleSuggested(friend)}
              >
                <Text
                  style={
                    isFriend
                      ? styles.secondaryButtonText
                      : styles.primaryButtonText
                  }
                >
                  {isFriend ? "Unfriend" : "Add"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

type ProfileScreenProps = {
  showPlaylistPopup: boolean;
  shareHistory: Array<{ id: string; song: string; artist: string; date: string }>;
  onTogglePlaylist: () => void;
};

function ProfileScreen({
  showPlaylistPopup,
  shareHistory,
  onTogglePlaylist
}: ProfileScreenProps) {
  const [profileTab, setProfileTab] = useState<"history" | "favorites">(
    "history"
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge} />
        <Text style={styles.profileName}>My Name</Text>
        <Text style={styles.profileHandle}>@username</Text>
        <Text style={styles.sectionSubtitle}>Friends: 45</Text>
      </View>

      <View style={styles.tabRow}>
        {["history", "favorites"].map((tab) => (
          <Pressable
            key={tab}
            onPress={() =>
              setProfileTab(tab as "history" | "favorites")
            }
            style={[
              styles.tabChip,
              profileTab === tab && styles.tabChipActive
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                profileTab === tab && styles.tabChipTextActive
              ]}
            >
              {tab === "history" ? "History" : "Favorites"}
            </Text>
          </Pressable>
        ))}
      </View>

      {profileTab === "history" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>History</Text>
          {shareHistory.map((entry) => (
            <View key={entry.id} style={styles.songRow}>
              <View style={styles.albumThumb} />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{entry.song}</Text>
                <Text style={styles.songArtist}>
                  {entry.artist} · {entry.date}
                </Text>
              </View>
            </View>
          ))}
          <Pressable style={styles.secondaryButton} onPress={onTogglePlaylist}>
            <Text style={styles.secondaryButtonText}>
              Song of the Day Playlist
            </Text>
          </Pressable>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Export to Spotify</Text>
          </Pressable>
        </View>
      )}

      {profileTab === "favorites" && (
        <>
          <Text style={styles.sectionTitle}>Favorite Songs</Text>
          <View style={styles.card}>
            {demoSongs.map((song) => (
              <View key={song.id} style={styles.songRow}>
                <View style={styles.albumThumb} />
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{song.title}</Text>
                  <Text style={styles.songArtist}>{song.artist}</Text>
                </View>
                <View style={styles.songPick} />
              </View>
            ))}
            <Text style={styles.sectionSubtitle}>Suggested by Spotify</Text>
          </View>

          <Text style={styles.sectionTitle}>Favorite Artists</Text>
          <View style={styles.card}>
            {["Artist Name", "Artist Name", "Artist Name"].map((artist) => (
              <View key={artist} style={styles.songRow}>
                <View style={styles.avatar} />
                <Text style={styles.songTitle}>{artist}</Text>
                <View style={styles.songPick} />
              </View>
            ))}
            <Text style={styles.sectionSubtitle}>Suggested by Spotify</Text>
          </View>
        </>
      )}

      {showPlaylistPopup && (
        <PopupSheet title="Playlist Pop-up" onClose={onTogglePlaylist}>
          <Text style={styles.sectionSubtitle}>Song of the Day Playlist</Text>
          {demoSongs.map((song) => (
            <Text key={song.id} style={styles.songArtist}>
              {song.title} - {song.artist}
            </Text>
          ))}
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Add to Library</Text>
          </Pressable>
        </PopupSheet>
      )}
    </ScrollView>
  );
}

type PopupSheetProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

function PopupSheet({ title, onClose, children }: PopupSheetProps) {
  return (
    <View style={styles.popupOverlay}>
      <View style={styles.popupCard}>
        <View style={styles.popupHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Pressable onPress={onClose} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </Pressable>
        </View>
        <View style={styles.popupBody}>{children}</View>
      </View>
    </View>
  );
}

const colors = {
  background: "#F7F7F9",
  card: "#FFFFFF",
  primary: "#2F5DFF",
  text: "#1D1E20",
  muted: "#5E6A71",
  border: "#E5E7EB"
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  body: {
    flex: 1,
    paddingHorizontal: 20
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  scrollContent: {
    paddingBottom: 32
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  brand: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text
  },
  headerPill: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  headerPillText: {
    color: colors.muted,
    fontSize: 12
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 16
  },
  card: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text
  },
  helperText: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 12
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center"
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600"
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "500"
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  circleButtonText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700"
  },
  feedCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  feedUser: {
    fontWeight: "600",
    color: colors.text
  },
  feedTimestamp: {
    fontSize: 12,
    color: colors.muted
  },
  albumCover: {
    height: 180,
    borderRadius: 16,
    backgroundColor: "#D9E0FF"
  },
  feedSong: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text
  },
  feedArtist: {
    color: colors.muted
  },
  feedCaption: {
    color: colors.text
  },
  feedActions: {
    flexDirection: "row",
    gap: 12
  },
  iconButton: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  iconText: {
    fontSize: 16
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center"
  },
  tabItemHome: {
    backgroundColor: colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    marginTop: -20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    flex: 0,
    borderWidth: 3,
    borderColor: colors.card,
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 12
  },
  tabLabelHome: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: "600"
  },
  sectionHeader: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.muted
  },
  tabRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tabChipText: {
    color: colors.text,
    fontWeight: "500"
  },
  tabChipTextActive: {
    color: "#FFFFFF"
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12
  },
  friendInfoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#CBD5F5"
  },
  friendInfo: {
    flex: 1
  },
  friendName: {
    fontWeight: "600",
    color: colors.text
  },
  friendHandle: {
    fontSize: 12,
    color: colors.muted
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#CBD5F5",
    marginBottom: 12
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text
  },
  profileHandle: {
    color: colors.muted,
    marginBottom: 12
  },
  profileStats: {
    flexDirection: "row",
    gap: 24
  },
  statItem: {
    alignItems: "center"
  },
  statNumber: {
    fontWeight: "700",
    color: colors.text
  },
  statLabel: {
    fontSize: 12,
    color: colors.muted
  },
  favoriteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  favoriteCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center"
  },
  favoriteThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#E4E9FF",
    marginBottom: 8
  },
  favoriteLabel: {
    fontSize: 12,
    color: colors.muted
  },
  blurredCard: {
    height: 80,
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    marginBottom: 12
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10
  },
  songRowActive: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingHorizontal: 8
  },
  albumThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#C7D2FE"
  },
  songInfo: {
    flex: 1
  },
  songTitle: {
    fontWeight: "600",
    color: colors.text
  },
  songArtist: {
    color: colors.muted,
    fontSize: 12
  },
  songPick: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border
  },
  primaryButtonSmall: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  backButtonText: {
    color: colors.text,
    fontSize: 12
  },
  headerSpacer: {
    width: 50
  },
  commentList: {
    flex: 1,
    marginTop: 12
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12
  },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  commentUser: {
    fontSize: 12,
    color: colors.muted
  },
  commentText: {
    color: colors.text
  },
  commentInputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 12
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text
  },
  commentDraftInput: {
    flex: 1
  },
  popupOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 20
  },
  popupCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  popupBody: {
    gap: 12
  }
});
