// Metro cannot analyze dynamic `require(...)` calls. Use explicit literal
// requires for the likely entry points, falling back to `require('zod')`.
let zod = null;

try {
  zod = require("../../node_modules/zod/lib/index.cjs");
} catch (e) {}

if (!zod) {
  try {
    zod = require("../../node_modules/zod/lib/index.js");
  } catch (e) {}
}

if (!zod) {
  try {
    zod = require("../../node_modules/zod/dist/index.cjs");
  } catch (e) {}
}

if (!zod) {
  try {
    zod = require("../../node_modules/zod/dist/index.js");
  } catch (e) {}
}

if (!zod) {
  try {
    zod = require("../../node_modules/zod/index.cjs");
  } catch (e) {}
}

if (!zod) {
  try {
    zod = require("../../node_modules/zod/index.js");
  } catch (e) {}
}

if (!zod) {
  try {
    zod = require("zod");
  } catch (e) {
    throw new Error(
      "zod shim: unable to locate the `zod` package. Ensure `zod` is installed.",
    );
  }
}

// Export whatever shape Zod provides (preserve named exports when present).
if (zod && zod.__esModule) {
  module.exports = zod.default || zod;
} else {
  module.exports = zod;
}
