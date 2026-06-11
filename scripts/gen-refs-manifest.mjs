// 掃描 public/refs 產生靜態 manifest.json（檔名 + 分類 + 說明）。
// 用法：npm run refs:manifest（加了新參考圖後重跑一次即可）
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

const refsUrl = new URL("../public/refs/", import.meta.url);
const dir = fileURLToPath(refsUrl);
const CATS = ["風格/版面", "UI組件", "文字", "插畫風格", "效果/其他"];

// 與 gallery 內相同的自動分類規則
function autoCat(name) {
  if (/插畫|illustration/i.test(name)) return "插畫風格";
  if (/文字|字效|字體|字型|標題文字/.test(name)) return "文字";
  if (/^風格-|^版面布局-|設計風格/.test(name)) return "風格/版面";
  if (/^組件-|按鈕|外框|導覽|搜尋|Tab|UI ?元素|UI ?按鈕|玻璃|雙按鈕|時間|滑桿|開關|分頁|標籤|徽章|頭像/i.test(name)) return "UI組件";
  return "效果/其他";
}

let captions = {};
try { captions = JSON.parse(readFileSync(new URL("captions.json", refsUrl), "utf8")); } catch {}

const files = readdirSync(dir)
  .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, "zh-Hant"));

const items = files.map((file) => ({ file, cat: autoCat(file), caption: captions[file] || "" }));
writeFileSync(new URL("manifest.json", refsUrl), JSON.stringify({ categories: CATS, items }, null, 2) + "\n");
console.log(`manifest.json 產生完成：${items.length} 張`);
