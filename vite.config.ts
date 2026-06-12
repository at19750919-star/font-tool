import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import {
  buildRefsManifest,
  removeRefFromManifest,
  saveRefCategory,
  syncRefsManifest,
} from "./scripts/refs-manifest-utils.mjs";

// 開發伺服器路由：讓「一鍵匯入本機字型」按鈕能讀取你已安裝的字型。
// 只在 dev 生效，直接從使用者字型資料夾讀檔（不複製檔案）。
const USER_FONTS_DIR = path.join(
  process.env.LOCALAPPDATA || "",
  "Microsoft",
  "Windows",
  "Fonts",
);
const FONT_EXT = /\.(ttf|otf|ttc|woff2?)$/i;

function serveUserFonts() {
  return {
    name: "serve-user-fonts",
    configureServer(server: any) {
      server.middlewares.use("/userfonts-list", (_req: any, res: any) => {
        try {
          const names = fs
            .readdirSync(USER_FONTS_DIR)
            .filter((n) => FONT_EXT.test(n));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(names));
        } catch (e) {
          res.statusCode = 500;
          res.end("[]");
        }
      });
      server.middlewares.use("/userfonts/", (req: any, res: any) => {
        const name = decodeURIComponent((req.url || "").replace(/^\//, ""));
        if (name.includes("..") || name.includes("/") || !FONT_EXT.test(name)) {
          res.statusCode = 400;
          res.end("bad request");
          return;
        }
        const fp = path.join(USER_FONTS_DIR, name);
        if (!fs.existsSync(fp)) {
          res.statusCode = 404;
          res.end("not found");
          return;
        }
        res.setHeader("Content-Type", "font/otf");
        fs.createReadStream(fp).pipe(res);
      });
    },
  };
}

// 畫廊 API：讓 public/refs 的參考圖能在瀏覽器裡列出 / 上傳 / 刪除（只在 dev 生效）。
const REFS_URL = new URL("./public/refs/", import.meta.url);
const REFS_DIR = fileURLToPath(REFS_URL);
const IMG_EXT = /\.(png|jpe?g|webp|gif)$/i;
const safeName = (n: string) => path.basename(n || "");

function galleryApi() {
  return {
    name: "gallery-api",
    configureServer(server: any) {
      // 列出所有圖片檔名
      server.middlewares.use("/refs-list", (_req: any, res: any) => {
        try {
          const names = fs
            .readdirSync(REFS_DIR)
            .filter((n) => IMG_EXT.test(n));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(names));
        } catch {
          res.statusCode = 500;
          res.end("[]");
        }
      });
      // 上傳：POST /refs-upload?name=檔名，body 為檔案原始 bytes
      server.middlewares.use("/refs-upload", (req: any, res: any) => {
        if (req.method !== "POST") { res.statusCode = 405; res.end("method"); return; }
        const q = new URL(req.url, "http://x").searchParams.get("name") || "";
        const name = safeName(q);
        if (!name || !IMG_EXT.test(name)) { res.statusCode = 400; res.end("bad name"); return; }
        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", () => {
          try {
            fs.mkdirSync(REFS_DIR, { recursive: true });
            fs.writeFileSync(path.join(REFS_DIR, name), Buffer.concat(chunks));
            syncRefsManifest(REFS_URL);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, name }));
          } catch (e) {
            res.statusCode = 500; res.end("write failed");
          }
        });
      });
      // 讀取所有圖片說明：GET /refs-captions → { 檔名: 說明 }
      server.middlewares.use("/refs-captions", (_req: any, res: any) => {
        try {
          const fp = path.join(REFS_DIR, "captions.json");
          const data = fs.existsSync(fp) ? fs.readFileSync(fp, "utf-8") : "{}";
          res.setHeader("Content-Type", "application/json");
          res.end(data || "{}");
        } catch {
          res.statusCode = 500;
          res.end("{}");
        }
      });
      // 讀取目前 manifest：GET /refs-manifest
      server.middlewares.use("/refs-manifest", (_req: any, res: any) => {
        try {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(buildRefsManifest(REFS_URL)));
        } catch {
          res.statusCode = 500;
          res.end("{}");
        }
      });
      // 儲存單張說明：POST /refs-caption，body 為 JSON {name, text}
      server.middlewares.use("/refs-caption", (req: any, res: any) => {
        if (req.method !== "POST") { res.statusCode = 405; res.end("method"); return; }
        let body = "";
        req.on("data", (c: Buffer) => (body += c));
        req.on("end", () => {
          try {
            const { name: rawName, text } = JSON.parse(body || "{}");
            const name = safeName(rawName);
            if (!name || !IMG_EXT.test(name)) { res.statusCode = 400; res.end("bad name"); return; }
            const fp = path.join(REFS_DIR, "captions.json");
            const all = fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, "utf-8") || "{}") : {};
            if (text && String(text).trim()) all[name] = String(text);
            else delete all[name];
            fs.writeFileSync(fp, JSON.stringify(all, null, 2));
            syncRefsManifest(REFS_URL);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch {
            res.statusCode = 500; res.end("save failed");
          }
        });
      });
      // 儲存單張分類：POST /refs-category，body 為 JSON {name, cat}
      server.middlewares.use("/refs-category", (req: any, res: any) => {
        if (req.method !== "POST") { res.statusCode = 405; res.end("method"); return; }
        let body = "";
        req.on("data", (c: Buffer) => (body += c));
        req.on("end", () => {
          try {
            const { name: rawName, cat } = JSON.parse(body || "{}");
            const name = safeName(rawName);
            const item = saveRefCategory(REFS_URL, name, String(cat || ""));
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, item }));
          } catch {
            res.statusCode = 500; res.end("save failed");
          }
        });
      });
      // 刪除：POST /refs-delete，body 為 JSON {name}
      server.middlewares.use("/refs-delete", (req: any, res: any) => {
        if (req.method !== "POST") { res.statusCode = 405; res.end("method"); return; }
        let body = "";
        req.on("data", (c: Buffer) => (body += c));
        req.on("end", () => {
          try {
            const name = safeName(JSON.parse(body || "{}").name);
            if (!name || !IMG_EXT.test(name)) { res.statusCode = 400; res.end("bad name"); return; }
            const fp = path.join(REFS_DIR, name);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
            removeRefFromManifest(REFS_URL, name);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch {
            res.statusCode = 500; res.end("delete failed");
          }
        });
      });
    },
  };
}

export default defineConfig({
  base: "/font-tool/",
  // preview 工具會用 PORT 環境變數指派埠號;沒有就用 Vite 預設
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  plugins: [react(), tailwindcss(), serveUserFonts(), galleryApi()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
