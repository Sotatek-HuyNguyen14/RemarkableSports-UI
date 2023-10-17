module.exports = {
  name: "GoPingPong",
  slug: "go-ping-pong",
  owner: "pivotal-technologies",
  version: "1.8.1",
  orientation: "portrait",
  icon: "./expo-assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./expo-assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    jsEngine: "hermes",
    supportsTablet: false,
    bundleIdentifier: "com.remarkable-sports",
    buildNumber: "68",
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSFaceIDUsageDescription:
        "This app will optionally use Face ID or Touch ID to save login",
      CFBundleAllowMixedLocalizations: true,
      UIBackgroundModes: ["remote-notification"],
    },
  },
  android: {
    jsEngine: "hermes",
    adaptiveIcon: {
      foregroundImage: "./expo-assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    package: "com.remarkablesports",
    versionCode: 34,
  },
  web: {
    favicon: "./expo-assets/favicon.png",
  },
  plugins: [
    [
      "expo-notifications",
      {
        icon: "./expo-assets/icon.png",
      },
    ],
  ],
  extra: {
    APP_ENV: process.env.APP_ENV || "development",
    eas: {
      projectId: "d73e2d14-93b7-4929-95da-e7eed15a9aea",
    },
  },
};
