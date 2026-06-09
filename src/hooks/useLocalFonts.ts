import { useState, useEffect, useCallback, useRef } from 'react';
import { detectScript, extractCJKName, type FontScript } from '@/lib/fontScript';

export interface LocalFont {
  id: string;
  name: string;
  fontFamily: string;
  format: string; // ttf, otf, ttc, woff, woff2
  script?: FontScript; // 中文 / 英文 / 數字 / 其他
  cnName?: string; // 從字型 name 表讀到的中文（或日文）名稱
  cnResolved?: boolean; // 是否已嘗試解析過 cnName（區分「沒有名稱」與「還沒解析」）
}

const DB_NAME = 'font-preview-db';
const DB_VERSION = 2;
const META_STORE = 'fontMeta'; // 輕量中繼資料：頁面載入只讀這個
const DATA_STORE = 'fontData'; // 字型二進位：只在「實際要預覽」時才讀取
const MAX_FONT_SIZE = 100 * 1024 * 1024;

// 已注入的字型與其 Blob URL，避免重複注入並可在刪除時釋放
const objectUrls = new Map<string, string>();

// ── IndexedDB ───────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      // 舊版單一 store 直接捨棄（之前只是測試資料）
      if (db.objectStoreNames.contains('fonts')) {
        db.deleteObjectStore('fonts');
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(DATA_STORE)) {
        db.createObjectStore(DATA_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAllMeta(): Promise<LocalFont[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(META_STORE, 'readonly').objectStore(META_STORE).getAll();
    req.onsuccess = () => resolve(req.result as LocalFont[]);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetData(id: string): Promise<ArrayBuffer | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(DATA_STORE, 'readonly').objectStore(DATA_STORE).get(id);
    req.onsuccess = () => resolve(req.result ? (req.result.buffer as ArrayBuffer) : undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(meta: LocalFont, buffer: ArrayBuffer): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([META_STORE, DATA_STORE], 'readwrite');
    tx.objectStore(META_STORE).put(meta);
    tx.objectStore(DATA_STORE).put({ id: meta.id, buffer });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbPutMeta(meta: LocalFont): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite');
    tx.objectStore(META_STORE).put(meta);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([META_STORE, DATA_STORE], 'readwrite');
    tx.objectStore(META_STORE).delete(id);
    tx.objectStore(DATA_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbClear(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([META_STORE, DATA_STORE], 'readwrite');
    tx.objectStore(META_STORE).clear();
    tx.objectStore(DATA_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// CSS @font-face 的 format() 提示
const FORMAT_HINT: Record<string, string> = {
  ttf: 'truetype',
  ttc: 'truetype', // TrueType Collection，瀏覽器以集合內第一個字面渲染
  otf: 'opentype',
  woff: 'woff',
  woff2: 'woff2',
};

function injectFontData(meta: LocalFont, buffer: ArrayBuffer) {
  const styleId = `font-${meta.id}`;
  if (document.getElementById(styleId)) return;

  const url = URL.createObjectURL(new Blob([buffer]));
  objectUrls.set(meta.id, url);

  const hint = FORMAT_HINT[meta.format] || 'truetype';
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @font-face {
      font-family: '${meta.fontFamily}';
      src: url('${url}') format('${hint}');
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

function removeInjectedFont(id: string) {
  document.getElementById(`font-${id}`)?.remove();
  const url = objectUrls.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    objectUrls.delete(id);
  }
}

// 從 CSS value（可能含引號，如 'LocalFont_xxx'）取出 fontFamily
function normalizeFamily(value: string): string {
  return value.replace(/^['"]|['"]$/g, '');
}

export function useLocalFonts() {
  const [localFonts, setLocalFonts] = useState<LocalFont[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 供 ensureFontLoaded 取得最新清單（避免 stale closure）
  const fontsRef = useRef<LocalFont[]>([]);
  fontsRef.current = localFonts;

  // 載入頁面：只讀「中繼資料」清單，不碰二進位、不注入，避免一次吃進數百 MB
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const metas = await idbGetAllMeta();
        if (cancelled) return;
        setLocalFonts(metas);

        // 一次性補登：對還沒分類（沒有 script）或還沒解析中文名（沒有 cnResolved）的字型，讀檔處理後存回
        const need = metas.filter((m) => !m.script || !m.cnResolved);
        for (const m of need) {
          if (cancelled) return;
          try {
            const buf = await idbGetData(m.id);
            if (!buf) continue;
            const script = m.script || detectScript(buf);
            const cnName = m.cnResolved ? m.cnName : extractCJKName(buf);
            const updated = { ...m, script, cnName, cnResolved: true };
            await idbPutMeta(updated);
            setLocalFonts((prev) =>
              prev.map((x) => (x.id === m.id ? updated : x)),
            );
          } catch {
            /* 單一字型處理失敗就略過 */
          }
        }
      } catch (err) {
        console.error('Failed to load local fonts:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 真正要預覽某個本地字型時才呼叫：載入其二進位並注入 @font-face
  const ensureFontLoaded = useCallback(async (cssValueOrFamily: string) => {
    const family = normalizeFamily(cssValueOrFamily);
    if (!family.startsWith('LocalFont_')) return; // 非本地字型不處理
    if (document.getElementById(`font-${family}`)) return;

    const meta = fontsRef.current.find((f) => f.fontFamily === family);
    if (!meta) return;
    if (document.getElementById(`font-${meta.id}`)) return; // 已注入

    try {
      const buffer = await idbGetData(meta.id);
      if (buffer) injectFontData(meta, buffer);
    } catch (err) {
      console.error('Failed to load font data:', err);
    }
  }, []);

  // 上傳字型（不立即注入，等被選取時才由 ensureFontLoaded 載入）
  const uploadFont = useCallback(
    async (file: File): Promise<LocalFont | null> => {
      setIsLoading(true);
      setError(null);
      try {
        if (file.size > MAX_FONT_SIZE) {
          throw new Error(`檔案大小超過限制 (最大 ${MAX_FONT_SIZE / 1024 / 1024}MB)`);
        }
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const validExtensions = ['ttf', 'otf', 'ttc', 'woff', 'woff2'];
        if (!validExtensions.includes(fileExtension || '')) {
          throw new Error('不支援的字型格式，請上傳 TTF、OTF、TTC、WOFF 或 WOFF2 檔案');
        }

        const buffer = await file.arrayBuffer();
        const fontName = file.name.replace(/\.[^/.]+$/, '');
        const meta: LocalFont = {
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: fontName,
          fontFamily: `LocalFont_${fontName.replace(/\s+/g, '_')}`,
          format: fileExtension || 'ttf',
          script: detectScript(buffer),
          cnName: extractCJKName(buffer),
          cnResolved: true,
        };

        await idbPut(meta, buffer);
        setLocalFonts((prev) => [...prev, meta]);
        setIsLoading(false);
        return meta;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '上傳失敗';
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  // 一鍵匯入「已安裝在本機」的字型（透過 dev 伺服器路由讀取）
  const bulkImportSystemFonts = useCallback(
    async (onProgress?: (done: number, total: number) => void): Promise<number> => {
      let list: string[];
      try {
        const r = await fetch('/userfonts-list');
        if (!r.ok) throw new Error();
        list = await r.json();
      } catch {
        throw new Error('讀不到本機字型清單（需要開發伺服器執行中）');
      }

      const existing = new Set(fontsRef.current.map((f) => f.name));
      const newMetas: LocalFont[] = [];
      let done = 0;

      for (const fn of list) {
        const name = fn.replace(/\.[^/.]+$/, '');
        if (existing.has(name)) {
          done++;
          onProgress?.(done, list.length);
          continue;
        }
        try {
          const buffer = await (await fetch('/userfonts/' + encodeURIComponent(fn))).arrayBuffer();
          const ext = (fn.split('.').pop() || 'ttf').toLowerCase();
          const meta: LocalFont = {
            id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            fontFamily: `LocalFont_${name.replace(/\s+/g, '_')}`,
            format: ext,
            script: detectScript(buffer),
            cnName: extractCJKName(buffer),
            cnResolved: true,
          };
          await idbPut(meta, buffer);
          newMetas.push(meta);
        } catch (e) {
          console.error('匯入失敗:', fn, e);
        }
        done++;
        onProgress?.(done, list.length);
      }

      if (newMetas.length) setLocalFonts((prev) => [...prev, ...newMetas]);
      return newMetas.length;
    },
    [],
  );

  const deleteFont = useCallback(async (fontId: string) => {
    removeInjectedFont(fontId);
    await idbDelete(fontId);
    setLocalFonts((prev) => prev.filter((f) => f.id !== fontId));
  }, []);

  const clearAllFonts = useCallback(async () => {
    fontsRef.current.forEach((font) => removeInjectedFont(font.id));
    await idbClear();
    setLocalFonts([]);
  }, []);

  return {
    localFonts,
    isLoading,
    error,
    uploadFont,
    deleteFont,
    clearAllFonts,
    ensureFontLoaded,
    bulkImportSystemFonts,
  };
}
