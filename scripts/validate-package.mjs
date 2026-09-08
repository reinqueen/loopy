import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));
const [product, codex, claude] = await Promise.all([
  readJson("package.json"),
  readJson(".codex-plugin/plugin.json"),
  readJson(".claude-plugin/plugin.json"),
]);

for (const manifest of [codex, claude]) {
  if (manifest.name !== "loopy") throw new Error("Every Host manifest must name the product loopy.");
  if (manifest.version !== product.version) throw new Error("Host manifest versions must match package.json.");
}

for (const required of [
  "skills/loopy/SKILL.md",
  "runtime/dist/engine/src/cli.js",
  "runtime/node_modules/yaml/package.json",
  "engine/contracts/interviews/product-start.yaml",
  "templates/LOOPY.md",
]) {
  await access(resolve(root, required));
}

console.log(`Loopy package validation passed for ${product.version}.`);
