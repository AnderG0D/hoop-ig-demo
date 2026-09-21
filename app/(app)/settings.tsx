import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

type SettingRowProps = {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  detail?: string;
  danger?: boolean;
  onPress: () => void;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const comingSoon = (label: string) =>
    Alert.alert("Coming soon", `${label} will be available in a future HoopIG release.`);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      Alert.alert(
        "Could not sign out",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Back to profile"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => router.replace("/(app)/profile")}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Feather color={colors.text} name="arrow-left" size={20} />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.intro}>Keep your HoopIG experience feeling like your game.</Text>

        <SettingsSection title="Account">
          <SettingRow
            detail="Name, photo and country"
            icon="user"
            label="Edit profile"
            onPress={() => comingSoon("Edit profile")}
          />
          <SettingRow
            detail="Manage sign-in preferences"
            icon="lock"
            label="Password and security"
            onPress={() => comingSoon("Password and security")}
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingRow
            detail="Mentions, follows and rewards"
            icon="bell"
            label="Notifications"
            onPress={() => comingSoon("Notifications")}
          />
          <SettingRow
            detail="Tune your Discover feed"
            icon="sliders"
            label="Content preferences"
            onPress={() => comingSoon("Content preferences")}
          />
        </SettingsSection>

        <SettingsSection title="Help and support">
          <SettingRow icon="help-circle" label="Help center" onPress={() => comingSoon("Help center")} />
          <SettingRow icon="flag" label="Report a problem" onPress={() => comingSoon("Report a problem")} />
        </SettingsSection>

        <SettingsSection title="Other">
          <SettingRow icon="file-text" label="Terms and privacy" onPress={() => comingSoon("Terms and privacy")} />
          <SettingRow
            danger
            detail="Demo only — nothing will be deleted"
            icon="trash-2"
            label="Delete my account"
            onPress={() =>
              Alert.alert("Demo only", "Account deletion is not connected in this MVP.")
            }
          />
        </SettingsSection>

        <Pressable
          accessibilityRole="button"
          disabled={isSigningOut}
          onPress={() => void handleSignOut()}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
            isSigningOut && styles.disabled,
          ]}
        >
          <Feather color={colors.danger} name="log-out" size={17} />
          <Text style={styles.logoutText}>
            {isSigningOut ? "Signing out..." : "Log out"}
          </Text>
        </Pressable>
        <Text style={styles.version}>HoopIG demo · MVP build</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRows}>{children}</View>
    </View>
  );
}

function SettingRow({ danger = false, detail, icon, label, onPress }: SettingRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Feather color={danger ? colors.danger : colors.primary} name={icon} size={17} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      </View>
      <Feather color={colors.muted} name="chevron-right" size={17} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { paddingBottom: 34, paddingHorizontal: 20 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingTop: 9 },
  backButton: { alignItems: "center", height: 42, justifyContent: "center", width: 42 },
  headerSpacer: { width: 42 },
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 27, marginTop: 8 },
  section: { marginBottom: 22 },
  sectionTitle: { color: colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 9, textTransform: "uppercase" },
  sectionRows: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  row: { alignItems: "center", flexDirection: "row", minHeight: 67, paddingHorizontal: 14 },
  rowPressed: { backgroundColor: colors.surfaceAlt },
  rowIcon: { alignItems: "center", backgroundColor: colors.primaryMuted, borderRadius: 12, height: 36, justifyContent: "center", width: 36 },
  rowIconDanger: { backgroundColor: "rgba(248, 113, 113, 0.12)" },
  rowCopy: { flex: 1, marginLeft: 12 },
  rowLabel: { color: colors.text, fontSize: 14, fontWeight: "700" },
  rowLabelDanger: { color: colors.danger },
  rowDetail: { color: colors.muted, fontSize: 11, marginTop: 4 },
  logoutButton: { alignItems: "center", borderColor: "rgba(248, 113, 113, 0.32)", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 52, marginTop: 2 },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: "800" },
  version: { color: colors.muted, fontSize: 11, marginTop: 22, textAlign: "center" },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.55 },
});
