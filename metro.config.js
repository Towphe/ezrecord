// Exclude Drizzle runtime metadata and local DB files from Metro's watcher.
// Avoid using internal metro-config paths so this file works with package exports.
module.exports = {
  resolver: {
    // Only block generated runtime artifacts — don't block the whole `drizzle/`
    // because the app imports source files like `drizzle/migrations`.
    blockList: [
      /drizzle\/meta\/.*$/,
      /.*\.sqlite$/,
      /db\/.*$/,
    ],
  },
};
