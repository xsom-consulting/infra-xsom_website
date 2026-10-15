#!/usr/bin/env node
// Update only cache keys; HTML remains directly deployable on a static host.
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const root = path.resolve(__dirname, "..");
for (const directory of ["", "en"]) {
  for (const file of fs
    .readdirSync(path.join(root, directory))
    .filter((n) => n.endsWith(".html"))) {
    const target = path.join(root, directory, file);
    const html = fs
      .readFileSync(target, "utf8")
      .replace(/<(?:link|script)\b[^>]*>/g, (tag) => {
        if (tag.startsWith("<link") && !/rel="stylesheet"/.test(tag))
          return tag;
        return tag.replace(/(href|src)="([^"]+)"/, (all, attr, value) => {
          const url = new URL(
            value,
            `https://www.xsom.fr/${directory ? directory + "/" : ""}${file}`,
          );
          if (url.origin !== "https://www.xsom.fr") return all;
          const asset = path.join(root, decodeURIComponent(url.pathname));
          const hash = createHash("sha256")
            .update(fs.readFileSync(asset))
            .digest("hex")
            .slice(0, 12);
          return `${attr}="${value.split(/[?#]/)[0]}?v=${hash}"`;
        });
      });
    fs.writeFileSync(target, html);
  }
}
