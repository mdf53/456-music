// @ts-nocheck
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AppRefreshControl } from "../components/AppRefreshControl";
import { DotsIcon, PencilIcon } from "../components/ActionIcons";
import { FriendAvatar } from "../components/FriendAvatar";
import { HeartIcon } from "../components/HeartIcon";
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
  profileHandle?: string | null;
  editingPostId?: string | null;
  editPostDraft?: string;
  onStartPostEdit?: (feedId: string) => void;
  onEditPostDraftChange?: (text: string) => void;
  onSavePostEdit?: () => void;
  onCancelPostEdit?: () => void;
  onDeletePost?: (feedId: string) => void;
  /** Lowercase @handle → avatar data URL or https URL */
  authorPhotoByHandle?: Record<string, string>;
};

function CommentIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.2 18.8 3.6 21l1.14-4.06A7.95 7.95 0 0 1 3 12c0-4.42 3.8-8 8.5-8s8.5 3.58 8.5 8-3.8 8-8.5 8c-1.5 0-2.9-.36-4.3-1.2Z"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HomeScreen({
  hasSharedToday,
  feedItems,
  refreshing,
  onRefresh,
  onAddSong,
  onOpenComments,
  onToggleLike,
  profileHandle,
  editingPostId,
  editPostDraft = "",
  onStartPostEdit,
  onEditPostDraftChange,
  onSavePostEdit,
  onCancelPostEdit,
  onDeletePost,
  authorPhotoByHandle = {}
}: HomeScreenProps) {
  const { activeId, isPlaying, progress, togglePlay } = useAudioPlayer();
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);
  const [noPreviewId, setNoPreviewId] = useState<string | null>(null);
  const previewCache = useRef<Record<string, string>>({});
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const lockedItems =
    feedItems.length > 0
      ? feedItems
      : [
          { id: "locked-1", user: "mila" },
          { id: "locked-2", user: "ava" },
          { id: "locked-3", user: "noah" },
          { id: "locked-4", user: "jun" }
        ];

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
      <View style={styles.lockedFeedWrap}>
        <ScrollView
          contentContainerStyle={styles.lockedFeedContent}
          refreshControl={
            <AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.pageTitle}>
            Share your <Text style={styles.pageTitleAccent}>Keep In Tune</Text> post first
          </Text>
          <Text style={styles.lockedFeedSubtitle}>
            You can see who posted. Share once to unlock today's songs.
          </Text>
          <View style={styles.pageDivider} />

          <View style={styles.searchRow}>
            <TextInput
              editable={false}
              placeholder="Search friends"
              placeholderTextColor="#8F93A0"
              style={styles.searchInput}
            />
            <Text style={styles.searchGo}>Go</Text>
          </View>

          <Text style={styles.homeSectionTitle}>Today's posts</Text>
          {lockedItems.map((item) => {
            const initial = (item.user?.[0] ?? "?").toUpperCase();
            return (
              <View key={item.id} style={styles.feedCard}>
                <View style={styles.listHeaderRow}>
                  <View style={styles.titleWrap}>
                    <View style={styles.tinyAvatar}>
                      <Text style={styles.tinyAvatarText}>{initial}</Text>
                    </View>
                    <Text style={styles.feedUser}>@{item.user}</Text>
                  </View>
                </View>

                <View style={styles.lockedGlassCard}>
                  <View style={styles.lockedReasonBadge}>
                    <Text style={styles.lockedReasonBadgeText}>
                      Hidden until you post on Keep In Tune
                    </Text>
                  </View>
                  <View style={styles.lockedGlassGlowTop} />
                  <View style={styles.lockedGlassGlowMid} />
                  <View style={styles.lockedGlassGlowBottom} />

                  <View style={styles.lockedBodyRow}>
                    <View style={styles.lockedAlbumBlock} />
                    <View style={styles.lockedMetaColumn}>
                      <View style={styles.lockedLineLong} />
                      <View style={styles.lockedLineShort} />
                      <View style={styles.lockedLineTiny} />
                    </View>
                  </View>

                  <View style={styles.lockedActionsRow}>
                    <View style={styles.lockedPill} />
                    <View style={styles.lockedPill} />
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.lockedCtaWrap}>
          <Pressable onPress={onAddSong} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Post on Keep In Tune!</Text>
          </Pressable>
          <Text style={styles.lockedCtaHint}>Unlock your feed right after posting.</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {feedItems.map((item) => {
        const isThisPlaying = activeId === item.id && isPlaying;
        const isThisActive = activeId === item.id;
        const isLoading = loadingPreviewId === item.id;
        const highlightedComment =
          item.comments.length === 0
            ? null
            : item.comments.reduce((best, c) => (c.likes > best.likes ? c : best));
        const userInitial = (item.user?.[0] ?? "?").toUpperCase();
        const authorPhoto =
          authorPhotoByHandle[item.user?.trim().toLowerCase() ?? ""];
        const canManagePost =
          !!profileHandle &&
          item.user?.trim().toLowerCase() === profileHandle.trim().toLowerCase();
        const isEditingPost = editingPostId === item.id;

        return (
          <View key={item.id} style={styles.feedCard}>
            <View style={styles.listHeaderRow}>
              <View style={styles.titleWrap}>
                {authorPhoto ? (
                  <FriendAvatar uri={authorPhoto} size={20} borderless />
                ) : (
                  <View style={styles.tinyAvatar}>
                    <Text style={styles.tinyAvatarText}>{userInitial}</Text>
                  </View>
                )}
                <Text style={styles.feedUser}>@{item.user}</Text>
              </View>
              {canManagePost ? (
                <Pressable
                  onPress={() =>
                    setOpenPostMenuId((prev) => (prev === item.id ? null : item.id))
                  }
                  style={styles.postMenuTrigger}
                  accessibilityRole="button"
                  accessibilityLabel="Post actions"
                >
                  <DotsIcon size={18} />
                </Pressable>
              ) : null}
            </View>

            {canManagePost && openPostMenuId === item.id ? (
              <View style={styles.postActionMenuRow}>
                <Pressable
                  onPress={() => {
                    setOpenPostMenuId(null);
                    onStartPostEdit?.(item.id);
                  }}
                  style={styles.postActionChip}
                >
                  <PencilIcon size={14} />
                  <Text style={styles.postActionChipText}>Edit post</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setOpenPostMenuId(null);
                    onDeletePost?.(item.id);
                  }}
                  style={[styles.postActionChip, styles.postActionDeleteChip]}
                >
                  <Text style={styles.postActionDeleteText}>Delete</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.feedHeroRow}>
              {item.albumCover ? (
                <Image source={{ uri: item.albumCover }} style={styles.feedAlbumCover} />
              ) : (
                <View style={styles.feedAlbumCover}>
                  <Text style={styles.feedCaptionSmall}>Album{"\n"}Cover</Text>
                </View>
              )}
              <View style={styles.feedHeroMeta}>
                <Text style={styles.feedSongLarge}>{item.song}</Text>
                <Text style={styles.feedArtistLarge}>{item.artist}</Text>
                <View style={styles.progressTrackLockedInCard}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: isThisActive ? `${Math.round(progress * 100)}%` : "0%" }
                    ]}
                  />
                </View>
                <Pressable
                  style={[styles.playButtonFilled, isThisPlaying && styles.playButtonFilledActive]}
                  onPress={() => void resolveAndPlay(item)}
                  disabled={isLoading}
                  accessibilityLabel={isThisPlaying ? "Pause preview" : "Play preview"}
                >
                  {isLoading ? (
                    <ActivityIndicator size={14} color="#1C1E25" />
                  ) : isThisPlaying ? (
                    <View style={styles.pauseIcon}>
                      <View style={styles.pauseBarDark} />
                      <View style={styles.pauseBarDark} />
                    </View>
                  ) : (
                    <View style={styles.playTriangleDark} />
                  )}
                </Pressable>
                {noPreviewId === item.id && (
                  <Text style={{ color: "#ff6b6b", fontSize: 11, marginTop: 4 }}>
                    No preview available
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.feedStatsRow}>
              <Pressable
                style={styles.feedStatAction}
                onPress={() => onToggleLike(item.id)}
              >
                <HeartIcon filled={item.liked} />
                <Text style={styles.feedStatCount}>{item.likes}</Text>
              </Pressable>
              <Pressable
                style={styles.feedStatAction}
                onPress={() => onOpenComments(item.id)}
              >
                <CommentIcon />
                <Text style={styles.feedStatCount}>{item.comments.length}</Text>
              </Pressable>
            </View>

            {isEditingPost ? (
              <View style={styles.postEditWrap}>
                <TextInput
                  value={editPostDraft}
                  onChangeText={(v) => onEditPostDraftChange?.(v)}
                  placeholder="Edit your caption"
                  placeholderTextColor="#8F93A0"
                  style={[styles.input, styles.postEditInput]}
                  multiline
                />
                <View style={styles.postEditActionsRow}>
                  <Pressable style={styles.secondaryButton} onPress={onCancelPostEdit}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.primaryButtonSmall} onPress={onSavePostEdit}>
                    <Text style={styles.primaryButtonText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Text style={styles.feedCaptionInline} numberOfLines={2}>
                <Text style={styles.feedCaptionUser}>@{item.user} </Text>
                {item.caption?.trim() || "Shared a song today."}
              </Text>
            )}

            <View style={styles.feedCardDivider} />
            <Text style={styles.feedCommentTitle}>Comments</Text>
            {highlightedComment ? (
              <Pressable onPress={() => onOpenComments(item.id)}>
                <Text style={styles.feedCommentPreview} numberOfLines={2}>
                  <Text style={styles.feedCommentPreviewUser}>@{highlightedComment.user} </Text>
                  {highlightedComment.text}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.feedCommentEmpty}>No comments yet.</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
