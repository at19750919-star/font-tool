// 把「組件款式參考圖」(GPT 生成的 PNG) 壓成 webp，放到 public/refs/_components/
// 供 components.html 引用。放子目錄，gallery 牆 (/refs-list 只掃 refs 根目錄) 不會掃到。
// 用法：node scripts/build-comp-shots.mjs   (來源 PNG 放專案根)
import sharp from "sharp";
import { mkdirSync, statSync, existsSync } from "fs";
import { fileURLToPath } from "url";

const rootUrl = new URL("../", import.meta.url);
const outUrl = new URL("../public/refs/_components/", import.meta.url);
mkdirSync(fileURLToPath(outUrl), { recursive: true });

const QUALITY = 82;
const MAX_WIDTH = 1800;

// 來源 PNG (專案根) → 輸出 webp 名
const map = {
  "ref-button-v2.png": "btn-uses.webp",
  "button-ref-preview-4.png": "btn-ext.webp",
  "button-ref-preview-5.png": "btn-special.webp",
  "ref-input-v2.png": "input.webp",
  "ref-number.png": "number.webp",
  "ref-select.png": "select.webp",
  "ref-switch.png": "switch.webp",
  "ref-slider.png": "slider.webp",
  "ref-choice.png": "choice.webp",
  "ref-toolbar.png": "toolbar.webp",
  "ref-navbar-v2.png": "navbar.webp",
  "ref-tabs.png": "tabs.webp",
  "ref-chip.png": "chip.webp",
  "ref-badge.png": "badge.webp",
  "ref-avatar.png": "avatar.webp",
  "ref-progress.png": "progress.webp",
  "ref-notify.png": "notify.webp",
  "ref-modal.png": "modal.webp",
  "ref-mix4c.png": "mix-styles.webp",
};

let before = 0, after = 0, n = 0, missing = [];
for (const [src, out] of Object.entries(map)) {
  const sPath = fileURLToPath(new URL(src, rootUrl));
  if (!existsSync(sPath)) { missing.push(src); continue; }
  const oPath = fileURLToPath(new URL(out, outUrl));
  const b = statSync(sPath).size;
  await sharp(sPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(oPath);
  const a = statSync(oPath).size;
  before += b; after += a; n++;
  console.log(`${src} → ${out}\t${(b / 1e6).toFixed(2)} → ${(a / 1e6).toFixed(2)} MB`);
}
if (missing.length) console.log("⚠ 缺來源:", missing.join(", "));
console.log(`\n✅ ${n} 張：${(before / 1e6).toFixed(1)} → ${(after / 1e6).toFixed(1)} MB（省 ${(100 - after / before * 100).toFixed(0)}%）`);
