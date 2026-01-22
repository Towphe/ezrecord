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
      // Metro sometimes doesn't honor package exports for subpath imports
      // like `zod/v4/core`. Map that subpath to the actual file so bundler
      // can resolve it.
      "zod/v4/core": path.resolve(
        __dirname,
        "node_modules/zod/v4/core/index.js",
      ),
      // Explicit mapping for top-level `zod` package to avoid resolution issues
      zod: path.resolve(__dirname, 'node_modules/zod/index.js'),
    },
    // Ensure Metro resolves TypeScript files.
    sourceExts: ["js", "json", "ts", "tsx", "jsx"],
    // Use a custom resolver for specific problematic subpath imports.
    resolveRequest: require("./rn-resolver").resolveRequest,
  },
  // Ensure Metro watches the project root for linked modules.
  watchFolders: [path.resolve(__dirname)],
};
