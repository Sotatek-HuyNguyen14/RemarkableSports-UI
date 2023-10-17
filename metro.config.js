// Learn more https://docs.expo.io/guides/customizing-metro
// If fix error by using eslint recommended way then cannot run simulator
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);
