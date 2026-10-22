// Stamps the shared partials into every page so each HTML file stays fully static.
// Usage: node build.js   (re-run after editing anything in /partials)
const fs = require("fs");
const path = require("path");

const root = __dirname;
const parts = ["sprite", "header", "footer"];
const read = (name) => fs.readFileSync(path.join(root, "partials", `${name}.html`), "utf8").trim();

const pages = fs.readdirSync(root).filter((f) => f.endsWith(".html"));
for (const page of pages) {
  const file = path.join(root, page);
  let html = fs.readFileSync(file, "utf8");
  for (const p of parts) {
    const re = new RegExp(`(<!-- @${p} -->)[\\s\\S]*?(<!-- /@${p} -->)`);
    html = html.replace(re, `$1\n${read(p)}\n$2`);
  }
  fs.writeFileSync(file, html);
  console.log("built", page);
}
