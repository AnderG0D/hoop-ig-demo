import { useCallback, useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { colors } from "@/constants/theme";
import { getProfileByUserId } from "@/lib/profile";

export default function Index() {
  const { isLoading, session } = useAuth();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isLoading) {
      return () => {
        isMounted = false;
      };
    }

    if (!session) {
      setIsProfileLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setIsProfileLoading(true);
    setProfileError(null);

    void getProfileByUserId(session.user.id)
      .then((profile) => {
        if (isMounted) {
          setOnboardingCompleted(profile?.onboarding_completed === true);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setProfileError(
            error instanceof Error
              ? error.message
              : "We could not load your profile."
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isLoading, retryCount, session]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(public)/login" />;
  }

  if (isProfileLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{profileError}</Text>
        <Pressable onPress={retry} style={styles.retryButton}>
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Redirect
      href={onboardingCompleted ? "/(app)/discover" : "/(setup)/nickname"}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  error: { color: colors.danger, textAlign: "center" },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryLabel: { color: "#FFFFFF", fontWeight: "700" },
});
