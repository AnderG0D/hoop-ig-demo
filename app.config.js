const appJson = require("./app.json");

const googleIosUrlScheme =
  process.env.GOOGLE_IOS_URL_SCHEME ?? process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

module.exports = () => {
  const baseConfig = appJson.expo;
  const hasFirebaseGoogleConfig =
    Boolean(baseConfig.android?.googleServicesFile) ||
    Boolean(baseConfig.ios?.googleServicesFile);

  const plugins = [...(baseConfig.plugins ?? [])];
  const hasGoogleSignInPlugin = plugins.some(
    (plugin) =>
      plugin === "@react-native-google-signin/google-signin" ||
      (Array.isArray(plugin) &&
        plugin[0] === "@react-native-google-signin/google-signin"),
  );

  if (!hasGoogleSignInPlugin) {
    if (hasFirebaseGoogleConfig) {
      plugins.unshift("@react-native-google-signin/google-signin");
    } else if (googleIosUrlScheme) {
      plugins.unshift([
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: googleIosUrlScheme,
        },
      ]);
    } else {
      plugins.unshift("@react-native-google-signin/google-signin");
    }
  }

  return {
    expo: {
      ...baseConfig,
      plugins,
    },
  };
};
