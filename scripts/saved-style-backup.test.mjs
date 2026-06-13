import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/savedStyleBackup.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2020,
    target: ts.ScriptTarget.ES2020,
  },
});

const tmp = mkdtempSync(join(tmpdir(), "saved-style-backup-"));
const modulePath = join(tmp, "savedStyleBackup.mjs");
writeFileSync(modulePath, compiled.outputText);

const {
  createSavedStylesBackup,
  filterSavedStyles,
  getSavedStyleMode,
  getSavedStyleModeLabel,
  summarizeSavedStyleImport,
  parseSavedStylesBackup,
} = await import(pathToFileURL(modulePath));

const styles = [
  { name: "Text style", state: { previewMode: "text", previewText: "Hello", textColor: "#111827" } },
  { name: "Button style", state: { previewMode: "button", btnBgColor: "#22c55e" } },
];

const backupText = createSavedStylesBackup(styles, new Date("2026-06-13T00:00:00.000Z"));
const backup = JSON.parse(backupText);

assert.equal(backup.app, "font-preview-tool");
assert.equal(backup.version, 1);
assert.equal(backup.exportedAt, "2026-06-13T00:00:00.000Z");
assert.deepEqual(backup.styles, styles);

const imported = parseSavedStylesBackup(
  JSON.stringify({
    app: "font-preview-tool",
    version: 1,
    exportedAt: "2026-06-13T00:00:00.000Z",
    styles: [
      { name: "Button style", state: { previewMode: "button", btnBgColor: "#0ea5e9" } },
      { name: "Card style", state: { previewMode: "card", cardTextColor: "#ffffff" } },
    ],
  }),
  styles,
);

assert.deepEqual(imported, [
  { name: "Text style", state: { previewMode: "text", previewText: "Hello", textColor: "#111827" } },
  { name: "Button style", state: { previewMode: "button", btnBgColor: "#0ea5e9" } },
  { name: "Card style", state: { previewMode: "card", cardTextColor: "#ffffff" } },
]);

assert.deepEqual(
  summarizeSavedStyleImport(
    [
      { name: "Button style", state: { previewMode: "button" } },
      { name: "Text style", state: { previewMode: "text" } },
    ],
    [
      { name: "Button style", state: { previewMode: "button" } },
      { name: "Image style", state: { previewMode: "image" } },
    ],
  ),
  { added: 1, overwritten: 1, total: 3 },
);

assert.equal(getSavedStyleMode(styles[1]), "button");
assert.equal(getSavedStyleModeLabel(styles[1]), "按鈕");
assert.deepEqual(
  filterSavedStyles(
    [
      { name: "Neon Text", state: { previewMode: "text", previewText: "Glow" } },
      { name: "Soft Button", state: { previewMode: "button", btnBgColor: "#22c55e" } },
      { name: "Photo Frame", state: { previewMode: "image", imgFrameColor: "#fff" } },
    ],
    { query: "soft", mode: "button" },
  ).map((style) => style.name),
  ["Soft Button"],
);

assert.throws(
  () => parseSavedStylesBackup("{\"styles\":[{\"name\":\"Broken\"}]}", []),
  /Invalid saved style entry/,
);

const homeSource = readFileSync(new URL("../src/pages/Home.tsx", import.meta.url), "utf8");
const requiredSavedStateKeys = [
  "textShadowLayers",
  "textRotate",
  "textSkewX",
  "textSkewY",
  "textScaleX",
  "textPerspective",
  "textRotateX",
  "textRotateY",
  "writingMode",
  "textDecoLine",
  "textDecoStyle",
  "textDecoColor",
  "textDecoThickness",
  "textUnderlineOffset",
  "textTransformVal",
  "textAlign",
  "textIndent",
  "dropCapEnabled",
  "filterBlur",
  "filterBrightness",
  "filterContrast",
  "filterHueRotate",
  "filterSaturate",
  "filterDropShadowEnabled",
  "filterDropShadowX",
  "filterDropShadowY",
  "filterDropShadowBlur",
  "filterDropShadowColor",
  "ligatures",
  "swash",
  "oldstyleNums",
  "tabularNums",
  "fontAxisWeight",
  "fontAxisWidth",
  "fontAxisOpticalSize",
  "fontVariationEnabled",
  "blendMode",
  "btnActiveOffsetX",
  "btnActiveOffsetY",
  "cardTiltEnabled",
  "cardTiltIntensity",
  "cardShadowMode",
  "cardShadowX",
  "cardShadowY",
  "cardShadowBlur",
  "cardShadowSpread",
  "cardShadowColor",
  "cardShadowOpacity",
  "btnShadowEnabled",
  "btnShadowInset",
  "btnShadowX",
  "btnShadowY",
  "btnShadowBlur",
  "btnShadowSpread",
  "btnShadowColor",
  "btnShadowOpacity",
  "imgShapeEffectEnabled",
  "imgShapePreset",
  "imgShapeColor1",
  "imgShapeColor2",
  "imgShapeAngle",
  "imgShapeGlowEnabled",
  "imgShapeGlowColor",
  "imgShapeGlowBlur",
  "imgShapeOutlineEnabled",
  "imgShapeOutlineWidth",
  "imgShapeOutlineColor",
  "imgShapeExtrudeEnabled",
  "imgShapeExtrudeDepth",
  "imgShapeExtrudeColor",
  "imgShapeAnimateFlow",
];

for (const key of requiredSavedStateKeys) {
  assert.match(homeSource, new RegExp(`${key}:\\s*set[A-Z]`), `${key} must be restorable from saved styles`);
  assert.match(homeSource, new RegExp(`[,{]\\s*${key}[,}]`), `${key} must be collected into saved styles`);
}

console.log("saved-style-backup tests passed");
