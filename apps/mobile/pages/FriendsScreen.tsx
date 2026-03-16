import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../components/styles";
import type { Friend } from "../types";
import { FriendProfileScreen } from "./FriendProfileScreen";

type FriendsScreenProps = {
  showFriendProfile: boolean;
  selectedFriend: Friend;
  friends: Friend[];
  requests: Friend[];
  suggested: Friend[];
  friendHistory: Array<{ id: string; song: string; artist: string; date: string }>;
  demoSongs: Array<{ id: string; title: string; artist: string }>;
  onAcceptRequest: (friend: Friend) => void;
  onDeclineRequest: (friend: Friend) => void;
  onToggleFriend: (friend: Friend) => void;
  onToggleSuggested: (friend: Friend) => void;
  onViewFriend: (friend: Friend) => void;
  onBack: () => void;
};

export function FriendsScreen({
  showFriendProfile,
  selectedFriend,
  friends,
  requests,
  suggested,
  friendHistory,
  demoSongs,
  onAcceptRequest,
  onDeclineRequest,
  onToggleFriend,
  onToggleSuggested,
  onViewFriend,
  onBack
}: FriendsScreenProps) {
  if (showFriendProfile) {
    return (
      <FriendProfileScreen
        friend={selectedFriend}
        shareHistory={friendHistory}
        demoSongs={demoSongs}
        onBack={onBack}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Friend Requests</Text>
      <View style={styles.card}>
        {requests.length === 0 && (
          <Text style={styles.sectionSubtitle}>No pending requests.</Text>
        )}
        {requests.map((request) => (
          <View key={request.id} style={styles.friendRow}>
            <View style={styles.avatar} />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{request.name}</Text>
              <Text style={styles.friendHandle}>{request.handle}</Text>
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
              <View style={styles.avatar} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendHandle}>{friend.handle}</Text>
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
        {suggested.map((friend) => {
          const isFriend = friends.some((item) => item.id === friend.id);
          return (
            <View key={friend.id} style={styles.friendRow}>
              <View style={styles.avatar} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendHandle}>{friend.handle}</Text>
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
