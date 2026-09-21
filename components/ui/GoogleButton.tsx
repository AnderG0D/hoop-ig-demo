import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/theme";

type GoogleButtonProps = {
  label?: string;
  disabled?: boolean;
  onPress: () => void;
};

export function GoogleButton({
  label = "Continue with Google",
  disabled = false,
  onPress,
}: GoogleButtonProps) {
  return (
    <Pressable
      accessibilityHint="Starts the Google sign-in flow."
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
    style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>G</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 20,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  badge: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: colors.surfaceAlt,
    borderWidth: 1,
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  badgeText: {
    color: "#4285F4",
    fontSize: 16,
    fontWeight: "800",
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
});
