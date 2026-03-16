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
          <Text style={styles.pageTitle}>{title}</Text>
          <Pressable onPress={onClose} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </Pressable>
        </View>
        <View style={styles.popupBody}>{children}</View>
      </View>
    </View>
  );
}
