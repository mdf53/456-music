import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

type PopupSheetProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Bottom sheet: keeps primary action at the bottom of the screen (e.g. caption + post). */
  anchor?: "center" | "bottom";
  /**
   * Center anchor only: modal stays vertically centered until the keyboard opens,
   * then the sheet shifts up so inputs stay above the keyboard.
   */
  keyboardAvoiding?: boolean;
};

export function PopupSheet({
  title,
  onClose,
  children,
  anchor = "center",
  keyboardAvoiding = false
}: PopupSheetProps) {
  const insets = useSafeAreaInsets();
  const isBottom = anchor === "bottom";
  /** Center + keyboard: avoid huge gap under the card — when keyboard is open, pin card just above it */
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    if (!keyboardAvoiding) {
      return;
    }
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardOpen(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardOpen(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, [keyboardAvoiding]);

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

  if (isBottom) {
    return (
      <View
        style={[
          styles.popupOverlay,
          styles.popupOverlayBottom,
          { paddingBottom: Math.max(insets.bottom, 12) }
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.popupKeyboardWrap}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 4 : 0}
        >
          {card}
        </KeyboardAvoidingView>
      </View>
    );
  }

  if (keyboardAvoiding) {
    return (
      <View style={styles.popupOverlayBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          enabled={Platform.OS === "ios"}
          style={styles.popupKeyboardAvoidCenterWrap}
          keyboardVerticalOffset={0}
        >
          <View
            style={[
              styles.popupOverlayCenteredInner,
              keyboardOpen && styles.popupOverlayCenteredKeyboardOpen
            ]}
          >
            {card}
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return <View style={styles.popupOverlay}>{card}</View>;
}
