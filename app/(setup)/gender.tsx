import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ActionButton, ScreenShell, SectionCard } from "@/components/hoopig-ui";
import { colors } from "@/constants/theme";
import {
  getStoredProfileDraft,
  profileGenderOptions,
  saveProfileDraft,
} from "@/lib/profile";
import type { ProfileGender } from "@/types/profile";

export default function GenderScreen() {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState<ProfileGender>(
    profileGenderOptions[0]
  );

  useEffect(() => {
    let isMounted = true;

    void getStoredProfileDraft().then((draft) => {
      if (isMounted && draft.gender) {
        setSelectedGender(draft.gender);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleContinue = async () => {
    await saveProfileDraft({ gender: selectedGender });
    router.push("/country");
  };

  return (
    <ScreenShell
      step={3}
      totalSteps={6}
      eyebrow="Step 3 of 6"
      title="Tell us how you identify."
      description="This step is ready for inclusive profile options, analytics, or preference-based discovery later."
    >
      <SectionCard
        title="Gender"
        description="Pick one option for now. You can swap this control for a richer settings flow later."
      >
        <View style={styles.optionStack}>
          {profileGenderOptions.map((option) => {
            const isSelected = option === selectedGender;

            return (
              <Pressable
                key={option}
                onPress={() => setSelectedGender(option)}
                style={[
                  styles.optionCard,
                  isSelected ? styles.optionCardSelected : styles.optionCardIdle,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected ? styles.optionTextSelected : styles.optionTextIdle,
                  ]}
                >
                  {option}
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
  optionStack: {
    gap: 10,
  },
  optionCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionCardIdle: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: colors.text,
  },
  optionTextIdle: {
    color: colors.muted,
  },
});
