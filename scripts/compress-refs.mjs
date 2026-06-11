// 批次把 public/refs 裡的 PNG/JPG 壓成 WebP（一次全部）。
// 需先安裝：npm i -D sharp
// 用法：npm run refs:compress   →   再跑 npm run refs:manifest
import sharp from "sharp";
import { readdirSync, readFileSync, writeFileSync, unlinkSync, statSync } from "fs";
import { fileURLToPath } from "url";

const refsUrl = new URL("../public/refs/", import.meta.url);
const QUALITY = 80;       // WebP 品質（80 通常肉眼無損、體積大降）
const MAX_WIDTH = 2000;   // 超過此寬度就縮到這（參考圖不需要超大）

const capPath = new URL("captions.json", refsUrl);
let captions = {};
try { captions = JSON.parse(readFileSync(capPath, "utf8")); } catch {}

const files = readdirSync(fileURLToPath(refsUrl)).filter((f) => /\.(png|jpe?g)$/i.test(f));
let before = 0, after = 0, n = 0;

for (const f of files) {
  const srcPath = fileURLToPath(new URL(f, refsUrl));
  const out = f.replace(/\.(png|jpe?g)$/i, ".webp");
  const outPath = fileURLToPath(new URL(out, refsUrl));
  const b = statSync(srcPath).size;

  await sharp(srcPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outPath);

  const a = statSync(outPath).size;
  before += b; after += a; n++;

  if (captions[f] != null) { captions[out] = captions[f]; delete captions[f]; } // 搬移說明
  unlinkSync(srcPath); // 刪掉原 PNG/JPG
  console.log(`${f} → ${out}\t${(b / 1e6).toFixed(2)} → ${(a / 1e6).toFixed(2)} MB`);
}

writeFileSync(capPath, JSON.stringify(captions, null, 2) + "\n");
console.log(`\n✅ 完成 ${n} 張：${(before / 1e6).toFixed(1)} MB → ${(after / 1e6).toFixed(1)} MB（省 ${(100 - after / before * 100).toFixed(0)}%）`);
console.log("👉 接著跑：npm run refs:manifest（更新清單成 .webp）");
