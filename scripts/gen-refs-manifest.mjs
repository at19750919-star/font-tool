// 掃描 public/refs 產生靜態 manifest.json（檔名 + 分類 + 說明）。
// 用法：npm run refs:manifest（加了新參考圖後重跑一次即可）
import { buildRefsManifest, writeRefsManifest } from "./refs-manifest-utils.mjs";

const refsUrl = new URL("../public/refs/", import.meta.url);
const manifest = writeRefsManifest(refsUrl, buildRefsManifest(refsUrl));
console.log(`manifest.json 產生完成：${manifest.items.length} 張`);
