import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { styles } from "../components/styles";
import type { Friend, OnboardingStep } from "../types";

type OnboardingFlowProps = {
  step: OnboardingStep;
  onLogin: () => void;
  onContinue: () => void;
  demoFriends: Friend[];
};

export function OnboardingFlow({
  step,
  onLogin,
  onContinue,
  demoFriends
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

          <View style={styles.welcomeButtonWrap}>
            <Pressable onPress={onLogin} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Login with Spotify</Text>
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
              Welcome to <Text style={styles.pageTitleAccent}>Song of the Day!</Text>
            </Text>
            <View style={styles.pageDivider} />
            <Text style={styles.subhead}>Help us get you ready to share your music.</Text>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHead}>Add Friends</Text>
            <Text style={styles.sectionCopy}>Add friends to connect with them.</Text>
            <Text style={styles.sectionHint}>Suggestions from Spotify friends</Text>

            <View style={styles.friendScroller}>
              <View style={styles.row}>
                {demoFriends.map((friend) => (
                  <View key={friend.id} style={styles.friendChip}>
                    <View style={styles.friendCircle} />
                    <Text style={styles.friendChipName}>{friend.name}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.friendsTrack} />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHead}>Customize Favorites</Text>
            <Text style={styles.sectionCopy}>Add favorites to show what you love!</Text>
            <Text style={styles.sectionHint}>Suggestions from Spotify</Text>

            <Text style={styles.bigSectionTitle}>Favorite Songs</Text>
            <View style={styles.gridRow}>
              {[
                { top: "Rubber Soul", bottom: "The Beatles" },
                { top: "The Rise and fa...", bottom: "Chappell Roan" },
                { top: "Tap to edit", bottom: "" }
              ].map((entry) => (
                <View key={`${entry.top}-${entry.bottom}`} style={styles.gridItem}>
                  <View style={styles.gridThumb} />
                  <Text style={styles.gridTitle}>{entry.top}</Text>
                  <Text style={styles.gridSub}>{entry.bottom || " "}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.centerButtonWrap}>
            <Pressable onPress={onContinue} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </View>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
