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
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Selected Song</Text>

      <View style={styles.selectionDot} />

      <View style={styles.card}>
        {(selectedSong ? [selectedSong] : songs.slice(0, 1)).map((song) => (
          <View key={song.id} style={styles.homeCardContentRow}>
            <View style={styles.albumCover}>
              <Text style={styles.feedCaptionSmall}>Album{"\n"}Cover</Text>
            </View>
            <View style={styles.musicMeta}>
              <Text style={styles.songTitle}>{song.title}</Text>
              <Text style={styles.songArtist}>{song.artist}</Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
              <View style={styles.playDot}>
                <View style={styles.playTriangle} />
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.captionRow}>
        <Text style={styles.captionIcon}>Add</Text>
        <Text style={styles.captionText}>Write a caption for your share</Text>
      </View>

      <View style={styles.centerButtonWrap}>
        <Pressable style={styles.primaryButton} onPress={onShare}>
          <Text style={styles.primaryButtonText}>Share Song</Text>
        </Pressable>
      </View>

      <Text style={styles.addSongTitle}>Pick a different song</Text>
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
            <View style={styles.albumThumb}>
              <Text style={styles.feedCaptionSmall}>Cover</Text>
            </View>
            <View style={styles.songInfo}>
              <Text style={styles.friendName}>{song.title}</Text>
              <Text style={styles.friendHandle}>{song.artist}</Text>
            </View>
            <View style={styles.songPick} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
