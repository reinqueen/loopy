import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const excludedDirectories = new Set([".git", "dist", "node_modules"]);
const predecessorProduct = ["re", "ins"].join("");
const predecessorPerson = ["rein", "er"].join("");
const forbidden = new RegExp(
  `\\b(?:${predecessorProduct}|${predecessorProduct}s|${predecessorPerson}|${predecessorPerson}s)\\b`,
  "i",
);
const failures = [];

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    const name = relative(root, path);
    if (forbidden.test(name)) failures.push(`${name}: forbidden legacy name in path`);
    if (entry.isDirectory()) {
      await visit(path);
      continue;
    }
    if (!entry.isFile()) continue;
    const bytes = await readFile(path);
    if (bytes.includes(0)) continue;
    const text = bytes.toString("utf8");
    const match = text.match(forbidden);
    if (match) failures.push(`${name}: forbidden legacy name ${JSON.stringify(match[0])}`);
  }
}

await visit(root);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Loopy brand validation passed.");
}
