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
        onContinue={actions.continueOnboarding}
        demoFriends={state.suggested.slice(0, 5)}
        topArtists={state.topArtists}
        suggestedTracks={state.suggestedTracks}
        profileName={state.profileName}
        authError={state.authError}
        authLoading={state.authLoading}
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
            />
          )}
        </View>

        <View style={styles.tabBar}>
          <View style={styles.tabBarInner}>
            {state.tabs
              .filter((tab) => tab.key !== "home")
              .map((tab) => {
                const isActive = state.activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => actions.setActiveTab(tab.key)}
                    style={[
                      styles.tabItem,
                      styles.tabItemNav,
                      isActive && styles.tabItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        isActive && styles.tabLabelActive,
                      ]}
                    >
                      {tab.key === "friends" ? "Friends" : "Profile"}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
          <Pressable
            onPress={() => actions.setActiveTab("home")}
            style={[styles.tabItemHome, styles.homeFab]}
          >
            <Text
              style={[
                styles.tabLabel,
                styles.tabLabelHome,
                state.activeTab === "home" && styles.tabLabelHome,
              ]}
            >
              Home
            </Text>
          </Pressable>
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
