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
  favoriteArtists: string[];
  favoriteSongs: string[];
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
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge} />
        <Text style={styles.profileName}>{profileName ?? "My Name"}</Text>
        <Text style={styles.profileHandle}>
          {profileHandle ? `@${profileHandle}` : "@username"}
        </Text>
        <Text style={styles.sectionSubtitle}>Friends: 45</Text>
      </View>

      <View style={styles.tabRow}>
        {["history", "favorites"].map((tab) => (
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

      {profileTab === "history" && (
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
          <Pressable style={styles.secondaryButton} onPress={onTogglePlaylist}>
            <Text style={styles.secondaryButtonText}>
              Song of the Day Playlist
            </Text>
          </Pressable>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Export to Spotify</Text>
          </Pressable>
        </View>
      )}

      {profileTab === "favorites" && (
        <>
          <Text style={styles.sectionTitle}>Favorite Songs</Text>
          <View style={styles.card}>
            {(favoriteSongs.length
              ? favoriteSongs.map((title, index) => ({
                  id: `favorite-${index}`,
                  title,
                  artist: ""
                }))
              : demoSongs
            ).map((song) => (
              <View key={song.id} style={styles.songRow}>
                <View style={styles.albumThumb} />
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{song.title}</Text>
                  <Text style={styles.songArtist}>{song.artist}</Text>
                </View>
                <View style={styles.songPick} />
              </View>
            ))}
            <Text style={styles.sectionSubtitle}>Suggested by Spotify</Text>
          </View>

          <Text style={styles.sectionTitle}>Favorite Artists</Text>
          <View style={styles.card}>
            {(favoriteArtists.length ? favoriteArtists : ["Artist Name", "Artist Name", "Artist Name"]).map(
              (artist, index) => (
              <View key={`${artist}-${index}`} style={styles.songRow}>
                <View style={styles.avatar} />
                <Text style={styles.songTitle}>{artist}</Text>
                <View style={styles.songPick} />
              </View>
            ))}
            <Text style={styles.sectionSubtitle}>Suggested by Spotify</Text>
          </View>
        </>
      )}

      {showPlaylistPopup && (
        <PopupSheet title="Playlist Pop-up" onClose={onTogglePlaylist}>
          <Text style={styles.sectionSubtitle}>Song of the Day Playlist</Text>
          {demoSongs.map((song) => (
            <Text key={song.id} style={styles.songArtist}>
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
