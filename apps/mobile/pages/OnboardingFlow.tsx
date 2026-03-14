// @ts-nocheck
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { styles } from "../components/styles";
import type { Friend, OnboardingStep } from "../types";
import type { SpotifyArtist, SpotifyTrack } from "../services/spotifyClient";

type OnboardingFlowProps = {
  step: OnboardingStep;
  onLogin: () => void;
  onContinue: () => void;
  demoFriends: Friend[];
  topArtists: SpotifyArtist[];
  suggestedTracks: SpotifyTrack[];
  profileName: string | null;
  authError?: string | null;
  authLoading?: boolean;
};

export function OnboardingFlow({
  step,
  onLogin,
  onContinue,
  demoFriends,
  topArtists,
  suggestedTracks,
  profileName,
  authError,
  authLoading
}: OnboardingFlowProps) {
  if (step === "login") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.brand}>Welcome to Song of the Day</Text>
          <Text style={[styles.subtitle, { marginTop: 8, textAlign: "center" }]}>
            Share your daily soundtrack with friends
          </Text>
          {authError ? (
            <Text style={styles.errorText}>{authError}</Text>
          ) : null}
          <Pressable
            onPress={onLogin}
            style={[
              styles.primaryButton,
              { width: "100%", marginTop: 24 },
              authLoading && styles.primaryButtonDisabled
            ]}
            disabled={authLoading}
          >
            <Text style={styles.primaryButtonText}>
              {authLoading ? "Connecting..." : "Login with Spotify"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 }}
      >
        <Text style={styles.brand}>
          Welcome{profileName ? `, ${profileName}` : ""}!
        </Text>
        <Text style={[styles.subtitle, { marginTop: 4, marginBottom: 20 }]}>
          Here's what we pulled from your Spotify
        </Text>

        {/* ── Top Artists ── */}
        {topArtists.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Your Top Artists</Text>
            <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>
              Based on your recent listening
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {topArtists.map((artist) => (
                <View key={artist.id} style={onboardingStyles.artistCard}>
                  {artist.imageUrl ? (
                    <Image
                      source={{ uri: artist.imageUrl }}
                      style={onboardingStyles.artistImage}
                    />
                  ) : (
                    <View style={onboardingStyles.artistImagePlaceholder} />
                  )}
                  <Text style={onboardingStyles.artistName} numberOfLines={1}>
                    {artist.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Suggested Songs ── */}
        {suggestedTracks.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Songs For You</Text>
            <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>
              Your most-played tracks
            </Text>
            {suggestedTracks.map((track) => (
              <View key={track.id} style={onboardingStyles.trackRow}>
                {track.albumCover ? (
                  <Image
                    source={{ uri: track.albumCover }}
                    style={styles.albumThumbImage}
                  />
                ) : (
                  <View style={styles.albumThumb} />
                )}
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.songArtist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Suggested Friends ── */}
        {demoFriends.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Suggested Friends</Text>
            <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>
              People already on Song of the Day
            </Text>
            {demoFriends.map((friend) => (
              <View key={friend.id} style={styles.friendRow}>
                <View style={styles.avatar} />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendHandle}>@{friend.handle}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── No data fallback ── */}
        {topArtists.length === 0 && suggestedTracks.length === 0 && (
          <View style={[styles.card, { marginBottom: 24 }]}>
            <Text style={styles.sectionTitle}>You're all set!</Text>
            <Text style={styles.subtitle}>
              Start sharing songs and discover what your friends are listening to.
            </Text>
          </View>
        )}

        <Pressable onPress={onContinue} style={[styles.primaryButton, { marginTop: 8 }]}>
          <Text style={styles.primaryButtonText}>Let's Go</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const onboardingStyles = {
  artistCard: {
    alignItems: "center" as const,
    marginRight: 16,
    width: 100
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8
  },
  artistImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#CBD5F5",
    marginBottom: 8
  },
  artistName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#1D1E20",
    textAlign: "center" as const
  },
  trackRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 8
  }
};
