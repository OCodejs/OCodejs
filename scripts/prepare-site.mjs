import { cp, mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export async function prepareSite(root) {
  const output = join(root, "_site");
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const path of ["index.html", "README.md", "docs", "assets"]) {
    await cp(join(root, path), join(output, path), { recursive: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareSite(fileURLToPath(new URL("../", import.meta.url)));
}
