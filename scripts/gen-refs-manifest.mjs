// 掃描 public/refs 產生靜態 manifest.json（檔名 + 分類 + 說明）。
// 用法：npm run refs:manifest（加了新參考圖後重跑一次即可）
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

const refsUrl = new URL("../public/refs/", import.meta.url);
const dir = fileURLToPath(refsUrl);
const CATS = ["文字效果", "按鈕", "卡片・外框", "質感・材質", "視覺風格", "版面・布局", "UI組件", "AI・其他"];

// 用「檔名 + 說明」一起判斷分類（順序＝優先序，先命中先決定）
function autoCat(name, caption = "") {
  const s = name + " " + caption;
  const h = (re) => re.test(s);
  if (h(/出圖|提示詞|prompt|ai ?插畫|illustration|插畫/i)) return "AI・其他";
  if (/^組件-/.test(name)) return /按鈕/.test(name) ? "按鈕" : "UI組件"; // 元件型錄一律歸 UI（按鈕型錄歸按鈕）
  if (h(/型錄|總覽|線框|wireframe/i)) return "版面・布局";
  if (h(/文字效果|字效|字體|字型|標題文字|文字設計|金屬漸層|霓虹中空|螢光筆|套印|glitch|長陰影|浮雕|中空描邊|ref-0[1-6]/i)) return "文字效果";
  if (h(/按鈕|button|雙按鈕|ref-07/i)) return "按鈕";
  if (h(/卡片|外框|邊框|票券|描邊|ref-08/i)) return "卡片・外框";
  if (h(/玻璃|擬物|光影|背景圖|全息|黏土|材質|質感|霓虹/i)) return "質感・材質";
  if (h(/版面|布局|layout|dashboard|grid|產品網頁/i)) return "版面・布局";
  if (h(/風格|設計風格|12種|saas|極簡|復古|minimal|modern|retro|expressive|品牌海報/i)) return "視覺風格";
  if (h(/組件|元件|彈窗|表格|通知|載入|進度|輸入|搜尋|導覽|導航|側邊欄|底部|開關|滑桿|核取|tab|頭像|分頁|標籤|徽章|時間/i)) return "UI組件";
  return "UI組件";
}

let captions = {};
try { captions = JSON.parse(readFileSync(new URL("captions.json", refsUrl), "utf8")); } catch {}

const files = readdirSync(dir)
  .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, "zh-Hant"));

const items = files.map((file) => ({ file, cat: autoCat(file, captions[file] || ""), caption: captions[file] || "" }));
writeFileSync(new URL("manifest.json", refsUrl), JSON.stringify({ categories: CATS, items }, null, 2) + "\n");
console.log(`manifest.json 產生完成：${items.length} 張`);
