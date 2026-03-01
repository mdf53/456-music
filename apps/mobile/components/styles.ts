import { StyleSheet } from "react-native";

export const colors = {
  background: "#F7F7F9",
  card: "#FFFFFF",
  primary: "#2F5DFF",
  text: "#1D1E20",
  muted: "#5E6A71",
  border: "#E5E7EB"
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
    paddingHorizontal: 20
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  scrollContent: {
    paddingBottom: 32
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  brand: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text
  },
  headerPill: {
    backgroundColor: colors.card,
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
    fontSize: 16,
    color: colors.muted,
    marginBottom: 16
  },
  card: {
    width: "100%",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text
  },
  helperText: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 12
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center"
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600"
  },
  primaryButtonSmall: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "500"
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  circleButtonText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700"
  },
  feedCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8
  },
  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  feedUser: {
    fontWeight: "600",
    color: colors.text
  },
  feedTimestamp: {
    fontSize: 12,
    color: colors.muted
  },
  albumCover: {
    height: 180,
    borderRadius: 16,
    backgroundColor: "#D9E0FF"
  },
  feedSong: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text
  },
  feedArtist: {
    color: colors.muted
  },
  feedCaption: {
    color: colors.text
  },
  feedActions: {
    flexDirection: "row",
    gap: 12
  },
  iconButton: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  iconText: {
    fontSize: 16
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center"
  },
  tabItemHome: {
    backgroundColor: colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    marginTop: -20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    flex: 0,
    borderWidth: 3,
    borderColor: colors.card,
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 12
  },
  tabLabelHome: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: "600"
  },
  sectionHeader: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.muted
  },
  tabRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card
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
    gap: 12,
    paddingVertical: 12
  },
  friendInfoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#CBD5F5"
  },
  friendInfo: {
    flex: 1
  },
  friendName: {
    fontWeight: "600",
    color: colors.text
  },
  friendHandle: {
    fontSize: 12,
    color: colors.muted
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#CBD5F5",
    marginBottom: 12
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text
  },
  profileHandle: {
    color: colors.muted,
    marginBottom: 12
  },
  profileStats: {
    flexDirection: "row",
    gap: 24
  },
  statItem: {
    alignItems: "center"
  },
  statNumber: {
    fontWeight: "700",
    color: colors.text
  },
  statLabel: {
    fontSize: 12,
    color: colors.muted
  },
  favoriteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  favoriteCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center"
  },
  favoriteThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#E4E9FF",
    marginBottom: 8
  },
  favoriteLabel: {
    fontSize: 12,
    color: colors.muted
  },
  blurredCard: {
    height: 80,
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    marginBottom: 12
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10
  },
  songRowActive: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingHorizontal: 8
  },
  albumThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#C7D2FE"
  },
  songInfo: {
    flex: 1
  },
  songTitle: {
    fontWeight: "600",
    color: colors.text
  },
  songArtist: {
    color: colors.muted,
    fontSize: 12
  },
  songPick: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border
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
    backgroundColor: colors.card,
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
    paddingVertical: 12
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
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 20
  },
  popupCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  popupBody: {
    gap: 12
  }
});
