import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { colors } from "./styles";

const TRACK_H = 6;
const FILL_H = 12;
const WRAP_H = 14;
/** Horizontal distance after which the wave pattern repeats (seamless loop). */
const WAVE_LOOP = 36;

/** Soft wave tile for the highlight layer (top of the fill). */
const WAVE_PATH_D =
  "M0 0 Q6 3.2 12 0 Q18 -3.2 24 0 Q30 3.2 36 0 L36 5 L0 5 Z";

function WaveStripSvg() {
  return (
    <Svg width={WAVE_LOOP * 4} height={6} viewBox={`0 0 ${WAVE_LOOP * 4} 6`}>
      {[0, 1, 2, 3].map((i) => (
        <G key={i} transform={`translate(${i * WAVE_LOOP},0)`}>
          <Path
            d={WAVE_PATH_D}
            fill={i % 2 === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.12)"}
          />
        </G>
      ))}
    </Svg>
  );
}

type SnippetProgressBarProps = {
  /** 0–1 playback position when active */
  progress: number;
  /** Whether this row is the active preview */
  active: boolean;
  /** Animate the wave when audio is playing */
  playing: boolean;
};

export function SnippetProgressBar({ progress, active, playing }: SnippetProgressBarProps) {
  const pct = active ? Math.round(Math.max(0, Math.min(1, progress)) * 100) : 0;
  const waveX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!playing) {
      waveX.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(waveX, {
        toValue: -WAVE_LOOP,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    loop.start();
    return () => loop.stop();
  }, [playing, waveX]);

  return (
    <View style={styles.wrap}>
      <View style={styles.track} />
      {pct > 0 && (
        <View style={[styles.fillAbsolute, { width: `${pct}%` }]}>
          <View style={styles.fillShadow}>
            <View style={styles.fillClip}>
              {playing ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.waveStrip,
                    { transform: [{ translateX: waveX }] }
                  ]}
                >
                  <WaveStripSvg />
                </Animated.View>
              ) : (
                <View pointerEvents="none" style={styles.waveStrip}>
                  <WaveStripSvg />
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    width: "100%",
    height: WRAP_H,
    justifyContent: "center"
  },
  track: {
    height: TRACK_H,
    width: "100%",
    backgroundColor: "#D6D9E0",
    borderRadius: 999
  },
  fillAbsolute: {
    position: "absolute",
    left: 0,
    top: (WRAP_H - FILL_H) / 2,
    height: FILL_H,
    zIndex: 2
  },
  fillShadow: {
    flex: 1,
    borderRadius: FILL_H / 2,
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOpacity: 0.55,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }
      },
      android: {
        elevation: 5
      },
      default: {}
    })
  },
  fillClip: {
    flex: 1,
    borderRadius: FILL_H / 2,
    overflow: "hidden",
    backgroundColor: colors.primary
  },
  waveStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 6,
    width: WAVE_LOOP * 4
  }
});
