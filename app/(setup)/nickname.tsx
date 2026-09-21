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

export default function NicknameScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    let isMounted = true;

    void getStoredProfileDraft().then((draft) => {
      if (isMounted) {
        setNickname(draft.nickname);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleContinue = async () => {
    await saveProfileDraft({ nickname });
    router.push("/birthday");
  };

  return (
    <ScreenShell
      step={1}
      totalSteps={6}
      eyebrow="Step 1 of 6"
      title="Pick your HoopIG nickname."
      description="Start the onboarding flow with the handle people will remember on the court and in the feed."
    >
      <SectionCard
        title="Nickname"
        description="You can wire availability checks and validation rules here later."
      >
        <TextField
          autoCapitalize="none"
          label="Nickname"
          onChangeText={setNickname}
          placeholder="@crossoverszn"
          value={nickname}
        />
        <ActionButton label="Continue" onPress={() => void handleContinue()} />
        <ActionButton
          label="Back to login"
          onPress={() => router.replace("/login")}
          variant="secondary"
        />
      </SectionCard>

    </ScreenShell>
  );
}

const styles = StyleSheet.create({
});
