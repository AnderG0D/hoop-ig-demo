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

export default function CountryScreen() {
  const router = useRouter();
  const [country, setCountry] = useState("");

  useEffect(() => {
    let isMounted = true;

    void getStoredProfileDraft().then((draft) => {
      if (isMounted) {
        setCountry(draft.country);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleContinue = async () => {
    await saveProfileDraft({ country });
    router.push("/interests");
  };

  return (
    <ScreenShell
      step={4}
      totalSteps={6}
      eyebrow="Step 4 of 6"
      title="Where are you hooping from?"
      description="Use this screen to capture country, market, or region before shaping recommendations and community content."
    >
      <SectionCard
        title="Country"
        description="You can swap this for a searchable picker or localization-driven list later."
      >
        <TextField
          label="Country"
          onChangeText={setCountry}
          placeholder="Mexico"
          value={country}
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
