import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ActionButton, ScreenShell, SectionCard } from "@/components/hoopig-ui";
import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import {
  clearProfileDraft,
  getStoredProfileDraft,
  upsertProfile,
} from "@/lib/profile";
import type { ProfileDraft } from "@/types/profile";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const errorRecord = error as Record<string, unknown>;
    const errorMessage = [
      typeof errorRecord.code === "string"
        ? `code: ${errorRecord.code}`
        : null,
      typeof errorRecord.message === "string"
        ? `message: ${errorRecord.message}`
        : null,
      typeof errorRecord.details === "string"
        ? `details: ${errorRecord.details}`
        : null,
      typeof errorRecord.hint === "string" ? `hint: ${errorRecord.hint}` : null,
    ].filter((part): part is string => part !== null);

    if (errorMessage.length > 0) {
      return errorMessage.join("; ");
    }
  }

  return "We could not save your profile. Please try again.";
}

export default function ProfilePicScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void getStoredProfileDraft().then((storedDraft) => {
      if (isMounted) {
        setDraft(storedDraft);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFinish = async () => {
    if (!session) {
      setErrorMessage("Your session has expired. Please sign in again.");
      return;
    }

    if (!draft) {
      setErrorMessage("Your onboarding details are still loading. Please try again.");
      return;
    }

    if (
      !draft.nickname.trim() ||
      !draft.birthday.trim() ||
      !draft.gender ||
      !draft.country.trim() ||
      draft.interests.length === 0
    ) {
      setErrorMessage(
        "Complete your nickname, birthday, gender, country, and interests before finishing."
      );
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      const metadata = session.user.user_metadata;
      const fullName =
        typeof metadata.full_name === "string"
          ? metadata.full_name
          : typeof metadata.name === "string"
            ? metadata.name
            : null;
      const avatarUrl =
        typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

      await upsertProfile({
        id: session.user.id,
        email: session.user.email ?? null,
        fullName,
        fallbackAvatarUrl: avatarUrl,
        draft,
        onboardingCompleted: true,
      });
      await clearProfileDraft();
      router.replace("/(app)/discover");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenShell
      step={6}
      totalSteps={6}
      eyebrow="Step 6 of 6"
      title="Ready for tip-off."
      description="Your profile picture is optional for now. You can add one later from your profile."
    >
      <SectionCard
        title="Finish your profile"
        description="We will save your onboarding details and personalize Discover."
      >
        {draft?.profileImageUrl ? (
          <Text style={styles.photoStatus}>A profile photo is ready to use.</Text>
        ) : (
          <Text style={styles.photoStatus}>No profile photo selected.</Text>
        )}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {isSaving ? (
          <View style={styles.savingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.photoStatus}>Saving your profile...</Text>
          </View>
        ) : null}
        <ActionButton
          disabled={isSaving || !draft}
          label={isSaving ? "Saving..." : "Finish onboarding"}
          onPress={() => void handleFinish()}
        />
        <ActionButton
          disabled={isSaving}
          label="Back"
          onPress={() => router.back()}
          variant="secondary"
        />
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  photoStatus: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 21,
  },
  savingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
});
