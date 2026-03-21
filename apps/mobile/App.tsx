// @ts-nocheck
import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { PopupSheet } from "./components/PopupSheet";
import { styles } from "./components/styles";
import { AddSongScreen } from "./pages/AddSongScreen";
import { FriendsScreen } from "./pages/FriendsScreen";
import { HomeScreen } from "./pages/HomeScreen";
import { OnboardingFlow } from "./pages/OnboardingFlow";
import { ProfileScreen } from "./pages/ProfileScreen";
import { useAppPresenter } from "./presenters/useAppPresenter";

export default function App() {
  const { state, actions } = useAppPresenter();

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
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>Song of the Day</Text>
          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>
              @{state.profileHandle ?? "spotify"}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {state.activeTab === "home" && (
            <>
              {state.showAddSong ? (
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
                />
              ) : (
                <HomeScreen
                  hasSharedToday={state.hasSharedToday}
                  feedItems={state.feedItems}
                  onAddSong={actions.openAddSong}
                  onOpenComments={actions.openComments}
                  onToggleLike={actions.toggleLike}
                />
              )}
            </>
          )}
          {state.activeTab === "friends" && (
            <FriendsScreen
              showFriendProfile={state.showFriendProfile}
              selectedFriend={state.selectedFriend}
              friends={state.friends}
              requests={state.requests}
              suggested={state.suggested}
              friendHistory={state.friendHistory}
              demoSongs={state.topTracks}
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
            />
          )}
          {state.activeTab === "profile" && (
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
            />
          )}
        </View>

        <View style={styles.tabBar}>
          <View style={styles.tabBarInner}>
            {state.tabs.map((tab) => {
              const isActive = state.activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => actions.setActiveTab(tab.key)}
                  style={[
                    styles.tabItem,
                    tab.key === "home" ? styles.tabItemHome : styles.tabItemNav,
                    isActive && styles.tabItemActive
                  ]}
                >
                  <Text
                    style={[
                      styles.tabLabel,
                      tab.key === "home" && styles.tabLabelHome,
                      isActive && styles.tabLabelActive
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {state.showCaptionPopup && (
        <PopupSheet
          title="Post your Song of the Day"
          onClose={actions.closeCaption}
        >
          <TextInput
            placeholder="Add a caption"
            placeholderTextColor="#96A1A8"
            style={styles.input}
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
          onClose={actions.closeComments}
        >
          <ScrollView
            style={{ maxHeight: 220 }}
            contentContainerStyle={styles.scrollContent}
          >
            {state.activeFeed?.comments.map((comment) => (
              <View key={comment.id} style={styles.commentBubble}>
                <Text style={styles.commentUser}>@{comment.user}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
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
