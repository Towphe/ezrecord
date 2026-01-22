const exclusionList = require('metro-config/src/defaults/exclusionList');

module.exports = {
  resolver: {
    // Prevent Metro from watching Drizzle runtime metadata and local DB files
    blockList: exclusionList([/drizzle\/.*/, /db\/.*/]),
  },
};
