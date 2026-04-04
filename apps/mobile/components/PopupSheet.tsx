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
  /**
   * Android: `KeyboardAvoidingView` is unreliable with bottom sheets, edge-to-edge, and
   * `adjustResize` — use the keyboard frame height as bottom inset on the overlay instead.
   * iOS keeps `KeyboardAvoidingView` with padding behavior.
   */
  const [androidKeyboardInset, setAndroidKeyboardInset] = useState(0);
  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setAndroidKeyboardInset(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setAndroidKeyboardInset(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
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
    const bottomPad =
      Math.max(insets.bottom, 12) +
      (Platform.OS === "android" ? androidKeyboardInset : 0);
    return (
      <View
        style={[
          styles.popupOverlay,
          styles.popupOverlayBottom,
          { paddingBottom: bottomPad }
        ]}
      >
        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.popupKeyboardWrap}
            keyboardVerticalOffset={insets.top + 4}
          >
            {card}
          </KeyboardAvoidingView>
        ) : (
          <View style={styles.popupKeyboardWrap}>{card}</View>
        )}
      </View>
    );
  }

  if (keyboardAvoiding) {
    if (Platform.OS === "android") {
      return (
        <View
          style={[
            styles.popupOverlayBackdrop,
            { paddingBottom: androidKeyboardInset }
          ]}
        >
          <View style={styles.popupKeyboardAvoidCenterWrap}>
            <View
              style={[
                styles.popupOverlayCenteredInner,
                keyboardOpen && styles.popupOverlayCenteredKeyboardOpen
              ]}
            >
              {card}
            </View>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.popupOverlayBackdrop}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.popupKeyboardAvoidCenterWrap}
          keyboardVerticalOffset={insets.top}
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
