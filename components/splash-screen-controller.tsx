import { StyleSheet, Text, View } from "react-native";

export function SplashScreenController() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>components/splash-screen-controller.tsx</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
});
