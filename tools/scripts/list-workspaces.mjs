#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

for (const top of ["apps", "domains", "lib"]) {
  const dir = path.join(ROOT, top);
  if (!fs.existsSync(dir)) continue;
  console.log(`\n[${top}/]`);
  for (const name of fs.readdirSync(dir).sort()) {
    const pkgFile = path.join(dir, name, "package.json");
    if (!fs.existsSync(pkgFile)) continue;
    const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
    const medml = Object.keys({
      ...pkg.dependencies,
      ...pkg.peerDependencies,
    }).filter((d) => d.startsWith("@medml/"));
    console.log(`  ${pkg.name ?? name}`);
    if (medml.length) console.log(`    → ${medml.join(", ")}`);
  }
}

console.log("");
