import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../components/styles";

type SongOption = { id: string; title: string; artist: string };

type AddSongScreenProps = {
  selectedSong: SongOption | undefined;
  songs: SongOption[];
  onSelectSong: (songId: string) => void;
  onShare: () => void;
  onBack: () => void;
};

export function AddSongScreen({
  selectedSong,
  songs,
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
        {songs.map((song) => (
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
