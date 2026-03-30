import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

type PopupSheetProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Bottom sheet: keeps primary action at the bottom of the screen (e.g. caption + post). */
  anchor?: "center" | "bottom";
};

export function PopupSheet({
  title,
  onClose,
  children,
  anchor = "center"
}: PopupSheetProps) {
  const insets = useSafeAreaInsets();
  const isBottom = anchor === "bottom";

  const card = (
    <View style={[styles.popupCard, isBottom && styles.popupCardBottom]}>
      <View style={styles.popupHeader}>
        <Text style={styles.popupTitle} numberOfLines={3}>
          {title}
        </Text>
        <Pressable
          onPress={onClose}
          style={styles.popupCloseHit}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
        >
          <Text style={styles.popupCloseIcon}>×</Text>
        </Pressable>
      </View>
      <View style={[styles.popupBody, isBottom && styles.popupBodyBottom]}>
        {children}
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.popupOverlay,
        isBottom && styles.popupOverlayBottom,
        isBottom && { paddingBottom: Math.max(insets.bottom, 12) }
      ]}
    >
      {isBottom ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%" }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          {card}
        </KeyboardAvoidingView>
      ) : (
        card
      )}
    </View>
  );
}
