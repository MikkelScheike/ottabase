import fs from "node:fs";
import path from "node:path";

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { filePath, changed: false, skipped: true };
  }

  const before = fs.readFileSync(filePath, "utf8");

  // OpenNext Cloudflare occasionally emits bare specifiers like "cloudflare/images.js".
  // Those are not resolvable at runtime unless bundled, but OpenNext ships these files
  // under `.open-next/cloudflare/*`. We rewrite them to relative imports.
  const after = before.replace(/(["'])cloudflare\//g, "$1./cloudflare/");

  if (after === before) {
    return { filePath, changed: false, skipped: false };
  }

  fs.writeFileSync(filePath, after);
  return { filePath, changed: true, skipped: false };
}

function collectFilesRecursively(rootDir, exts) {
  const results = [];
  if (!fs.existsSync(rootDir)) return results;

  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (exts.includes(path.extname(entry.name))) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

function main() {
  const appRoot = process.cwd();
  const outputDirs = [".open-next", ".worker-next"]
    .map((d) => path.join(appRoot, d))
    .filter((d) => fs.existsSync(d));

  const exts = [".js", ".mjs", ".cjs"];
  const targets = [
    ...outputDirs.flatMap((outDir) => collectFilesRecursively(outDir, exts)),
    // Some OpenNext modes may emit top-level worker entry files.
    ...["worker.js", "worker.mjs", "index.js", "index.mjs"]
      .map((f) => path.join(appRoot, f))
      .filter((f) => fs.existsSync(f)),
  ];

  const results = targets.map(patchFile);
  const changed = results.filter((r) => r.changed);

  // eslint-disable-next-line no-console
  console.log(
    `[fix-opennext-cloudflare-imports] patched ${changed.length}/${results.length} files`,
  );
  for (const r of results) {
    // eslint-disable-next-line no-console
    console.log(
      `  - ${path.relative(appRoot, r.filePath)}: ${
        r.skipped ? "skipped (missing)" : r.changed ? "changed" : "no-op"
      }`,
    );
  }
}

main();
