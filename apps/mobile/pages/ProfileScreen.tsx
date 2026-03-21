// @ts-nocheck
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { PopupSheet } from "../components/PopupSheet";
import { styles } from "../components/styles";

type ProfileScreenProps = {
  showPlaylistPopup: boolean;
  shareHistory: Array<{ id: string; song: string; artist: string; date: string; albumCover?: string }>;
  onTogglePlaylist: () => void;
  onToggleProfileTab: (tab: "history" | "favorites") => void;
  profileTab: "history" | "favorites";
  demoSongs: Array<{ id: string; title: string; artist: string; albumCover?: string }>;
  favoriteArtists: Array<{ name: string; imageUrl?: string }>;
  favoriteSongs: Array<{ title: string; artist: string; albumCover?: string }>;
  profileName?: string;
  profileHandle?: string;
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
  profileHandle
}: ProfileScreenProps) {
  const historySource =
    shareHistory.length > 0
      ? shareHistory
      : [{ id: "history", song: "", artist: "", date: "mm/dd/yr", albumCover: undefined as string | undefined }];
  const historyGrid = Array.from({ length: Math.min(9, Math.max(historySource.length, 1)) }, (_, index) => {
    const source = historySource[index % historySource.length];
    return {
      id: `${source?.id ?? "history"}-${index}`,
      date: source?.date ?? "mm/dd/yr",
      albumCover: source?.albumCover
    };
  });

  const displaySongs = favoriteSongs.length > 0
    ? favoriteSongs.map((s, i) => ({ id: `fav-song-${i}`, title: s.title, artist: s.artist, albumCover: s.albumCover }))
    : demoSongs.slice(0, 3).map((s) => ({ ...s, id: s.id, albumCover: s.albumCover }));

  const displayArtists = favoriteArtists.length > 0
    ? favoriteArtists
    : [{ name: "Artist 1" }, { name: "Artist 2" }, { name: "Artist 3" }];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge} />
        <Text style={styles.profileName}>{profileName ?? "My Profile"}</Text>
        <Text style={styles.profileHandle}>
          {profileHandle ? `@${profileHandle}` : "@you"}
        </Text>
        <View style={styles.followStatsRow}>
          <View style={styles.slimChip}>
            <Text style={styles.slimChipText}>43 friends</Text>
          </View>
          <View style={styles.slimChip}>
            <Text style={styles.slimChipText}>38 followers</Text>
          </View>
        </View>
        <Pressable onPress={onTogglePlaylist} style={[styles.primaryButton, styles.profileAction]}>
          <Text style={styles.primaryButtonText}>Open Playlist</Text>
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        {["favorites", "history"].map((tab) => (
          <Pressable
            key={tab}
            onPress={() => onToggleProfileTab(tab as "history" | "favorites")}
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

      <View style={styles.profileSection}>
        {profileTab === "history" && (
          <>
            <Text style={styles.bigSectionTitle}>History</Text>
            {[0, 3, 6].map((start) => {
              const row = historyGrid.slice(start, start + 3);
              if (row.length === 0) return null;
              return (
                <View key={`row-${start}`} style={styles.profileGrid}>
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

        {profileTab === "favorites" && (
          <>
            <Text style={styles.bigSectionTitle}>Favorite Songs</Text>
            <View style={styles.profileGrid}>
              {displaySongs.slice(0, 3).map((song) => (
                <View key={song.id} style={styles.profileGridItem}>
                  {song.albumCover ? (
                    <Image source={{ uri: song.albumCover }} style={styles.profileThumb} />
                  ) : (
                    <View style={styles.profileThumb} />
                  )}
                  <Text style={styles.profileGridLabel}>{song.title}</Text>
                  <Text style={styles.profileGridLabel}>{song.artist}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionDivider} />

            <Text style={styles.bigSectionTitle}>Favorite Artists</Text>
            <View style={styles.profileGrid}>
              {displayArtists.map((artist, idx) => (
                <View key={`artist-${idx}`} style={styles.profileGridItem}>
                  {artist.imageUrl ? (
                    <Image source={{ uri: artist.imageUrl }} style={[styles.profileThumb, { borderRadius: 999 }]} />
                  ) : (
                    <View style={styles.profileThumb} />
                  )}
                  <Text style={styles.profileGridLabel}>{artist.name}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {showPlaylistPopup && (
        <PopupSheet title="Playlist" onClose={onTogglePlaylist}>
          <Text style={styles.sectionSubtitle}>Song of the Day Playlist</Text>
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
    </ScrollView>
  );
}
