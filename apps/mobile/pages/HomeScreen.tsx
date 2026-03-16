// @ts-nocheck
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
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
      <View style={styles.blurStateWrap}>
        <Text style={styles.pageTitle}>
          Share your <Text style={styles.pageTitleAccent}>Song of the Day!</Text>
        </Text>
        <View style={styles.pageDivider} />
        <View style={styles.searchRow}>
          <TextInput
            editable={false}
            placeholder="Search..."
            placeholderTextColor="#8F93A0"
            style={styles.searchInput}
          />
          <Text style={styles.searchGo}>Go</Text>
        </View>
        <Text style={styles.homeSectionTitle}>Recent Songs</Text>
        {[0, 1, 2].map((item) => (
          <View key={item} style={[styles.feedCard, styles.overlayBlurCard]}>
            <View style={styles.homeCardContentRow}>
              <View style={styles.albumCover}>
                <Text style={styles.feedCaptionSmall}>Album Cover</Text>
              </View>
              <View style={styles.musicMeta}>
                <Text style={styles.songTitle}>Song Title</Text>
                <Text style={styles.songArtist}>Artist</Text>
              </View>
            </View>
          </View>
        ))}
        <View style={styles.blurOverlay} />
        <View style={styles.fixedCtaWrap}>
          <Pressable onPress={onAddSong} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Post your Song of the Day!</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {feedItems.map((item) => (
        <View key={item.id} style={styles.feedCard}>
          <View style={styles.listHeaderRow}>
            <View style={styles.titleWrap}>
              <View style={styles.tinyAvatar} />
              <Text style={styles.feedUser}>@{item.user}</Text>
            </View>
            <Text style={styles.feedTimestamp}>Today</Text>
          </View>

          <View style={styles.homeCardContentRow}>
            {item.albumCover ? (
              <Image source={{ uri: item.albumCover }} style={styles.albumCover} />
            ) : (
              <View style={styles.albumCover}>
                <Text style={styles.feedCaptionSmall}>Album{"\n"}Cover</Text>
              </View>
            )}
            <View style={styles.musicMeta}>
              <Text style={styles.songTitle}>{item.song}</Text>
              <Text style={styles.songArtist}>{item.artist}</Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
              <View style={styles.playDot}>
                <View style={styles.playTriangle} />
              </View>
            </View>
          </View>

          <View style={styles.feedActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => onToggleLike(item.id)}
            >
              <Text style={styles.iconText}>{item.liked ? "Liked" : "Like"}</Text>
              <Text style={styles.miniCount}>{item.likes}</Text>
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => onOpenComments(item.id)}
            >
              <Text style={styles.iconText}>Comments</Text>
              <Text style={styles.miniCount}>{item.comments.length}</Text>
            </Pressable>
          </View>
          <Text style={styles.feedCaptionSmall}>{item.caption}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
