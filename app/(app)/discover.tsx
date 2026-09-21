import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { demoProfiles, type DemoProfile } from "@/constants/demo-profiles";
import { colors } from "@/constants/theme";

type MatchView = "match" | "profile";
type SwipeDirection = "left" | "right";

const SWIPE_TRIGGER = 100;

export default function DiscoverScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [likedProfileIds, setLikedProfileIds] = useState<string[]>([]);
  const [matchProfile, setMatchProfile] = useState<DemoProfile | null>(null);
  const [matchView, setMatchView] = useState<MatchView>("match");
  const [isProfileDetailsOpen, setIsProfileDetailsOpen] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const profile = demoProfiles[activeIndex];
  const profileRef = useRef(profile);
  const pendingAddFriendProfileRef = useRef<DemoProfile | null>(null);
  const swipePosition = useRef(new Animated.Value(0)).current;
  const isSwipeAnimating = useRef(false);

  profileRef.current = profile;

  useEffect(() => {
    setPhotoIndex(0);
  }, [activeIndex]);

  const moveToNext = () => {
    setActiveIndex((index) => (index + 1) % demoProfiles.length);
  };

  const handleAddFriend = (targetProfile: DemoProfile) => {
    setLikedProfileIds((likedIds) =>
      likedIds.includes(targetProfile.id) ? likedIds : [...likedIds, targetProfile.id]
    );

    pendingAddFriendProfileRef.current = targetProfile;
    setMatchView("profile");
    setMatchProfile(targetProfile);
  };

  const resetSwipe = () => {
    isSwipeAnimating.current = false;
    setSwipeX(0);
    Animated.spring(swipePosition, {
      damping: 18,
      stiffness: 220,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const completeSwipe = (direction: SwipeDirection) => {
    if (isSwipeAnimating.current) return;

    isSwipeAnimating.current = true;
    const targetX = direction === "left" ? -520 : 520;
    Animated.timing(swipePosition, {
      duration: 180,
      toValue: targetX,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;

      swipePosition.setValue(0);
      setSwipeX(0);
      isSwipeAnimating.current = false;
      if (direction === "left") {
        moveToNext();
      } else {
        handleAddFriend(profileRef.current);
      }
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderGrant: () => {
        swipePosition.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        swipePosition.setValue(gestureState.dx);
        setSwipeX(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) < SWIPE_TRIGGER) {
          resetSwipe();
          return;
        }

        completeSwipe(gestureState.dx < 0 ? "left" : "right");
      },
      onPanResponderTerminate: resetSwipe,
    })
  ).current;

  const closeMatch = () => {
    pendingAddFriendProfileRef.current = null;
    setMatchProfile(null);
    setMatchView("match");
  };

  const advanceFromProfilePanel = () => {
    const pendingProfile = pendingAddFriendProfileRef.current;
    if (!pendingProfile) return;

    pendingAddFriendProfileRef.current = null;
    isSwipeAnimating.current = false;
    swipePosition.stopAnimation();
    swipePosition.setValue(0);
    setSwipeX(0);
    setPhotoIndex(0);
    setMatchProfile(null);
    setMatchView("match");

    const pendingProfileIndex = demoProfiles.findIndex(({ id }) => id === pendingProfile.id);
    const nextProfileIndex =
      pendingProfileIndex === -1
        ? (activeIndex + 1) % demoProfiles.length
        : (pendingProfileIndex + 1) % demoProfiles.length;
    setActiveIndex(nextProfileIndex);
  };

  const showInstagram = () => {
    if (!matchProfile) return;
    Alert.alert("Instagram de demo", `${matchProfile.instagram}\nNo se abrió ninguna app externa.`);
  };

  const showCopyFeedback = () => {
    if (!matchProfile) return;
    Alert.alert("Copiar @", `${matchProfile.instagram}\nDisponible solo dentro de esta demo local.`);
  };

  const changePhoto = (direction: SwipeDirection) => {
    setPhotoIndex((index) =>
      direction === "right"
        ? (index + 1) % profile.images.length
        : (index - 1 + profile.images.length) % profile.images.length
    );
  };

  const cardRotation = swipePosition.interpolate({
    inputRange: [-320, 0, 320],
    outputRange: ["-8deg", "0deg", "8deg"],
  });

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Pressable accessibilityLabel="Open filters" style={styles.filterButton}>
            <Feather color={colors.text} name="sliders" size={22} />
          </Pressable>
          <View style={styles.headerSpacer} />
          <View style={styles.streakPill}>
            <Text style={styles.streakIcon}>✦</Text>
            <Text style={styles.streakText}>50</Text>
          </View>
        </View>

        <View style={styles.storyProgress}>
          {profile.images.map((_, index) => (
            <View
              key={`${profile.id}-photo-${index}`}
              style={[styles.storyLine, index === photoIndex && styles.storyLineActive]}
            />
          ))}
        </View>

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.profileCard,
            { transform: [{ translateX: swipePosition }, { rotate: cardRotation }] },
          ]}
        >
          <Image source={profile.images[photoIndex]} style={styles.profileImage} />
          <View pointerEvents="none" style={styles.imageShade} />

          <Pressable
            accessibilityLabel="Previous profile photo"
            onPress={() => changePhoto("left")}
            style={styles.photoHotspotLeft}
          />
          <Pressable
            accessibilityLabel="Open profile details"
            onPress={() => setIsProfileDetailsOpen(true)}
            style={styles.photoHotspotCenter}
          />
          <Pressable
            accessibilityLabel="Next profile photo"
            onPress={() => changePhoto("right")}
            style={styles.photoHotspotRight}
          />

          <View pointerEvents="box-none" style={styles.cardTopRow}>
            <View style={styles.tagPill}>
              <Text style={styles.tagClose}>×</Text>
              <Text style={styles.tagText}>{profile.tag}</Text>
            </View>
            <Pressable accessibilityLabel="Report profile" style={styles.reportButton}>
              <Feather color="#FFFFFF" name="flag" size={18} />
            </Pressable>
          </View>
          <View pointerEvents="none" style={styles.profileMeta}>
            <Text style={styles.profileName}>{profile.name} {profile.age}</Text>
            <Text style={styles.profileCountry}>📍  {profile.city}</Text>
          </View>
          <SwipeFeedback swipeX={swipeX} />
        </Animated.View>

        <View style={styles.actionRow}>
          <View style={[styles.actionButton, styles.skipButton]}>
            <Feather color="#A5AAB4" name="rotate-ccw" size={26} />
          </View>
          <View style={[styles.actionButton, styles.likeButton]}>
            <Feather color="#FFFFFF" name="star" size={30} />
          </View>
          <View style={[styles.actionButton, styles.sendButton]}>
            <Feather color="#FFFFFF" name="send" size={25} />
          </View>
        </View>
      </View>

      <MatchModal
        matchProfile={matchProfile}
        matchView={matchView}
        onClose={closeMatch}
        onTopClose={matchView === "profile" ? advanceFromProfilePanel : closeMatch}
        onCopy={showCopyFeedback}
        onOpenProfile={() => setMatchView("profile")}
        onShowMatch={() => setMatchView("match")}
        onShowInstagram={showInstagram}
      />
      <ProfileDetailsModal
        photoIndex={photoIndex}
        profile={isProfileDetailsOpen ? profile : null}
        onClose={() => setIsProfileDetailsOpen(false)}
      />
    </SafeAreaView>
  );
}

function SwipeFeedback({ swipeX }: { swipeX: number }) {
  if (Math.abs(swipeX) < 2) return null;

  const direction: SwipeDirection = swipeX < 0 ? "left" : "right";
  const intensity = Math.min(Math.abs(swipeX) / SWIPE_TRIGGER, 1);
  const feedbackColor = direction === "left" ? colors.primaryDark : colors.success;
  const label = direction === "left" ? "SKIP" : "ADD FRIEND";

  return (
    <View pointerEvents="none" style={styles.swipeFeedback}>
      {[1, 0.84, 0.68, 0.52, 0.36, 0.2].map((stop, index) => (
        <View
          key={stop}
          style={[
            styles.gradientStrip,
            direction === "left" ? styles.gradientStripRight : styles.gradientStripLeft,
            {
              backgroundColor: feedbackColor,
              opacity: intensity * (0.035 + index * 0.025),
              width: `${Math.max(0.04, intensity * stop) * 100}%`,
            },
          ]}
        />
      ))}
      <View
        style={[
          styles.swipeLabel,
          direction === "left" ? styles.swipeLabelRight : styles.swipeLabelLeft,
          { borderColor: feedbackColor, opacity: intensity },
        ]}
      >
        <Text style={[styles.swipeLabelText, { color: feedbackColor }]}>{label}</Text>
      </View>
    </View>
  );
}

type MatchModalProps = {
  matchProfile: DemoProfile | null;
  matchView: MatchView;
  onClose: () => void;
  onTopClose: () => void;
  onCopy: () => void;
  onOpenProfile: () => void;
  onShowMatch: () => void;
  onShowInstagram: () => void;
};

function MatchModal({
  matchProfile,
  matchView,
  onClose,
  onTopClose,
  onCopy,
  onOpenProfile,
  onShowMatch,
  onShowInstagram,
}: MatchModalProps) {
  if (!matchProfile) return null;

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <View style={styles.modalBackdrop}>
        <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafeArea}>
          <View style={styles.matchSheet}>
            <Pressable
              accessibilityLabel="Close match"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onTopClose}
              style={styles.modalCloseButton}
            >
              <Feather color={colors.text} name="x" size={22} />
            </Pressable>

            {matchView === "match" ? (
              <MatchContent
                onClose={onClose}
                onCopy={onCopy}
                onOpenProfile={onOpenProfile}
                onShowInstagram={onShowInstagram}
                profile={matchProfile}
              />
            ) : (
              <ProfileContent
                onClose={onClose}
                onCopy={onCopy}
                onShowInstagram={onShowInstagram}
                onShowMatch={onShowMatch}
                profile={matchProfile}
              />
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

type MatchContentProps = {
  profile: DemoProfile;
  onCopy: () => void;
  onOpenProfile: () => void;
  onShowInstagram: () => void;
  onClose: () => void;
};

function MatchContent({
  profile,
  onCopy,
  onOpenProfile,
  onShowInstagram,
  onClose,
}: MatchContentProps) {
  return (
    <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.matchEyebrow}>IT&apos;S A MATCH</Text>
      <Text style={styles.matchTitle}>The court brought you together.</Text>
      <View style={styles.matchAvatarWrap}>
        <Image source={profile.images[0]} style={styles.matchAvatar} />
        <View style={styles.matchSparkle}>
          <Text style={styles.matchSparkleText}>✦</Text>
        </View>
      </View>
      <Text style={styles.matchName}>{profile.name}, {profile.age}</Text>
      <Text style={styles.matchCity}>📍  {profile.city}</Text>
      <Text style={styles.matchBio}>{profile.bio}</Text>
      <InterestList interests={profile.interests} />
      <ActionPair onCopy={onCopy} onShowInstagram={onShowInstagram} />
      <Pressable onPress={onOpenProfile} style={styles.outlineAction}>
        <Text style={styles.outlineActionText}>Abrir perfil</Text>
        <Feather color={colors.text} name="arrow-up-right" size={18} />
      </Pressable>
      <Pressable onPress={onClose} style={styles.returnAction}>
        <Text style={styles.returnActionText}>Volver a Discover</Text>
      </Pressable>
    </ScrollView>
  );
}

type ProfileContentProps = {
  profile: DemoProfile;
  onCopy: () => void;
  onShowMatch: () => void;
  onShowInstagram: () => void;
  onClose: () => void;
};

function ProfileContent({
  profile,
  onCopy,
  onShowMatch,
  onShowInstagram,
  onClose,
}: ProfileContentProps) {
  return (
    <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
      <Pressable onPress={onShowMatch} style={styles.backToMatch}>
        <Feather color={colors.text} name="arrow-left" size={18} />
        <Text style={styles.backToMatchText}>Back to match</Text>
      </Pressable>
      <Text style={styles.profileEyebrow}>DEMO PROFILE</Text>
      <DetailGallery photoIndex={0} profile={profile} />
      <View style={styles.detailIdentityRow}>
        <View style={styles.detailIdentityCopy}>
          <Text style={styles.detailName}>{profile.name}, {profile.age}</Text>
          <Text style={styles.detailNationality}>🌎  {profile.nationality}</Text>
        </View>
        <Pressable
          accessibilityLabel="Messages unavailable in demo"
          accessibilityRole="button"
          style={styles.messageButton}
        >
          <Feather color={colors.primaryDark} name="message-circle" size={22} />
        </Pressable>
      </View>
      <Text style={styles.matchCity}>📍  {profile.city}</Text>
      <Text style={styles.detailBio}>{profile.bio}</Text>
      <Text style={styles.interestsTitle}>Interests</Text>
      <InterestList interests={profile.interests} />
      <Text style={styles.instagramLabel}>Instagram</Text>
      <Text style={styles.instagramHandle}>{profile.instagram}</Text>
      <ActionPair onCopy={onCopy} onShowInstagram={onShowInstagram} />
      <Pressable onPress={onClose} style={styles.returnAction}>
        <Text style={styles.returnActionText}>Volver a Discover</Text>
      </Pressable>
    </ScrollView>
  );
}

function ProfileDetailsModal({
  photoIndex,
  profile,
  onClose,
}: {
  photoIndex: number;
  profile: DemoProfile | null;
  onClose: () => void;
}) {
  if (!profile) return null;

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <View style={styles.modalBackdrop}>
        <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafeArea}>
          <View style={styles.matchSheet}>
            <Pressable
              accessibilityLabel="Back to Discover"
              hitSlop={10}
              onPress={onClose}
              style={styles.detailsBackButton}
            >
              <Feather color={colors.text} name="arrow-left" size={22} />
            </Pressable>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.profileEyebrow}>ACTIVE PROFILE</Text>
              <DetailGallery photoIndex={photoIndex} profile={profile} />
              <View style={styles.detailIdentityRow}>
                <View style={styles.detailIdentityCopy}>
                  <Text style={styles.detailName}>{profile.name}, {profile.age}</Text>
                  <Text style={styles.detailNationality}>🌎  {profile.nationality}</Text>
                </View>
                <Pressable
                  accessibilityLabel="Messages unavailable in demo"
                  accessibilityRole="button"
                  style={styles.messageButton}
                >
                  <Feather color={colors.primaryDark} name="message-circle" size={22} />
                </Pressable>
              </View>
              <Text style={styles.matchCity}>📍  {profile.city}</Text>
              <Text style={styles.detailTag}>{profile.tag}</Text>
              <Text style={styles.detailBio}>{profile.bio}</Text>
              <Text style={styles.interestsTitle}>Interests</Text>
              <InterestList interests={profile.interests} />
              <Text style={styles.instagramLabel}>Instagram</Text>
              <Text style={styles.instagramHandle}>{profile.instagram}</Text>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function DetailGallery({ profile, photoIndex }: { profile: DemoProfile; photoIndex: number }) {
  const nextPhotoIndex = (photoIndex + 1) % profile.images.length;
  const lastPhotoIndex = (photoIndex + 2) % profile.images.length;

  return (
    <View style={styles.detailGallery}>
      <Image source={profile.images[photoIndex]} style={styles.detailHeroImage} />
      <View style={styles.detailThumbColumn}>
        <Image source={profile.images[nextPhotoIndex]} style={styles.detailThumbImage} />
        <Image source={profile.images[lastPhotoIndex]} style={styles.detailThumbImage} />
      </View>
    </View>
  );
}

function InterestList({ interests }: { interests: string[] }) {
  return (
    <View style={styles.interestList}>
      {interests.map((interest) => (
        <View key={interest} style={styles.interestPill}>
          <Text style={styles.interestText}>{interest}</Text>
        </View>
      ))}
    </View>
  );
}

function ActionPair({
  onCopy,
  onShowInstagram,
}: {
  onCopy: () => void;
  onShowInstagram: () => void;
}) {
  return (
    <View style={styles.modalActions}>
      <Pressable onPress={onShowInstagram} style={styles.primaryModalAction}>
        <Feather color="#FFFFFF" name="instagram" size={17} />
        <Text style={styles.primaryModalActionText}>Ver Instagram</Text>
      </Pressable>
      <Pressable onPress={onCopy} style={styles.secondaryModalAction}>
        <Feather color={colors.text} name="copy" size={17} />
        <Text style={styles.secondaryModalActionText}>Copiar @</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  container: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  header: { alignItems: "center", flexDirection: "row", gap: 13, paddingHorizontal: 5 },
  title: { color: colors.text, fontSize: 38, fontWeight: "900", letterSpacing: -1 },
  filterButton: { padding: 3 },
  headerSpacer: { flex: 1 },
  streakPill: { alignItems: "center", backgroundColor: colors.blue, borderRadius: 22, flexDirection: "row", gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  streakIcon: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  streakText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  storyProgress: { flexDirection: "row", gap: 10, marginBottom: 10, marginTop: 17, paddingHorizontal: 27 },
  storyLine: { backgroundColor: "#D9DDE3", borderRadius: 5, flex: 1, height: 4 },
  storyLineActive: { backgroundColor: colors.text },
  profileCard: { borderRadius: 23, flex: 1, overflow: "hidden", position: "relative" },
  profileImage: { height: "100%", width: "100%" },
  imageShade: { backgroundColor: "rgba(0, 0, 0, 0.16)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  photoHotspotLeft: { bottom: 0, left: 0, position: "absolute", top: 0, width: "27%" },
  photoHotspotCenter: { bottom: 0, left: "27%", position: "absolute", right: "27%", top: 0 },
  photoHotspotRight: { bottom: 0, position: "absolute", right: 0, top: 0, width: "27%" },
  cardTopRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", left: 8, position: "absolute", right: 17, top: 28 },
  tagPill: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 30, flexDirection: "row", gap: 7, paddingHorizontal: 12, paddingVertical: 8 },
  tagClose: { color: colors.text, fontSize: 22, lineHeight: 20 },
  tagText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  reportButton: { padding: 4 },
  profileMeta: { bottom: 28, left: 25, position: "absolute" },
  profileName: { color: "#FFFFFF", fontSize: 39, fontWeight: "900", letterSpacing: -0.8 },
  profileCountry: { color: "#FFFFFF", fontSize: 18, marginTop: 8 },
  swipeFeedback: { bottom: 0, left: 0, overflow: "hidden", position: "absolute", right: 0, top: 0 },
  gradientStrip: { bottom: 0, position: "absolute", top: 0 },
  gradientStripLeft: { left: 0 },
  gradientStripRight: { right: 0 },
  swipeLabel: { borderRadius: 10, borderWidth: 3, paddingHorizontal: 12, paddingVertical: 7, position: "absolute", top: "42%" },
  swipeLabelLeft: { left: 27, transform: [{ rotate: "-12deg" }] },
  swipeLabelRight: { right: 22, transform: [{ rotate: "12deg" }] },
  swipeLabelText: { fontSize: 24, fontWeight: "900", letterSpacing: 1.3 },
  actionRow: { alignItems: "center", flexDirection: "row", gap: 18, justifyContent: "center", paddingVertical: 12 },
  actionButton: { alignItems: "center", borderRadius: 99, height: 60, justifyContent: "center", width: 60 },
  skipButton: { backgroundColor: "#ECF0F5" },
  likeButton: { backgroundColor: "#6974E9", height: 72, width: 72 },
  sendButton: { backgroundColor: colors.pink },
  modalBackdrop: { backgroundColor: "rgba(38, 34, 39, 0.48)", flex: 1, justifyContent: "flex-end" },
  modalSafeArea: { flex: 1, justifyContent: "flex-end" },
  matchSheet: { backgroundColor: colors.background, borderTopLeftRadius: 34, borderTopRightRadius: 34, maxHeight: "94%", minHeight: "72%", overflow: "hidden", paddingHorizontal: 22, paddingTop: 23 },
  modalCloseButton: { alignItems: "center", alignSelf: "flex-end", backgroundColor: colors.surfaceAlt, borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  detailsBackButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.surfaceAlt, borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  modalContent: { alignItems: "center", paddingBottom: 28, paddingTop: 12 },
  matchEyebrow: { color: colors.primaryDark, fontSize: 13, fontWeight: "900", letterSpacing: 2, marginTop: 4 },
  matchTitle: { color: colors.text, fontSize: 29, fontWeight: "900", letterSpacing: -0.7, lineHeight: 33, marginTop: 10, maxWidth: 310, textAlign: "center" },
  matchAvatarWrap: { marginTop: 22, position: "relative" },
  matchAvatar: { borderColor: colors.primaryMuted, borderRadius: 110, borderWidth: 8, height: 156, width: 156 },
  matchSparkle: { alignItems: "center", backgroundColor: colors.primary, borderColor: colors.background, borderRadius: 99, borderWidth: 4, bottom: 2, height: 42, justifyContent: "center", position: "absolute", right: 2, width: 42 },
  matchSparkleText: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  matchName: { color: colors.text, fontSize: 28, fontWeight: "900", marginTop: 13 },
  matchCity: { color: colors.muted, fontSize: 16, marginTop: 5 },
  matchBio: { color: colors.text, fontSize: 15, lineHeight: 21, marginTop: 16, maxWidth: 330, textAlign: "center" },
  interestList: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 15 },
  interestPill: { backgroundColor: colors.primaryMuted, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 7 },
  interestText: { color: colors.primaryDark, fontSize: 12, fontWeight: "800" },
  modalActions: { alignSelf: "stretch", gap: 10, marginTop: 22 },
  primaryModalAction: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 17, flexDirection: "row", gap: 10, justifyContent: "center", minHeight: 54 },
  primaryModalActionText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  secondaryModalAction: { alignItems: "center", backgroundColor: colors.surfaceAlt, borderRadius: 17, flexDirection: "row", gap: 10, justifyContent: "center", minHeight: 54 },
  secondaryModalActionText: { color: colors.text, fontSize: 16, fontWeight: "900" },
  outlineAction: { alignItems: "center", borderColor: colors.border, borderRadius: 17, borderWidth: 1.5, flexDirection: "row", gap: 9, justifyContent: "center", marginTop: 10, minHeight: 54, width: "100%" },
  outlineActionText: { color: colors.text, fontSize: 16, fontWeight: "800" },
  returnAction: { marginTop: 17, paddingHorizontal: 10, paddingVertical: 8 },
  returnActionText: { color: colors.primaryDark, fontSize: 15, fontWeight: "900" },
  backToMatch: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 7, marginBottom: 20 },
  backToMatchText: { color: colors.text, fontSize: 14, fontWeight: "800" },
  profileEyebrow: { alignSelf: "flex-start", color: colors.primaryDark, fontSize: 12, fontWeight: "900", letterSpacing: 1.6 },
  detailGallery: { alignSelf: "stretch", flexDirection: "row", gap: 9, height: 210, marginTop: 14 },
  detailHeroImage: { borderRadius: 22, flex: 1.65, height: "100%" },
  detailThumbColumn: { flex: 1, gap: 9 },
  detailThumbImage: { borderRadius: 17, flex: 1, width: "100%" },
  detailIdentityRow: { alignItems: "center", alignSelf: "stretch", flexDirection: "row", gap: 12, marginTop: 15 },
  detailIdentityCopy: { flex: 1 },
  detailName: { color: colors.text, fontSize: 28, fontWeight: "900" },
  detailNationality: { color: colors.muted, fontSize: 16, marginTop: 4 },
  messageButton: { alignItems: "center", backgroundColor: colors.primaryMuted, borderRadius: 16, height: 52, justifyContent: "center", width: 52 },
  detailBio: { color: colors.text, fontSize: 16, lineHeight: 23, marginTop: 17, textAlign: "center" },
  detailTag: { color: colors.primaryDark, fontSize: 14, fontWeight: "900", marginTop: 11 },
  interestsTitle: { alignSelf: "flex-start", color: colors.text, fontSize: 17, fontWeight: "900", marginTop: 23 },
  instagramLabel: { color: colors.muted, fontSize: 13, fontWeight: "800", marginTop: 24, textTransform: "uppercase" },
  instagramHandle: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 5 },
});
