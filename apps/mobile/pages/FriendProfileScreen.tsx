import { useState } from "react";
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
  const [profileTab, setProfileTab] = useState<"favorites" | "history">(
    "favorites"
  );
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
  const favoriteSongs = demoSongs.slice(0, 3);
  const favoriteArtists = ["HUNTR/X", "The Beatles", "Sabrina Carpenter"];

  return (
    <ScrollView contentContainerStyle={[styles.scrollContent, styles.profileScreenContent]}>
      <Pressable onPress={onBack} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>

      <View style={styles.profileTopPanel}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge} />
          <Text style={styles.profileName}>{friend.name}</Text>
          <Text style={styles.profileHandle}>@{friend.handle}</Text>
          <View style={styles.followStatsRow}>
            <View style={styles.slimChip}>
              <Text style={styles.slimChipText}>491 friends</Text>
            </View>
            <View style={styles.slimChip}>
              <Text style={styles.slimChipText}>502 followers</Text>
            </View>
          </View>
        </View>

      </View>

      <View style={styles.profileSection}>
        <View style={[styles.tabRow, { marginTop: 0, marginBottom: 12 }]}>
          {(["favorites", "history"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setProfileTab(tab)}
              style={[styles.tabChip, profileTab === tab && styles.tabChipActive]}
            >
              <Text style={[styles.tabChipText, profileTab === tab && styles.tabChipTextActive]}>
                {tab === "favorites" ? "Favorites" : "History"}
              </Text>
            </Pressable>
          ))}
        </View>

        {profileTab === "favorites" ? (
          <>
            <Text style={styles.bigSectionTitle}>Favorite Songs</Text>
            <View style={styles.profileGrid}>
              {favoriteSongs.map((song) => (
                <View key={song.id} style={styles.profileGridItem}>
                  <View style={styles.profileThumb} />
                  <Text style={styles.profileGridLabel} numberOfLines={2}>
                    {song.title || "Album Cover"}
                  </Text>
                  <Text style={[styles.profileGridLabel, styles.profileGridSubLabel]} numberOfLines={1}>
                    {song.artist || "Artist"}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionDivider} />

            <Text style={styles.bigSectionTitle}>Favorite Artists</Text>
            <View style={styles.profileGrid}>
              {favoriteArtists.map((artist) => (
                <View key={artist} style={styles.profileGridItem}>
                  <View style={[styles.profileThumb, { borderRadius: 999 }]} />
                  <Text style={styles.profileGridLabel} numberOfLines={2}>{artist}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.bigSectionTitle}>History</Text>
            {[0, 3, 6].map((start) => {
              const row = historyGrid.slice(start, start + 3);
              return (
                <View key={`history-row-${start}`} style={styles.profileGrid}>
                  {row.map((entry) => (
                    <View key={entry.id} style={styles.profileGridItem}>
                      <View style={styles.profileThumb} />
                      <Text style={styles.profileGridLabel}>Posted {entry.date}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
}
