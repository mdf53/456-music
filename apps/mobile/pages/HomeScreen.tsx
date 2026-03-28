// @ts-nocheck
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { colors, styles } from "../components/styles";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { fetchEmbedPreviewUrl, searchTracks } from "../services/spotifyClient";
import type { FeedItem } from "../types";

type HomeScreenProps = {
  hasSharedToday: boolean;
  feedItems: FeedItem[];
  refreshing: boolean;
  onRefresh: () => void;
  onAddSong: () => void;
  onOpenComments: (feedId: string) => void;
  onToggleLike: (feedId: string) => void;
};

export function HomeScreen({
  hasSharedToday,
  feedItems,
  refreshing,
  onRefresh,
  onAddSong,
  onOpenComments,
  onToggleLike
}: HomeScreenProps) {
  const { activeId, isPlaying, progress, togglePlay } = useAudioPlayer();
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);
  const [noPreviewId, setNoPreviewId] = useState<string | null>(null);
  const previewCache = useRef<Record<string, string>>({});
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const resolveAndPlay = useCallback(
    async (item: FeedItem) => {
      if (activeIdRef.current === item.id) {
        void togglePlay(item.id, previewCache.current[item.id] ?? item.previewUrl);
        return;
      }

      const cached = previewCache.current[item.id];
      if (cached) {
        void togglePlay(item.id, cached);
        return;
      }
      if (item.previewUrl) {
        previewCache.current[item.id] = item.previewUrl;
        void togglePlay(item.id, item.previewUrl);
        return;
      }

      setLoadingPreviewId(item.id);
      setNoPreviewId(null);
      try {
        let url: string | null = null;

        const trackId = item.spotifyTrackId;
        if (trackId) {
          url = await fetchEmbedPreviewUrl(trackId);
        }

        if (!url) {
          const results = await searchTracks(`${item.song} ${item.artist}`, 1);
          const match = results[0];
          if (match?.id) {
            url = match.previewUrl ?? (await fetchEmbedPreviewUrl(match.id));
          }
        }

        if (url) {
          previewCache.current[item.id] = url;
          void togglePlay(item.id, url);
        } else {
          setNoPreviewId(item.id);
          setTimeout(
            () => setNoPreviewId((cur) => (cur === item.id ? null : cur)),
            2500
          );
        }
      } catch {
        setNoPreviewId(item.id);
        setTimeout(
          () => setNoPreviewId((cur) => (cur === item.id ? null : cur)),
          2500
        );
      } finally {
        setLoadingPreviewId(null);
      }
    },
    [togglePlay]
  );

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
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.feedCard, styles.overlayBlurCard]}>
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
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      {feedItems.map((item) => {
        const isThisPlaying = activeId === item.id && isPlaying;
        const isThisActive = activeId === item.id;
        const isLoading = loadingPreviewId === item.id;

        return (
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
                  <View
                    style={[
                      styles.progressFill,
                      { width: isThisActive ? `${Math.round(progress * 100)}%` : "0%" }
                    ]}
                  />
                </View>
                <Pressable
                  style={[styles.playDot, isThisPlaying && styles.playDotActive]}
                  onPress={() => void resolveAndPlay(item)}
                  disabled={isLoading}
                  accessibilityLabel={isThisPlaying ? "Pause preview" : "Play preview"}
                >
                  {isLoading ? (
                    <ActivityIndicator size={10} color={colors.primary} />
                  ) : isThisPlaying ? (
                    <View style={styles.pauseIcon}>
                      <View style={styles.pauseBar} />
                      <View style={styles.pauseBar} />
                    </View>
                  ) : (
                    <View style={styles.playTriangle} />
                  )}
                </Pressable>
                {noPreviewId === item.id && (
                  <Text style={{ color: "#ff6b6b", fontSize: 11, marginTop: 4 }}>
                    No preview available
                  </Text>
                )}
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
        );
      })}
    </ScrollView>
  );
}
