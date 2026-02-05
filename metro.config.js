const { getDefaultConfig } = require("expo/metro-config"); // if using Expo
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("tflite");
config.resolver.sourceExts.push("sql");

module.exports = config;
