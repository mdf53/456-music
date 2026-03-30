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

type ShareHistoryEntry = {
  id: string;
  song: string;
  artist: string;
  date: string;
  albumCover?: string;
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
  onBack
}: FriendProfileScreenProps) {
  const songs = favoriteSongs ?? [];
  const artists = favoriteArtists ?? [];
  const history = shareHistory ?? [];

  const historySource =
    history.length > 0
      ? history
      : [
          {
            id: "history",
            song: "",
            artist: "",
            date: "mm/dd/yr",
            albumCover: undefined as string | undefined
          }
        ];
  const historyGrid = Array.from(
    { length: Math.min(9, Math.max(historySource.length, 1)) },
    (_, index) => {
      const source = historySource[index % historySource.length];
      return {
        id: `${source?.id ?? "history"}-${index}`,
        date: source?.date ?? "mm/dd/yr",
        albumCover: source?.albumCover
      };
    }
  );

  const songSlots = Array.from({ length: SLOT_COUNT }, (_, i) => songSlot(i, songs));
  const artistSlots = Array.from({ length: SLOT_COUNT }, (_, i) => artistSlot(i, artists));

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, styles.profileScreenContent]}
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
            <View style={styles.slimChip}>
              <Text style={styles.slimChipText}>Keep In Tune</Text>
            </View>
          </View>
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
            {[0, 3, 6].map((start) => {
              const row = historyGrid.slice(start, start + 3);
              if (row.length === 0) return null;
              return (
                <View key={`history-row-${start}`} style={styles.profileGrid}>
                  {row.map((entry) => (
                    <View key={entry.id} style={styles.profileGridItem}>
                      {entry.albumCover ? (
                        <Image source={{ uri: entry.albumCover }} style={styles.profileThumb} />
                      ) : (
                        <View style={styles.profileThumb} />
                      )}
                      <Text style={styles.profileGridLabel}>Posted {entry.date}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
}
