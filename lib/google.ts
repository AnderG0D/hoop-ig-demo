import Constants from "expo-constants";
import { Platform } from "react-native";

export const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function shouldUseNativeGoogleSignIn() {
  if (Platform.OS === "web" || !googleWebClientId) {
    return false;
  }

  const hasGoogleServicesFile = Boolean(
    Constants.expoConfig?.ios?.googleServicesFile
  );

  if (Platform.OS === "ios") {
    return Boolean(googleIosClientId || hasGoogleServicesFile);
  }

  return true;
}

export function getNativeGoogleErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    const code = String(error.code);

    if (code === "IN_PROGRESS") {
      return "Google sign-in is already in progress.";
    }

    if (code === "PLAY_SERVICES_NOT_AVAILABLE") {
      return "Google Play Services are missing or need an update on this device.";
    }
  }

  if (
    error instanceof Error &&
    /native module|expo go|not been linked|cannot find/i.test(error.message)
  ) {
    return "Google Sign-In requires a development build or standalone app. Expo Go is not supported.";
  }

  return error instanceof Error
    ? error.message
    : "Google sign-in could not be completed.";
}

export async function getGoogleSignInModule() {
  const module = await import("@react-native-google-signin/google-signin");

  module.GoogleSignin.configure({
    webClientId: googleWebClientId,
    ...(Platform.OS === "ios" && googleIosClientId
      ? { iosClientId: googleIosClientId }
      : {}),
  });

  return module;
}
