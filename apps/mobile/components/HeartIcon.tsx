import Svg, { Path } from "react-native-svg";
import { colors } from "./styles";

export function HeartIcon({ filled }: { filled?: boolean }) {
  const fill = filled ? colors.primary : "none";
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20.2 4.4 13.34A4.98 4.98 0 0 1 3 9.78C3 6.9 5.18 5 7.78 5c1.6 0 3.16.76 4.22 2.02A5.4 5.4 0 0 1 16.22 5C18.82 5 21 6.9 21 9.78c0 1.34-.52 2.6-1.4 3.56L12 20.2Z"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinejoin="round"
        fill={fill}
      />
    </Svg>
  );
}
