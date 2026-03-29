// @ts-nocheck
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { FriendAvatar } from "../components/FriendAvatar";
import { colors, styles } from "../components/styles";
import type { FavoriteArtistEntry, FavoriteSongEntry, Friend } from "../types";
import { FriendProfileScreen } from "./FriendProfileScreen";

type FriendsScreenProps = {
  showFriendProfile: boolean;
  selectedFriend: Friend;
  friends: Friend[];
  requests: Friend[];
  sentRequests?: Friend[];
  suggested: Friend[];
  friendSearchQuery?: string;
  friendSearchResults?: Friend[];
  friendSearchLoading?: boolean;
  onFriendSearchQueryChange?: (q: string) => void;
  onRunFriendSearch?: () => void;
  onSendFriendRequest?: (friend: Friend) => void;
  onAcceptRequest: (friend: Friend) => void;
  onDeclineRequest: (friend: Friend) => void;
  onToggleFriend: (friend: Friend) => void;
  onToggleSuggested: (friend: Friend) => void;
  onViewFriend: (friend: Friend) => void;
  onBack: () => void;
  /** Keyed by lowercase @handle → avatar data URL */
  friendPhotoByHandle?: Record<string, string>;
  friendsRefreshing?: boolean;
  onRefreshFriends?: () => void;
  friendProfileTab?: "favorites" | "history";
  onFriendProfileTabChange?: (tab: "history" | "favorites") => void;
  friendViewLoading?: boolean;
  friendFavoriteSongs?: FavoriteSongEntry[];
  friendFavoriteArtists?: FavoriteArtistEntry[];
  friendShareHistory?: Array<{
    id: string;
    song: string;
    artist: string;
    date: string;
    albumCover?: string;
  }>;
  friendViewFriendCount?: number;
};

export function FriendsScreen({
  showFriendProfile,
  selectedFriend,
  friends,
  requests,
  sentRequests = [],
  suggested,
  friendSearchQuery = "",
  friendSearchResults = [],
  friendSearchLoading = false,
  onFriendSearchQueryChange,
  onRunFriendSearch,
  onSendFriendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onToggleFriend,
  onToggleSuggested,
  onViewFriend,
  onBack,
  friendPhotoByHandle = {},
  friendsRefreshing = false,
  onRefreshFriends,
  friendProfileTab = "favorites",
  onFriendProfileTabChange,
  friendViewLoading = false,
  friendFavoriteSongs = [],
  friendFavoriteArtists = [],
  friendShareHistory = [],
  friendViewFriendCount = 0
}: FriendsScreenProps) {
  const photoFor = (handle: string) => friendPhotoByHandle[handle.trim().toLowerCase()];
  if (showFriendProfile) {
    return (
      <FriendProfileScreen
        friend={selectedFriend}
        profilePhotoUri={photoFor(selectedFriend.handle)}
        profileTab={friendProfileTab}
        onToggleProfileTab={(t) => onFriendProfileTabChange?.(t)}
        favoriteSongs={friendFavoriteSongs}
        favoriteArtists={friendFavoriteArtists}
        shareHistory={friendShareHistory}
        loading={friendViewLoading}
        friendCount={friendViewFriendCount}
        refreshing={friendsRefreshing}
        onRefresh={onRefreshFriends}
        onBack={onBack}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        onRefreshFriends ? (
          <RefreshControl
            refreshing={friendsRefreshing}
            onRefresh={() => void onRefreshFriends()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    >
      <Text style={styles.sectionTitle}>Find friends</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Search by @handle…"
          placeholderTextColor="#888"
          value={friendSearchQuery}
          onChangeText={onFriendSearchQueryChange}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          returnKeyType="search"
          onSubmitEditing={() => void onRunFriendSearch?.()}
        />
        <Pressable
          style={[styles.primaryButton, { marginTop: 10 }]}
          onPress={() => void onRunFriendSearch?.()}
        >
          <Text style={styles.primaryButtonText}>Search</Text>
        </Pressable>
        {friendSearchLoading ? (
          <View style={{ paddingVertical: 16, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}
        {friendSearchResults.length === 0 && !friendSearchLoading && friendSearchQuery.trim() ? (
          <Text style={[styles.sectionSubtitle, { marginTop: 12 }]}>No users found.</Text>
        ) : null}
        {friendSearchResults.map((result) => (
          <View key={result.id} style={styles.friendRow}>
            <FriendAvatar uri={photoFor(result.handle)} />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{result.name}</Text>
              <Text style={styles.friendHandle}>@{result.handle}</Text>
            </View>
            {result.isFriend ? (
              <Text style={[styles.sectionSubtitle, { marginRight: 8 }]}>Friends</Text>
            ) : result.pendingOutgoing ? (
              <Text style={[styles.sectionSubtitle, { marginRight: 8 }]}>Pending</Text>
            ) : (
              <Pressable
                style={styles.primaryButtonSmall}
                onPress={() => onSendFriendRequest?.(result)}
              >
                <Text style={styles.primaryButtonSmallText}>Add</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Friend Requests</Text>
      <View style={styles.card}>
        {requests.length === 0 && (
          <Text style={styles.sectionSubtitle}>No pending requests.</Text>
        )}
        {requests.map((request) => (
          <View key={request.id} style={styles.friendRow}>
            <FriendAvatar uri={photoFor(request.handle)} />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{request.name}</Text>
              <Text style={styles.friendHandle}>@{request.handle}</Text>
            </View>
            <Pressable
              style={styles.primaryButtonSmall}
              onPress={() => onAcceptRequest(request)}
            >
              <Text style={styles.primaryButtonSmallText}>Accept</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => onDeclineRequest(request)}
            >
              <Text style={styles.secondaryButtonText}>Decline</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Pending (Sent)</Text>
      <View style={styles.card}>
        {sentRequests.length === 0 ? (
          <Text style={styles.sectionSubtitle}>No outgoing requests pending.</Text>
        ) : (
          sentRequests.map((request) => (
            <View key={request.id} style={styles.friendRow}>
              <FriendAvatar uri={photoFor(request.handle)} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{request.name}</Text>
                <Text style={styles.friendHandle}>@{request.handle}</Text>
              </View>
              <Text style={[styles.sectionSubtitle, { marginRight: 8 }]}>Pending</Text>
            </View>
          ))
        )}
      </View>

      <Text style={styles.sectionTitle}>Friends</Text>
      <View style={styles.card}>
        {friends.length === 0 && (
          <Text style={styles.sectionSubtitle}>No friends yet.</Text>
        )}
        {friends.map((friend) => (
          <View key={friend.id} style={styles.friendRow}>
            <Pressable
              style={styles.friendInfoRow}
              onPress={() => onViewFriend(friend)}
            >
              <FriendAvatar uri={photoFor(friend.handle)} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendHandle}>@{friend.handle}</Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => onToggleFriend(friend)}
            >
              <Text style={styles.secondaryButtonText}>Unfriend</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Suggested</Text>
      <View style={styles.card}>
        {suggested.length === 0 && (
          <Text style={styles.sectionSubtitle}>No suggestions yet.</Text>
        )}
        {suggested.map((friend) => {
          const isFriend = friends.some((item) => item.id === friend.id);
          return (
            <View key={friend.id} style={styles.friendRow}>
              <FriendAvatar uri={photoFor(friend.handle)} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendHandle}>@{friend.handle}</Text>
              </View>
              <Pressable
                style={isFriend ? styles.secondaryButton : styles.primaryButtonSmall}
                onPress={() => onToggleSuggested(friend)}
              >
                <Text
                  style={
                    isFriend
                      ? styles.secondaryButtonText
                      : styles.primaryButtonSmallText
                  }
                >
                  {isFriend ? "Unfriend" : "Add"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
