import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const storage = {
  async getItem(key: string) {
    if (Platform.OS === "web") {
      if (!canUseLocalStorage()) {
        return null;
      }

      return window.localStorage.getItem(key);
    }

    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === "web") {
      if (!canUseLocalStorage()) {
        return;
      }

      window.localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string) {
    if (Platform.OS === "web") {
      if (!canUseLocalStorage()) {
        return;
      }

      window.localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};
