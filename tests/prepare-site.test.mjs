import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepareSite } from "../scripts/prepare-site.mjs";

test("static publish directory includes website files and removes stale output", async () => {
  const root = await mkdtemp(join(tmpdir(), "ocode-site-"));
  try {
    const files = {
      "index.html": '<a href="docs/API.md">API</a>',
      "README.md": "Readme",
      "docs/API.md": "API documentation",
      "assets/logo.svg": "<svg/>",
      "package.json": "{}",
    };
    for (const [path, content] of Object.entries(files)) {
      await mkdir(join(root, path, ".."), { recursive: true });
      await writeFile(join(root, path), content);
    }
    await mkdir(join(root, "_site"));
    await writeFile(join(root, "_site/stale.html"), "old page");
    await prepareSite(root);
    for (const [path, content] of Object.entries(files)) {
      if (path !== "package.json") {
        assert.equal(await readFile(join(root, "_site", path), "utf8"), content);
      }
    }
    await assert.rejects(access(join(root, "_site/package.json")), { code: "ENOENT" });
    await assert.rejects(access(join(root, "_site/stale.html")), { code: "ENOENT" });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
