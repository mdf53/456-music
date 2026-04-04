// @ts-nocheck
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { AppRefreshControl } from "../components/AppRefreshControl";
import { PopupSheet } from "../components/PopupSheet";
import { colors, styles } from "../components/styles";
import type { SpotifyArtist, SpotifyTrack } from "../services/spotifyClient";
import type { FavoriteArtistEntry, FavoriteSongEntry } from "../types";

const SLOT_COUNT = 3;

type ProfileScreenProps = {
  showPlaylistPopup: boolean;
  shareHistory: Array<{
    id: string;
    song: string;
    artist: string;
    date: string;
    albumCover?: string;
    caption?: string;
    likes?: number;
    comments?: Array<{ user: string; text: string; likes?: number }>;
  }>;
  onTogglePlaylist: () => void;
  onToggleProfileTab: (tab: "history" | "favorites") => void;
  profileTab: "history" | "favorites";
  demoSongs: Array<{ id: string; title: string; artist: string; albumCover?: string }>;
  favoriteArtists: FavoriteArtistEntry[];
  favoriteSongs: FavoriteSongEntry[];
  profileName?: string;
  profileHandle?: string;
  /** Tap artwork on Favorites tab to replace that slot */
  profileSearchOpen?: boolean;
  profileSearchQuery?: string;
  profileSearchMode?: "track" | "artist";
  profileSearchTrackResults?: SpotifyTrack[];
  profileSearchArtistResults?: SpotifyArtist[];
  profileSearchLoading?: boolean;
  profileSearchError?: string | null;
  onOpenFavoriteSlot?: (kind: "song" | "artist", index: number) => void;
  onProfileSearchQueryChange?: (q: string) => void;
  onRunProfileSearch?: () => void;
  onPickProfileSearchTrack?: (track: SpotifyTrack) => void;
  onPickProfileSearchArtist?: (artist: SpotifyArtist) => void;
  onCloseProfileSearch?: () => void;
  /** Tap @handle to rename */
  editHandleOpen?: boolean;
  editHandleDraft?: string;
  editHandleSaving?: boolean;
  editHandleError?: string | null;
  onOpenEditHandle?: () => void;
  onEditHandleDraftChange?: (value: string) => void;
  onSaveEditHandle?: () => void;
  onCloseEditHandle?: () => void;
  profilePhotoUri?: string | null;
  profilePhotoSaving?: boolean;
  onPickProfilePhoto?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  friendCount?: number;
  onGoToFriends?: () => void;
};

function songSlot(
  index: number,
  favoriteSongs: FavoriteSongEntry[]
): { id: string; empty: true } | { id: string; empty: false; title: string; artist: string; albumCoverUrl?: string } {
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
): { id: string; empty: true } | { id: string; empty: false; name: string; imageUrl?: string } {
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

const profileSearchRowStyles = {
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3e414a"
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#2a2c33"
  }
};

export function ProfileScreen({
  showPlaylistPopup,
  shareHistory,
  onTogglePlaylist,
  onToggleProfileTab,
  profileTab,
  demoSongs,
  favoriteArtists,
  favoriteSongs,
  profileName,
  profileHandle,
  profileSearchOpen = false,
  profileSearchQuery = "",
  profileSearchMode = "track",
  profileSearchTrackResults = [],
  profileSearchArtistResults = [],
  profileSearchLoading = false,
  profileSearchError = null,
  onOpenFavoriteSlot,
  onProfileSearchQueryChange,
  onRunProfileSearch,
  onPickProfileSearchTrack,
  onPickProfileSearchArtist,
  onCloseProfileSearch,
  editHandleOpen = false,
  editHandleDraft = "",
  editHandleSaving = false,
  editHandleError = null,
  onOpenEditHandle,
  onEditHandleDraftChange,
  onSaveEditHandle,
  onCloseEditHandle,
  profilePhotoUri = null,
  profilePhotoSaving = false,
  onPickProfilePhoto,
  refreshing = false,
  onRefresh,
  friendCount = 0,
  onGoToFriends
}: ProfileScreenProps) {
  const [selectedHistoryPost, setSelectedHistoryPost] = useState<
    | {
        id: string;
        song: string;
        artist: string;
        date: string;
        albumCover?: string;
        caption?: string;
        likes?: number;
        comments?: Array<{ user: string; text: string; likes?: number }>;
      }
    | null
  >(null);

  const historySource =
    shareHistory.length > 0
      ? shareHistory
      : [
          {
            id: "history-empty",
            song: "No songs posted yet",
            artist: "Post your first song to build history",
            date: "--/--/--",
            albumCover: undefined as string | undefined,
            caption: "",
            likes: 0,
            comments: []
          }
        ];

  const historyRows = useMemo(() => {
    const rows: typeof historySource[] = [];
    for (let i = 0; i < historySource.length; i += 3) {
      rows.push(historySource.slice(i, i + 3));
    }
    return rows;
  }, [historySource]);

  const songSlots = Array.from({ length: SLOT_COUNT }, (_, i) => songSlot(i, favoriteSongs));
  const artistSlots = Array.from({ length: SLOT_COUNT }, (_, i) => artistSlot(i, favoriteArtists));

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
      <View style={styles.profileTopPanel}>
        <View style={styles.profileHeader}>
          <Pressable
            onPress={() => onPickProfilePhoto?.()}
            disabled={!onPickProfilePhoto || profilePhotoSaving}
            style={[styles.avatarLarge, styles.avatarLargeInteractive]}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
          >
            {profilePhotoUri ? (
              <Image
                source={{ uri: profilePhotoUri }}
                style={styles.avatarLargeImage}
                resizeMode="cover"
              />
            ) : null}
            {profilePhotoSaving ? (
              <View style={styles.avatarLargeSavingOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : null}
          </Pressable>
          <Text style={styles.profileName}>{profileName ?? "My Profile"}</Text>
          {profileHandle && onOpenEditHandle ? (
            <Pressable
              onPress={onOpenEditHandle}
              accessibilityRole="button"
              accessibilityLabel="Edit profile handle"
            >
              <Text style={[styles.profileHandle, { color: colors.primary }]}>@{profileHandle}</Text>
            </Pressable>
          ) : (
            <Text style={styles.profileHandle}>{profileHandle ? `@${profileHandle}` : "@you"}</Text>
          )}
          <View style={styles.followStatsRow}>
            <Pressable
              onPress={() => onGoToFriends?.()}
              disabled={!onGoToFriends}
              accessibilityRole={onGoToFriends ? "button" : undefined}
              accessibilityLabel="View friends"
            >
              <View style={styles.slimChip}>
                <Text style={styles.slimChipText}>
                  {friendCount === 1 ? "1 friend" : `${friendCount} friends`}
                </Text>
              </View>
            </Pressable>
          </View>
          {/* Playlist feature — deferred; re-enable with PopupSheet block below
          <Pressable onPress={onTogglePlaylist} style={[styles.primaryButton, styles.profileAction]}>
            <Text style={styles.primaryButtonText}>Open Playlist</Text>
          </Pressable>
          */}
        </View>

      </View>

      <View style={styles.profileSection}>
        <View style={[styles.tabRow, { marginTop: 0, marginBottom: 12 }]}>
          {["favorites", "history"].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => onToggleProfileTab(tab as "history" | "favorites")}
              style={[styles.tabChip, profileTab === tab && styles.tabChipActive]}
            >
              <Text
                style={[styles.tabChipText, profileTab === tab && styles.tabChipTextActive]}
              >
                {tab === "history" ? "History" : "Favorites"}
              </Text>
            </Pressable>
          ))}
        </View>

        {profileTab === "history" && (
          <>
            <Text style={styles.bigSectionTitle}>History</Text>
            {historyRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={[styles.profileGrid, styles.historyGridRow]}>
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

        {profileTab === "favorites" && (
          <>
            <Text style={styles.bigSectionTitle}>Favorite Songs</Text>
            <View style={styles.profileGrid}>
              {songSlots.map((song, index) => (
                <View key={song.id} style={styles.profileGridItem}>
                  <Pressable
                    onPress={() => onOpenFavoriteSlot?.("song", index)}
                    disabled={!onOpenFavoriteSlot}
                    accessibilityRole="button"
                    accessibilityLabel={`Change favorite song ${index + 1}`}
                  >
                    {!song.empty && song.albumCoverUrl ? (
                      <Image source={{ uri: song.albumCoverUrl }} style={styles.profileThumb} />
                    ) : (
                      <View
                        style={[
                          styles.profileThumb,
                          song.empty && { opacity: 0.85, borderStyle: "dashed", borderWidth: 1, borderColor: "#4a4d5a" }
                        ]}
                      />
                    )}
                  </Pressable>
                  <Text
                    style={[
                      styles.profileGridLabel,
                      song.empty && { opacity: 0.85, fontSize: 12 }
                    ]}
                    numberOfLines={song.empty ? 1 : 2}
                  >
                    {song.empty ? "Empty slot" : song.title}
                  </Text>
                  {!song.empty && song.artist ? (
                    <Text style={[styles.profileGridLabel, { opacity: 0.85 }]} numberOfLines={1}>
                      {song.artist}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>

            <View style={styles.sectionDivider} />

            <Text style={styles.bigSectionTitle}>Favorite Artists</Text>
            <View style={styles.profileGrid}>
              {artistSlots.map((artist, index) => (
                <View key={artist.id} style={styles.profileGridItem}>
                  <Pressable
                    onPress={() => onOpenFavoriteSlot?.("artist", index)}
                    disabled={!onOpenFavoriteSlot}
                    accessibilityRole="button"
                    accessibilityLabel={`Change favorite artist ${index + 1}`}
                  >
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
                  </Pressable>
                  <Text
                    style={[
                      styles.profileGridLabel,
                      artist.empty && { opacity: 0.85, fontSize: 12 }
                    ]}
                    numberOfLines={2}
                  >
                    {artist.empty ? "Empty slot" : artist.name}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Playlist feature — deferred
      {showPlaylistPopup && (
        <PopupSheet title="Playlist" onClose={onTogglePlaylist}>
          <Text style={styles.sectionSubtitle}>Keep In Tune Playlist</Text>
          {demoSongs.map((song) => (
            <Text key={song.id} style={styles.friendHandle}>
              {song.title} - {song.artist}
            </Text>
          ))}
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Add to Library</Text>
          </Pressable>
        </PopupSheet>
      )}
      */}
    </ScrollView>

    {profileSearchOpen && onCloseProfileSearch ? (
      <PopupSheet
        title={
          profileSearchMode === "track" ? "Replace favorite song" : "Replace favorite artist"
        }
        onClose={onCloseProfileSearch}
      >
        <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>
          Search Spotify, then tap a result to save.
        </Text>
        <View style={{ gap: 10, marginBottom: 12 }}>
          <TextInput
            style={styles.input}
            placeholder={
              profileSearchMode === "track"
                ? "Search for a song…"
                : "Search for an artist…"
            }
            placeholderTextColor="#888"
            value={profileSearchQuery}
            onChangeText={onProfileSearchQueryChange}
            returnKeyType="search"
            onSubmitEditing={() => onRunProfileSearch?.()}
          />
          <Pressable onPress={() => onRunProfileSearch?.()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Search Spotify</Text>
          </Pressable>
        </View>
        {profileSearchLoading ? (
          <View style={{ paddingVertical: 16, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.sectionSubtitle, { marginTop: 12 }]}>Searching…</Text>
          </View>
        ) : null}
        {profileSearchError ? (
          <Text style={styles.errorText}>{profileSearchError}</Text>
        ) : null}
        <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator>
          {profileSearchMode === "track" &&
            profileSearchTrackResults.map((t) => (
              <Pressable
                key={t.id}
                style={profileSearchRowStyles.row}
                onPress={() => void onPickProfileSearchTrack?.(t)}
              >
                {t.albumCover ? (
                  <Image source={{ uri: t.albumCover }} style={profileSearchRowStyles.thumb} />
                ) : (
                  <View style={profileSearchRowStyles.thumb} />
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.gridTitle} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={styles.gridSub} numberOfLines={1}>
                    {t.artist} · {t.album}
                  </Text>
                </View>
              </Pressable>
            ))}
          {profileSearchMode === "artist" &&
            profileSearchArtistResults.map((a) => (
              <Pressable
                key={a.id}
                style={profileSearchRowStyles.row}
                onPress={() => void onPickProfileSearchArtist?.(a)}
              >
                {a.imageUrl ? (
                  <Image
                    source={{ uri: a.imageUrl }}
                    style={[profileSearchRowStyles.thumb, { borderRadius: 999 }]}
                  />
                ) : (
                  <View style={[profileSearchRowStyles.thumb, { borderRadius: 999 }]} />
                )}
                <Text style={[styles.gridTitle, { flex: 1, minWidth: 0 }]} numberOfLines={1}>
                  {a.name}
                </Text>
              </Pressable>
            ))}
          {!profileSearchLoading &&
          !profileSearchError &&
          profileSearchMode === "track" &&
          profileSearchTrackResults.length === 0 ? (
            <Text style={styles.sectionSubtitle}>No tracks yet — search above.</Text>
          ) : null}
          {!profileSearchLoading &&
          !profileSearchError &&
          profileSearchMode === "artist" &&
          profileSearchArtistResults.length === 0 ? (
            <Text style={styles.sectionSubtitle}>No artists yet — search above.</Text>
          ) : null}
        </ScrollView>
      </PopupSheet>
    ) : null}

    {editHandleOpen && onCloseEditHandle ? (
      <PopupSheet title="Edit handle" onClose={onCloseEditHandle}>
        <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>
          3–30 characters: lowercase letters, numbers, and underscores only — no spaces.
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "700" }}>@</Text>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="your_handle"
            placeholderTextColor="#888"
            value={editHandleDraft}
            onChangeText={onEditHandleDraftChange}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            editable={!editHandleSaving}
            returnKeyType="done"
          />
        </View>
        {editHandleError ? (
          <Text style={[styles.errorText, { marginBottom: 8 }]}>{editHandleError}</Text>
        ) : null}
        <Pressable
          onPress={() => void onSaveEditHandle?.()}
          style={[
            styles.primaryButton,
            editHandleSaving && styles.primaryButtonDisabled
          ]}
          disabled={editHandleSaving}
        >
          {editHandleSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save</Text>
          )}
        </Pressable>
      </PopupSheet>
    ) : null}

    {selectedHistoryPost ? (
      <PopupSheet title="Post" onClose={() => setSelectedHistoryPost(null)}>
        <View style={styles.feedCard}>
          <View style={styles.feedHeader}>
            <Text style={styles.feedUser}>@{profileHandle ?? "you"}</Text>
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
              <Text style={styles.feedCaptionUser}>@{profileHandle ?? "you"} </Text>
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
