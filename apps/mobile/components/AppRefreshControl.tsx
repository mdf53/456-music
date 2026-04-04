// @ts-nocheck — RN RefreshControl JSX types vs React 19
import { Platform, RefreshControl, type RefreshControlProps } from "react-native";
import { colors } from "./styles";

const SPINNER = "#ffffff";

/**
 * Pull-to-refresh styled for dark app UI: white spinner on iOS and Android.
 * iOS: `tintColor` / `titleColor` only (no Android-only props on the native view).
 */
export function AppRefreshControl({
  tintColor,
  titleColor,
  colors: progressColors,
  progressBackgroundColor,
  ...rest
}: RefreshControlProps) {
  if (Platform.OS === "ios") {
    return (
      <RefreshControl
        {...rest}
        tintColor={tintColor ?? SPINNER}
        titleColor={titleColor ?? tintColor ?? SPINNER}
      />
    );
  }

  return (
    <RefreshControl
      {...rest}
      colors={progressColors ?? [SPINNER]}
      progressBackgroundColor={progressBackgroundColor ?? colors.surface}
    />
  );
}
