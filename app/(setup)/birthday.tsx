import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import {
  ActionButton,
  ScreenShell,
  SectionCard,
  TextField,
} from "@/components/hoopig-ui";
import { colors } from "@/constants/theme";
import { getStoredProfileDraft, saveProfileDraft } from "@/lib/profile";

export default function BirthdayScreen() {
  const router = useRouter();
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    let isMounted = true;

    void getStoredProfileDraft().then((draft) => {
      if (isMounted) {
        setBirthday(draft.birthday);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleContinue = async () => {
    await saveProfileDraft({ birthday });
    router.push("/gender");
  };

  return (
    <ScreenShell
      step={2}
      totalSteps={6}
      eyebrow="Step 2 of 6"
      title="Add your birthday."
      description="This placeholder screen can later validate age gates, eligibility, or birthday-based profile badges."
    >
      <SectionCard
        title="Birthday"
        description="Use your preferred format for now, such as MM/DD/YYYY."
      >
        <TextField
          keyboardType="numbers-and-punctuation"
          label="Birthday"
          onChangeText={setBirthday}
          placeholder="08/23/2001"
          value={birthday}
        />
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
});
