import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtimeRoot = resolve(repositoryRoot, "runtime");

await rm(runtimeRoot, { recursive: true, force: true });
await mkdir(resolve(runtimeRoot, "dist"), { recursive: true });
await mkdir(resolve(runtimeRoot, "node_modules/yaml"), { recursive: true });

await cp(resolve(repositoryRoot, "dist"), resolve(runtimeRoot, "dist"), {
  recursive: true,
});
for (const entry of ["LICENSE", "package.json", "dist"]) {
  await cp(
    resolve(repositoryRoot, "node_modules/yaml", entry),
    resolve(runtimeRoot, "node_modules/yaml", entry),
    { recursive: true, dereference: true },
  );
}
