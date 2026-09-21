import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect, Stack } from "expo-router";

import { colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";

export default function SetupLayout() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(public)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="nickname" options={{ title: "Nickname" }} />
      <Stack.Screen name="birthday" options={{ title: "Birthday" }} />
      <Stack.Screen name="gender" options={{ title: "Gender" }} />
      <Stack.Screen name="country" options={{ title: "Country" }} />
      <Stack.Screen name="interests" options={{ title: "Interests" }} />
      <Stack.Screen name="profile-pic" options={{ title: "Profile Picture" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
});
