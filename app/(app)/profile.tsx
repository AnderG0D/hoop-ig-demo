import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import {
  formatProfileHandle,
  getProfileByUserId,
  getStoredProfileDraft,
} from "@/lib/profile";
import type { ProfileDraft, ProfileRecord } from "@/types/profile";

const photoDecorations = [
  require("../../assets/images/profile-streetball.png"),
  require("../../assets/images/profile-court-sunset.png"),
  require("../../assets/images/profile-basketball.png"),
];

const rewardDays = ["D1", "D2", "D3", "D4", "D5", "D6", "D7"];

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "H"
  );
}

function getMetadataString(metadata: Record<string, unknown> | undefined, key: string) {
  return typeof metadata?.[key] === "string" ? metadata[key] : null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [claimedDay, setClaimedDay] = useState(1);

  useEffect(() => {
    let isMounted = true;

    if (!session) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    void Promise.all([getProfileByUserId(session.user.id), getStoredProfileDraft()])
      .then(([storedProfile, storedDraft]) => {
        if (isMounted) {
          setProfile(storedProfile);
          setDraft(storedDraft);
        }
      })
      .catch(() => {
        if (isMounted) setDraft(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const metadata = session?.user.user_metadata as Record<string, unknown> | undefined;
  const displayName =
    profile?.nickname?.trim() ||
    draft?.nickname.trim() ||
    getMetadataString(metadata, "full_name") ||
    getMetadataString(metadata, "name") ||
    "HoopIG starter";
  const country = profile?.country?.trim() || draft?.country.trim() || "Mexico";
  const avatarUrl =
    profile?.avatar_url || draft?.profileImageUrl || getMetadataString(metadata, "avatar_url");
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const nextReward = Math.min(claimedDay + 1, 7);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const handleVerify = () => {
    setVerificationRequested(true);
    Alert.alert("Demo verification", "Your request is queued locally for this demo.");
  };

  const handleClaimReward = () => {
    if (claimedDay >= 7) {
      Alert.alert("All caught up", "You have claimed this week's demo rewards.");
      return;
    }
    setClaimedDay(nextReward);
    Alert.alert("Reward claimed", `Day ${nextReward} added to your demo streak.`);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerKicker}>HOOPIG</Text>
            <Text style={styles.headerTitle}>My profile</Text>
          </View>
          <Pressable
            accessibilityLabel="Open settings"
            onPress={() => router.push("/settings")}
            style={styles.settingsButton}
          >
            <Feather color={colors.text} name="settings" size={23} />
          </Pressable>
        </View>

        <View style={styles.profileIntro}>
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileHandle}>@{formatProfileHandle(displayName)}</Text>
          <Text style={styles.location}>🇲🇽  {country}</Text>
          <Pressable onPress={handleVerify} style={styles.verifyButton}>
            <Text style={styles.verifyText}>{verificationRequested ? "Requested" : "Verify profile"}</Text>
            <Feather color="#FFFFFF" name={verificationRequested ? "check" : "shield"} size={17} />
          </Pressable>
          <Text style={styles.verifyHint}>Verified profiles get up to 4x more friends</Text>
        </View>

        <View style={styles.levelPill}>
          <Text style={styles.levelBall}>●</Text>
          <Text style={styles.levelText}>Level 1</Text>
        </View>

        <View style={styles.rewardCard}>
          <View style={styles.rewardCopy}>
            <Text style={styles.rewardKicker}>DAILY</Text>
            <Text style={styles.rewardTitle}>REWARD</Text>
            <Pressable onPress={handleClaimReward} style={styles.claimButton}>
              <Text style={styles.claimText}>Claim</Text>
            </Pressable>
          </View>
          <View style={styles.daysRow}>
            {rewardDays.map((day, index) => {
              const isClaimed = index < claimedDay;
              return (
                <View key={day} style={styles.dayItem}>
                  <View style={[styles.dayCircle, isClaimed && styles.dayCircleClaimed]}>
                    {isClaimed ? <Feather color="#FFFFFF" name="check" size={14} /> : <Text style={styles.dayNumber}>•</Text>}
                  </View>
                  <Text style={[styles.dayLabel, isClaimed && styles.dayLabelClaimed]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Photo decorations</Text>
        <View style={styles.photoRow}>
          {photoDecorations.map((image, index) => (
            <Image key={index} source={image} style={styles.photoCard} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
  safeArea: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { paddingBottom: 30, paddingHorizontal: 18, paddingTop: 8 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  headerKicker: { color: colors.primaryDark, fontSize: 12, fontWeight: "900", letterSpacing: 1.5 },
  headerTitle: { color: colors.text, fontSize: 36, fontWeight: "900", letterSpacing: -1 },
  settingsButton: { padding: 8 },
  profileIntro: { alignItems: "center", paddingTop: 26 },
  avatarWrap: { marginBottom: 13, position: "relative" },
  avatar: { borderRadius: 110, height: 150, width: 150 },
  avatarFallback: { alignItems: "center", backgroundColor: colors.primary, justifyContent: "center" },
  avatarInitials: { color: "#FFFFFF", fontSize: 46, fontWeight: "900" },
  onlineDot: { backgroundColor: colors.success, borderColor: colors.background, borderRadius: 99, borderWidth: 4, bottom: 8, height: 25, position: "absolute", right: 8, width: 25 },
  profileName: { color: colors.text, fontSize: 38, fontWeight: "900" },
  profileHandle: { color: colors.muted, fontSize: 15, marginTop: 2 },
  location: { color: colors.text, fontSize: 19, marginTop: 9 },
  verifyButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 20, flexDirection: "row", gap: 12, marginTop: 16, paddingHorizontal: 25, paddingVertical: 15 },
  verifyText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  verifyHint: { color: colors.muted, fontSize: 14, marginTop: 13 },
  levelPill: { alignItems: "center", alignSelf: "center", backgroundColor: colors.surfaceAlt, borderRadius: 30, flexDirection: "row", gap: 12, marginVertical: 23, paddingHorizontal: 23, paddingVertical: 13 },
  levelBall: { color: colors.primaryDark, fontSize: 22 },
  levelText: { color: colors.text, fontSize: 20, fontWeight: "700" },
  rewardCard: { alignItems: "center", backgroundColor: colors.purple, borderRadius: 25, flexDirection: "row", minHeight: 150, overflow: "hidden", paddingHorizontal: 16, paddingVertical: 19 },
  rewardCopy: { width: 87 },
  rewardKicker: { color: "#FFFFFF", fontSize: 21, fontWeight: "900", lineHeight: 21 },
  rewardTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", lineHeight: 25 },
  claimButton: { backgroundColor: colors.primary, borderColor: "#FFFFFF", borderRadius: 18, borderWidth: 2, marginTop: 15, paddingHorizontal: 16, paddingVertical: 8, transform: [{ rotate: "-8deg" }] },
  claimText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  daysRow: { alignItems: "center", flex: 1, flexDirection: "row", justifyContent: "space-between" },
  dayItem: { alignItems: "center", gap: 5 },
  dayCircle: { alignItems: "center", backgroundColor: "rgba(47, 24, 119, .38)", borderRadius: 99, height: 36, justifyContent: "center", width: 36 },
  dayCircleClaimed: { backgroundColor: colors.primary },
  dayNumber: { color: "#B9A9F2", fontSize: 19 },
  dayLabel: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  dayLabelClaimed: { color: "#FFFFFF" },
  sectionTitle: { color: colors.text, fontSize: 26, fontWeight: "900", marginBottom: 14, marginTop: 29 },
  photoRow: { flexDirection: "row", gap: 12 },
  photoCard: { backgroundColor: colors.surfaceAlt, borderRadius: 20, flex: 1, height: 180 },
});
