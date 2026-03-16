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
        <View style={styles.welcomeScreen}>
          <View style={styles.welcomeOrbTop} />
          <View style={styles.welcomeOrbBottom} />

          <View>
            <Text style={styles.welcomeEyebrow}>SONG OF THE DAY</Text>
            <Text style={styles.welcomeTitleLine}>Share what</Text>
            <Text style={styles.welcomeTitleLine}>you are playing</Text>
            <Text style={[styles.welcomeTitleLine, styles.heroAccent]}>today.</Text>
            <Text style={styles.welcomeSubtitle}>
              Discover your friends' picks, post your own track, and build a daily music story together.
            </Text>
          </View>

          {authError ? (
            <Text style={[styles.errorText, { marginTop: 12 }]}>{authError}</Text>
          ) : null}

          <View style={styles.welcomeButtonWrap}>
            <Pressable
              onPress={onLogin}
              style={[styles.primaryButton, authLoading && styles.primaryButtonDisabled]}
              disabled={authLoading}
            >
              <Text style={styles.primaryButtonText}>
                {authLoading ? "Connecting..." : "Login with Spotify"}
              </Text>
            </Pressable>
            <Text style={styles.welcomeFootnote}>No spam. Just music.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.body}>
          <View style={{ marginTop: 36 }}>
            <Text style={styles.pageTitle}>
              Welcome{profileName ? `, ${profileName}` : ""}
              {" to "}
              <Text style={styles.pageTitleAccent}>Song of the Day!</Text>
            </Text>
            <View style={styles.pageDivider} />
            <Text style={styles.subhead}>Here's what we pulled from your Spotify</Text>
          </View>

          {/* ── Friends ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHead}>Add Friends</Text>
            <Text style={styles.sectionCopy}>Add friends to connect with them.</Text>
            <Text style={styles.sectionHint}>Suggestions from Song of the Day</Text>

            <View style={styles.friendScroller}>
              <View style={styles.row}>
                {(demoFriends.length > 0
                  ? demoFriends
                  : [{ id: "p1", name: "Invite friends!", handle: "" }]
                ).map((friend) => (
                  <View key={friend.id} style={styles.friendChip}>
                    <View style={styles.friendCircle} />
                    <Text style={styles.friendChipName}>{friend.name}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.friendsTrack} />
            </View>
          </View>

          {/* ── Favorite Songs from Spotify ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHead}>Customize Favorites</Text>
            <Text style={styles.sectionCopy}>Add favorites to show what you love!</Text>
            <Text style={styles.sectionHint}>Based on your Spotify listening</Text>

            <Text style={styles.bigSectionTitle}>Favorite Songs</Text>
            <View style={styles.gridRow}>
              {(suggestedTracks.length > 0
                ? suggestedTracks.slice(0, 3).map((t) => ({
                    top: t.title,
                    bottom: t.artist,
                    image: t.albumCover
                  }))
                : [
                    { top: "Song 1", bottom: "Artist", image: undefined },
                    { top: "Song 2", bottom: "Artist", image: undefined },
                    { top: "Tap to edit", bottom: "", image: undefined }
                  ]
              ).map((entry, idx) => (
                <View key={`song-${idx}`} style={styles.gridItem}>
                  {entry.image ? (
                    <Image source={{ uri: entry.image }} style={styles.gridThumb} />
                  ) : (
                    <View style={styles.gridThumb} />
                  )}
                  <Text style={styles.gridTitle} numberOfLines={1}>{entry.top}</Text>
                  <Text style={styles.gridSub} numberOfLines={1}>{entry.bottom || " "}</Text>
                </View>
              ))}
            </View>

            {/* ── Favorite Artists from Spotify ── */}
            <Text style={[styles.bigSectionTitle, { marginTop: 16 }]}>Top Artists</Text>
            <View style={styles.gridRow}>
              {(topArtists.length > 0
                ? topArtists.slice(0, 3).map((a) => ({
                    name: a.name,
                    image: a.imageUrl
                  }))
                : [
                    { name: "Artist 1", image: undefined },
                    { name: "Artist 2", image: undefined },
                    { name: "Artist 3", image: undefined }
                  ]
              ).map((artist, idx) => (
                <View key={`artist-${idx}`} style={styles.gridItem}>
                  {artist.image ? (
                    <Image
                      source={{ uri: artist.image }}
                      style={[styles.gridThumb, { borderRadius: 999 }]}
                    />
                  ) : (
                    <View style={[styles.gridThumb, { borderRadius: 999 }]} />
                  )}
                  <Text style={styles.gridTitle} numberOfLines={1}>{artist.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.centerButtonWrap}>
            <Pressable onPress={onContinue} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Let's Go</Text>
            </Pressable>
          </View>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
