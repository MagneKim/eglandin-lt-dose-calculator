"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const dist = path.resolve(__dirname, "../dist");
const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const css = fs.readFileSync(path.join(dist, "style.css"), "utf8");
const script = fs.readFileSync(path.join(dist, "script.js"), "utf8");

test("all locally referenced page assets exist", () => {
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((reference) => !reference.startsWith("#"));

  assert.deepEqual(references.sort(), ["calc.js", "script.js", "style.css"]);
  for (const reference of references) {
    assert.ok(fs.existsSync(path.join(dist, reference)), `${reference} should exist`);
  }
});

test("includes mobile viewport and required accessible form relationships", () => {
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1"/);
  assert.match(html, /<main\b/);
  assert.match(html, /<form id="dose-form" novalidate>/);
  assert.match(html, /<fieldset/);
  assert.match(html, /aria-describedby="weight-error"/);
  assert.match(html, /id="weight-error"[^>]*role="alert"/);
  assert.match(html, /id="result"[^>]*aria-live="polite"/);
  assert.match(html, /inputmode="decimal"/);
});

test("keeps tap targets, small-screen behavior, focus, and reduced motion rules", () => {
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /@media \(max-width:\s*520px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-width:\s*320px/);
});

test("clears stale result after inputs change", () => {
  assert.match(script, /form\.addEventListener\("input",[\s\S]*hideResult\(\)/);
  assert.match(script, /form\.addEventListener\("change", hideResult\)/);
});
