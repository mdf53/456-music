import {
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { colors, styles } from "../components/styles";

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
  refreshing?: boolean;
  onRefresh?: () => void;
};

const BOTTOM_BAR_EXTRA_SCROLL = 168;
const HOME_INDICATOR_PAD = Platform.OS === "ios" ? 26 : 12;

export function AddSongScreen({
  selectedSong,
  songs,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  loading,
  onSelectSong,
  onShare,
  onBack,
  refreshing = false,
  onRefresh
}: AddSongScreenProps) {
  const scrollBottomPad = selectedSong
    ? BOTTOM_BAR_EXTRA_SCROLL + HOME_INDICATOR_PAD
    : undefined;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          scrollBottomPad != null && { paddingBottom: scrollBottomPad }
        ]}
        keyboardShouldPersistTaps="handled"
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
        <Text style={styles.sectionTitle}>Share your Song of the Day</Text>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search songs..."
            placeholderTextColor="#8F93A0"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            onSubmitEditing={onSearchSubmit}
            returnKeyType="search"
          />
          <Pressable onPress={onSearchSubmit}>
            <Text style={styles.searchGo}>Go</Text>
          </Pressable>
        </View>
        {loading && <Text style={styles.sectionSubtitle}>Searching...</Text>}
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
                  style={styles.albumThumb}
                />
              ) : (
                <View style={styles.albumThumb} />
              )}
              <View style={styles.songInfo}>
                <Text style={styles.friendName}>{song.title}</Text>
                <Text style={styles.friendHandle}>{song.artist}</Text>
              </View>
              {selectedSong?.id === song.id ? (
                <View style={[styles.songPick, styles.songPickActive]}>
                  <Text style={styles.songPickCheck}>✓</Text>
                </View>
              ) : (
                <View style={styles.songPick} />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {selectedSong ? (
        <View
          style={[
            styles.addSongBottomBar,
            { paddingBottom: HOME_INDICATOR_PAD, paddingHorizontal: 0 }
          ]}
        >
          <View style={[styles.addSongBottomBarInner, { paddingHorizontal: 4 }]}>
            {selectedSong.albumCover ? (
              <Image
                source={{ uri: selectedSong.albumCover }}
                style={styles.albumThumb}
              />
            ) : (
              <View style={styles.albumThumb} />
            )}
            <View style={styles.addSongBottomTextBlock}>
              <Text style={styles.feedSong} numberOfLines={2}>
                {selectedSong.title}
              </Text>
              <Text style={styles.feedArtist} numberOfLines={1}>
                {selectedSong.artist}
              </Text>
            </View>
          </View>
          <Pressable style={styles.primaryButton} onPress={onShare}>
            <Text style={styles.primaryButtonText}>Add caption & share</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
