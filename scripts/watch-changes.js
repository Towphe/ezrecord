const fs = require("fs");
const path = require("path");
const dir = process.argv[2] || ".";
const interval = parseInt(process.argv[3], 10) || 1000;
function scan(base) {
  const out = {};
  function walk(p) {
    let stat;
    try {
      stat = fs.statSync(p);
    } catch {
      return;
    }
    if (stat.isDirectory()) {
      const entries = fs.readdirSync(p);
      for (const e of entries) walk(path.join(p, e));
    } else {
      out[path.relative(process.cwd(), p)] = stat.mtimeMs;
    }
  }
  walk(base);
  return out;
}
let prev = scan(dir);
console.log("Watching", dir);
setInterval(() => {
  const cur = scan(dir);
  for (const k of Object.keys(cur)) {
    if (!prev[k]) console.log("CREATED", k);
    else if (cur[k] !== prev[k]) console.log("MODIFIED", k);
  }
  for (const k of Object.keys(prev)) {
    if (!cur[k]) console.log("DELETED", k);
  }
  prev = cur;
}, interval);
