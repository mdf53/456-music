import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { styles } from "../components/styles";

type SongOption = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  albumCover?: string;
  previewUrl?: string;
};

type AddSongScreenProps = {
  selectedSong: SongOption | undefined;
  songs: SongOption[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  loading?: boolean;
  onSelectSong: (songId: string) => void;
  onShare: () => void;
  onBack: () => void;
};

export function AddSongScreen({
  selectedSong,
  songs,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  loading,
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
        <TextInput
          placeholder="Search Spotify songs"
          placeholderTextColor="#96A1A8"
          style={styles.input}
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
        />
        <Pressable style={styles.secondaryButton} onPress={onSearchSubmit}>
          <Text style={styles.secondaryButtonText}>
            {loading ? "Searching..." : "Search"}
          </Text>
        </Pressable>
      </View>
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
            {song.albumCover ? (
              <Image
                source={{ uri: song.albumCover }}
                style={styles.albumThumbImage}
              />
            ) : (
              <View style={styles.albumThumb} />
            )}
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
          {selectedSong.previewUrl ? (
            <Text style={styles.sectionSubtitle}>Preview available</Text>
          ) : null}
          <Pressable style={styles.primaryButton} onPress={onShare}>
            <Text style={styles.primaryButtonText}>Share Song</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
