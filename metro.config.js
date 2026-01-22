// Exclude Drizzle runtime metadata and local DB files from Metro's watcher.
// Also provide a resolver alias for `@` so imports like `@/db/schema` work.
const path = require("path");

module.exports = {
  resolver: {
    // Only block runtime DB files and the `db` folder. Do NOT block
    // `drizzle/meta` because the app imports JSON/migration modules
    // from `drizzle/` at build-time; blocking those prevents resolution.
    blockList: [/.*\.sqlite$/],
    // Map the `@` alias to the project root so Metro resolves `@/...` imports.
    extraNodeModules: {
      "@": path.resolve(__dirname),
      // Route zod imports to a local shim so Metro doesn't fail resolving
      // package subpaths like `zod/v4/core`.
      "zod/v4/core": path.resolve(__dirname, "src/shims/zod-shim.js"),
      zod: path.resolve(__dirname, "src/shims/zod-shim.js"),
    },
    // Ensure Metro resolves TypeScript files.
    sourceExts: ["js", "json", "ts", "tsx", "jsx"],
    // Use a custom resolver for specific problematic subpath imports.
    resolveRequest: require("./rn-resolver").resolveRequest,
  },
  // Ensure Metro watches the project root for linked modules.
  watchFolders: [path.resolve(__dirname)],
};
