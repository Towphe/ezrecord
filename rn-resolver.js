const path = require("path");
const defaultResolver = require("metro-resolver").resolve;

function resolveRequest(context, moduleName, platform) {
  if (moduleName === "zod/v4/core") {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "node_modules/zod/v4/core/index.js"),
    };
  }
  return defaultResolver(context, moduleName, platform);
}

module.exports = { resolveRequest };
