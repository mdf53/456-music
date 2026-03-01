import { Pressable, SafeAreaView, Text, View } from "react-native";
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
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.brand}>Welcome to Song of the Day</Text>
          <Pressable onPress={onLogin} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Login with Spotify</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.brand}>Welcome to Song of the Day</Text>
        <Text style={styles.subtitle}>
          Help us get you ready to share your music
        </Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add Friends</Text>
          <View style={styles.row}>
            {demoFriends.map((friend) => (
              <View key={friend.id} style={styles.avatar} />
            ))}
          </View>
          <Text style={styles.sectionTitle}>Customize Favorites</Text>
          <View style={styles.row}>
            {["Song", "Album", "Artist"].map((label) => (
              <View key={label} style={styles.favoriteCard}>
                <View style={styles.favoriteThumb} />
                <Text style={styles.favoriteLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={onContinue} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
