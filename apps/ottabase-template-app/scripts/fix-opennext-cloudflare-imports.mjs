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

function main() {
  const appRoot = process.cwd();
  const outputDirs = [".open-next", ".worker-next"]
    .map((d) => path.join(appRoot, d))
    .filter((d) => fs.existsSync(d));

  const targets = outputDirs.flatMap((outDir) => [
    path.join(outDir, "worker.js"),
    path.join(outDir, "index.js"),
  ]);

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
