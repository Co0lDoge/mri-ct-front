#!/usr/bin/env node
/**
 * Проверка архитектурных границ medml-front по package.json.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const WORKSPACE_GLOBS = ["apps", "domains", "lib"];

const VIEWER_PACKAGES = new Set(["@medml/viewers", "@medml/ct-mri-viewer"]);

/** Домены, которые lib может подключать для композиции каркаса (исключение). */
const LIB_ALLOWED_DOMAIN_DEPS = new Set(["@medml/layout"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function collectPackages() {
  const result = [];
  for (const top of WORKSPACE_GLOBS) {
    const dir = path.join(ROOT, top);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      const pkgDir = path.join(dir, name);
      const pkgFile = path.join(pkgDir, "package.json");
      if (!fs.statSync(pkgDir).isDirectory() || !fs.existsSync(pkgFile)) continue;
      const pkg = readJson(pkgFile);
      result.push({
        layer: top,
        name: pkg.name ?? name,
        dir: `${top}/${name}`,
        deps: {
          ...pkg.dependencies,
          ...pkg.peerDependencies,
        },
      });
    }
  }
  return result;
}

function depNames(deps) {
  return Object.keys(deps ?? {}).filter((d) => d.startsWith("@medml/"));
}

const violations = [];

for (const pkg of collectPackages()) {
  const medmlDeps = depNames(pkg.deps);

  if (pkg.layer === "domains") {
    for (const d of medmlDeps) {
      if (VIEWER_PACKAGES.has(d)) {
        violations.push(
          `${pkg.dir}: доменный пакет не должен зависеть от визуализации (${d})`
        );
      }
      if (d.includes("-app") || pkg.deps[d]?.includes("apps/")) {
        violations.push(`${pkg.dir}: домен не должен зависеть от приложения (${d})`);
      }
    }
  }

  if (pkg.name === "@medml/shared") {
    for (const d of medmlDeps) {
      if (d !== "@medml/shared") {
        violations.push(`${pkg.dir}: shared-пакет не должен зависеть от ${d}`);
      }
    }
  }

  if (pkg.layer === "lib" && pkg.name !== "@medml/shared") {
    for (const d of medmlDeps) {
      if (d.startsWith("@medml/") && d.includes("patient")) {
        violations.push(`${pkg.dir}: lib не должен зависеть от домена пациентов (${d})`);
      }
      if (d === "@medml/auth") {
        violations.push(`${pkg.dir}: lib не должен зависеть от домена (${d})`);
      }
      if (d === "@medml/layout" && !LIB_ALLOWED_DOMAIN_DEPS.has(d)) {
        violations.push(`${pkg.dir}: lib не должен зависеть от домена (${d})`);
      }
    }
  }
}

if (violations.length === 0) {
  console.log("check-boundaries: OK — нарушений границ не найдено.");
  process.exit(0);
}

console.error("check-boundaries: найдены нарушения:\n");
for (const v of violations) {
  console.error(`  • ${v}`);
}
process.exit(1);
