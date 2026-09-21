import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ActionButton, ScreenShell, SectionCard } from "@/components/hoopig-ui";
import { colors } from "@/constants/theme";
import {
  getStoredProfileDraft,
  profileInterestOptions,
  saveProfileDraft,
} from "@/lib/profile";
import type { ProfileInterest } from "@/types/profile";

export default function InterestsScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<ProfileInterest[]>([
    "Training",
    "Mixtapes",
  ]);

  useEffect(() => {
    let isMounted = true;

    void getStoredProfileDraft().then((draft) => {
      if (isMounted && draft.interests.length) {
        setSelectedInterests(draft.interests);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleInterest = (interest: ProfileInterest) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  const handleContinue = async () => {
    await saveProfileDraft({ interests: selectedInterests });
    router.push("/profile-pic");
  };

  return (
    <ScreenShell
      step={5}
      totalSteps={6}
      eyebrow="Step 5 of 6"
      title="Tune the feed to your game."
      description="This step can capture onboarding preferences and recommendation signals before the first session starts."
    >
      <SectionCard
        title="Choose Interests"
        description="Tap a few topics that should shape the first Discover experience."
      >
        <View style={styles.chipGrid}>
          {profileInterestOptions.map((interest) => {
            const isSelected = selectedInterests.includes(interest);

            return (
              <Pressable
                key={interest}
                onPress={() => toggleInterest(interest)}
                style={[
                  styles.chip,
                  isSelected ? styles.chipSelected : styles.chipUnselected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected ? styles.chipTextSelected : styles.chipTextMuted,
                  ]}
                >
                  {interest}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ActionButton label="Continue" onPress={() => void handleContinue()} />
        <ActionButton
          label="Back"
          onPress={() => router.back()}
          variant="secondary"
        />
      </SectionCard>

    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700",
  },
  chipTextSelected: {
    color: colors.text,
  },
  chipTextMuted: {
    color: colors.muted,
  },
});
