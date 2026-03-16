import { Pressable, ScrollView, Text, View } from "react-native";
import { PopupSheet } from "../components/PopupSheet";
import { styles } from "../components/styles";

type ProfileScreenProps = {
  showPlaylistPopup: boolean;
  shareHistory: Array<{ id: string; song: string; artist: string; date: string }>;
  onTogglePlaylist: () => void;
  onToggleProfileTab: (tab: "history" | "favorites") => void;
  profileTab: "history" | "favorites";
  demoSongs: Array<{ id: string; title: string; artist: string }>;
};

export function ProfileScreen({
  showPlaylistPopup,
  shareHistory,
  onTogglePlaylist,
  onToggleProfileTab,
  profileTab,
  demoSongs
}: ProfileScreenProps) {
  const historySource =
    shareHistory.length > 0
      ? shareHistory
      : [{ id: "history", song: "", artist: "", date: "mm/dd/yr" }];
  const historyGrid = Array.from({ length: 9 }, (_, index) => {
    const source = historySource[index % historySource.length];
    return {
      id: `${source?.id ?? "history"}-${index}`,
      date: source?.date ?? "mm/dd/yr"
    };
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge} />
        <Text style={styles.profileName}>My Profile</Text>
        <Text style={styles.profileHandle}>@you</Text>
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
            <View style={styles.profileGrid}>
              {historyGrid.slice(0, 3).map((entry) => (
                <View key={entry.id} style={styles.profileGridItem}>
                  <View style={styles.profileThumb} />
                  <Text style={styles.profileGridLabel}>Posted {entry.date}</Text>
                </View>
              ))}
            </View>
            <View style={styles.profileGrid}>
              {historyGrid.slice(3, 6).map((entry) => (
                <View key={entry.id} style={styles.profileGridItem}>
                  <View style={styles.profileThumb} />
                  <Text style={styles.profileGridLabel}>Posted {entry.date}</Text>
                </View>
              ))}
            </View>
            <View style={styles.profileGrid}>
              {historyGrid.slice(6, 9).map((entry) => (
                <View key={entry.id} style={styles.profileGridItem}>
                  <View style={styles.profileThumb} />
                  <Text style={styles.profileGridLabel}>Posted {entry.date}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {profileTab === "favorites" && (
          <>
            <Text style={styles.bigSectionTitle}>Favorite Songs</Text>
            <View style={styles.profileGrid}>
              {demoSongs.slice(0, 3).map((song) => (
                <View key={song.id} style={styles.profileGridItem}>
                  <View style={styles.profileThumb} />
                  <Text style={styles.profileGridLabel}>{song.title}</Text>
                  <Text style={styles.profileGridLabel}>{song.artist}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionDivider} />

            <Text style={styles.bigSectionTitle}>Favorite Artists</Text>
            <View style={styles.profileGrid}>
              {["HUNTR/X", "The Beatles", "Sabrina Carpenter"].map((artist) => (
                <View key={artist} style={styles.profileGridItem}>
                  <View style={styles.profileThumb} />
                  <Text style={styles.profileGridLabel}>{artist}</Text>
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
