// @ts-nocheck
import { Image, View } from "react-native";
import { colors, styles } from "./styles";

type FriendAvatarProps = {
  /** Data URL or https URL */
  uri?: string | null;
  size?: number;
  /** When true, no border (e.g. feed header). Default keeps a light ring on empty slots in lists. */
  borderless?: boolean;
};

/** Row avatar: green circle when empty; cropped image when `uri` is set. */
export function FriendAvatar({ uri, size = 52, borderless = false }: FriendAvatarProps) {
  const radius = size / 2;
  const borderWidth = borderless ? 0 : uri ? 0 : 1;
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: uri ? colors.surfaceSoft : colors.primary,
          borderWidth
        }
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );
}
