import { StyleSheet } from "react-native";

export const colors = {
  background: "#1f2024",
  surface: "#2b2d33",
  surfaceSoft: "#34363e",
  surfaceElevated: "#383b44",
  primary: "#d8f26a",
  text: "#f2f2f3",
  muted: "#a5a8b0",
  border: "#3e414a",
  black: "#050506"
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  body: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: 8
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 26,
    paddingTop: 8
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  header: {
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text
  },
  headerPill: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border
  },
  headerPillText: {
    color: colors.muted,
    fontSize: 12
  },
  subtitle: {
    fontSize: 17,
    color: colors.muted,
    lineHeight: 24
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 8
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: "#262830"
  },
  helperText: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 12
  },
  errorText: {
    color: "#C02626",
    marginBottom: 12,
    textAlign: "center"
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center"
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 220
  },
  primaryButtonDisabled: {
    opacity: 0.7
  },
  primaryButtonText: {
    color: "#111213",
    fontWeight: "700",
    fontSize: 16
  },
  primaryButtonSmall: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center"
  },
  primaryButtonSmallText: {
    color: "#111213",
    fontWeight: "700",
    fontSize: 13
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: colors.surfaceSoft
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "500"
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  circleButtonText: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "700"
  },
  feedCard: {
    backgroundColor: colors.surface,
    borderRadius: 13,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 6
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  feedUser: {
    fontWeight: "500",
    color: colors.text,
    fontSize: 14
  },
  feedTimestamp: {
    fontSize: 12,
    color: colors.primary,
    lineHeight: 16,
    fontWeight: "600",
    backgroundColor: "rgba(216, 242, 106, 0.14)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  albumCover: {
    width: 92,
    height: 92,
    borderRadius: 10,
    backgroundColor: "#c9c9cb",
    alignItems: "center",
    justifyContent: "center"
  },
  feedSong: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text
  },
  feedArtist: {
    color: colors.text,
    fontSize: 14,
    marginTop: -2
  },
  feedCaption: {
    color: colors.text,
    fontSize: 14
  },
  feedActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  iconButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  iconText: {
    fontSize: 12,
    color: colors.primary
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.black,
    borderRadius: 20,
    marginHorizontal: 6,
    marginBottom: 8,
    overflow: "hidden",
    position: "relative",
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  tabBarInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
    flex: 1
  },
  homeFab: {
    position: "relative",
    left: 0,
    bottom: 0,
    transform: [{ translateX: 0 }],
    zIndex: 1
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center"
  },
  tabItemNav: {
    flex: 1,
    minWidth: 0
  },
  tabItemHome: {
    backgroundColor: "transparent",
    width: "auto",
    height: "auto",
    borderRadius: 12,
    marginTop: 0,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    flex: 1,
    zIndex: 1,
    borderWidth: 0
  },
  tabItemActive: {
    backgroundColor: "rgba(216, 242, 106, 0.14)",
    borderRadius: 12
  },
  tabLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3
  },
  tabLabelHome: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: "600"
  },
  sectionHeader: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text
  },
  sectionSubtitle: {
    fontSize: 15,
    color: colors.muted
  },
  tabRow: {
    flexDirection: "row",
    gap: 0,
    marginBottom: 0
  },
  tabChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors.surfaceSoft,
    minWidth: 104,
    alignItems: "center"
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tabChipText: {
    color: colors.text,
    fontWeight: "500"
  },
  tabChipTextActive: {
    color: "#FFFFFF"
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9
  },
  friendInfoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border
  },
  friendInfo: {
    flex: 1
  },
  friendName: {
    fontWeight: "600",
    color: colors.text,
    fontSize: 16
  },
  friendHandle: {
    fontSize: 14,
    color: colors.muted
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 18,
    marginTop: 6
  },
  avatarLarge: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: colors.primary,
    marginBottom: 12
  },
  profileName: {
    fontSize: 30,
    fontWeight: "500",
    color: colors.text
  },
  profileHandle: {
    color: colors.muted,
    marginBottom: 10,
    fontSize: 16
  },
  profileStats: {
    flexDirection: "row",
    gap: 8
  },
  statItem: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  statNumber: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 12
  },
  statLabel: {
    fontSize: 12,
    color: colors.muted,
    marginTop: -3
  },
  favoriteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  favoriteCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center"
  },
  favoriteThumb: {
    width: 80,
    height: 80,
    borderRadius: 0,
    backgroundColor: "#c9c9cb",
    marginBottom: 8
  },
  favoriteLabel: {
    fontSize: 13,
    color: colors.text,
    textAlign: "center"
  },
  blurredCard: {
    height: 154,
    width: "100%",
    borderRadius: 14,
    backgroundColor: colors.surface,
    marginBottom: 12,
    opacity: 0.25
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8
  },
  songRowActive: {
    backgroundColor: "#30343d",
    borderRadius: 12,
    paddingHorizontal: 8
  },
  albumThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#c9c9cb",
    alignItems: "center",
    justifyContent: "center"
  },
  albumThumbImage: {
    width: 36,
    height: 36,
    borderRadius: 8
  },
  songInfo: {
    flex: 1
  },
  songTitle: {
    fontWeight: "500",
    color: colors.text,
    fontSize: 17
  },
  songArtist: {
    color: colors.muted,
    fontSize: 13
  },
  songPick: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  backButtonText: {
    color: colors.text,
    fontSize: 12
  },
  headerSpacer: {
    width: 50
  },
  commentList: {
    flex: 1,
    marginTop: 12
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12
  },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  commentUser: {
    fontSize: 12,
    color: colors.muted
  },
  commentText: {
    color: colors.text
  },
  commentInputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 12,
    width: "100%"
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text
  },
  commentDraftInput: {
    flex: 1
  },
  popupOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(3, 3, 4, 0.72)",
    justifyContent: "center",
    padding: 20
  },
  popupCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.36,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  popupBody: {
    gap: 12
  },
  pageTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "500",
    marginBottom: 8
  },
  pageTitleAccent: {
    color: colors.primary,
    fontWeight: "700"
  },
  pageDivider: {
    height: 1,
    backgroundColor: "#111216",
    marginBottom: 12
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292b32",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 12
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14
  },
  searchGo: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700"
  },
  homeSectionTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "700"
  },
  homeCardContentRow: {
    flexDirection: "row",
    gap: 10
  },
  musicMeta: {
    flex: 1,
    justifyContent: "center",
    gap: 3
  },
  progressTrack: {
    height: 2,
    backgroundColor: "#ececed",
    borderRadius: 2,
    marginTop: 5,
    width: "100%"
  },
  progressFill: {
    height: 2,
    width: "28%",
    borderRadius: 2,
    backgroundColor: colors.primary
  },
  playDot: {
    marginTop: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: colors.primary,
    marginLeft: 2
  },
  pauseIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  pauseBar: {
    width: 3,
    height: 10,
    borderRadius: 1,
    backgroundColor: colors.primary
  },
  playDotActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(112, 94, 255, 0.12)"
  },
  miniCount: {
    color: colors.text,
    fontSize: 12
  },
  blurStateWrap: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 24,
    gap: 8
  },
  blurOverlay: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    bottom: 74,
    backgroundColor: "rgba(20, 21, 24, 0.4)",
    borderRadius: 16
  },
  fixedCtaWrap: {
    alignItems: "center",
    marginTop: -48
  },
  heroTitle: {
    color: colors.text,
    fontSize: 42,
    lineHeight: 46,
    textAlign: "left",
    width: "100%",
    fontWeight: "500"
  },
  heroAccent: {
    color: colors.primary,
    fontWeight: "700"
  },
  heroButtonWrap: {
    width: "100%",
    marginTop: 32,
    alignItems: "center"
  },
  onboardPanel: {
    width: "100%",
    marginTop: 28,
    paddingTop: 8
  },
  subhead: {
    color: colors.primary,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "500",
    marginBottom: 20
  },
  sectionBlock: {
    borderTopWidth: 1,
    borderTopColor: "#111216",
    paddingTop: 20,
    marginTop: 14
  },
  sectionHead: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700"
  },
  sectionCopy: {
    color: colors.text,
    fontSize: 16,
    marginTop: -1
  },
  sectionHint: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 10
  },
  friendScroller: {
    backgroundColor: "rgba(96, 102, 114, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  friendChip: {
    width: 88,
    alignItems: "center",
    marginRight: 8
  },
  friendCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6
  },
  friendChipName: {
    color: colors.text,
    fontSize: 11,
    textAlign: "center"
  },
  friendsTrack: {
    marginTop: 6,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 3,
    width: "60%"
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8
  },
  gridItem: {
    flex: 1,
    alignItems: "center"
  },
  gridThumb: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#c9c9cb",
    marginBottom: 4
  },
  gridTitle: {
    color: colors.text,
    fontSize: 11,
    textAlign: "center"
  },
  gridSub: {
    color: colors.text,
    fontSize: 11,
    marginTop: -2,
    textAlign: "center"
  },
  profileSection: {
    marginTop: 0,
    backgroundColor: "rgba(97, 101, 110, 0.45)",
    marginHorizontal: -18,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18
  },
  bigSectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 8
  },
  profileGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 4
  },
  profileGridItem: {
    flex: 1,
    alignItems: "center"
  },
  profileThumb: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#c9c9cb",
    marginBottom: 5
  },
  profileGridLabel: {
    color: colors.text,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 14
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#22242b",
    marginVertical: 10
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  tinyAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.muted
  },
  feedCaptionSmall: {
    color: colors.text,
    fontSize: 12
  },
  addSongTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4
  },
  captionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    marginTop: 10
  },
  captionIcon: {
    color: colors.primary,
    fontSize: 18,
    marginRight: 10
  },
  captionText: {
    color: colors.text,
    fontSize: 14
  },
  centerButtonWrap: {
    alignItems: "center",
    marginTop: 20
  },
  overlayBlurCard: {
    opacity: 0.2
  },
  selectionDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 8
  },
  followStatsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6
  },
  slimChip: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  slimChipText: {
    color: colors.text,
    fontSize: 10
  },
  profileAction: {
    marginTop: 10,
    minWidth: 140
  },
  welcomeScreen: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 36,
    paddingBottom: 40,
    overflow: "hidden"
  },
  welcomeOrbTop: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(216, 242, 106, 0.12)",
    top: -90,
    right: -80
  },
  welcomeOrbBottom: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(73, 77, 88, 0.35)",
    bottom: -150,
    left: -130
  },
  welcomeEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 12
  },
  welcomeTitleLine: {
    color: colors.text,
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "700"
  },
  welcomeSubtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 14,
    maxWidth: "90%"
  },
  welcomeButtonWrap: {
    width: "100%",
    alignItems: "center"
  },
  welcomeFootnote: {
    color: colors.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 12
  }
});
