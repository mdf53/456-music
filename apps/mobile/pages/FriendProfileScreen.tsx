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
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Pressable onPress={onBack} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Back to Friends</Text>
      </Pressable>
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge} />
        <Text style={styles.profileName}>{friend.name}</Text>
        <Text style={styles.profileHandle}>{friend.handle}</Text>
        <Text style={styles.sectionSubtitle}>Friends: 500+</Text>
      </View>

      <View style={styles.tabRow}>
        {["history", "favorites"].map((tab) => (
          <View key={tab} style={styles.tabChip}>
            <Text style={styles.tabChipText}>
              {tab === "history" ? "History" : "Favorites"}
            </Text>
          </View>
        ))}
      </View>

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
      </View>

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
      </View>

      <Text style={styles.sectionTitle}>Favorite Artists</Text>
      <View style={styles.card}>
        {["Artist Name", "Artist Name", "Artist Name"].map((artist, index) => (
          <View key={`${artist}-${index}`} style={styles.songRow}>
            <View style={styles.avatar} />
            <Text style={styles.songTitle}>{artist}</Text>
            <View style={styles.songPick} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
