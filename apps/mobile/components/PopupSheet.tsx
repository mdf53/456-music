import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "./styles";

type PopupSheetProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function PopupSheet({ title, onClose, children }: PopupSheetProps) {
  return (
    <View style={styles.popupOverlay}>
      <View style={styles.popupCard}>
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
        <View style={styles.popupBody}>{children}</View>
      </View>
    </View>
  );
}
