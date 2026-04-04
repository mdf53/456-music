import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { AppRefreshControl } from "../components/AppRefreshControl";
import { PopupSheet } from "../components/PopupSheet";
import { colors, styles } from "../components/styles";
import type { FavoriteArtistEntry, FavoriteSongEntry, Friend } from "../types";

const SLOT_COUNT = 3;

type ShareHistoryEntry = {
  id: string;
  song: string;
  artist: string;
  date: string;
  albumCover?: string;
  caption?: string;
  likes?: number;
  comments?: Array<{ user: string; text: string; likes?: number }>;
};

type FriendProfileScreenProps = {
  friend: Friend;
  profilePhotoUri?: string | null;
  profileTab: "favorites" | "history";
  onToggleProfileTab: (tab: "history" | "favorites") => void;
  favoriteSongs: FavoriteSongEntry[];
  favoriteArtists: FavoriteArtistEntry[];
  shareHistory: ShareHistoryEntry[];
  loading?: boolean;
  friendCount?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  onBack: () => void;
  /** Viewer is already friends, has a pending outgoing request, or can send a request */
  friendRelationship?: "friend" | "pending" | "none";
  onAddFriend?: () => void;
};

function songSlot(
  index: number,
  favoriteSongs: FavoriteSongEntry[]
):
  | { id: string; empty: true }
  | {
      id: string;
      empty: false;
      title: string;
      artist: string;
      albumCoverUrl?: string;
    } {
  const s = favoriteSongs[index];
  if (s && s.title.trim() !== "") {
    return {
      id: `fav-song-${index}`,
      empty: false,
      title: s.title,
      artist: s.artist ?? "",
      albumCoverUrl: s.albumCoverUrl
    };
  }
  return { id: `fav-song-${index}`, empty: true };
}

function artistSlot(
  index: number,
  favoriteArtists: FavoriteArtistEntry[]
):
  | { id: string; empty: true }
  | { id: string; empty: false; name: string; imageUrl?: string } {
  const a = favoriteArtists[index];
  if (a && a.name.trim() !== "") {
    return {
      id: `fav-art-${index}`,
      empty: false,
      name: a.name,
      imageUrl: a.imageUrl
    };
  }
  return { id: `fav-art-${index}`, empty: true };
}

export function FriendProfileScreen({
  friend,
  profilePhotoUri,
  profileTab,
  onToggleProfileTab,
  favoriteSongs,
  favoriteArtists,
  shareHistory,
  loading = false,
  friendCount = 0,
  refreshing = false,
  onRefresh,
  onBack,
  friendRelationship = "friend",
  onAddFriend
}: FriendProfileScreenProps) {
  const [selectedHistoryPost, setSelectedHistoryPost] = useState<ShareHistoryEntry | null>(
    null
  );

  const songs = favoriteSongs ?? [];
  const artists = favoriteArtists ?? [];
  const history = shareHistory ?? [];

  const historySource =
    history.length > 0
      ? history
      : [
          {
            id: "history-empty",
            song: "No songs posted yet",
            artist: "This user has not shared a song yet",
            date: "--/--/--",
            albumCover: undefined as string | undefined,
            caption: "",
            likes: 0,
            comments: []
          }
        ];

  const historyRows = useMemo(() => {
    const rows: ShareHistoryEntry[][] = [];
    for (let i = 0; i < historySource.length; i += 3) {
      rows.push(historySource.slice(i, i + 3));
    }
    return rows;
  }, [historySource]);

  const songSlots = Array.from({ length: SLOT_COUNT }, (_, i) => songSlot(i, songs));
  const artistSlots = Array.from({ length: SLOT_COUNT }, (_, i) => artistSlot(i, artists));

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, styles.profileScreenContent]}
        refreshControl={
          onRefresh ? (
            <AppRefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
            />
          ) : undefined
        }
      >
      <Pressable onPress={onBack} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>

      <View style={styles.profileTopPanel}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatarLarge, styles.avatarLargeInteractive]}>
            {profilePhotoUri ? (
              <Image
                source={{ uri: profilePhotoUri }}
                style={styles.avatarLargeImage}
                resizeMode="cover"
              />
            ) : null}
          </View>
          <Text style={styles.profileName}>{friend.name}</Text>
          <Text style={styles.profileHandle}>@{friend.handle}</Text>
          <View style={styles.followStatsRow}>
            <View style={styles.slimChip}>
              <Text style={styles.slimChipText}>
                {friendCount > 0 ? `${friendCount} friends` : "— friends"}
              </Text>
            </View>
          </View>
          {friendRelationship === "none" && onAddFriend ? (
            <Pressable
              onPress={onAddFriend}
              style={[styles.primaryButton, { marginTop: 14, alignSelf: "stretch" }]}
              accessibilityRole="button"
              accessibilityLabel="Send friend request"
            >
              <Text style={styles.primaryButtonText}>Add friend</Text>
            </Pressable>
          ) : null}
          {friendRelationship === "pending" ? (
            <View
              style={[
                styles.friendRequestPendingButton,
                { marginTop: 14, alignSelf: "stretch" }
              ]}
              accessibilityRole="text"
              accessibilityLabel="Friend request pending"
            >
              <Text style={styles.friendRequestPendingButtonText}>Request sent</Text>
            </View>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}

      <View style={styles.profileSection}>
        <View style={[styles.tabRow, { marginTop: 0, marginBottom: 12 }]}>
          {(["favorites", "history"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => onToggleProfileTab(tab)}
              style={[styles.tabChip, profileTab === tab && styles.tabChipActive]}
            >
              <Text
                style={[styles.tabChipText, profileTab === tab && styles.tabChipTextActive]}
              >
                {tab === "favorites" ? "Favorites" : "History"}
              </Text>
            </Pressable>
          ))}
        </View>

        {profileTab === "favorites" ? (
          <>
            <Text style={styles.bigSectionTitle}>Favorite Songs</Text>
            <View style={styles.profileGrid}>
              {songSlots.map((song) => (
                <View key={song.id} style={styles.profileGridItem}>
                  {!song.empty && song.albumCoverUrl ? (
                    <Image source={{ uri: song.albumCoverUrl }} style={styles.profileThumb} />
                  ) : (
                    <View
                      style={[
                        styles.profileThumb,
                        song.empty && {
                          opacity: 0.85,
                          borderStyle: "dashed",
                          borderWidth: 1,
                          borderColor: "#4a4d5a"
                        }
                      ]}
                    />
                  )}
                  <Text
                    style={[styles.profileGridLabel, song.empty && { opacity: 0.85, fontSize: 12 }]}
                    numberOfLines={song.empty ? 1 : 2}
                  >
                    {song.empty ? "Empty slot" : song.title}
                  </Text>
                  {!song.empty && song.artist ? (
                    <Text
                      style={[styles.profileGridLabel, styles.profileGridSubLabel]}
                      numberOfLines={1}
                    >
                      {song.artist}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>

            <View style={styles.sectionDivider} />

            <Text style={styles.bigSectionTitle}>Favorite Artists</Text>
            <View style={styles.profileGrid}>
              {artistSlots.map((artist) => (
                <View key={artist.id} style={styles.profileGridItem}>
                  {!artist.empty && artist.imageUrl ? (
                    <Image
                      source={{ uri: artist.imageUrl }}
                      style={[styles.profileThumb, { borderRadius: 999 }]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.profileThumb,
                        { borderRadius: 999 },
                        artist.empty && {
                          opacity: 0.85,
                          borderStyle: "dashed",
                          borderWidth: 1,
                          borderColor: "#4a4d5a"
                        }
                      ]}
                    />
                  )}
                  <Text
                    style={[styles.profileGridLabel, artist.empty && { opacity: 0.85, fontSize: 12 }]}
                    numberOfLines={2}
                  >
                    {artist.empty ? "Empty slot" : artist.name}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.bigSectionTitle}>History</Text>
            {historyRows.map((row, rowIndex) => (
              <View
                key={`history-row-${rowIndex}`}
                style={[styles.profileGrid, styles.historyGridRow]}
              >
                {row.map((entry) => {
                  const isEmpty = entry.id === "history-empty";
                  return (
                    <Pressable
                      key={entry.id}
                      style={[styles.profileGridItem, styles.historyGridItem]}
                      onPress={() => {
                        if (!isEmpty) setSelectedHistoryPost(entry);
                      }}
                      disabled={isEmpty}
                    >
                      {entry.albumCover ? (
                        <Image source={{ uri: entry.albumCover }} style={styles.profileThumb} />
                      ) : (
                        <View style={styles.profileThumb} />
                      )}
                      <Text style={styles.historySongText} numberOfLines={2}>
                        {entry.song || "Untitled song"}
                      </Text>
                      {entry.artist ? (
                        <Text style={styles.historyArtistText} numberOfLines={1}>
                          {entry.artist}
                        </Text>
                      ) : null}
                      <Text style={styles.historyDateText}>Posted {entry.date}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </>
        )}
      </View>

      </ScrollView>

      {selectedHistoryPost ? (
        <PopupSheet title="Post" onClose={() => setSelectedHistoryPost(null)}>
          <View style={styles.feedCard}>
            <View style={styles.feedHeader}>
              <Text style={styles.feedUser}>@{friend.handle}</Text>
              <Text style={styles.feedTimestamp}>Posted {selectedHistoryPost.date}</Text>
            </View>
            <View style={styles.feedHeroRow}>
              {selectedHistoryPost.albumCover ? (
                <Image
                  source={{ uri: selectedHistoryPost.albumCover }}
                  style={styles.feedAlbumCover}
                />
              ) : (
                <View style={styles.feedAlbumCover}>
                  <Text style={styles.feedCaptionSmall}>Album{"\n"}Cover</Text>
                </View>
              )}
              <View style={styles.feedHeroMeta}>
                <Text style={styles.feedSongLarge}>{selectedHistoryPost.song}</Text>
                <Text style={styles.feedArtistLarge}>{selectedHistoryPost.artist}</Text>
              </View>
            </View>
            {selectedHistoryPost.caption?.trim() ? (
              <Text style={styles.feedCaptionInline}>
                <Text style={styles.feedCaptionUser}>@{friend.handle} </Text>
                {selectedHistoryPost.caption}
              </Text>
            ) : null}

            <View style={styles.historyPopupStatRow}>
              <Text style={styles.historyPopupStatLabel}>Likes</Text>
              <Text style={styles.historyPopupStatValue}>{selectedHistoryPost.likes ?? 0}</Text>
            </View>

            <View style={styles.feedCardDivider} />
            <Text style={styles.feedCommentTitle}>Comments</Text>
            {selectedHistoryPost.comments && selectedHistoryPost.comments.length > 0 ? (
              selectedHistoryPost.comments.map((comment, index) => (
                <View
                  key={`${selectedHistoryPost.id}-comment-${index}`}
                  style={styles.historyPopupCommentRow}
                >
                  <Text style={[styles.feedCommentPreview, styles.historyPopupCommentText]}>
                    <Text style={styles.feedCommentPreviewUser}>@{comment.user} </Text>
                    {comment.text}
                  </Text>
                  <Text style={styles.historyPopupCommentLikes}>
                    {comment.likes ?? 0} likes
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.feedCommentEmpty}>No comments yet.</Text>
            )}
          </View>
        </PopupSheet>
      ) : null}
    </>
  );
}
