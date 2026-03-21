// @ts-nocheck
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { PopupSheet } from "../components/PopupSheet";
import { colors, styles } from "../components/styles";
import type { Friend, OnboardingStep } from "../types";
import type { SpotifyArtist, SpotifyTrack } from "../services/spotifyClient";

type FavoriteTarget = { kind: "song" | "artist"; index: number } | null;

type OnboardingFlowProps = {
  step: OnboardingStep;
  onLogin: () => void;
  onContinue: () => void | Promise<void>;
  demoFriends: Friend[];
  topArtists: SpotifyArtist[];
  suggestedTracks: SpotifyTrack[];
  profileName: string | null;
  authError?: string | null;
  authLoading?: boolean;
  onboardingHandleDraft?: string;
  onOnboardingHandleDraftChange?: (value: string) => void;
  onboardingHandleError?: string | null;
  onboardingHandleSaving?: boolean;
  onboardingSearchQuery?: string;
  onOnboardingSearchQueryChange?: (q: string) => void;
  onboardingFavoriteTarget?: FavoriteTarget;
  spotifySearchOpen?: boolean;
  spotifySearchMode?: "track" | "artist";
  spotifySearchTrackResults?: SpotifyTrack[];
  spotifySearchArtistResults?: SpotifyArtist[];
  spotifySearchLoading?: boolean;
  spotifySearchError?: string | null;
  onCloseSpotifySearch?: () => void;
  onRunOnboardingSpotifySearch?: () => void;
  onSelectSongSlot?: (index: number) => void;
  onSelectArtistSlot?: (index: number) => void;
  onPickSearchTrack?: (track: SpotifyTrack) => void;
  onPickSearchArtist?: (artist: SpotifyArtist) => void;
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
  authLoading,
  onboardingHandleDraft = "",
  onOnboardingHandleDraftChange,
  onboardingHandleError = null,
  onboardingHandleSaving = false,
  onboardingSearchQuery = "",
  onOnboardingSearchQueryChange,
  onboardingFavoriteTarget = null,
  spotifySearchOpen = false,
  spotifySearchMode = "track",
  spotifySearchTrackResults = [],
  spotifySearchArtistResults = [],
  spotifySearchLoading = false,
  spotifySearchError = null,
  onCloseSpotifySearch,
  onRunOnboardingSpotifySearch,
  onSelectSongSlot,
  onSelectArtistSlot,
  onPickSearchTrack,
  onPickSearchArtist
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

  const songTiles =
    suggestedTracks.length > 0
      ? suggestedTracks.slice(0, 3).map((t) => ({
          top: t.title,
          bottom: t.artist,
          image: t.albumCover
        }))
      : [
          { top: "Song 1", bottom: "Artist", image: undefined },
          { top: "Song 2", bottom: "Artist", image: undefined },
          { top: "Song 3", bottom: "Artist", image: undefined }
        ];

  const artistTiles =
    topArtists.length > 0
      ? topArtists.slice(0, 3).map((a) => ({
          name: a.name,
          image: a.imageUrl
        }))
      : [
          { name: "Artist 1", image: undefined },
          { name: "Artist 2", image: undefined },
          { name: "Artist 3", image: undefined }
        ];

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

          {/* ── Your @handle ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHead}>Your handle</Text>
            <Text style={styles.sectionCopy}>
              Choose your @username — how friends see you in the app. Use lowercase letters,
              numbers, and underscores (3–30 characters). This is saved when you tap{" "}
              <Text style={{ fontWeight: "700" }}>Let's Go</Text> below.
            </Text>
            <View style={[localStyles.handleRow, { marginTop: 12 }]}>
              <Text style={localStyles.handleAt}>@</Text>
              <TextInput
                style={[styles.input, localStyles.handleInput]}
                placeholder="your_handle"
                placeholderTextColor="#888"
                value={onboardingHandleDraft}
                onChangeText={onOnboardingHandleDraftChange}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                editable={!onboardingHandleSaving}
              />
            </View>
            {onboardingHandleError ? (
              <Text style={[styles.errorText, { marginTop: 8, textAlign: "left" }]}>
                {onboardingHandleError}
              </Text>
            ) : null}
          </View>

          {/* ── Favorite Songs from Spotify ── */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHead}>Customize Favorites</Text>
            <Text style={styles.sectionCopy}>Add favorites to show what you love!</Text>
            <Text style={styles.sectionHint}>Based on your Spotify listening</Text>
            <Text style={[styles.sectionHint, { marginTop: 4, opacity: 0.85 }]}>
              Tap a song or artist tile to search Spotify and set that slot — same as your profile.
            </Text>

            <Text style={[styles.bigSectionTitle, { marginTop: 20 }]}>Favorite Songs</Text>
            <View style={styles.gridRow}>
              {songTiles.map((entry, idx) => {
                const selected =
                  spotifySearchOpen &&
                  onboardingFavoriteTarget?.kind === "song" &&
                  onboardingFavoriteTarget.index === idx;
                return (
                  <Pressable
                    key={`song-${idx}`}
                    style={[styles.gridItem, selected && localStyles.slotSelected]}
                    onPress={() => onSelectSongSlot?.(idx)}
                    disabled={!onSelectSongSlot}
                  >
                    {entry.image ? (
                      <Image source={{ uri: entry.image }} style={styles.gridThumb} />
                    ) : (
                      <View style={styles.gridThumb} />
                    )}
                    <Text style={styles.gridTitle} numberOfLines={1}>
                      {entry.top}
                    </Text>
                    <Text style={styles.gridSub} numberOfLines={1}>
                      {entry.bottom || " "}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ── Favorite Artists from Spotify ── */}
            <Text style={[styles.bigSectionTitle, { marginTop: 16 }]}>Top Artists</Text>
            <View style={styles.gridRow}>
              {artistTiles.map((artist, idx) => {
                const selected =
                  spotifySearchOpen &&
                  onboardingFavoriteTarget?.kind === "artist" &&
                  onboardingFavoriteTarget.index === idx;
                return (
                  <Pressable
                    key={`artist-${idx}`}
                    style={[styles.gridItem, selected && localStyles.slotSelected]}
                    onPress={() => onSelectArtistSlot?.(idx)}
                    disabled={!onSelectArtistSlot}
                  >
                    {artist.image ? (
                      <Image
                        source={{ uri: artist.image }}
                        style={[styles.gridThumb, { borderRadius: 999 }]}
                      />
                    ) : (
                      <View style={[styles.gridThumb, { borderRadius: 999 }]} />
                    )}
                    <Text style={styles.gridTitle} numberOfLines={1}>
                      {artist.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.centerButtonWrap}>
            <Pressable
              onPress={() => void onContinue()}
              style={[
                styles.primaryButton,
                onboardingHandleSaving && styles.primaryButtonDisabled
              ]}
              disabled={onboardingHandleSaving}
            >
              {onboardingHandleSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Let's Go</Text>
              )}
            </Pressable>
          </View>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      {spotifySearchOpen && onCloseSpotifySearch ? (
        <PopupSheet
          title={
            spotifySearchMode === "track"
              ? "Replace favorite song"
              : "Replace favorite artist"
          }
          onClose={onCloseSpotifySearch}
        >
          <Text style={[styles.sectionSubtitle, { marginBottom: 12 }]}>
            Search Spotify, then tap a result to save.
          </Text>
          <View style={{ gap: 10, marginBottom: 12 }}>
            <TextInput
              style={styles.input}
              placeholder={
                spotifySearchMode === "track"
                  ? "Search for a song…"
                  : "Search for an artist…"
              }
              placeholderTextColor="#888"
              value={onboardingSearchQuery}
              onChangeText={onOnboardingSearchQueryChange}
              returnKeyType="search"
              onSubmitEditing={() => onRunOnboardingSpotifySearch?.()}
            />
            <Pressable
              onPress={() => onRunOnboardingSpotifySearch?.()}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Search Spotify</Text>
            </Pressable>
          </View>
          {spotifySearchLoading ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.sectionSubtitle, { marginTop: 12 }]}>Searching…</Text>
            </View>
          ) : null}
          {spotifySearchError ? (
            <Text style={styles.errorText}>{spotifySearchError}</Text>
          ) : null}
          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator>
            {spotifySearchMode === "track" &&
              spotifySearchTrackResults.map((t) => (
                <Pressable
                  key={t.id}
                  style={onboardingSearchRowStyles.row}
                  onPress={() => void onPickSearchTrack?.(t)}
                  disabled={!onPickSearchTrack}
                >
                  {t.albumCover ? (
                    <Image
                      source={{ uri: t.albumCover }}
                      style={onboardingSearchRowStyles.thumb}
                    />
                  ) : (
                    <View style={onboardingSearchRowStyles.thumb} />
                  )}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.gridTitle} numberOfLines={1}>
                      {t.title}
                    </Text>
                    <Text style={styles.gridSub} numberOfLines={1}>
                      {t.artist} · {t.album}
                    </Text>
                  </View>
                </Pressable>
              ))}
            {spotifySearchMode === "artist" &&
              spotifySearchArtistResults.map((a) => (
                <Pressable
                  key={a.id}
                  style={onboardingSearchRowStyles.row}
                  onPress={() => void onPickSearchArtist?.(a)}
                  disabled={!onPickSearchArtist}
                >
                  {a.imageUrl ? (
                    <Image
                      source={{ uri: a.imageUrl }}
                      style={[onboardingSearchRowStyles.thumb, { borderRadius: 999 }]}
                    />
                  ) : (
                    <View
                      style={[onboardingSearchRowStyles.thumb, { borderRadius: 999 }]}
                    />
                  )}
                  <Text style={[styles.gridTitle, { flex: 1, minWidth: 0 }]} numberOfLines={1}>
                    {a.name}
                  </Text>
                </Pressable>
              ))}
            {!spotifySearchLoading &&
            !spotifySearchError &&
            spotifySearchMode === "track" &&
            spotifySearchTrackResults.length === 0 ? (
              <Text style={styles.sectionSubtitle}>No tracks yet — search above.</Text>
            ) : null}
            {!spotifySearchLoading &&
            !spotifySearchError &&
            spotifySearchMode === "artist" &&
            spotifySearchArtistResults.length === 0 ? (
              <Text style={styles.sectionSubtitle}>No artists yet — search above.</Text>
            ) : null}
          </ScrollView>
        </PopupSheet>
      ) : null}
    </SafeAreaView>
  );
}

const localStyles = {
  handleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8
  },
  handleAt: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700" as const,
    marginRight: 2
  },
  handleInput: {
    flex: 1,
    marginBottom: 0
  },
  slotSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 4,
    margin: -4
  }
};

const onboardingSearchRowStyles = {
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3e414a"
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#34363e"
  }
};
