// 讀字型檔的 cmap（字元對應表）判斷它涵蓋哪種字元，用來分「中文 / 英文 / 數字」。
// 不靠檔名猜，直接看字型實際有哪些字。

export type FontScript = "中文" | "英文" | "數字" | "其他";

export function detectScript(buffer: ArrayBuffer): FontScript {
  try {
    const dv = new DataView(buffer);
    let base = 0;
    const sig = dv.getUint32(0);
    // 'ttcf' = TrueType Collection，取集合內第一個字型的表目錄
    if (sig === 0x74746366) {
      base = dv.getUint32(12);
    }
    const numTables = dv.getUint16(base + 4);
    let cmapOff = 0;
    for (let i = 0; i < numTables; i++) {
      const rec = base + 12 + i * 16;
      if (dv.getUint32(rec) === 0x636d6170) {
        // 'cmap'
        cmapOff = dv.getUint32(rec + 8);
        break;
      }
    }
    if (!cmapOff) return "其他";

    // 選一個 Unicode 子表（偏好全集 format 12 / BMP format 4）
    const numSub = dv.getUint16(cmapOff + 2);
    let best = 0;
    let bestScore = -1;
    for (let i = 0; i < numSub; i++) {
      const rec = cmapOff + 4 + i * 8;
      const plat = dv.getUint16(rec);
      const enc = dv.getUint16(rec + 2);
      const off = dv.getUint32(rec + 4);
      let score: number;
      if (plat === 3 && enc === 10) score = 5;
      else if (plat === 0 && (enc === 4 || enc === 6)) score = 4;
      else if (plat === 3 && enc === 1) score = 3;
      else if (plat === 0) score = 2;
      else score = 1;
      if (score > bestScore) {
        bestScore = score;
        best = cmapOff + off;
      }
    }
    if (!best) return "其他";

    const has = (cp: number) => cmapHas(dv, best, cp);
    const hasCJK =
      has(0x6c38) || has(0x570b) || has(0x4e00) || has(0x611b); // 永 國 一 愛
    const hasLatin = has(0x41) || has(0x61); // A a
    const hasDigit = has(0x30); // 0

    if (hasCJK) return "中文";
    if (hasLatin) return "英文";
    if (hasDigit) return "數字";
    return "其他";
  } catch {
    return "其他";
  }
}

// 讀字型檔的 name 表，取出「在地化名稱」（優先中文，其次日文）。
// 拉丁字型通常沒有 CJK 名稱記錄，回傳 undefined。
export function extractCJKName(buffer: ArrayBuffer): string | undefined {
  try {
    const dv = new DataView(buffer);
    let base = 0;
    if (dv.getUint32(0) === 0x74746366) base = dv.getUint32(12); // 'ttcf' 取集合第一個
    const numTables = dv.getUint16(base + 4);
    let nameOff = 0;
    for (let i = 0; i < numTables; i++) {
      const rec = base + 12 + i * 16;
      if (dv.getUint32(rec) === 0x6e616d65) { // 'name'
        nameOff = dv.getUint32(rec + 8);
        break;
      }
    }
    if (!nameOff) return undefined;

    const count = dv.getUint16(nameOff + 2);
    const strOff = nameOff + dv.getUint16(nameOff + 4);
    const cand: { idRank: number; langPri: number; s: string }[] = [];
    // 同語系內偏好：Family(1) > Typographic family(16) > Full(4)
    const idRank: Record<number, number> = { 1: 3, 16: 2, 4: 1 };

    for (let i = 0; i < count; i++) {
      const r = nameOff + 6 + i * 12;
      const plat = dv.getUint16(r);
      const lang = dv.getUint16(r + 4);
      const nameID = dv.getUint16(r + 6);
      const len = dv.getUint16(r + 8);
      const off = dv.getUint16(r + 10);
      if (plat !== 3) continue; // 只取 Windows 平台（字串為 UTF-16BE）
      if (!(nameID in idRank)) continue;
      const primary = lang & 0x3ff;
      let langPri: number;
      if (primary === 0x04) langPri = 2; // 中文最優先
      else if (primary === 0x11) langPri = 1; // 日文次之
      else continue; // 其餘語系（含英文）略過
      let s = "";
      for (let j = 0; j + 1 < len; j += 2) s += String.fromCharCode(dv.getUint16(strOff + off + j));
      s = s.trim();
      if (s) cand.push({ idRank: idRank[nameID], langPri, s });
    }
    if (!cand.length) return undefined;
    cand.sort((a, b) => (b.langPri - a.langPri) || (b.idRank - a.idRank));
    return cand[0].s;
  } catch {
    return undefined;
  }
}

function cmapHas(dv: DataView, off: number, cp: number): boolean {
  const format = dv.getUint16(off);

  if (format === 4) {
    const segX2 = dv.getUint16(off + 6);
    const segCount = segX2 / 2;
    const endOff = off + 14;
    const startOff = endOff + segX2 + 2;
    const deltaOff = startOff + segX2;
    const rangeOff = deltaOff + segX2;
    for (let i = 0; i < segCount; i++) {
      const end = dv.getUint16(endOff + i * 2);
      if (cp <= end) {
        const start = dv.getUint16(startOff + i * 2);
        if (cp < start) return false;
        const delta = dv.getUint16(deltaOff + i * 2);
        const rangeOffset = dv.getUint16(rangeOff + i * 2);
        if (rangeOffset === 0) {
          return ((cp + delta) & 0xffff) !== 0;
        }
        const gi = dv.getUint16(rangeOff + i * 2 + rangeOffset + (cp - start) * 2);
        return gi !== 0;
      }
    }
    return false;
  }

  if (format === 12) {
    const nGroups = dv.getUint32(off + 12);
    for (let i = 0; i < nGroups; i++) {
      const g = off + 16 + i * 12;
      const startC = dv.getUint32(g);
      const endC = dv.getUint32(g + 4);
      if (cp >= startC && cp <= endC) return true;
      if (cp < startC) break;
    }
    return false;
  }

  if (format === 6) {
    const first = dv.getUint16(off + 6);
    const count = dv.getUint16(off + 8);
    if (cp >= first && cp < first + count) {
      return dv.getUint16(off + 10 + (cp - first) * 2) !== 0;
    }
    return false;
  }

  if (format === 0) {
    if (cp < 256) return dv.getUint8(off + 6 + cp) !== 0;
    return false;
  }

  return false;
}
