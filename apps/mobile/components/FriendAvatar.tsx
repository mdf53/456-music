// @ts-nocheck
import { Image, View } from "react-native";
import { colors, styles } from "./styles";

type FriendAvatarProps = {
  /** Data URL or https URL */
  uri?: string | null;
  size?: number;
};

/** Row avatar: green circle when empty; cropped image when `uri` is set. */
export function FriendAvatar({ uri, size = 52 }: FriendAvatarProps) {
  const radius = size / 2;
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
          borderWidth: uri ? 0 : 1
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
