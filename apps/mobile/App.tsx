// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { DotsIcon, PencilIcon } from "./components/ActionIcons";
import { HeartIcon } from "./components/HeartIcon";
import { PopupSheet } from "./components/PopupSheet";
import { colors, styles } from "./components/styles";
import { AddSongScreen } from "./pages/AddSongScreen";
import { FriendsScreen } from "./pages/FriendsScreen";
import { HomeScreen } from "./pages/HomeScreen";
import { OnboardingFlow } from "./pages/OnboardingFlow";
import { ProfileScreen } from "./pages/ProfileScreen";
import { useAppPresenter } from "./presenters/useAppPresenter";
import type { TabKey } from "./types";

/** Same order as the bottom tab bar (`presenter` `tabs`): Friends → Home → Profile. */
const MAIN_TAB_ORDER: TabKey[] = ["friends", "home", "profile"];

function mainTabIndex(key: TabKey) {
  return MAIN_TAB_ORDER.indexOf(key);
}

/** Gap between pager pages (pt / logical px). */
const MAIN_PAGER_PAGE_MARGIN = 14;

const TAB_ICON_MUTED_RGB = [0x6f, 0x74, 0x83] as const;

function hexToRgbTriplet(hex: string) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ] as const;
}

const TAB_ICON_PRIMARY_RGB = hexToRgbTriplet(colors.primary);

function tabSwipeFocus(progress: number, tabIndex: number) {
  return Math.max(0, Math.min(1, 1 - Math.abs(progress - tabIndex)));
}

function tabIconColorForFocus(focus: number) {
  const t = Math.max(0, Math.min(1, focus));
  const r = Math.round(
    TAB_ICON_MUTED_RGB[0] +
      (TAB_ICON_PRIMARY_RGB[0] - TAB_ICON_MUTED_RGB[0]) * t
  );
  const g = Math.round(
    TAB_ICON_MUTED_RGB[1] +
      (TAB_ICON_PRIMARY_RGB[1] - TAB_ICON_MUTED_RGB[1]) * t
  );
  const b = Math.round(
    TAB_ICON_MUTED_RGB[2] +
      (TAB_ICON_PRIMARY_RGB[2] - TAB_ICON_MUTED_RGB[2]) * t
  );
  return `rgb(${r},${g},${b})`;
}

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function TabIcon({ tab, color }: { tab: TabKey; color: string }) {
  if (tab === "home") {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          fill={color}
          d="m10.09 11.963l9.274-3.332v5.54a3.8 3.8 0 0 0-1.91-.501c-1.958 0-3.545 1.426-3.545 3.185s1.587 3.185 3.545 3.185c1.959 0 3.546-1.426 3.546-3.185V7.492c0-1.12 0-2.059-.088-2.807a7 7 0 0 0-.043-.31c-.084-.51-.234-.988-.522-1.386a2.2 2.2 0 0 0-.676-.617l-.009-.005c-.771-.461-1.639-.428-2.532-.224c-.864.198-1.936.6-3.25 1.095l-2.284.859c-.615.231-1.137.427-1.547.63c-.435.216-.81.471-1.092.851c-.281.38-.398.79-.452 1.234c-.05.418-.05.926-.05 1.525v7.794a3.8 3.8 0 0 0-1.91-.501C4.587 15.63 3 17.056 3 18.815S4.587 22 6.545 22c1.959 0 3.546-1.426 3.546-3.185z"
        />
      </Svg>
    );
  }

  if (tab === "friends") {
    return (
      <Svg width={24} height={24} viewBox="0 0 20 20" fill="none">
        <Path
          fill={color}
          d="M6.75 10a3.25 3.25 0 1 0 0-6.5a3.25 3.25 0 0 0 0 6.5m5.687 5.145c.53.217 1.204.355 2.062.355c4 0 4-3 4-3A1.5 1.5 0 0 0 17 11h-4.628c.393.476.629 1.085.629 1.75v.356a3 3 0 0 1-.017.252a5 5 0 0 1-.546 1.787M17 7.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0M1.5 13a2 2 0 0 1 2-2H10a2 2 0 0 1 2 2s0 4-5.25 4s-5.25-4-5.25-4m11.5.106l-.003.064Z"
        />
      </Svg>
    );
  }

  return (
    <Svg width={24} height={24} viewBox="0 0 12 12" fill="none">
      <Path
        fill={color}
        d="M6 1a2 2 0 1 0 0 4a2 2 0 0 0 0-4m2.5 5h-5A1.5 1.5 0 0 0 2 7.5c0 1.116.459 2.01 1.212 2.615C3.953 10.71 4.947 11 6 11s2.047-.29 2.788-.885C9.54 9.51 10 8.616 10 7.5A1.5 1.5 0 0 0 8.5 6"
      />
    </Svg>
  );
}

export default function App() {
  const { state, actions } = useAppPresenter();
  const mainPagerRef = useRef(null);
  const skipPagerSelectRef = useRef(false);

  const [openCommentMenuId, setOpenCommentMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const idx = mainTabIndex(state.activeTab);
    /** Keep pager aligned when `activeTab` changes outside the tab bar (e.g. feed @handle). */
    skipPagerSelectRef.current = true;
    mainPagerRef.current?.setPage(idx);
  }, [state.activeTab]);

  const onMainTabPress = (key: TabKey) => {
    if (state.activeTab === key) return;
    if (Platform.OS !== "web") {
      skipPagerSelectRef.current = true;
    }
    actions.setActiveTab(key);
  };

  const goToFriendsFromProfile = () => {
    if (Platform.OS !== "web") {
      skipPagerSelectRef.current = true;
    }
    actions.setActiveTab("friends");
  };

  const onMainPagerSelected = (e) => {
    const pos = e.nativeEvent.position;
    if (skipPagerSelectRef.current) {
      skipPagerSelectRef.current = false;
    }
    /** Always sync presenter from the pager. Skipping here when `skip` was true left `activeTab`
     * stale after some swipes (e.g. middle tab) if the flag was still set from a prior `setPage`. */
    const key = MAIN_TAB_ORDER[pos];
    actions.setActiveTab(key);
  };

  if (!state.signedIn) {
    return (
      <OnboardingFlow
        step={state.onboardingStep}
        onLogin={actions.login}
        onNextLanding={actions.nextOnboardingLanding}
        onFinishOnboarding={actions.finishOnboarding}
        demoFriends={state.suggested.slice(0, 5)}
        topArtists={state.topArtists}
        suggestedTracks={state.suggestedTracks}
        profileName={state.profileName}
        authError={state.authError}
        authLoading={state.authLoading}
        onboardingHandleDraft={state.onboardingHandleDraft}
        onOnboardingHandleDraftChange={actions.setOnboardingHandleDraft}
        onboardingHandleError={state.onboardingHandleError}
        onboardingHandleSaving={state.onboardingHandleSaving}
        onboardingSearchQuery={state.onboardingSearchQuery}
        onOnboardingSearchQueryChange={actions.setOnboardingSearchQuery}
        onboardingFavoriteTarget={state.onboardingFavoriteTarget}
        spotifySearchOpen={state.onboardingSpotifySearchOpen}
        spotifySearchMode={state.onboardingSpotifySearchMode}
        spotifySearchTrackResults={state.onboardingSpotifyTrackResults}
        spotifySearchArtistResults={state.onboardingSpotifyArtistResults}
        spotifySearchLoading={state.onboardingSpotifySearchLoading}
        spotifySearchError={state.onboardingSpotifySearchError}
        onCloseSpotifySearch={actions.closeOnboardingSpotifySearch}
        onRunOnboardingSpotifySearch={actions.runOnboardingSpotifySearch}
        onSelectSongSlot={actions.selectOnboardingSongSlot}
        onSelectArtistSlot={actions.selectOnboardingArtistSlot}
        onPickSearchTrack={actions.pickOnboardingSearchTrack}
        onPickSearchArtist={actions.pickOnboardingSearchArtist}
        friendSearchQuery={state.friendSearchQuery}
        friendSearchResults={state.friendSearchResults}
        friendSearchLoading={state.friendSearchLoading}
        onFriendSearchQueryChange={actions.setFriendSearchQuery}
        onRunFriendSearch={actions.runFriendSearch}
        onSendFriendRequest={actions.sendFriendRequest}
        friendPhotoByHandle={state.friendPhotoByHandle}
        profilePhotoUri={state.profilePhotoUri}
        profilePhotoSaving={state.profilePhotoSaving}
        onPickProfilePhoto={actions.pickProfilePhoto}
      />
    );
  }

  const homePane = state.showAddSong ? (
    <AddSongScreen
      selectedSong={state.selectedSong}
      songs={state.availableTracks}
      searchQuery={state.searchQuery}
      onSearchQueryChange={actions.setSearchQuery}
      onSearchSubmit={actions.runSearch}
      loading={state.searchLoading}
      onSelectSong={actions.setSelectedSongId}
      onShare={actions.openCaption}
      onBack={actions.closeAddSong}
      refreshing={state.addSongRefreshing}
      onRefresh={actions.refreshAddSong}
    />
  ) : (
    <HomeScreen
      feedReady={Boolean(state.feedLoadComplete)}
      hasSharedToday={state.hasSharedToday}
      feedItems={state.feedItems}
      viewerHandle={state.profileHandle}
      refreshing={state.feedRefreshing}
      onRefresh={actions.refreshFeed}
      onAddSong={actions.openAddSong}
      onOpenComments={actions.openComments}
      onToggleLike={actions.toggleLike}
      profileHandle={state.profileHandle}
      editingPostId={state.editingPostId}
      editPostDraft={state.editPostDraft}
      onStartPostEdit={actions.startPostEdit}
      onEditPostDraftChange={actions.setEditPostDraft}
      onSavePostEdit={actions.savePostEdit}
      onCancelPostEdit={actions.cancelPostEdit}
      onDeletePost={actions.deletePost}
      authorPhotoByHandle={state.friendPhotoByHandle}
      onOpenFriendProfile={actions.openFriendProfileByHandle}
    />
  );

  const friendsPane = (
    <FriendsScreen
      showFriendProfile={state.showFriendProfile}
      selectedFriend={state.selectedFriend}
      friends={state.friends}
      requests={state.requests}
      sentRequests={state.sentRequests}
      suggested={state.suggested}
      friendSearchQuery={state.friendSearchQuery}
      friendSearchResults={state.friendSearchResults}
      friendSearchLoading={state.friendSearchLoading}
      onFriendSearchQueryChange={actions.setFriendSearchQuery}
      onRunFriendSearch={actions.runFriendSearch}
      onSendFriendRequest={actions.sendFriendRequest}
      onAcceptRequest={actions.acceptRequest}
      onDeclineRequest={actions.declineRequest}
      onToggleFriend={actions.toggleFriend}
      onToggleSuggested={actions.toggleSuggested}
      onViewFriend={actions.viewFriend}
      onBack={actions.closeFriendProfile}
      friendPhotoByHandle={state.friendPhotoByHandle}
      friendsRefreshing={state.friendsRefreshing}
      onRefreshFriends={actions.refreshFriendsTab}
      friendProfileTab={state.friendViewTab}
      onFriendProfileTabChange={actions.setFriendProfileTab}
      friendViewLoading={state.friendViewLoading}
      friendFavoriteSongs={state.friendViewSongs}
      friendFavoriteArtists={state.friendViewArtists}
      friendShareHistory={state.friendViewHistory}
      friendViewFriendCount={state.friendViewFriendCount}
    />
  );

  const profilePane = (
    <ProfileScreen
      showPlaylistPopup={state.showPlaylistPopup}
      shareHistory={state.shareHistory}
      onTogglePlaylist={actions.togglePlaylist}
      onToggleProfileTab={actions.setProfileTab}
      profileTab={state.profileTab}
      demoSongs={state.topTracks}
      favoriteArtists={state.favoriteArtists}
      favoriteSongs={state.favoriteSongs}
      profileName={state.profileName ?? undefined}
      profileHandle={state.profileHandle ?? undefined}
      friendCount={state.friends.length}
      onGoToFriends={goToFriendsFromProfile}
      profileSearchOpen={state.profileSearchOpen}
      profileSearchQuery={state.profileSearchQuery}
      profileSearchMode={state.profileSearchMode}
      profileSearchTrackResults={state.profileSearchTrackResults}
      profileSearchArtistResults={state.profileSearchArtistResults}
      profileSearchLoading={state.profileSearchLoading}
      profileSearchError={state.profileSearchError}
      onOpenFavoriteSlot={actions.openProfileFavoriteSlot}
      onProfileSearchQueryChange={actions.setProfileSearchQuery}
      onRunProfileSearch={actions.runProfileSearch}
      onPickProfileSearchTrack={actions.pickProfileSearchTrack}
      onPickProfileSearchArtist={actions.pickProfileSearchArtist}
      onCloseProfileSearch={actions.closeProfileSearch}
      editHandleOpen={state.editHandleOpen}
      editHandleDraft={state.editHandleDraft}
      editHandleSaving={state.editHandleSaving}
      editHandleError={state.editHandleError}
      onOpenEditHandle={actions.openEditHandle}
      onEditHandleDraftChange={actions.setEditHandleDraft}
      onSaveEditHandle={actions.saveEditHandle}
      onCloseEditHandle={actions.closeEditHandle}
      profilePhotoUri={state.profilePhotoUri}
      profilePhotoSaving={state.profilePhotoSaving}
      onPickProfilePhoto={actions.pickProfilePhoto}
      refreshing={state.profileRefreshing}
      onRefresh={actions.refreshProfileTab}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>Keep In Tune</Text>
          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>
              @{state.profileHandle ?? "spotify"}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {Platform.OS === "web" ? (
            <View style={styles.mainPager}>
              {state.activeTab === "home" && (
                <View style={styles.mainPagerPage}>{homePane}</View>
              )}
              {state.activeTab === "friends" && (
                <View style={styles.mainPagerPage}>{friendsPane}</View>
              )}
              {state.activeTab === "profile" && (
                <View style={styles.mainPagerPage}>{profilePane}</View>
              )}
            </View>
          ) : (
            <PagerView
              ref={mainPagerRef}
              style={styles.mainPager}
              initialPage={mainTabIndex(state.activeTab)}
              pageMargin={MAIN_PAGER_PAGE_MARGIN}
              onPageSelected={onMainPagerSelected}
              scrollEnabled={
                !state.showAddSong && !state.showFriendProfile
              }
              offscreenPageLimit={1}
            >
              <View key="friends" style={styles.mainPagerPage} collapsable={false}>
                {friendsPane}
              </View>
              <View key="home" style={styles.mainPagerPage} collapsable={false}>
                {homePane}
              </View>
              <View key="profile" style={styles.mainPagerPage} collapsable={false}>
                {profilePane}
              </View>
            </PagerView>
          )}
        </View>

        <View style={styles.tabBar}>
          <View style={styles.tabBarInner}>
            {state.tabs.map((tab, tabIndex) => {
              const isActive = state.activeTab === tab.key;
              const focus = tabSwipeFocus(
                mainTabIndex(state.activeTab),
                tabIndex
              );
              const iconColor = tabIconColorForFocus(focus);
              const pillAlpha = focus * 0.92;
              const labelOpacity = Math.max(0, Math.min(1, (focus - 0.2) / 0.75));
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => {
                    onMainTabPress(tab.key);
                  }}
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.tabItem,
                    pillAlpha > 0.04 && {
                      backgroundColor: `rgba(35, 41, 59, ${pillAlpha})`
                    }
                  ]}
                >
                  <View style={styles.tabItemContent}>
                    <TabIcon tab={tab.key} color={iconColor} />
                    <Text
                      style={[
                        styles.tabLabel,
                        styles.tabLabelActive,
                        {
                          opacity: labelOpacity,
                          maxWidth: labelOpacity > 0.02 ? 120 : 0,
                          overflow: "hidden"
                        }
                      ]}
                      numberOfLines={1}
                    >
                      {tab.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {state.showCaptionPopup && (
        <PopupSheet
          title="Post on Keep In Tune"
          onClose={actions.closeCaption}
          anchor="bottom"
        >
          <TextInput
            placeholder="Add a caption"
            placeholderTextColor="#96A1A8"
            style={[styles.input, styles.captionModalInput]}
            multiline
            textAlignVertical="top"
            value={state.captionDraft}
            onChangeText={actions.setCaptionDraft}
          />
          <Pressable
            style={styles.primaryButton}
            onPress={actions.confirmShare}
          >
            <Text style={styles.primaryButtonText}>Share Song</Text>
          </Pressable>
        </PopupSheet>
      )}

      {state.showCommentsPopup && (
        <PopupSheet
          title="Comments"
          onClose={() => {
            setOpenCommentMenuId(null);
            actions.closeComments();
          }}
          keyboardAvoiding
        >
          <ScrollView
            style={{ maxHeight: 220 }}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {state.activeFeed?.comments.map((comment) => (
              <View key={comment.id} style={styles.commentBubble}>
                <View style={styles.commentHeaderRow}>
                  <Pressable
                    onPress={() =>
                      actions.openFriendProfileByHandle(comment.user)
                    }
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`Open profile @${comment.user}`}
                  >
                    <Text
                      style={[styles.commentUser, styles.feedHandlePressable]}
                    >
                      @{comment.user}
                    </Text>
                  </Pressable>
                  {comment.user?.trim().toLowerCase() ===
                  (state.profileHandle ?? "").trim().toLowerCase() ? (
                    <Pressable
                      onPress={() =>
                        setOpenCommentMenuId((prev) =>
                          prev === comment.id ? null : comment.id
                        )
                      }
                      style={styles.commentMenuTrigger}
                      accessibilityRole="button"
                      accessibilityLabel="Comment actions"
                    >
                      <DotsIcon size={16} />
                    </Pressable>
                  ) : null}
                </View>

                {state.editingComment?.postId === state.activeFeed?.id &&
                state.editingComment.commentIndex === comment.commentIndex ? (
                  <View style={styles.commentEditWrap}>
                    <TextInput
                      value={state.editCommentDraft}
                      onChangeText={actions.setEditCommentDraft}
                      placeholder="Edit comment"
                      placeholderTextColor="#8F93A0"
                      style={[styles.input, styles.commentEditInput]}
                      multiline
                    />
                    <View style={styles.commentEditActionsRow}>
                      <Pressable
                        style={styles.secondaryButton}
                        onPress={actions.cancelCommentEdit}
                      >
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={styles.primaryButtonSmall}
                        onPress={actions.saveCommentEdit}
                      >
                        <Text style={styles.primaryButtonText}>Save</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.commentText}>{comment.text}</Text>
                )}

                {openCommentMenuId === comment.id ? (
                  <View style={styles.commentActionMenuRow}>
                    <Pressable
                      style={styles.postActionChip}
                      onPress={() => {
                        setOpenCommentMenuId(null);
                        actions.startCommentEdit(comment);
                      }}
                    >
                      <PencilIcon size={14} />
                      <Text style={styles.postActionChipText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.postActionChip, styles.postActionDeleteChip]}
                      onPress={() => {
                        setOpenCommentMenuId(null);
                        actions.deleteComment(comment);
                      }}
                    >
                      <Text style={styles.postActionDeleteText}>Delete</Text>
                    </Pressable>
                  </View>
                ) : null}
                <View style={styles.feedStatsRow}>
                  <Pressable
                    style={styles.commentLikeAction}
                    onPress={() => actions.toggleCommentLike(comment)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      comment.liked ? "Unlike comment" : "Like comment"
                    }
                  >
                    <HeartIcon filled={comment.liked} />
                    <Text style={styles.commentLikeCount}>{comment.likes}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.commentInputRow}>
            <TextInput
              placeholder="Add comment"
              placeholderTextColor="#96A1A8"
              style={[styles.input, styles.commentDraftInput]}
              value={state.commentDraft}
              onChangeText={actions.setCommentDraft}
            />
            <Pressable
              style={styles.primaryButtonSmall}
              onPress={actions.postComment}
            >
              <Text style={styles.primaryButtonText}>Post</Text>
            </Pressable>
          </View>
        </PopupSheet>
      )}
    </SafeAreaView>
  );
}
