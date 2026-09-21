import type { ReactNode } from "react";
import type { KeyboardTypeOptions, StyleProp, ViewStyle } from "react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";

type ScreenShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  step?: number;
  totalSteps?: number;
  children: ReactNode;
};

type SectionCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

type TextFieldProps = {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
};

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export function ScreenShell({
  eyebrow,
  title,
  description,
  step,
  totalSteps,
  children,
}: ScreenShellProps) {
  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Text style={styles.backMark}>‹</Text>
          {step && totalSteps ? (
            <View style={styles.progressRow}>
              {Array.from({ length: totalSteps }).map((_, index) => (
                <View
                  key={index}
                  style={[styles.progressDot, index < step && styles.progressDotActive]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.hero}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.stack}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SectionCard({
  title,
  description,
  children,
  style,
}: SectionCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
}

export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  autoCapitalize = "sentences",
  keyboardType = "default",
  secureTextEntry = false,
}: TextFieldProps) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9DA8B8"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: ActionButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          isPrimary ? styles.primaryButtonText : styles.secondaryButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    paddingTop: 8,
  },
  topRow: {
    alignItems: "center",
    minHeight: 36,
    justifyContent: "center",
    position: "relative",
  },
  backMark: {
    color: colors.text,
    fontSize: 42,
    fontWeight: "300",
    left: 0,
    lineHeight: 36,
    position: "absolute",
    top: -4,
  },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },
  progressDot: {
    backgroundColor: colors.text,
    borderRadius: 99,
    height: 5,
    width: 5,
  },
  progressDotActive: {
    backgroundColor: colors.primaryDark,
    height: 12,
    width: 12,
  },
  hero: {
    gap: 10,
    marginBottom: 20,
    marginTop: 42,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1.2,
    lineHeight: 44,
  },
  description: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 23,
  },
  stack: {
    gap: 14,
  },
  card: {
    gap: 18,
  },
  cardHeader: {
    gap: 5,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  cardDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  cardContent: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 17,
    borderWidth: 1.5,
    color: colors.text,
    fontSize: 18,
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  button: {
    alignItems: "center",
    borderRadius: 17,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceAlt,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.48,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "800",
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
  secondaryButtonText: {
    color: colors.text,
  },
});
