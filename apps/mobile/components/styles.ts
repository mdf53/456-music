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
    paddingTop: 10
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: 8
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 30,
    paddingTop: 10
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  brand: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.2
  },
  headerPill: {
    backgroundColor: colors.surfaceSoft,
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
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 12,
    elevation: 6
  },
  input: {
    borderWidth: 1,
    borderColor: "#4A4E59",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: colors.text,
    backgroundColor: colors.surfaceSoft,
    fontSize: 15
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
    paddingVertical: 14,
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
    fontSize: 15,
    letterSpacing: 0.2
  },
  primaryButtonSmall: {
    backgroundColor: colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 13,
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
    borderRadius: 12,
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
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    shadowColor: colors.black,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 10,
    elevation: 5
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  feedUser: {
    fontWeight: "600",
    color: colors.text,
    fontSize: 15
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
  feedHeroRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  feedAlbumCover: {
    width: 112,
    height: 112,
    borderRadius: 8,
    backgroundColor: "#c9c9cb",
    alignItems: "center",
    justifyContent: "center"
  },
  feedHeroMeta: {
    flex: 1,
    gap: 4,
    paddingTop: 6
  },
  feedSongLarge: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 24
  },
  feedArtistLarge: {
    color: colors.muted,
    fontSize: 14,
    opacity: 1
  },
  progressTrackLockedInCard: {
    height: 3,
    backgroundColor: "#D6D9E0",
    borderRadius: 999,
    marginTop: 8,
    width: "100%"
  },
  playButtonFilled: {
    marginTop: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  playButtonFilledActive: {
    opacity: 0.9
  },
  playTriangleDark: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 9,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#1A1C23",
    marginLeft: 2
  },
  pauseBarDark: {
    width: 3,
    height: 10,
    borderRadius: 1,
    backgroundColor: "#1A1C23"
  },
  feedStatsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 6
  },
  feedStatAction: {
    alignItems: "center",
    justifyContent: "center"
  },
  feedStatCount: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 14,
    marginTop: 2
  },
  feedCaptionInline: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6
  },
  feedCaptionUser: {
    fontWeight: "700"
  },
  feedCardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 8,
    marginBottom: 8
  },
  feedCommentTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 1
  },
  feedCommentPreview: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  feedCommentPreviewUser: {
    fontWeight: "700"
  },
  feedCommentEmpty: {
    color: colors.muted,
    fontSize: 14
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
    backgroundColor: "#11141C",
    borderRadius: 28,
    marginHorizontal: 14,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#1D2230"
  },
  tabBarInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8
  },
  tabItem: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    flex: 1
  },
  tabItemActive: {
    backgroundColor: "#23293B"
  },
  tabItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  tabLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: "700"
  },
  sectionHeader: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted
  },
  profileScreenContent: {
    gap: 10,
    paddingBottom: 22,
    paddingTop: 6
  },
  profileTopPanel: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4
  },
  tabRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 0,
    justifyContent: "center",
    marginTop: 6,
    width: "100%",
    backgroundColor: colors.surfaceSoft,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4
  },
  tabChip: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "transparent",
    alignItems: "center"
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tabChipText: {
    color: colors.text,
    fontWeight: "500",
    fontSize: 14
  },
  tabChipTextActive: {
    color: "#111213",
    fontWeight: "700"
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10
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
    marginBottom: 12,
    marginTop: 4
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 10
  },
  /** Use with `avatarLarge` — clips the photo to the circle. */
  avatarLargeInteractive: {
    overflow: "hidden"
  },
  avatarLargeImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 44
  },
  avatarLargeSavingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 44
  },
  profileName: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.text
  },
  profileHandle: {
    color: colors.muted,
    marginBottom: 8,
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
  popupOverlayBottom: {
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 0
  },
  popupCardBottom: {
    width: "100%",
    maxHeight: "88%",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0
  },
  popupBodyBottom: {
    gap: 12,
    width: "100%"
  },
  addSongRoot: {
    flex: 1
  },
  addSongScroll: {
    flex: 1
  },
  addSongStickyBar: {
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background
  },
  pageTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
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
    backgroundColor: colors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15
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
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "500",
    marginBottom: 14
  },
  sectionBlock: {
    borderTopWidth: 1,
    borderTopColor: "#111216",
    paddingTop: 20,
    marginTop: 14
  },
  sectionHead: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700"
  },
  sectionCopy: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 2
  },
  sectionHint: {
    color: colors.muted,
    fontSize: 13,
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
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14
  },
  bigSectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10
  },
  profileGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12
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
  profileGridSubLabel: {
    opacity: 0.8
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12
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
    borderColor: colors.muted,
    backgroundColor: "#252830",
    alignItems: "center",
    justifyContent: "center"
  },
  tinyAvatarText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: "700"
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
  lockedFeedWrap: {
    flex: 1
  },
  lockedFeedContent: {
    gap: 12,
    paddingBottom: 140,
    paddingTop: 8
  },
  lockedFeedSubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -2,
    marginBottom: 6
  },
  lockedGlassCard: {
    position: "relative",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(205, 211, 224, 0.18)",
    backgroundColor: "rgba(189, 195, 210, 0.12)",
    padding: 12,
    overflow: "hidden"
  },
  lockedReasonBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    backgroundColor: "rgba(14, 16, 23, 0.62)",
    borderWidth: 1,
    borderColor: "rgba(216, 242, 106, 0.3)"
  },
  lockedReasonBadgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "600"
  },
  lockedGlassGlowTop: {
    position: "absolute",
    top: -10,
    left: -30,
    width: 170,
    height: 52,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.14)"
  },
  lockedGlassGlowMid: {
    position: "absolute",
    top: 42,
    right: -24,
    width: 150,
    height: 44,
    borderRadius: 24,
    backgroundColor: "rgba(223, 230, 246, 0.1)"
  },
  lockedGlassGlowBottom: {
    position: "absolute",
    bottom: -18,
    left: 22,
    width: 140,
    height: 40,
    borderRadius: 24,
    backgroundColor: "rgba(245, 249, 255, 0.08)"
  },
  lockedBodyRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  lockedAlbumBlock: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: "rgba(222, 228, 240, 0.26)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)"
  },
  lockedMetaColumn: {
    flex: 1,
    gap: 8
  },
  lockedLineLong: {
    height: 15,
    width: "92%",
    borderRadius: 8,
    backgroundColor: "rgba(229, 235, 247, 0.24)"
  },
  lockedLineShort: {
    height: 13,
    width: "68%",
    borderRadius: 8,
    backgroundColor: "rgba(229, 235, 247, 0.22)"
  },
  lockedLineTiny: {
    height: 12,
    width: "44%",
    borderRadius: 8,
    backgroundColor: "rgba(229, 235, 247, 0.2)"
  },
  lockedActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  lockedPill: {
    width: 62,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(250, 252, 255, 0.22)",
    backgroundColor: "rgba(226, 232, 245, 0.18)"
  },
  lockedCtaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: "rgba(31, 32, 36, 0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(216, 242, 106, 0.15)"
  },
  lockedCtaHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 8
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
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border
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
