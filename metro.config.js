// Exclude Drizzle runtime metadata and local DB files from Metro's watcher.
// Avoid using internal metro-config paths so this file works with package exports.
module.exports = {
  resolver: {
    // Only block runtime DB files and the `db` folder. Do NOT block
    // `drizzle/meta` here because the app imports JSON/migration modules
    // from `drizzle/` at build-time; blocking those prevents resolution.
    blockList: [/.*\.sqlite$/, /db\/.*$/],
  },
};
