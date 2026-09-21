import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";

import { GoogleButton } from "@/components/ui/GoogleButton";
import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

export default function LoginScreen() {
  const router = useRouter();
  const { errorMessage, isLoading, session, signInWithGoogle } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(setup)/nickname" />;
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.replace("/");
    } catch {
      // The provider exposes the failure through errorMessage.
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.artStage}>
        <View style={[styles.loop, styles.loopOrange]} />
        <View style={[styles.loop, styles.loopPeach]} />
        <View style={[styles.loop, styles.loopPink]} />
      </View>

      <Text style={styles.headline}>Make friends with{`\n`}people who match{`\n`}your vibe</Text>

      <View style={styles.footer}>
        <GoogleButton
          disabled={isLoading}
          onPress={() => void handleGoogleSignIn()}
        />
        <Text style={styles.terms}>
          By continuing, you agree to our <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Community Guidelines</Text> and acknowledge our <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  artStage: {
    alignSelf: "center",
    height: 250,
    marginTop: 24,
    position: "relative",
    width: 300,
  },
  loop: {
    borderRadius: 160,
    borderWidth: 20,
    height: 142,
    left: 18,
    position: "absolute",
    top: 54,
    transform: [{ rotate: "-13deg" }],
    width: 264,
  },
  loopOrange: {
    borderColor: "#FF914D",
    transform: [{ rotate: "-10deg" }],
  },
  loopPeach: {
    borderColor: "#FFAD8D",
    top: 68,
    transform: [{ rotate: "9deg" }],
  },
  loopPink: {
    borderColor: "#FA6B86",
    top: 44,
    transform: [{ rotate: "-2deg" }],
  },
  headline: {
    color: colors.text,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.4,
    lineHeight: 48,
    marginBottom: 28,
  },
  footer: {
    gap: 22,
  },
  terms: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
});
