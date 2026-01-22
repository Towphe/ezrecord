// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from "./0000_volatile_blob";

let journal;
try {
  // Prefer a static journal snapshot so Metro doesn't retrigger rebuilds
  // when the runtime `_journal.json` is updated frequently.
  journal = require("./_journal.static.json");
} catch (e) {
  // Fallback to the dynamic journal if static is missing.
  journal = require("./meta/_journal.json");
}

export default {
  journal,
  migrations: {
    m0000,
  },
};
