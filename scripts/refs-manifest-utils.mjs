import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

export const REF_CATEGORIES = [
  "文字效果",
  "按鈕",
  "卡片・外框",
  "質感・材質",
  "視覺風格",
  "版面・布局",
  "UI組件",
  "AI・其他",
];

const IMG_EXT = /\.(png|jpe?g|webp|gif)$/i;

export function autoCat(name, caption = "") {
  const s = name + " " + caption;
  const h = (re) => re.test(s);
  if (h(/出圖|提示詞|prompt|ai ?插畫|illustration|插畫/i)) return "AI・其他";
  if (/^組件-/.test(name)) return /按鈕/.test(name) ? "按鈕" : "UI組件";
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

function readJson(url, fallback) {
  try {
    return JSON.parse(readFileSync(url, "utf8") || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function validImageName(name) {
  return Boolean(name) && basename(name) === name && IMG_EXT.test(name);
}

export function buildRefsManifest(refsUrl) {
  const captions = readJson(new URL("captions.json", refsUrl), {});
  const existing = readJson(new URL("manifest.json", refsUrl), {});
  const categories = Array.isArray(existing.categories) && existing.categories.length
    ? existing.categories
    : REF_CATEGORIES;
  const existingCats = new Map(
    Array.isArray(existing.items)
      ? existing.items
          .filter((item) => item && categories.includes(item.cat))
          .map((item) => [item.file, item.cat])
      : [],
  );
  const files = readdirSync(fileURLToPath(refsUrl))
    .filter((file) => IMG_EXT.test(file))
    .sort((a, b) => a.localeCompare(b, "zh-Hant"));

  const items = files.map((file) => ({
    file,
    cat: existingCats.get(file) || autoCat(file, captions[file] || ""),
    caption: captions[file] || "",
  }));

  return { categories, items };
}

export function writeRefsManifest(refsUrl, manifest = buildRefsManifest(refsUrl)) {
  writeFileSync(new URL("manifest.json", refsUrl), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

export function saveRefCategory(refsUrl, rawName, cat) {
  const name = basename(rawName || "");
  if (!validImageName(name)) throw new Error("bad name");

  const manifest = buildRefsManifest(refsUrl);
  if (!manifest.categories.includes(cat)) throw new Error("bad category");

  const item = manifest.items.find((entry) => entry.file === name);
  if (!item) throw new Error("not found");
  item.cat = cat;

  writeRefsManifest(refsUrl, manifest);
  return item;
}

export function removeRefFromManifest(refsUrl, rawName) {
  const name = basename(rawName || "");
  if (!validImageName(name)) throw new Error("bad name");

  const manifest = buildRefsManifest(refsUrl);
  manifest.items = manifest.items.filter((entry) => entry.file !== name);
  writeRefsManifest(refsUrl, manifest);
  return manifest;
}

export function syncRefsManifest(refsUrl) {
  if (!existsSync(fileURLToPath(refsUrl))) return { categories: REF_CATEGORIES, items: [] };
  return writeRefsManifest(refsUrl);
}
