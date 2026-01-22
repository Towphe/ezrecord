// Exclude Drizzle runtime metadata and local DB files from Metro's watcher.
// Also provide a resolver alias for `@` so imports like `@/db/schema` work.
const path = require('path');

module.exports = {
  resolver: {
    // Only block runtime DB files and the `db` folder. Do NOT block
    // `drizzle/meta` because the app imports JSON/migration modules
    // from `drizzle/` at build-time; blocking those prevents resolution.
    blockList: [/.*\.sqlite$/, /db\/.*/],
    // Map the `@` alias to the project root so Metro resolves `@/...` imports.
    extraNodeModules: {
      '@': path.resolve(__dirname),
    },
  },
  // Ensure Metro watches the project root for linked modules.
  watchFolders: [path.resolve(__dirname)],
};
