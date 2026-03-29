// @ts-nocheck
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View
} from "react-native";
import { colors, styles } from "../components/styles";
import type { FavoriteArtistEntry, FavoriteSongEntry, Friend } from "../types";

const SLOT_COUNT = 3;

type FriendProfileScreenProps = {
  friend: Friend;
  profilePhotoUri?: string | null;
  profileTab: "favorites" | "history";
  onToggleProfileTab: (tab: "history" | "favorites") => void;
  favoriteSongs: FavoriteSongEntry[];
  favoriteArtists: FavoriteArtistEntry[];
  shareHistory: Array<{
    id: string;
    song: string;
    artist: string;
    date: string;
    albumCover?: string;
  }>;
  loading?: boolean;
  friendCount?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  onBack: () => void;
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

export function FriendProfileScreen({
  friend,
  profilePhotoUri = null,
  profileTab,
  onToggleProfileTab,
  favoriteSongs,
  favoriteArtists,
  shareHistory,
  loading = false,
  friendCount = 0,
  refreshing = false,
  onRefresh,
  onBack
}: FriendProfileScreenProps) {
  const historyItems =
    shareHistory.length > 0
      ? shareHistory
      : [
          {
            id: "empty",
            song: "",
            artist: "",
            date: "—",
            albumCover: undefined
          }
        ];

  const songSlots = Array.from({ length: SLOT_COUNT }, (_, i) => songSlot(i, favoriteSongs));
  const artistSlots = Array.from({ length: SLOT_COUNT }, (_, i) => artistSlot(i, favoriteArtists));

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    >
      <Pressable onPress={onBack} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>

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
            <Text style={styles.slimChipText}>{friendCount} Friends</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => onToggleProfileTab("favorites")}
          style={[styles.tabChip, profileTab === "favorites" && styles.tabChipActive]}
        >
          <Text
            style={[
              styles.tabChipText,
              profileTab === "favorites" && styles.tabChipTextActive
            ]}
          >
            Favorites
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onToggleProfileTab("history")}
          style={[styles.tabChip, profileTab === "history" && styles.tabChipActive]}
        >
          <Text
            style={[
              styles.tabChipText,
              profileTab === "history" && styles.tabChipTextActive
            ]}
          >
            History
          </Text>
        </Pressable>
      </View>

      <View style={styles.profileSection}>
        {profileTab === "history" && (
          <>
            <Text style={styles.bigSectionTitle}>Song history</Text>
            <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>
              Songs they&apos;ve shared on Song of the Day.
            </Text>
            <View style={styles.profileHistoryGrid}>
              {historyItems.map((entry, index) => (
                <View
                  key={`${entry.id ?? "fh"}-${index}`}
                  style={styles.profileHistoryGridCell}
                >
                  {entry.albumCover ? (
                    <Image
                      source={{ uri: entry.albumCover }}
                      style={styles.profileHistoryThumb}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.profileHistoryThumb} />
                  )}
                  <Text style={styles.profileHistoryCaption} numberOfLines={2}>
                    {entry.song || "—"}
                  </Text>
                  <Text style={styles.profileHistoryCaptionMuted} numberOfLines={1}>
                    {entry.artist || " "}
                  </Text>
                  <Text style={[styles.profileHistoryCaptionMuted, { opacity: 0.9 }]}>
                    {entry.date}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {profileTab === "favorites" && (
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
                    style={[
                      styles.profileGridLabel,
                      song.empty && { opacity: 0.85, fontSize: 12 }
                    ]}
                    numberOfLines={song.empty ? 1 : 2}
                  >
                    {song.empty ? "Empty" : song.title}
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
                    style={[
                      styles.profileGridLabel,
                      artist.empty && { opacity: 0.85, fontSize: 12 }
                    ]}
                    numberOfLines={2}
                  >
                    {artist.empty ? "Empty" : artist.name}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
