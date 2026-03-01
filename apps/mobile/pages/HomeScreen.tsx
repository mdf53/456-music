import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../components/styles";
import type { FeedItem } from "../types";

type HomeScreenProps = {
  hasSharedToday: boolean;
  feedItems: FeedItem[];
  onAddSong: () => void;
  onOpenComments: (feedId: string) => void;
  onToggleLike: (feedId: string) => void;
};

export function HomeScreen({
  hasSharedToday,
  feedItems,
  onAddSong,
  onOpenComments,
  onToggleLike
}: HomeScreenProps) {
  if (!hasSharedToday) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.subtitle}>Home is blurred until you share.</Text>
        <View style={styles.blurredCard} />
        <View style={styles.blurredCard} />
        <Pressable onPress={onAddSong} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Share your Song of the Day</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {feedItems.map((item) => (
        <View key={item.id} style={styles.feedCard}>
          <View style={styles.feedHeader}>
            <Text style={styles.feedUser}>@{item.user}</Text>
            <Text style={styles.feedTimestamp}>Today</Text>
          </View>
          <View style={styles.albumCover} />
          <Text style={styles.feedSong}>{item.song}</Text>
          <Text style={styles.feedArtist}>{item.artist}</Text>
          <Text style={styles.feedCaption}>{item.caption}</Text>
          <View style={styles.feedActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => onToggleLike(item.id)}
            >
              <Text style={styles.iconText}>
                {item.liked ? "♥" : "♡"} {item.likes}
              </Text>
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => onOpenComments(item.id)}
            >
              <Text style={styles.iconText}>💬</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
