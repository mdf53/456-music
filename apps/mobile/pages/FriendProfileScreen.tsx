import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../components/styles";
import type { Friend } from "../types";

type FriendProfileScreenProps = {
  friend: Friend;
  shareHistory: Array<{ id: string; song: string; artist: string; date: string }>;
  demoSongs: Array<{ id: string; title: string; artist: string }>;
  onBack: () => void;
};

export function FriendProfileScreen({
  friend,
  shareHistory,
  demoSongs,
  onBack
}: FriendProfileScreenProps) {
  const historySource =
    shareHistory.length > 0
      ? shareHistory
      : [{ id: "history", song: "", artist: "", date: "mm/dd/yr" }];
  const historyGrid = Array.from({ length: 6 }, (_, index) => {
    const source = historySource[index % historySource.length];
    return {
      id: `${source?.id ?? "history"}-${index}`,
      date: source?.date ?? "mm/dd/yr"
    };
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Pressable onPress={onBack} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>

      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge} />
        <Text style={styles.profileName}>{friend.name}</Text>
        <Text style={styles.profileHandle}>{friend.handle}</Text>
        <View style={styles.followStatsRow}>
          <View style={styles.slimChip}>
            <Text style={styles.slimChipText}>491 friends</Text>
          </View>
          <View style={styles.slimChip}>
            <Text style={styles.slimChipText}>502 followers</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabRow}>
        <View style={styles.tabChip}>
          <Text style={styles.tabChipText}>Favorites</Text>
        </View>
        <View style={[styles.tabChip, styles.tabChipActive]}>
          <Text style={[styles.tabChipText, styles.tabChipTextActive]}>History</Text>
        </View>
      </View>

      <View style={styles.profileSection}>
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
          {demoSongs.slice(0, 3).map((song) => (
            <View key={song.id} style={styles.profileGridItem}>
              <View style={styles.profileThumb} />
              <Text style={styles.profileGridLabel}>{song.title}</Text>
              <Text style={styles.profileGridLabel}>{song.artist}</Text>
            </View>
          ))}
        </View>

        <View style={styles.profileGrid}>
          {historyGrid.slice(3, 6).map((entry) => (
            <View key={`history-${entry.id}`} style={styles.profileGridItem}>
              <View style={styles.profileThumb} />
              <Text style={styles.profileGridLabel}>Posted {entry.date}</Text>
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
      </View>
    </ScrollView>
  );
}
