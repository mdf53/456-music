// @ts-nocheck
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

  const displaySongs = favoriteSongs.length > 0
    ? favoriteSongs.map((title, i) => ({ id: `fav-song-${i}`, title, artist: "" }))
    : demoSongs.slice(0, 3);

  const displayArtists = favoriteArtists.length > 0
    ? favoriteArtists
    : ["Artist 1", "Artist 2", "Artist 3"];

  const profileSongCards = displaySongs.slice(0, 3);
  const profileArtistCards = displayArtists.slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeroCard}>
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
      </View>

      <View style={styles.profileTabWrap}>
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
            <Text style={styles.bigSectionTitle}>Recent Shares</Text>
            <Text style={styles.sectionSubtitle}>A timeline of what you posted to your feed.</Text>

            <View style={styles.profileGridSpacious}>
              {historyGrid.slice(0, 6).map((entry) => (
                <View key={entry.id} style={styles.profileGridItemCard}>
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
            <Text style={styles.sectionSubtitle}>Tracks that represent your signature sound.</Text>
            <View style={styles.profileGridSpacious}>
              {profileSongCards.map((song) => (
                <View key={song.id} style={styles.profileGridItemCard}>
                  <View style={styles.profileThumb} />
                  <Text style={styles.profileGridLabel}>{song.title}</Text>
                  <Text style={styles.profileGridLabelMuted}>{song.artist || "Artist"}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionDivider} />

            <Text style={styles.bigSectionTitle}>Favorite Artists</Text>
            <Text style={styles.sectionSubtitle}>Artists you come back to the most.</Text>
            <View style={styles.profileGridSpacious}>
              {profileArtistCards.map((artist, idx) => (
                <View key={`artist-${idx}`} style={styles.profileGridItemCard}>
                  <View style={[styles.profileThumb, { borderRadius: 999 }]} />
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
