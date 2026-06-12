import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import {
  buildRefsManifest,
  saveRefCategory,
} from "./refs-manifest-utils.mjs";

const tmp = mkdtempSync(join(tmpdir(), "refs-manifest-"));
const refsUrl = pathToFileURL(tmp + "/");

writeFileSync(join(tmp, "manual.webp"), "");
writeFileSync(join(tmp, "new-button.webp"), "");
writeFileSync(
  join(tmp, "captions.json"),
  JSON.stringify({
    "manual.webp": "自訂分類過的圖片",
    "new-button.webp": "button example",
  }),
);
writeFileSync(
  join(tmp, "manifest.json"),
  JSON.stringify({
    categories: ["文字效果", "按鈕", "卡片・外框", "質感・材質", "視覺風格", "版面・布局", "UI組件", "AI・其他"],
    items: [
      { file: "manual.webp", cat: "AI・其他", caption: "舊說明" },
    ],
  }),
);

const rebuilt = buildRefsManifest(refsUrl);
assert.equal(
  rebuilt.items.find((item) => item.file === "manual.webp")?.cat,
  "AI・其他",
  "重產生 manifest 時要保留既有手動分類",
);
assert.equal(
  rebuilt.items.find((item) => item.file === "new-button.webp")?.cat,
  "按鈕",
  "新圖片仍要可依檔名與說明自動分類",
);

saveRefCategory(refsUrl, "manual.webp", "按鈕");
const saved = JSON.parse(readFileSync(join(tmp, "manifest.json"), "utf8"));
assert.equal(
  saved.items.find((item) => item.file === "manual.webp")?.cat,
  "按鈕",
  "儲存分類要直接寫回 manifest.json",
);

const rebuiltAfterSave = buildRefsManifest(refsUrl);
assert.equal(
  rebuiltAfterSave.items.find((item) => item.file === "manual.webp")?.cat,
  "按鈕",
  "寫回後再次重產生也要保留手動分類",
);

assert.throws(
  () => saveRefCategory(refsUrl, "manual.webp", "不存在分類"),
  /bad category/,
  "不接受 manifest categories 之外的分類",
);

console.log("refs-manifest-utils tests passed");
