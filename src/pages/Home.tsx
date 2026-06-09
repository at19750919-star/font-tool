import { useState, useMemo, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Copy, Check, X, LayoutGrid, Eye, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useLocalFonts } from "@/hooks/useLocalFonts";
import { FontUploader } from "@/components/FontUploader";
import "@/studio.css";

// 與 dashboard 一致的網路字型（Google Fonts + CDN，已在 index.html 載入）
// script 標註此字型主要涵蓋的字元：中文(含日文漢字) / 英文(拉丁)
const WEB_FONTS: { family: string; script: "中文" | "英文"; cn?: string }[] = [
  // 中文 / 日文（含漢字）
  { family: "Dela Gothic One", script: "中文", cn: "演唱會海報黑體" },
  { family: "DotGothic16", script: "中文", cn: "像素點陣黑體" },
  { family: "Zen Old Mincho", script: "中文", cn: "金色裝飾明朝" },
  { family: "Rampart One", script: "中文", cn: "中空立體" },
  { family: "Reggae One", script: "中文", cn: "複古反白" },
  { family: "Hachi Maru Pop", script: "中文", cn: "手寫圓滑" },
  { family: "Stick", script: "中文", cn: "骨架細體" },
  { family: "Potta One", script: "中文", cn: "超粗膨脹黑體" },
  { family: "RocknRoll One", script: "中文", cn: "活力手感黑體" },
  { family: "Palette Mosaic", script: "中文", cn: "馬賽克拼貼" },
  { family: "Kaisei Opti", script: "中文", cn: "日式優雅明朝" },
  { family: "Chocolate Classical Sans", script: "中文", cn: "優雅現代" },
  { family: "LXGW WenKai TC", script: "中文", cn: "霞鶩文楷" },
  { family: "LXGW WenKai Mono TC", script: "中文", cn: "等寬楷書" },
  { family: "Taipei Sans TC", script: "中文", cn: "台北黑體" },
  { family: "Chiron Sung HK WS", script: "中文", cn: "港式現代宋" },
  // 本機下載字型（檔案放 public/fonts/，@font-face 定義在 index.html）
  { family: "ChenYuluoyan Thin", script: "中文", cn: "極細毛筆楷書" },
  { family: "GenWanMin2 TC", script: "中文", cn: "文鼎開源宋體" },
  { family: "Glow Sans TC Extended", script: "中文", cn: "多字重無襯線" },
  { family: "Satsuki Gendai Mincho", script: "中文", cn: "現代感明朝" },
  { family: "Swei Spring CJK TC", script: "中文", cn: "台灣手感黑體" },
  { family: "ToneOZ Tsuipita TC", script: "中文", cn: "注音符號標注" },
  { family: "香萃刻宋", script: "中文", cn: "精刻宋體" },
  { family: "哥特式字體", script: "中文", cn: "西式哥特裝飾" },
  { family: "漢儀彩雲體繁", script: "中文", cn: "雲朵裝飾輪廓" },
  { family: "漢儀齊黑繁", script: "中文", cn: "方正均勻黑體" },
  { family: "山海黑奇式格特", script: "中文", cn: "奇幻哥特黑體" },
  { family: "山海星夜格特", script: "中文", cn: "星夜哥特黑體" },
  { family: "Gen Ei Gothic P Heavy", script: "中文", cn: "源暎圓角超粗黑" },
  { family: "AR RomanMinchoJP UL", script: "中文", cn: "日系超細明朝" },
  // 英文（拉丁）
  { family: "Monoton", script: "英文" },
  { family: "Bebas Neue", script: "英文" },
  { family: "Pacifico", script: "英文" },
  { family: "Press Start 2P", script: "英文" },
  { family: "Orbitron", script: "英文" },
  { family: "Audiowide", script: "英文" },
  { family: "Russo One", script: "英文" },
  { family: "Major Mono Display", script: "英文" },
  { family: "Abril Fatface", script: "英文" },
  { family: "Rubik Glitch", script: "英文" },
  { family: "Bungee Shade", script: "英文" },
  { family: "Rubik Wet Paint", script: "英文" },
  { family: "Cherry Bomb One", script: "英文" },
  { family: "Kablammo", script: "英文" },
  { family: "Faster One", script: "英文" },
  { family: "Wallpoet", script: "英文" },
  { family: "Iceberg", script: "英文" },
  { family: "Rubik Mono One", script: "英文" },
  { family: "Modak", script: "英文" },
  { family: "Playfair Display", script: "英文" },
  { family: "DM Serif Display", script: "英文" },
  { family: "Bodoni Moda", script: "英文" },
  { family: "Yeseva One", script: "英文" },
  { family: "Libre Bodoni", script: "英文" },
  { family: "Roboto Slab", script: "英文" },
  { family: "Old Standard TT", script: "英文" },
  { family: "Cormorant SC", script: "英文" },
  { family: "Source Serif 4", script: "英文" },
  { family: "Fraunces", script: "英文" },
  { family: "Instrument Serif", script: "英文" },
  { family: "Caveat", script: "英文" },
  { family: "Patrick Hand", script: "英文" },
  { family: "DM Sans", script: "英文" },
  { family: "JetBrains Mono", script: "英文" },
];

// 把字型清單依「中文 / 英文 / 數字 / 其他」分組（固定顯示順序）
const SCRIPT_ORDER = ["中文", "英文", "數字", "其他"] as const;
function groupByScript<T extends { script?: string }>(items: T[]) {
  const groups: Record<string, T[]> = {};
  items.forEach((it) => {
    const k = it.script || "其他";
    (groups[k] = groups[k] || []).push(it);
  });
  return SCRIPT_ORDER.filter((k) => groups[k]?.length).map(
    (k) => [k, groups[k]] as [string, T[]],
  );
}

// 常見的中文字型列表
const FONT_LIST = [
  { name: "系統預設", value: "system-ui", category: "系統" },
  { name: "微軟雅黑", value: "'Microsoft YaHei', sans-serif", category: "系統" },
  { name: "蘋果字體", value: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', sans-serif", category: "系統" },
  { name: "Noto Sans TC", value: "'Noto Sans TC', sans-serif", category: "Google Fonts" },
  { name: "Noto Serif TC", value: "'Noto Serif TC', serif", category: "Google Fonts" },
  { name: "思源黑體", value: "'Source Han Sans TC', sans-serif", category: "Adobe" },
  { name: "思源宋體", value: "'Source Han Serif TC', serif", category: "Adobe" },
  { name: "文泉驛微米黑", value: "'WenQuanYi Micro Hei', sans-serif", category: "開源" },
  { name: "文泉驛正黑", value: "'WenQuanYi Zen Hei', sans-serif", category: "開源" },
];

const DEFAULT_PREVIEW_TEXT = "一杯森活力滿分";

// 效果預設定義
interface TextEffectPreset {
  name: string;
  label: string;
  shadowEnabled: boolean;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowColor: string;
  shadowOpacity: number;
  strokeEnabled: boolean;
  strokeWidth: number;
  strokeColor: string;
}

const EFFECT_PRESETS: TextEffectPreset[] = [
  {
    name: "neon",
    label: "霓虹燈",
    shadowEnabled: true,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 20,
    shadowColor: "#ff00ff",
    shadowOpacity: 1,
    strokeEnabled: false,
    strokeWidth: 0,
    strokeColor: "#000000",
  },
  {
    name: "3d",
    label: "立體",
    shadowEnabled: true,
    shadowX: 4,
    shadowY: 4,
    shadowBlur: 8,
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    strokeEnabled: true,
    strokeWidth: 0.5,
    strokeColor: "#333333",
  },
  {
    name: "emboss",
    label: "浮雕",
    shadowEnabled: true,
    shadowX: -2,
    shadowY: -2,
    shadowBlur: 4,
    shadowColor: "#ffffff",
    shadowOpacity: 0.8,
    strokeEnabled: true,
    strokeWidth: 0.3,
    strokeColor: "#cccccc",
  },
  {
    name: "engrave",
    label: "陰刻",
    shadowEnabled: true,
    shadowX: 2,
    shadowY: 2,
    shadowBlur: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.6,
    strokeEnabled: false,
    strokeWidth: 0,
    strokeColor: "#000000",
  },
  {
    name: "metal",
    label: "金屬",
    shadowEnabled: true,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 10,
    shadowColor: "#ffcc00",
    shadowOpacity: 0.7,
    strokeEnabled: true,
    strokeWidth: 1,
    strokeColor: "#cc9900",
  },
  {
    name: "glow",
    label: "發光",
    shadowEnabled: true,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 15,
    shadowColor: "#00ffff",
    shadowOpacity: 0.9,
    strokeEnabled: false,
    strokeWidth: 0,
    strokeColor: "#000000",
  },
];

// 產生「長陰影」用的多層 text-shadow 字串
const longShadow = (color: string, n = 16) =>
  Array.from({ length: n }, (_, i) => `${i + 1}px ${i + 1}px 0 ${color}`).join(", ");

// 設計文字效果：一鍵套用「整組」樣式（漸層 / 中空 / 多層陰影 / 螢光筆）
interface DesignPreset {
  name: string;
  label: string;
  gradient?: { type: "linear" | "radial"; angle: number; c1: string; c2: string };
  color?: string; // 純色文字（無漸層時）
  fillTransparent?: boolean; // 中空（只留描邊）
  stroke?: { width: number; color: string };
  shadow?: string; // 多層 text-shadow 字串
  highlight?: string; // 螢光筆底色
}

const DESIGN_PRESETS: DesignPreset[] = [
  // 金屬金漸層：金色漸層 + 頂部高光 + 落地陰影
  { name: "gold", label: "金屬金漸層", gradient: { type: "linear", angle: 100, c1: "#fff3b0", c2: "#b8860b" }, stroke: { width: 0.5, color: "#6b4e00" }, shadow: "0 1px 0 #fff8d8, 0 2px 4px rgba(0,0,0,.32)" },
  // 鮮豔漸層：紫→粉 + 柔光
  { name: "vivid", label: "鮮豔漸層", gradient: { type: "linear", angle: 95, c1: "#7c3aed", c2: "#fb7185" }, shadow: "0 2px 7px rgba(124,58,237,.35)" },
  // 鍍鉻銀：上白下灰 + 上下金屬邊 + 落地陰影
  { name: "chrome", label: "鍍鉻銀", gradient: { type: "linear", angle: 180, c1: "#ffffff", c2: "#6b7280" }, stroke: { width: 0.5, color: "#4b5563" }, shadow: "0 1px 0 #ffffff, 0 -1px 0 #cbd5e1, 0 3px 5px rgba(0,0,0,.4)" },
  // 霓虹發光：白色核心 + 多層粉光暈
  { name: "neon", label: "霓虹發光", color: "#ff2db6", shadow: "0 0 2px #ffffff, 0 0 6px #ff2db6, 0 0 14px #ff2db6, 0 0 28px #ff2db6, 0 0 52px #ff2db6" },
  // 立體 3D：米白面 + 左上亮邊 + 多層暗面擠出 + 落地陰影
  { name: "extrude3d", label: "立體 3D", color: "#ece3cf", shadow: "-1px -1px 0 #ffffff, 1px 1px 0 #c9bd99, 2px 2px 0 #c0b48f, 3px 3px 0 #b6aa85, 4px 4px 0 #ac9f7a, 5px 5px 0 #a29570, 6px 6px 0 #988b66, 7px 7px 0 #8d815b, 8px 8px 0 #837751, 11px 11px 17px rgba(0,0,0,.38)" },
  // 長陰影：亮面 + 22 層 45° 半透明長陰影
  { name: "longshadow", label: "長陰影", color: "#14b8a6", shadow: longShadow("rgba(13,90,84,.45)", 22) },
  // 中空描邊:粗外框 + 透明填色 + 淡位移陰影
  { name: "hollow", label: "中空描邊", fillTransparent: true, stroke: { width: 2.5, color: "#111827" }, shadow: "3px 3px 0 rgba(17,24,39,.12)" },
  // 霓虹中空:粉外框 + 透明填色 + 多層光暈
  { name: "neonHollow", label: "霓虹中空", fillTransparent: true, stroke: { width: 1.6, color: "#ff2d95" }, shadow: "0 0 6px #ff2d95, 0 0 14px #ff2d95, 0 0 28px #ff2d95" },
  // 套印錯位:青 / 洋紅雙色錯位
  { name: "misprint", label: "套印錯位", color: "#111827", shadow: "3px 3px 0 #00b4d8, -3px -3px 0 #ff006e" },
  // 故障 glitch:紅藍 RGB 分離
  { name: "glitch", label: "故障 glitch", color: "#111827", shadow: "3px 0 #ff006e, -3px 0 #00e5ff, 0 2px 0 #00e5ff" },
  // 浮雕:近底色面 + 上亮下暗壓印
  { name: "emboss2", label: "浮雕", color: "#d8dde3", shadow: "0 1px 0 #ffffff, 0 -1px 1px rgba(0,0,0,.25)" },
  // 螢光筆:深字 + 黃色底線色塊
  { name: "marker", label: "螢光筆", color: "#1f2937", highlight: "#fde047" },
];

// 設計按鈕效果：一鍵套用整顆按鈕的外觀
interface ButtonPreset {
  name: string;
  label: string;
  grad?: { angle: number; c1: string; c2: string };
  bg?: string; // 純色背景（可用 rgba / transparent）
  radius: number;
  border?: { width: number; color: string };
  boxShadow?: string;
  backdropBlur?: number;
  textColor: string;
  px?: number;
  py?: number;
}

const BUTTON_PRESETS: ButtonPreset[] = [
  { name: "glass", label: "玻璃擬態", bg: "rgba(255,255,255,0.35)", radius: 16, border: { width: 1, color: "rgba(255,255,255,0.7)" }, boxShadow: "0 8px 32px rgba(31,38,135,0.18)", backdropBlur: 8, textColor: "#1f2937", px: 28, py: 14 },
  { name: "gradGlow", label: "漸層光暈", grad: { angle: 95, c1: "#a855f7", c2: "#ec4899" }, radius: 999, boxShadow: "0 10px 28px rgba(168,85,247,0.5)", textColor: "#ffffff", px: 30, py: 14 },
  { name: "neu", label: "新擬態", bg: "#e0e5ec", radius: 16, boxShadow: "8px 8px 16px #b8bcc4, -8px -8px 16px #ffffff", textColor: "#555f6d", px: 28, py: 14 },
  { name: "brutal", label: "neo-brutalism", bg: "#ffde59", radius: 4, border: { width: 2, color: "#111111" }, boxShadow: "5px 5px 0 #111111", textColor: "#111111", px: 26, py: 13 },
  { name: "neonBorder", label: "霓虹邊框", bg: "#0b0f1a", radius: 10, border: { width: 2, color: "#22d3ee" }, boxShadow: "0 0 8px #22d3ee, 0 0 18px #22d3ee, inset 0 0 8px rgba(34,211,238,0.45)", textColor: "#22d3ee", px: 28, py: 13 },
  { name: "press3d", label: "3D 按下", bg: "#ff7a18", radius: 12, boxShadow: "0 6px 0 #b3530f", textColor: "#ffffff", px: 28, py: 13 },
  { name: "ghost", label: "Ghost 描邊", bg: "transparent", radius: 8, border: { width: 2, color: "#3b82f6" }, textColor: "#3b82f6", px: 26, py: 12 },
  { name: "metal", label: "金屬質感", grad: { angle: 180, c1: "#f7f7f7", c2: "#9aa0a6" }, radius: 8, border: { width: 1, color: "#7c7c7c" }, boxShadow: "inset 0 1px 0 #ffffff, 0 2px 5px rgba(0,0,0,0.35)", textColor: "#2b2f33", px: 28, py: 13 },
  { name: "clay", label: "黏土擬態", bg: "#c9a7ff", radius: 26, boxShadow: "10px 10px 22px rgba(0,0,0,0.2), inset -5px -5px 10px rgba(0,0,0,0.18), inset 5px 6px 14px rgba(255,255,255,0.7)", textColor: "#4c1d95", px: 30, py: 15 },
];

// 把 React.CSSProperties 轉成 CSS 文字字串（camelCase→kebab-case，數字補 px）
const styleToCss = (style: React.CSSProperties): string =>
  Object.entries(style)
    .map(([k, v]) => {
      const prop = k
        .replace(/^Webkit/, "webkit")
        .replace(/^Moz/, "moz")
        .replace(/^ms/, "ms")
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()
        .replace(/^webkit/, "-webkit")
        .replace(/^moz/, "-moz")
        .replace(/^ms/, "-ms");
      const val = typeof v === "number" ? `${v}px` : v;
      return `${prop}: ${val};`;
    })
    .join(" ");

// 設計卡片效果：一鍵套用整張卡片的外觀（外框 / 樣式）
interface CardPreset { name: string; label: string; style: React.CSSProperties; textColor: string; badges?: boolean; }

const CARD_PRESETS: CardPreset[] = [
  { name: "gradBorder", label: "漸層描邊", textColor: "#1f2937", style: { background: "linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#a855f7,#ec4899) border-box", border: "3px solid transparent", borderRadius: 16 } },
  { name: "neonBorder", label: "霓虹外框", textColor: "#22d3ee", style: { background: "#0b0f1a", border: "2px solid #22d3ee", borderRadius: 12, boxShadow: "0 0 10px #22d3ee, 0 0 24px rgba(34,211,238,.5), inset 0 0 12px rgba(34,211,238,.25)" } },
  { name: "doubleLine", label: "復古雙線", textColor: "#6b5b4a", style: { background: "#fdf6e3", border: "4px double #6b5b4a", borderRadius: 6 } },
  { name: "inset", label: "內凹卡片", textColor: "#555f6d", style: { background: "#e8eaed", borderRadius: 14, boxShadow: "inset 6px 6px 12px #c4c7cc, inset -6px -6px 12px #ffffff" } },
  { name: "ticket", label: "票券缺角", textColor: "#1f2937", style: { background: "#ffffff", borderRadius: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.12)", maskImage: "radial-gradient(circle 13px at left center, transparent 12px, #000 13px), radial-gradient(circle 13px at right center, transparent 12px, #000 13px)", WebkitMaskImage: "radial-gradient(circle 13px at left center, transparent 12px, #000 13px), radial-gradient(circle 13px at right center, transparent 12px, #000 13px)", maskComposite: "intersect", WebkitMaskComposite: "source-in" } },
  { name: "corner", label: "四角裝飾", textColor: "#111111", style: { backgroundColor: "#ffffff", background: "linear-gradient(#111,#111) left top/20px 2px no-repeat, linear-gradient(#111,#111) left top/2px 20px no-repeat, linear-gradient(#111,#111) right top/20px 2px no-repeat, linear-gradient(#111,#111) right top/2px 20px no-repeat, linear-gradient(#111,#111) left bottom/20px 2px no-repeat, linear-gradient(#111,#111) left bottom/2px 20px no-repeat, linear-gradient(#111,#111) right bottom/20px 2px no-repeat, linear-gradient(#111,#111) right bottom/2px 20px no-repeat, #ffffff", borderRadius: 2 } },
  { name: "brutal", label: "手繪粗框", textColor: "#111111", style: { background: "#fffef5", border: "2.5px solid #111111", borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px", boxShadow: "3px 4px 0 rgba(17,17,17,0.85)" } },
  { name: "frosted", label: "毛玻璃", textColor: "#1f2937", style: { background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 18, boxShadow: "0 8px 32px rgba(31,38,135,0.15)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" } },
  { name: "liquidGlass", label: "液態玻璃", textColor: "#1f2937", style: { background: "linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.15))", border: "1px solid rgba(255,255,255,0.8)", borderRadius: 28, boxShadow: "0 12px 40px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -10px 22px rgba(255,255,255,0.25)", backdropFilter: "blur(14px) saturate(160%)", WebkitBackdropFilter: "blur(14px) saturate(160%)" } },
  { name: "neumorph", label: "新擬物", textColor: "#555f6d", style: { background: "#e0e5ec", borderRadius: 20, boxShadow: "9px 9px 18px #b8bcc4, -9px -9px 18px #ffffff" } },
  { name: "clay", label: "黏土擬態", textColor: "#4c1d95", style: { background: "#c9a7ff", borderRadius: 32, boxShadow: "30px 30px 60px rgba(0,0,0,0.22), inset -8px -8px 16px rgba(0,0,0,0.18), inset 8px 10px 22px rgba(255,255,255,0.65)" } },
  { name: "softui", label: "柔感 UI", textColor: "#4b5563", style: { background: "#eef1f6", borderRadius: 20, boxShadow: "6px 6px 14px #d1d6e0, -6px -6px 14px #ffffff" } },
  { name: "darkmode", label: "深色模式", textColor: "#e2e8f0", style: { background: "#1e293b", borderRadius: 14, border: "1px solid #334155", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" } },
  { name: "stripe", label: "Stripe 風", textColor: "#635bff", style: { background: "#ffffff", borderRadius: 16, border: "1px solid #eef0f5", boxShadow: "0 7px 14px rgba(50,50,93,0.1), 0 3px 6px rgba(0,0,0,0.08)" } },
  { name: "kawaii", label: "可愛粉嫩", textColor: "#d6336c", style: { background: "#ffe3ef", borderRadius: 30, border: "2px solid #ffb6d5", boxShadow: "0 6px 0 #ffb6d5" } },
  { name: "tropical", label: "熱帶漸層", textColor: "#ffffff", style: { background: "linear-gradient(135deg,#34d399,#06b6d4 50%,#fbbf24)", borderRadius: 20, boxShadow: "0 10px 24px rgba(6,182,212,0.35)" } },
  { name: "apple", label: "Apple 風", textColor: "#1d1d1f", style: { background: "rgba(255,255,255,0.9)", borderRadius: 22, border: "1px solid #ececec", boxShadow: "0 12px 30px rgba(0,0,0,0.1)" } },
  { name: "flat", label: "極簡扁平", textColor: "#111827", style: { background: "#ffffff", borderRadius: 6, border: "1px solid #e5e7eb" } },
  { name: "notion", label: "Notion 風", textColor: "#37352f", style: { background: "#ffffff", borderRadius: 6, border: "1px solid #e9e9e7", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" } },
  { name: "japaneseFresh", label: "日系清新", textColor: "#4b6b46", style: { background: "#f7fbf5", borderRadius: 16, border: "1px solid #dcebd6", boxShadow: "0 6px 16px rgba(120,160,110,0.18)" } },
  { name: "scandinavian", label: "北歐極簡", textColor: "#4a463f", style: { background: "#f3efe9", borderRadius: 10, border: "1px solid #e0d8cc" } },
  { name: "monochrome", label: "黑白", textColor: "#111111", style: { background: "#ffffff", borderRadius: 4, border: "2px solid #111111" } },
  { name: "koreanMinimal", label: "韓系極簡", textColor: "#6b6b6b", style: { background: "#fafafa", borderRadius: 18, boxShadow: "0 8px 20px rgba(0,0,0,0.06)" } },
  { name: "swiss", label: "瑞士風", textColor: "#e3000f", style: { background: "#ffffff", borderRadius: 0, border: "2px solid #111111" } },
  { name: "github", label: "GitHub 風", textColor: "#1f2328", style: { background: "#ffffff", borderRadius: 6, border: "1px solid #d0d7de", boxShadow: "0 1px 0 rgba(27,31,36,0.04)" } },
  { name: "corporateClean", label: "企業簡潔", textColor: "#1e3a5f", style: { background: "#ffffff", borderRadius: 8, border: "1px solid #e3e8ef", boxShadow: "0 4px 12px rgba(16,42,80,0.08)" } },
  { name: "editorialCard", label: "雜誌編輯", textColor: "#2b2b2b", style: { background: "#fbf7ef", borderRadius: 2, border: "1px solid #e5dccb" } },
  { name: "terracotta", label: "陶土色", textColor: "#ffffff", style: { background: "#e2725b", borderRadius: 16, boxShadow: "0 8px 20px rgba(226,114,91,0.4)" } },
  { name: "naturalOrganic", label: "自然有機", textColor: "#4a5c3a", style: { background: "#eaf0e4", borderRadius: "40px 24px 40px 24px", border: "1px solid #cdd9c0" } },
  { name: "material", label: "材料設計", textColor: "#6200ee", style: { background: "#ffffff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.12)" } },
  { name: "vaporwaveCard", label: "蒸氣波", textColor: "#2d0a4e", style: { background: "linear-gradient(135deg,#ff71ce,#01cdfe)", borderRadius: 14, boxShadow: "0 0 18px rgba(255,113,206,0.6)" } },
  { name: "retroVintage", label: "復古懷舊", textColor: "#6b4f2a", style: { background: "#f4e4c1", borderRadius: 6, border: "3px double #8a6d3b" } },
  { name: "y2kCard", label: "Y2K 千禧", textColor: "#3a3a5a", style: { background: "linear-gradient(135deg,#c0c0c0,#e8e8e8 50%,#a0a0a0)", borderRadius: 18, border: "1px solid #b0b0b0", boxShadow: "inset 0 1px 2px #ffffff, 0 4px 10px rgba(0,0,0,0.3)" } },
  { name: "skeuomorphCard", label: "擬物質感", textColor: "#333333", style: { background: "linear-gradient(180deg,#fdfdfd,#dcdcdc)", borderRadius: 12, border: "1px solid #b9b9b9", boxShadow: "inset 0 1px 0 #ffffff, 0 3px 6px rgba(0,0,0,0.3)" } },
  { name: "synthwave", label: "合成波", textColor: "#ff6ad5", style: { background: "linear-gradient(180deg,#241734,#43225b)", borderRadius: 12, border: "1px solid #ff2d95", boxShadow: "0 0 20px rgba(255,45,149,0.5)" } },
  { name: "outrun", label: "Outrun", textColor: "#f72585", style: { background: "linear-gradient(180deg,#0d0221,#3a0ca3)", borderRadius: 10, boxShadow: "0 0 20px rgba(247,37,133,0.5)" } },
  { name: "frutigerAero", label: "清新水感", textColor: "#0a558c", style: { background: "linear-gradient(180deg,#cdefff,#9fe3ff)", borderRadius: 18, border: "1px solid #ffffff", boxShadow: "inset 0 2px 6px rgba(255,255,255,0.8), 0 8px 18px rgba(60,160,220,0.35)" } },
  { name: "neoBrutalist", label: "新野獸派", textColor: "#111111", style: { background: "#ffffff", borderRadius: 2, border: "3px solid #111111", boxShadow: "6px 6px 0 #ff4d4d" } },
  { name: "neonTokyo", label: "霓虹東京", textColor: "#22d3ee", style: { background: "#0a0a12", borderRadius: 12, border: "1px solid #ff2d95", boxShadow: "0 0 12px #ff2d95, 0 0 24px rgba(34,211,238,0.5)" } },
  { name: "modernGradient", label: "現代漸層", textColor: "#ffffff", style: { background: "linear-gradient(135deg,#667eea,#764ba2)", borderRadius: 18, boxShadow: "0 10px 24px rgba(118,75,162,0.4)" } },
  { name: "cyberpunkNeon", label: "賽博霓虹", textColor: "#00ffff", style: { background: "#0d0d0d", borderRadius: 8, border: "1px solid #ff00ff", boxShadow: "0 0 10px #00ffff, inset 0 0 10px rgba(255,0,255,0.3)" } },
  { name: "holographicCard", label: "全像虹彩", textColor: "#3a2d55", style: { background: "linear-gradient(135deg,#a1c4fd,#c2e9fb 30%,#fbc2eb 60%,#fda085)", borderRadius: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" } },
  { name: "glitchCard", label: "故障藝術", textColor: "#ffffff", style: { background: "#0d0d0d", borderRadius: 4, boxShadow: "3px 0 #ff006e, -3px 0 #00e5ff" } },
  { name: "badges", label: "彩色標籤", textColor: "#1f2937", badges: true, style: { background: "transparent" } },
];

// 設計滑桿效果：一鍵套用滑軌 / 已填段 / 把手樣式
interface SliderPreset { name: string; label: string; track: React.CSSProperties; fill: React.CSSProperties; thumb: React.CSSProperties; }

const SLIDER_PRESETS: SliderPreset[] = [
  { name: "neon", label: "霓虹內外光", track: { height: 8, background: "#0b0f1a", borderRadius: 999, boxShadow: "inset 0 0 6px rgba(34,211,238,0.4)" }, fill: { background: "#22d3ee", boxShadow: "0 0 8px #22d3ee, 0 0 16px #22d3ee" }, thumb: { width: 22, height: 22, background: "#0b0f1a", border: "2px solid #22d3ee", boxShadow: "0 0 10px #22d3ee, inset 0 0 6px #22d3ee" } },
  { name: "insetTrack", label: "內凹軌道", track: { height: 10, background: "#e0e5ec", borderRadius: 999, boxShadow: "inset 3px 3px 6px #b8bcc4, inset -3px -3px 6px #ffffff" }, fill: { background: "#94a3b8" }, thumb: { width: 22, height: 22, background: "#f0f3f7", boxShadow: "3px 3px 6px #b8bcc4, -3px -3px 6px #ffffff" } },
  { name: "neumorph", label: "新擬態凸起", track: { height: 10, background: "#e0e5ec", borderRadius: 999, boxShadow: "3px 3px 6px #b8bcc4, -3px -3px 6px #ffffff" }, fill: { background: "#a3aab8" }, thumb: { width: 22, height: 22, background: "#e0e5ec", boxShadow: "3px 3px 6px #b8bcc4, -3px -3px 6px #ffffff" } },
  { name: "gradient", label: "漸層軌道", track: { height: 8, background: "#e5e7eb", borderRadius: 999 }, fill: { background: "linear-gradient(90deg,#a855f7,#ec4899)" }, thumb: { width: 22, height: 22, background: "#ffffff", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" } },
  { name: "glass", label: "玻璃", track: { height: 10, background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 999 }, fill: { background: "rgba(168,85,247,0.55)" }, thumb: { width: 22, height: 22, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.85)", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" } },
  { name: "solid3d", label: "立體把手", track: { height: 8, background: "#e5e7eb", borderRadius: 999 }, fill: { background: "#3b82f6" }, thumb: { width: 24, height: 24, background: "#3b82f6", boxShadow: "0 4px 0 #1e40af" } },
  { name: "thick", label: "粗描邊", track: { height: 12, background: "#ffffff", border: "2px solid #111111", borderRadius: 999 }, fill: { background: "#ffde59" }, thumb: { width: 24, height: 24, background: "#ffffff", border: "2px solid #111111", boxShadow: "3px 3px 0 #111111" } },
  { name: "minimal", label: "極簡", track: { height: 4, background: "#e5e7eb", borderRadius: 999 }, fill: { background: "#111111" }, thumb: { width: 14, height: 14, background: "#111111" } },
];

interface ComparisonFont {
  id: string;
  font: typeof FONT_LIST[0];
}

export default function Home() {
  const [previewText, setPreviewText] = useState(DEFAULT_PREVIEW_TEXT);
  const [selectedFont, setSelectedFont] = useState({ name: "Dela Gothic One", value: "'Dela Gothic One'", category: "網路字型" });
  const [fontSize, setFontSize] = useState(48);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [wordSpacing, setWordSpacing] = useState(0);
  const [fontWeight, setFontWeight] = useState(400);
  const [textOpacity, setTextOpacity] = useState(100);
  const [textColor, setTextColor] = useState("#111827"); // 純色文字顏色（非漸層時）
  const [previewBgColor, setPreviewBgColor] = useState("#f9fafb"); // 預覽區（按鈕後面那塊）底色
  const [gallerySample, setGallerySample] = useState("永 國 字體 Aa 123"); // 畫廊中文字型卡片的範例字（可自訂）
  const [copied, setCopied] = useState(false);

  // 預覽模式：純文字 / 按鈕
  const [previewMode, setPreviewMode] = useState<"text" | "button" | "card" | "slider">("text");

  // ── 按鈕外框狀態（btn* / bg* 前綴，避開文字漸層 gradient*）──
  // 盒模型
  const [btnPaddingX, setBtnPaddingX] = useState(24);
  const [btnPaddingY, setBtnPaddingY] = useState(12);
  const [btnBorderRadius, setBtnBorderRadius] = useState(8);
  const [btnWidth, setBtnWidth] = useState("auto");
  const [btnHeight, setBtnHeight] = useState("auto");
  // 邊框
  const [btnBorderMode, setBtnBorderMode] = useState<"unified" | "separate">("unified");
  const [btnBorderWidth, setBtnBorderWidth] = useState(0);
  const [btnBorderTopWidth, setBtnBorderTopWidth] = useState(0);
  const [btnBorderRightWidth, setBtnBorderRightWidth] = useState(0);
  const [btnBorderBottomWidth, setBtnBorderBottomWidth] = useState(0);
  const [btnBorderLeftWidth, setBtnBorderLeftWidth] = useState(0);
  const [btnBorderColor, setBtnBorderColor] = useState("#000000");
  const [btnBorderStyle, setBtnBorderStyle] = useState("solid");
  const [btnBorderGlowEnabled, setBtnBorderGlowEnabled] = useState(false);
  const [btnBorderGlowColor, setBtnBorderGlowColor] = useState("#0066cc");
  const [btnBorderGlowBlur, setBtnBorderGlowBlur] = useState(5);
  const [btnBorderGlowSpread, setBtnBorderGlowSpread] = useState(0);
  // 背景
  const [btnBgColor, setBtnBgColor] = useState("#3498db");
  const [bgUseGradient, setBgUseGradient] = useState(false);
  const [bgGradColor1, setBgGradColor1] = useState("#3498db");
  const [bgGradColor2, setBgGradColor2] = useState("#2980b9");
  const [bgGradAngle, setBgGradAngle] = useState(90);
  // 懸停
  const [btnHoverBgColor, setBtnHoverBgColor] = useState("#2980b9");
  const [btnHoverScale, setBtnHoverScale] = useState(1);
  const [btnHoverShadow, setBtnHoverShadow] = useState("0px 4px 12px rgba(0, 0, 0, 0.15)");
  const [btnHoverShadowEnabled, setBtnHoverShadowEnabled] = useState(true);
  // 過渡
  const [btnTransitionDuration, setBtnTransitionDuration] = useState(0.3);
  const [btnTransitionTiming, setBtnTransitionTiming] = useState("ease");
  // 焦點
  const [btnFocusBgColor, setBtnFocusBgColor] = useState("#2980b9");
  const [btnFocusBorderColor, setBtnFocusBorderColor] = useState("#0066cc");
  const [btnFocusBorderWidth, setBtnFocusBorderWidth] = useState(2);
  const [btnFocusOutlineEnabled, setBtnFocusOutlineEnabled] = useState(true);
  const [btnFocusOutlineColor, setBtnFocusOutlineColor] = useState("#0066cc");
  const [btnFocusOutlineWidth, setBtnFocusOutlineWidth] = useState(2);
  const [btnFocusShadow, setBtnFocusShadow] = useState("0 0 0 3px rgba(0, 102, 204, 0.25)");
  const [btnFocusShadowEnabled, setBtnFocusShadowEnabled] = useState(true);
  // 禁用
  const [btnDisabledOpacity, setBtnDisabledOpacity] = useState(0.5);
  const [btnDisabledCursor, setBtnDisabledCursor] = useState("not-allowed");
  const [btnDisabledEnabled, setBtnDisabledEnabled] = useState(true);
  // 按鈕整體透明度（與文字透明度獨立；宣告在此以利 cssCode useMemo 取用）
  const [btnOpacity, setBtnOpacity] = useState(100);

  // 文字效果狀態
  const [textShadowEnabled, setTextShadowEnabled] = useState(false);
  const [textShadowX, setTextShadowX] = useState(2);
  const [textShadowY, setTextShadowY] = useState(2);
  const [textShadowBlur, setTextShadowBlur] = useState(4);
  const [textShadowColor, setTextShadowColor] = useState("#000000");
  const [textShadowOpacity, setTextShadowOpacity] = useState(0.5);

  const [textStrokeEnabled, setTextStrokeEnabled] = useState(false);
  const [textStrokeWidth, setTextStrokeWidth] = useState(1);
  const [textStrokeColor, setTextStrokeColor] = useState("#000000");

  // 漸層效果狀態
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [gradientAngle, setGradientAngle] = useState(90);
  const [gradientColor1, setGradientColor1] = useState("#ff0000");
  const [gradientColor2, setGradientColor2] = useState("#0000ff");

  // 設計文字效果用的額外狀態
  const [textFillTransparent, setTextFillTransparent] = useState(false); // 中空（填色透明）
  const [textHighlightColor, setTextHighlightColor] = useState(""); // 螢光筆底色，"" = 不用
  const [effectShadow, setEffectShadow] = useState(""); // 多層 text-shadow 字串，"" = 不用
  const [activeDesignPreset, setActiveDesignPreset] = useState<string | null>(null);

  // ── 多層文字陰影 ──
  interface TextShadowLayer { id: number; x: number; y: number; blur: number; color: string; opacity: number; }
  const [textShadowLayers, setTextShadowLayers] = useState<TextShadowLayer[]>([]);
  const nextShadowId = () => Date.now();
  const addShadowLayer = () => setTextShadowLayers(prev => [...prev, { id: nextShadowId(), x: 2, y: 2, blur: 4, color: "#000000", opacity: 0.5 }]);
  const removeShadowLayer = (id: number) => setTextShadowLayers(prev => prev.filter(l => l.id !== id));
  const updateShadowLayer = (id: number, patch: Partial<TextShadowLayer>) => setTextShadowLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));

  // ── 文字變形 ──
  const [textRotate, setTextRotate] = useState(0);
  const [textSkewX, setTextSkewX] = useState(0);
  const [textSkewY, setTextSkewY] = useState(0);
  const [textScaleX, setTextScaleX] = useState(1);
  const [textPerspective, setTextPerspective] = useState(0); // 0 = 關；px 值
  const [textRotateX, setTextRotateX] = useState(0);
  const [textRotateY, setTextRotateY] = useState(0);

  // ── 直書 ──
  const [writingMode, setWritingMode] = useState<"horizontal-tb" | "vertical-rl" | "vertical-lr">("horizontal-tb");

  // ── 文字裝飾線 ──
  const [textDecoLine, setTextDecoLine] = useState<"none" | "underline" | "line-through" | "overline">("none");
  const [textDecoStyle, setTextDecoStyle] = useState<"solid" | "wavy" | "dashed" | "dotted" | "double">("solid");
  const [textDecoColor, setTextDecoColor] = useState("#111827");
  const [textDecoThickness, setTextDecoThickness] = useState(2);
  const [textUnderlineOffset, setTextUnderlineOffset] = useState(4);

  // ── 排版進階 ──
  const [textTransformVal, setTextTransformVal] = useState<"none" | "uppercase" | "lowercase" | "capitalize">("none");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("left");
  const [textIndent, setTextIndent] = useState(0);
  const [dropCapEnabled, setDropCapEnabled] = useState(false);

  // ── 濾鏡 ──
  const [filterBlur, setFilterBlur] = useState(0);
  const [filterBrightness, setFilterBrightness] = useState(100);
  const [filterContrast, setFilterContrast] = useState(100);
  const [filterHueRotate, setFilterHueRotate] = useState(0);
  const [filterSaturate, setFilterSaturate] = useState(100);
  const [filterDropShadowEnabled, setFilterDropShadowEnabled] = useState(false);
  const [filterDropShadowX, setFilterDropShadowX] = useState(2);
  const [filterDropShadowY, setFilterDropShadowY] = useState(2);
  const [filterDropShadowBlur, setFilterDropShadowBlur] = useState(4);
  const [filterDropShadowColor, setFilterDropShadowColor] = useState("#000000");

  // ── OpenType / 可變字型 ──
  const [ligatures, setLigatures] = useState(false);
  const [swash, setSwash] = useState(false);
  const [oldstyleNums, setOldstyleNums] = useState(false);
  const [tabularNums, setTabularNums] = useState(false);
  const [fontAxisWeight, setFontAxisWeight] = useState<number | null>(null); // null = 用 fontWeight slider
  const [fontAxisWidth, setFontAxisWidth] = useState(100);
  const [fontAxisOpticalSize, setFontAxisOpticalSize] = useState<number | null>(null);
  const [fontVariationEnabled, setFontVariationEnabled] = useState(false);

  // ── 混合模式 ──
  const [blendMode, setBlendMode] = useState<string>("normal");

  // ── 按鈕 :active 位移 ──
  const [btnActiveOffsetX, setBtnActiveOffsetX] = useState(0);
  const [btnActiveOffsetY, setBtnActiveOffsetY] = useState(2);

  // ── 卡片 tilt ──
  const [cardTiltEnabled, setCardTiltEnabled] = useState(false);
  const [cardTiltIntensity, setCardTiltIntensity] = useState(15);

  // 設計按鈕效果用的額外狀態
  const [btnBoxShadow, setBtnBoxShadow] = useState(""); // 整顆按鈕的 box-shadow（"" = 用發光邊框設定）
  const [btnBackdropBlur, setBtnBackdropBlur] = useState(0); // 毛玻璃模糊 px（0 = 關）
  const [activeButtonPreset, setActiveButtonPreset] = useState<string | null>(null);
  // 按鈕手動陰影（獨立於設計預設；inset 可做內陰影，X/Y 設 0 即內外光暈）
  const [btnShadowEnabled, setBtnShadowEnabled] = useState(false);
  const [btnShadowInset, setBtnShadowInset] = useState(false);
  const [btnShadowX, setBtnShadowX] = useState(0);
  const [btnShadowY, setBtnShadowY] = useState(6);
  const [btnShadowBlur, setBtnShadowBlur] = useState(16);
  const [btnShadowSpread, setBtnShadowSpread] = useState(0);
  const [btnShadowColor, setBtnShadowColor] = useState("#000000");
  const [btnShadowOpacity, setBtnShadowOpacity] = useState(0.2);

  // 設計卡片效果用的狀態
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>(CARD_PRESETS[0].style);
  const [cardTextColor, setCardTextColor] = useState<string>(CARD_PRESETS[0].textColor);
  const [activeCardPreset, setActiveCardPreset] = useState<string | null>(null);

  // 卡片外框手動覆蓋層（疊在卡片預設之上；套預設時清空）
  const [cardOverride, setCardOverride] = useState<React.CSSProperties>({});
  // 盒模型四項一律生效（預設值剛好等於原本寫死的 padding/width，視覺不變）
  const [cardPadX, setCardPadX] = useState(32);
  const [cardPadY, setCardPadY] = useState(28);
  const [cardRadius, setCardRadius] = useState(16);
  const [cardWidth, setCardWidth] = useState(360);
  const [cardHeight, setCardHeight] = useState("auto"); // 高度 auto / px
  // 邊框 / 背景 / 陰影各自有啟用開關，關閉時不寫進 cardOverride（讓預設透出）
  const [cardBorderEnabled, setCardBorderEnabled] = useState(false);
  const [cardBorderMode, setCardBorderMode] = useState<"unified" | "separate">("unified");
  const [cardBorderWidth, setCardBorderWidth] = useState(2);
  const [cardBorderTopWidth, setCardBorderTopWidth] = useState(0);
  const [cardBorderRightWidth, setCardBorderRightWidth] = useState(0);
  const [cardBorderBottomWidth, setCardBorderBottomWidth] = useState(0);
  const [cardBorderLeftWidth, setCardBorderLeftWidth] = useState(0);
  const [cardBorderColor, setCardBorderColor] = useState("#111111");
  const [cardBorderStyle, setCardBorderStyle] = useState("solid");
  // 發光邊框（卡片）
  const [cardBorderGlowEnabled, setCardBorderGlowEnabled] = useState(false);
  const [cardBorderGlowColor, setCardBorderGlowColor] = useState("#0066cc");
  const [cardBorderGlowBlur, setCardBorderGlowBlur] = useState(5);
  const [cardBgEnabled, setCardBgEnabled] = useState(false);
  const [cardBgColor, setCardBgColor] = useState("#ffffff");
  const [cardBgUseGradient, setCardBgUseGradient] = useState(false);
  const [cardBgGradColor1, setCardBgGradColor1] = useState("#a855f7");
  const [cardBgGradColor2, setCardBgGradColor2] = useState("#ec4899");
  const [cardBgGradAngle, setCardBgGradAngle] = useState(135);
  const [cardShadowEnabled, setCardShadowEnabled] = useState(false);
  const [cardShadow, setCardShadow] = useState("0 8px 24px rgba(0,0,0,0.12)");

  // 設計滑桿效果用的狀態
  const [sliderTrack, setSliderTrack] = useState<React.CSSProperties>(SLIDER_PRESETS[0].track);
  const [sliderFill, setSliderFill] = useState<React.CSSProperties>(SLIDER_PRESETS[0].fill);
  const [sliderThumb, setSliderThumb] = useState<React.CSSProperties>(SLIDER_PRESETS[0].thumb);
  const [activeSliderPreset, setActiveSliderPreset] = useState<string | null>(null);

  // 字型載入完成後 bump 一次，用來強制預覽重掛 → 讓 background-clip:text 的漸層
  // 在粗體網路字型 swap 進來後重新裁切(否則漸層會變成一塊底色跑到字後面)
  const [fontStamp, setFontStamp] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const fam = selectedFont.value.replace(/['"]/g, "").split(",")[0].trim();
    const done = () => { if (!cancelled) setFontStamp((n) => n + 1); };
    if ((document as any).fonts?.load) {
      (document as any).fonts.load(`48px "${fam}"`).then(done).catch(done);
    } else {
      done();
    }
    return () => { cancelled = true; };
  }, [selectedFont]);

  const [activePreset, setActivePreset] = useState<string | null>(null);
  
  // 組合效果狀態
  const [combinedPresets, setCombinedPresets] = useState<string[]>([]);
  const [combinedShadows, setCombinedShadows] = useState<string[]>([]);

  // 對比模式狀態
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonFonts, setComparisonFonts] = useState<ComparisonFont[]>([]);

  // 本地字型管理
  const { localFonts, isLoading, error, uploadFont, deleteFont, ensureFontLoaded, bulkImportSystemFonts } = useLocalFonts();
  const [isImporting, setIsImporting] = useState(false);
  // 各分組的收合狀態（key 例如 "web:中文"、"local:英文"）
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (k: string) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const handleBulkImport = async () => {
    setIsImporting(true);
    const toastId = toast.loading("匯入本機字型中…");
    try {
      const n = await bulkImportSystemFonts((done, total) => {
        toast.loading(`匯入本機字型中… ${done}/${total}`, { id: toastId });
      });
      toast.success(n > 0 ? `已匯入 ${n} 個本機字型` : "沒有新字型可匯入（都已在清單中）", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "匯入失敗", { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  const fontCategories = useMemo(() => {
    const categories = new Map<string, typeof FONT_LIST>();
    FONT_LIST.forEach((font) => {
      if (!categories.has(font.category)) {
        categories.set(font.category, []);
      }
      categories.get(font.category)!.push(font);
    });

    // 新增本地字型分類
    if (localFonts.length > 0) {
      categories.set("本地字型", localFonts.map((font) => ({
        name: font.name,
        value: `'${font.fontFamily}'`,
        category: "本地字型",
      })));
    }

    return categories;
  }, [localFonts]);

  // 轉換十六進制顏色為 RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // 把純十六進位色加上 alpha 變成 rgba（非 hex 例如 rgba()/transparent/漸層 → 原樣回傳）
  const withAlpha = (color: string, a: number) => {
    if (!/^#?[0-9a-f]{6}$/i.test(color)) return color;
    const { r, g, b } = hexToRgb(color);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  // 按鈕背景（套用「背景透明度」到背景色的 alpha；文字不受影響）
  const btnBgCss = () => {
    const a = btnOpacity / 100;
    return bgUseGradient
      ? `linear-gradient(${bgGradAngle}deg, ${withAlpha(bgGradColor1, a)}, ${withAlpha(bgGradColor2, a)})`
      : withAlpha(btnBgColor, a);
  };

  // 套用預設效果
  // 切換組合效果
  const toggleCombinedPreset = (presetName: string) => {
    const preset = EFFECT_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;

    let newCombined = [...combinedPresets];
    let newShadows = [...combinedShadows];

    if (newCombined.includes(presetName)) {
      newCombined = newCombined.filter((p) => p !== presetName);
      newShadows = newShadows.filter((_, i) => newCombined[i] !== undefined);
    } else {
      if (newCombined.length >= 3) {
        toast.error("最多只能組合 3 個效果");
        return;
      }
      newCombined.push(presetName);
      
      if (preset.shadowEnabled) {
        const rgb = hexToRgb(preset.shadowColor);
        const shadow = `${preset.shadowX}px ${preset.shadowY}px ${preset.shadowBlur}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${preset.shadowOpacity})`;
        newShadows.push(shadow);
      }
    }

    setCombinedPresets(newCombined);
    setCombinedShadows(newShadows);
    setActivePreset(null);

    if (newCombined.length > 0) {
      if (newShadows.length > 0) {
        setTextShadowEnabled(true);
      }
      
      const hasStroke = newCombined.some((name) => {
        const p = EFFECT_PRESETS.find((ep) => ep.name === name);
        return p?.strokeEnabled;
      });
      
      if (hasStroke) {
        const strokePreset = EFFECT_PRESETS.find((p) => newCombined.includes(p.name) && p.strokeEnabled);
        if (strokePreset) {
          setTextStrokeEnabled(true);
          setTextStrokeWidth(strokePreset.strokeWidth);
          setTextStrokeColor(strokePreset.strokeColor);
        }
      }

      toast.success(`已組合 ${newCombined.length} 個效果`);
    } else {
      setTextShadowEnabled(false);
      setTextStrokeEnabled(false);
      toast.success("已清除組合效果");
    }
  };

  // 套用一個「設計文字效果」預設（整組覆蓋）
  const applyDesignPreset = (p: DesignPreset) => {
    // 清掉舊的組合預設與單一陰影，避免互相干擾
    setCombinedPresets([]);
    setCombinedShadows([]);
    setTextShadowEnabled(false);
    setActivePreset(null);
    // 漸層 / 純色
    if (p.gradient) {
      setGradientEnabled(true);
      setGradientType(p.gradient.type);
      setGradientAngle(p.gradient.angle);
      setGradientColor1(p.gradient.c1);
      setGradientColor2(p.gradient.c2);
    } else {
      setGradientEnabled(false);
      if (p.color) setTextColor(p.color);
    }
    // 中空（填色透明）
    setTextFillTransparent(!!p.fillTransparent);
    // 描邊
    if (p.stroke) {
      setTextStrokeEnabled(true);
      setTextStrokeWidth(p.stroke.width);
      setTextStrokeColor(p.stroke.color);
    } else {
      setTextStrokeEnabled(false);
    }
    // 多層陰影 / 螢光筆
    setEffectShadow(p.shadow || "");
    setTextHighlightColor(p.highlight || "");
    setActiveDesignPreset(p.name);
    toast.success(`已套用「${p.label}」`);
  };

  // 清除設計文字效果
  const clearDesignPreset = () => {
    setGradientEnabled(false);
    setTextFillTransparent(false);
    setTextStrokeEnabled(false);
    setEffectShadow("");
    setTextHighlightColor("");
    setActiveDesignPreset(null);
    toast.success("已清除設計效果");
  };

  // 套用一個「設計按鈕效果」預設（整顆按鈕外觀覆蓋）
  const applyButtonPreset = (p: ButtonPreset) => {
    // 背景
    if (p.grad) {
      setBgUseGradient(true);
      setBgGradAngle(p.grad.angle);
      setBgGradColor1(p.grad.c1);
      setBgGradColor2(p.grad.c2);
    } else {
      setBgUseGradient(false);
      if (p.bg) setBtnBgColor(p.bg);
    }
    // 盒模型
    setBtnBorderRadius(p.radius);
    if (p.px != null) setBtnPaddingX(p.px);
    if (p.py != null) setBtnPaddingY(p.py);
    // 邊框
    setBtnBorderMode("unified");
    if (p.border) {
      setBtnBorderWidth(p.border.width);
      setBtnBorderColor(p.border.color);
      setBtnBorderStyle("solid");
    } else {
      setBtnBorderWidth(0);
    }
    setBtnBorderGlowEnabled(false);
    // 陰影 / 毛玻璃
    setBtnBoxShadow(p.boxShadow || "");
    setBtnBackdropBlur(p.backdropBlur || 0);
    // 按鈕文字：乾淨純色（清掉文字設計效果）
    setGradientEnabled(false);
    setTextFillTransparent(false);
    setTextHighlightColor("");
    setEffectShadow("");
    setTextStrokeEnabled(false);
    setActiveDesignPreset(null);
    setTextColor(p.textColor);
    setActiveButtonPreset(p.name);
    toast.success(`已套用「${p.label}」`);
  };

  // 清除設計按鈕效果
  const clearButtonPreset = () => {
    // 完整還原按鈕外觀為預設(背景/文字色/圓角/內距/邊框/陰影/透明度都回到初始值)
    setBtnBoxShadow("");
    setBtnBackdropBlur(0);
    setBgUseGradient(false);
    setBgGradColor1("#3498db");
    setBgGradColor2("#2980b9");
    setBgGradAngle(90);
    setBtnBgColor("#3498db");
    setBtnOpacity(100);
    setBtnBorderMode("unified");
    setBtnBorderWidth(0);
    setBtnBorderColor("#000000");
    setBtnBorderStyle("solid");
    setBtnBorderRadius(8);
    setBtnPaddingX(24);
    setBtnPaddingY(12);
    setBtnWidth("auto");
    setBtnHeight("auto");
    setBtnBorderGlowEnabled(false);
    setTextColor("#111827");
    setActiveButtonPreset(null);
    toast.success("已清除按鈕效果");
  };

  // 套預設時把卡片外框控制重設回預設值（盒模型回原始寫死值、邊框/背景/陰影關閉、清空覆蓋）
  const resetCardOverride = () => {
    setCardOverride({});
    setCardPadX(32);
    setCardPadY(28);
    setCardRadius(16);
    setCardWidth(360);
    setCardHeight("auto");
    setCardBorderEnabled(false);
    setCardBorderMode("unified");
    setCardBorderGlowEnabled(false);
    setCardBgEnabled(false);
    setCardShadowEnabled(false);
  };

  // 套用 / 清除設計卡片效果
  const applyCardPreset = (p: CardPreset) => {
    setCardStyle(p.style);
    setCardTextColor(p.textColor);
    setActiveCardPreset(p.name);
    resetCardOverride();
    toast.success(`已套用「${p.label}」`);
  };
  const clearCardPreset = () => {
    setCardStyle(CARD_PRESETS[0].style);
    setCardTextColor(CARD_PRESETS[0].textColor);
    setActiveCardPreset(null);
    resetCardOverride();
    toast.success("已清除卡片效果");
  };

  // 套用 / 清除設計滑桿效果
  const applySliderPreset = (p: SliderPreset) => {
    setSliderTrack(p.track); setSliderFill(p.fill); setSliderThumb(p.thumb); setActiveSliderPreset(p.name);
    toast.success(`已套用「${p.label}」`);
  };
  const clearSliderPreset = () => {
    setSliderTrack(SLIDER_PRESETS[0].track); setSliderFill(SLIDER_PRESETS[0].fill); setSliderThumb(SLIDER_PRESETS[0].thumb); setActiveSliderPreset(null);
    toast.success("已清除滑桿效果");
  };

  // 新增對比字型
  const addComparisonFont = (font: typeof FONT_LIST[0]) => {
    if (comparisonFonts.length >= 3) {
      toast.error("最多只能對比 3 個字型");
      return;
    }
    
    const isDuplicate = comparisonFonts.some((cf) => cf.font.name === font.name);
    if (isDuplicate) {
      toast.error("該字型已在對比列表中");
      return;
    }

    ensureFontLoaded(font.value);
    setComparisonFonts([...comparisonFonts, { id: Date.now().toString(), font }]);
    toast.success(`已新增「${font.name}」到對比列表`);
  };

  // 移除對比字型
  const removeComparisonFont = (id: string) => {
    setComparisonFonts(comparisonFonts.filter((cf) => cf.id !== id));
  };

  // 退出對比模式
  const exitComparisonMode = () => {
    setComparisonMode(false);
    setComparisonFonts([]);
  };

  // 由卡片外框控制項組出實際要疊加的覆蓋樣式
  // 盒模型四項一律寫入；邊框/背景/陰影依各自啟用開關決定是否覆蓋
  const cardOverrideStyle = useMemo<React.CSSProperties>(() => {
    const o: React.CSSProperties = {
      padding: `${cardPadY}px ${cardPadX}px`,
      borderRadius: `${cardRadius}px`,
      width: `${cardWidth}px`,
      height: cardHeight === "auto" ? "auto" : `${cardHeight}px`,
      ...cardOverride,
    };
    if (cardBorderEnabled) {
      if (cardBorderMode === "unified") {
        o.border = cardBorderWidth > 0 ? `${cardBorderWidth}px ${cardBorderStyle} ${cardBorderColor}` : "none";
      } else {
        o.borderTop = `${cardBorderTopWidth}px ${cardBorderStyle} ${cardBorderColor}`;
        o.borderRight = `${cardBorderRightWidth}px ${cardBorderStyle} ${cardBorderColor}`;
        o.borderBottom = `${cardBorderBottomWidth}px ${cardBorderStyle} ${cardBorderColor}`;
        o.borderLeft = `${cardBorderLeftWidth}px ${cardBorderStyle} ${cardBorderColor}`;
      }
    }
    if (cardBgEnabled) {
      o.background = cardBgUseGradient
        ? `linear-gradient(${cardBgGradAngle}deg, ${cardBgGradColor1}, ${cardBgGradColor2})`
        : cardBgColor;
    }
    // 發光邊框 + 陰影合併成 box-shadow（兩者皆有時以逗號併接）
    const glow = cardBorderGlowEnabled ? `0 0 ${cardBorderGlowBlur}px ${cardBorderGlowColor}` : null;
    const shadow = cardShadowEnabled ? cardShadow : null;
    const boxShadow = [glow, shadow].filter(Boolean).join(", ");
    if (boxShadow) {
      o.boxShadow = boxShadow;
    }
    return o;
  }, [
    cardOverride,
    cardPadX,
    cardPadY,
    cardRadius,
    cardWidth,
    cardHeight,
    cardBorderEnabled,
    cardBorderMode,
    cardBorderWidth,
    cardBorderTopWidth,
    cardBorderRightWidth,
    cardBorderBottomWidth,
    cardBorderLeftWidth,
    cardBorderColor,
    cardBorderStyle,
    cardBorderGlowEnabled,
    cardBorderGlowColor,
    cardBorderGlowBlur,
    cardBgEnabled,
    cardBgColor,
    cardBgUseGradient,
    cardBgGradColor1,
    cardBgGradColor2,
    cardBgGradAngle,
    cardShadowEnabled,
    cardShadow,
  ]);

  // 發光邊框 box-shadow 字串（未開啟時回傳 null）
  const glowShadow = (scale = 1): string | null =>
    btnBorderGlowEnabled
      ? `0 0 ${btnBorderGlowBlur * scale}px ${btnBorderGlowSpread * scale}px ${btnBorderGlowColor}`
      : null;

  // 按鈕手動陰影字串（未開啟時回傳 null；inset → 內陰影，X/Y 為 0 即內外光暈）
  const btnShadowStr = (scale = 1): string | null =>
    btnShadowEnabled
      ? `${btnShadowInset ? "inset " : ""}${btnShadowX * scale}px ${btnShadowY * scale}px ${btnShadowBlur * scale}px ${btnShadowSpread * scale}px ${withAlpha(btnShadowColor, btnShadowOpacity)}`
      : null;

  // 按鈕最終 box-shadow：設計預設(或發光邊框) 疊上手動陰影
  const btnBoxShadowFinal = (scale = 1): string => {
    const base = btnBoxShadow || glowShadow(scale);
    return [base, btnShadowStr(scale)].filter(Boolean).join(", ") || "none";
  };

  // ── 多層文字陰影字串 ──
  const buildMultiShadow = (): string =>
    textShadowLayers.map(l => `${l.x}px ${l.y}px ${l.blur}px ${withAlpha(l.color, l.opacity)}`).join(", ");

  // ── filter 字串 ──
  const buildFilter = (): string => {
    const parts: string[] = [];
    if (filterBlur > 0) parts.push(`blur(${filterBlur}px)`);
    if (filterBrightness !== 100) parts.push(`brightness(${filterBrightness}%)`);
    if (filterContrast !== 100) parts.push(`contrast(${filterContrast}%)`);
    if (filterHueRotate !== 0) parts.push(`hue-rotate(${filterHueRotate}deg)`);
    if (filterSaturate !== 100) parts.push(`saturate(${filterSaturate}%)`);
    if (filterDropShadowEnabled) parts.push(`drop-shadow(${filterDropShadowX}px ${filterDropShadowY}px ${filterDropShadowBlur}px ${filterDropShadowColor})`);
    return parts.length ? parts.join(" ") : "none";
  };

  // ── font-feature-settings 字串 ──
  const buildFeatureSettings = (): string => {
    const parts: string[] = [];
    if (ligatures) parts.push('"liga" 1, "calt" 1');
    if (swash) parts.push('"swsh" 1');
    if (oldstyleNums) parts.push('"onum" 1');
    if (tabularNums) parts.push('"tnum" 1');
    return parts.length ? parts.join(", ") : "normal";
  };

  // ── font-variation-settings 字串 ──
  const buildVariationSettings = (): string => {
    if (!fontVariationEnabled) return "normal";
    const parts: string[] = [];
    if (fontAxisWeight != null) parts.push(`"wght" ${fontAxisWeight}`);
    if (fontAxisWidth !== 100) parts.push(`"wdth" ${fontAxisWidth}`);
    if (fontAxisOpticalSize != null) parts.push(`"opsz" ${fontAxisOpticalSize}`);
    return parts.length ? parts.join(", ") : "normal";
  };

  // ── 3D transform 字串 ──
  const buildTransform = (): string => {
    const parts: string[] = [];
    if (textPerspective > 0) return `perspective(${textPerspective}px) rotateX(${textRotateX}deg) rotateY(${textRotateY}deg) rotate(${textRotate}deg) skewX(${textSkewX}deg) skewY(${textSkewY}deg) scaleX(${textScaleX})`;
    if (textRotate !== 0) parts.push(`rotate(${textRotate}deg)`);
    if (textSkewX !== 0) parts.push(`skewX(${textSkewX}deg)`);
    if (textSkewY !== 0) parts.push(`skewY(${textSkewY}deg)`);
    if (textScaleX !== 1) parts.push(`scaleX(${textScaleX})`);
    return parts.length ? parts.join(" ") : "none";
  };

  const cssCode = useMemo(() => {
    const effectiveFontWeight = fontVariationEnabled && fontAxisWeight != null ? fontAxisWeight : fontWeight;
    // 文字樣式片段（純文字模式直接用；按鈕模式包進 .button > span）
    let text = `font-family: ${selectedFont.value};
font-size: ${fontSize}px;
line-height: ${lineHeight};
letter-spacing: ${letterSpacing}px;
word-spacing: ${wordSpacing}px;
font-weight: ${effectiveFontWeight};
opacity: ${(textOpacity / 100).toFixed(2)};`;

    if (writingMode !== "horizontal-tb") text += `\nwriting-mode: ${writingMode};`;
    if (textTransformVal !== "none") text += `\ntext-transform: ${textTransformVal};`;
    if (textAlign !== "left") text += `\ntext-align: ${textAlign};`;
    if (textIndent > 0) text += `\ntext-indent: ${textIndent}em;`;
    if (textDecoLine !== "none") {
      text += `\ntext-decoration: ${textDecoLine} ${textDecoStyle} ${textDecoColor} ${textDecoThickness}px;`;
      if (textDecoLine === "underline") text += `\ntext-underline-offset: ${textUnderlineOffset}px;`;
    }

    if (gradientEnabled) {
      const g =
        gradientType === "linear"
          ? `linear-gradient(${gradientAngle}deg, ${gradientColor1}, ${gradientColor2})`
          : `radial-gradient(circle, ${gradientColor1}, ${gradientColor2})`;
      text += `\nbackground: ${g};
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;`;
    } else if (textHighlightColor) {
      text += `\ncolor: ${textColor};
background: linear-gradient(transparent 55%, ${textHighlightColor} 55%);`;
    } else {
      text += `\ncolor: ${textColor};`;
      if (textFillTransparent) text += `\n-webkit-text-fill-color: transparent;`;
    }

    if (textShadowLayers.length > 0) {
      text += `\ntext-shadow: ${buildMultiShadow()};`;
    } else if (effectShadow) {
      text += `\ntext-shadow: ${effectShadow};`;
    } else if (combinedPresets.length > 0 && combinedShadows.length > 0) {
      text += `\ntext-shadow: ${combinedShadows.join(", ")};`;
    } else if (textShadowEnabled) {
      const rgb = hexToRgb(textShadowColor);
      text += `\ntext-shadow: ${textShadowX}px ${textShadowY}px ${textShadowBlur}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${textShadowOpacity});`;
    }

    if (textStrokeEnabled) {
      text += `\n-webkit-text-stroke: ${textStrokeWidth}px ${textStrokeColor};`;
    }

    const xform = buildTransform();
    if (xform !== "none") text += `\ntransform: ${xform};`;

    const flt = buildFilter();
    if (flt !== "none") text += `\nfilter: ${flt};`;

    const feat = buildFeatureSettings();
    if (feat !== "normal") text += `\nfont-feature-settings: ${feat};`;

    const varSet = buildVariationSettings();
    if (varSet !== "normal") text += `\nfont-variation-settings: ${varSet};`;

    if (blendMode !== "normal") text += `\nmix-blend-mode: ${blendMode};`;

    // 純文字模式：直接輸出文字樣式
    if (previewMode === "text") return text;

    // 卡片模式：.card 樣式（卡片預設 + 手動外框覆蓋）
    if (previewMode === "card") {
      const merged = { ...cardStyle, ...cardOverrideStyle };
      return `.card {\n${styleToCss(merged).split(";").filter(Boolean).map((s) => "  " + s.trim() + ";").join("\n")}\n  color: ${cardTextColor};\n}`;
    }

    // 滑桿模式：.slider-track / .slider-fill / .slider-thumb 樣式
    if (previewMode === "slider") {
      const blk = (sel: string, obj: React.CSSProperties) => `${sel} {\n${styleToCss(obj).split(";").filter(Boolean).map((s) => "  " + s.trim() + ";").join("\n")}\n}`;
      return [blk(".slider-track", sliderTrack), blk(".slider-fill", sliderFill), blk(".slider-thumb", sliderThumb)].join("\n\n");
    }

    // 按鈕模式：.button 外框 + .button > span 文字
    const bg = btnBgCss();
    const hoverBg = bgUseGradient
      ? `linear-gradient(${bgGradAngle}deg, ${btnHoverBgColor}, ${btnHoverBgColor})`
      : btnHoverBgColor;
    const focusBg = bgUseGradient
      ? `linear-gradient(${bgGradAngle}deg, ${btnFocusBgColor}, ${btnFocusBgColor})`
      : btnFocusBgColor;

    let css = `.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${btnPaddingY}px ${btnPaddingX}px;
  background: ${bg};${btnBorderMode === "unified" ? `\n  border: ${btnBorderWidth}px ${btnBorderStyle} ${btnBorderColor};` : `\n  border-top: ${btnBorderTopWidth}px ${btnBorderStyle} ${btnBorderColor};\n  border-right: ${btnBorderRightWidth}px ${btnBorderStyle} ${btnBorderColor};\n  border-bottom: ${btnBorderBottomWidth}px ${btnBorderStyle} ${btnBorderColor};\n  border-left: ${btnBorderLeftWidth}px ${btnBorderStyle} ${btnBorderColor};`}
  border-radius: ${btnBorderRadius}px;
  width: ${btnWidth === "auto" ? "auto" : `${btnWidth}px`};
  height: ${btnHeight === "auto" ? "auto" : `${btnHeight}px`};
  cursor: pointer;
  transition: all ${btnTransitionDuration}s ${btnTransitionTiming};${btnBoxShadowFinal() !== "none" ? `\n  box-shadow: ${btnBoxShadowFinal()};` : ""}${btnBackdropBlur > 0 ? `\n  backdrop-filter: blur(${btnBackdropBlur}px);\n  -webkit-backdrop-filter: blur(${btnBackdropBlur}px);` : ""}
}

.button:hover {
  background: ${hoverBg};
  transform: scale(${btnHoverScale});${btnHoverShadowEnabled ? `\n  box-shadow: ${btnHoverShadow};` : ""}
}

.button:focus {
  background: ${focusBg};
  border: ${btnFocusBorderWidth}px ${btnBorderStyle} ${btnFocusBorderColor};${btnFocusOutlineEnabled ? `\n  outline: ${btnFocusOutlineWidth}px solid ${btnFocusOutlineColor};` : ""}${btnFocusShadowEnabled ? `\n  box-shadow: ${btnFocusShadow};` : ""}
}

.button:focus:not(:focus-visible) {
  outline: none;
}`;

    if (btnDisabledEnabled) {
      css += `\n\n.button:disabled {
  opacity: ${btnDisabledOpacity};
  cursor: ${btnDisabledCursor};
  pointer-events: none;
}`;
    }

    const indented = text
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n");
    css += `\n\n.button > span {\n${indented}\n}`;
    return css;
  }, [
    previewMode,
    cardStyle,
    cardOverrideStyle,
    cardTextColor,
    sliderTrack,
    sliderFill,
    sliderThumb,
    selectedFont,
    fontSize,
    lineHeight,
    letterSpacing,
    wordSpacing,
    fontWeight,
    textOpacity,
    textColor,
    textShadowEnabled,
    textShadowX,
    textShadowY,
    textShadowBlur,
    textShadowColor,
    textShadowOpacity,
    textStrokeEnabled,
    textStrokeWidth,
    textStrokeColor,
    gradientEnabled,
    gradientType,
    gradientAngle,
    gradientColor1,
    gradientColor2,
    textFillTransparent,
    textHighlightColor,
    effectShadow,
    combinedPresets,
    combinedShadows,
    btnPaddingX,
    btnPaddingY,
    btnBorderRadius,
    btnWidth,
    btnHeight,
    btnBorderMode,
    btnBorderWidth,
    btnBorderTopWidth,
    btnBorderRightWidth,
    btnBorderBottomWidth,
    btnBorderLeftWidth,
    btnBorderColor,
    btnBorderStyle,
    btnBorderGlowEnabled,
    btnBorderGlowColor,
    btnBorderGlowBlur,
    btnBorderGlowSpread,
    btnBoxShadow,
    btnBackdropBlur,
    btnBgColor,
    bgUseGradient,
    bgGradColor1,
    bgGradColor2,
    bgGradAngle,
    btnHoverBgColor,
    btnHoverScale,
    btnHoverShadow,
    btnHoverShadowEnabled,
    btnTransitionDuration,
    btnTransitionTiming,
    btnFocusBgColor,
    btnFocusBorderColor,
    btnFocusBorderWidth,
    btnFocusOutlineEnabled,
    btnFocusOutlineColor,
    btnFocusOutlineWidth,
    btnFocusShadow,
    btnFocusShadowEnabled,
    btnDisabledOpacity,
    btnDisabledCursor,
    btnDisabledEnabled,
    btnOpacity,
    btnShadowEnabled,
    btnShadowInset,
    btnShadowX,
    btnShadowY,
    btnShadowBlur,
    btnShadowSpread,
    btnShadowColor,
    btnShadowOpacity,
    textShadowLayers,
    textRotate,
    textSkewX,
    textSkewY,
    textScaleX,
    textPerspective,
    textRotateX,
    textRotateY,
    writingMode,
    textDecoLine,
    textDecoStyle,
    textDecoColor,
    textDecoThickness,
    textUnderlineOffset,
    textTransformVal,
    textAlign,
    textIndent,
    filterBlur,
    filterBrightness,
    filterContrast,
    filterHueRotate,
    filterSaturate,
    filterDropShadowEnabled,
    filterDropShadowX,
    filterDropShadowY,
    filterDropShadowBlur,
    filterDropShadowColor,
    ligatures,
    swash,
    oldstyleNums,
    tabularNums,
    fontVariationEnabled,
    fontAxisWeight,
    fontAxisWidth,
    fontAxisOpticalSize,
    blendMode,
  ]);

  const handleCopyCSS = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    toast.success("已複製到剪貼板");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploadFont = async (file: File) => {
    return await uploadFont(file);
  };

  // 計算預覽文字的樣式
  const getPreviewStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      fontFamily: selectedFont.value,
      fontSize: `${fontSize}px`,
      lineHeight: lineHeight,
      letterSpacing: `${letterSpacing}px`,
      wordSpacing: `${wordSpacing}px`,
      fontWeight: fontVariationEnabled && fontAxisWeight != null ? fontAxisWeight : fontWeight,
      opacity: textOpacity / 100,
      wordBreak: "break-all",
      writingMode: writingMode,
      textTransform: textTransformVal as any,
      textAlign: textAlign as any,
      textIndent: textIndent > 0 ? `${textIndent}em` : undefined,
      mixBlendMode: blendMode !== "normal" ? blendMode as any : undefined,
    };

    // 文字裝飾線
    if (textDecoLine !== "none") {
      style.textDecoration = `${textDecoLine} ${textDecoStyle} ${textDecoColor} ${textDecoThickness}px`;
      (style as any).textDecorationThickness = `${textDecoThickness}px`;
      if (textDecoLine === "underline") (style as any).textUnderlineOffset = `${textUnderlineOffset}px`;
    }

    // 顏色 / 漸層
    if (gradientEnabled) {
      const g = gradientType === "linear"
        ? `linear-gradient(${gradientAngle}deg, ${gradientColor1}, ${gradientColor2})`
        : `radial-gradient(circle, ${gradientColor1}, ${gradientColor2})`;
      style.background = g;
      (style as any).WebkitBackgroundClip = "text";
      (style as any).WebkitTextFillColor = "transparent";
      style.backgroundClip = "text" as any;
    } else if (textHighlightColor) {
      style.color = textColor;
      style.background = `linear-gradient(transparent 55%, ${textHighlightColor} 55%)`;
    } else {
      style.color = textColor;
      if (textFillTransparent) (style as any).WebkitTextFillColor = "transparent";
    }

    // 文字陰影（多層 > 設計效果 > 組合 > 單層）
    if (textShadowLayers.length > 0) {
      style.textShadow = buildMultiShadow();
    } else if (effectShadow) {
      style.textShadow = effectShadow;
    } else if (combinedPresets.length > 0 && combinedShadows.length > 0) {
      style.textShadow = combinedShadows.join(", ");
    } else if (textShadowEnabled) {
      const rgb = hexToRgb(textShadowColor);
      style.textShadow = `${textShadowX}px ${textShadowY}px ${textShadowBlur}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${textShadowOpacity})`;
    }

    // 描邊
    if (textStrokeEnabled) {
      (style as any).WebkitTextStroke = `${textStrokeWidth}px ${textStrokeColor}`;
    }

    // 首字下沉（用 CSS class 方式最簡單，但 inline style 無法做 ::first-letter，改用 fontSize 放大信號在外層處理）
    // 變形
    const xform = buildTransform();
    if (xform !== "none") style.transform = xform;

    // 濾鏡
    const flt = buildFilter();
    if (flt !== "none") style.filter = flt;

    // OpenType
    const feat = buildFeatureSettings();
    if (feat !== "normal") (style as any).fontFeatureSettings = feat;

    // 可變字型軸
    const varSet = buildVariationSettings();
    if (varSet !== "normal") (style as any).fontVariationSettings = varSet;

    return style;
  };

  const previewStyle = getPreviewStyle();

  // 邊框相關的共用樣式片段（依「四邊一致 / 分別設定」與「發光」產生）
  // scale 用於縮小版預覽（按鈕狀態卡片），讓邊框寬度等比例縮小
  const getBorderStyle = (scale = 1): React.CSSProperties => {
    const s: React.CSSProperties = {
      borderStyle: btnBorderStyle as React.CSSProperties["borderStyle"],
      borderColor: btnBorderColor,
      borderWidth: 0,
    };
    if (btnBorderMode === "unified") {
      s.borderWidth = `${btnBorderWidth * scale}px`;
    } else {
      s.borderTopWidth = `${btnBorderTopWidth * scale}px`;
      s.borderRightWidth = `${btnBorderRightWidth * scale}px`;
      s.borderBottomWidth = `${btnBorderBottomWidth * scale}px`;
      s.borderLeftWidth = `${btnBorderLeftWidth * scale}px`;
    }
    return s;
  };


  // 按鈕外框樣式（不含任何文字屬性，文字由內層 span 負責）
  const getButtonBoxStyle = (): React.CSSProperties => {
    return {
      padding: `${btnPaddingY}px ${btnPaddingX}px`,
      background: btnBgCss(),
      ...getBorderStyle(),
      borderRadius: `${btnBorderRadius}px`,
      width: btnWidth === "auto" ? "auto" : `${btnWidth}px`,
      height: btnHeight === "auto" ? "auto" : `${btnHeight}px`,
      cursor: "pointer",
      transition: `all ${btnTransitionDuration}s ${btnTransitionTiming}`,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: btnBoxShadowFinal(),
      ...(btnBackdropBlur > 0
        ? { backdropFilter: `blur(${btnBackdropBlur}px)`, WebkitBackdropFilter: `blur(${btnBackdropBlur}px)` as any }
        : {}),
    };
  };

  // ============ Frosted Studio：搜尋字型用的本地狀態 ============
  const [fontSearch, setFontSearch] = useState("");
  const [interactOpen, setInteractOpen] = useState(true);
  const [cssOpen, setCssOpen] = useState(true);
  // 貼上 CSS 解析回控制項
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteMsg, setPasteMsg] = useState("");

  // ── 把貼上的 CSS 解析回控制項 ──
  const parseHex = (c: string): string | null => {
    c = (c || "").trim();
    let m = /^#([0-9a-f]{6})$/i.exec(c); if (m) return "#" + m[1].toLowerCase();
    m = /^#([0-9a-f]{3})$/i.exec(c); if (m) return "#" + m[1].split("").map((x) => x + x).join("").toLowerCase();
    m = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(c);
    if (m) { const h = (n: number) => (parseInt(m![n], 10) & 255).toString(16).padStart(2, "0"); return "#" + h(1) + h(2) + h(3); }
    return null;
  };
  const splitDecls = (block: string): Record<string, string> => {
    const map: Record<string, string> = {};
    (block || "").split(";").forEach((d) => {
      const i = d.indexOf(":"); if (i < 0) return;
      const k = d.slice(0, i).trim().toLowerCase(); const v = d.slice(i + 1).trim();
      if (k) map[k] = v;
    });
    return map;
  };
  const ruleBody = (text: string, sel: string): string | null => {
    const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\>]/g, "\\$&") + "\\s*\\{([^}]*)\\}", "i");
    const m = re.exec(text || ""); return m ? m[1] : null;
  };
  const parseGrad = (s: string): { angle: number; c1: string; c2: string } | null => {
    const am = /(-?\d+(?:\.\d+)?)deg/.exec(s); const angle = am ? parseFloat(am[1]) : 90;
    const cols = (s.match(/#[0-9a-f]{3,8}|rgba?\([^)]*\)/gi) || []).map((c) => parseHex(c)).filter(Boolean) as string[];
    if (cols.length < 2) return null;
    return { angle, c1: cols[0], c2: cols[1] };
  };
  const applyTextDecls = (m: Record<string, string>) => {
    if (m["font-family"]) {
      const fam = m["font-family"];
      const bare = fam.replace(/['"]/g, "").split(",")[0].trim();
      const web = WEB_FONTS.find((f) => f.family.toLowerCase() === bare.toLowerCase());
      const built = FONT_LIST.find((f) => f.value.toLowerCase().includes(bare.toLowerCase()) || f.name === bare);
      if (web) setSelectedFont({ name: web.family, value: `'${web.family}'`, category: "網路字型" });
      else if (built) setSelectedFont(built);
      else setSelectedFont({ name: bare, value: fam, category: "自訂" });
    }
    if (m["font-size"]) { const v = parseFloat(m["font-size"]); if (!isNaN(v)) setFontSize(v); }
    if (m["line-height"]) { const v = parseFloat(m["line-height"]); if (!isNaN(v)) setLineHeight(v); }
    if (m["letter-spacing"]) setLetterSpacing(parseFloat(m["letter-spacing"]) || 0);
    if (m["word-spacing"]) setWordSpacing(parseFloat(m["word-spacing"]) || 0);
    if (m["font-weight"]) { const v = parseInt(m["font-weight"], 10); if (!isNaN(v)) setFontWeight(v); }
    if (m["opacity"]) { const v = parseFloat(m["opacity"]); if (!isNaN(v)) setTextOpacity(Math.round(v * 100)); }
    if (m["background"] && /gradient/i.test(m["background"])) {
      const g = parseGrad(m["background"]);
      if (g) { setGradientEnabled(true); setGradientType("linear"); setGradientAngle(g.angle); setGradientColor1(g.c1); setGradientColor2(g.c2); setTextHighlightColor(""); }
    } else if (m["color"]) { const hex = parseHex(m["color"]); if (hex) { setGradientEnabled(false); setTextColor(hex); } }
    if (m["text-shadow"] && !/^none/i.test(m["text-shadow"])) setEffectShadow(m["text-shadow"]);
    const stroke = m["-webkit-text-stroke"] || m["text-stroke"];
    if (stroke) { const sm = /([\d.]+)px\s+(.+)/.exec(stroke); if (sm) { setTextStrokeEnabled(true); setTextStrokeWidth(parseFloat(sm[1])); const hc = parseHex(sm[2]); if (hc) setTextStrokeColor(hc); } }
  };
  const applyPastedCss = () => {
    const text = pasteText;
    let n = 0;
    if (previewMode === "button") {
      const m = splitDecls(ruleBody(text, ".button") || (/\{([^}]*)\}/.exec(text) || [])[1] || text);
      if (m["padding"]) { const p = m["padding"].split(/\s+/).map((x) => parseFloat(x)); if (p.length >= 2 && !isNaN(p[0])) { setBtnPaddingY(p[0]); setBtnPaddingX(p[1]); n++; } else if (p.length === 1 && !isNaN(p[0])) { setBtnPaddingY(p[0]); setBtnPaddingX(p[0]); n++; } }
      if (!m["padding"] && m["min-height"]) { const v = parseFloat(m["min-height"]); if (!isNaN(v)) { setBtnHeight(String(Math.round(v))); n++; } }
      const bg = m["background"] || m["background-color"];
      if (bg) { if (/gradient/i.test(bg)) { const g = parseGrad(bg); if (g) { setBgUseGradient(true); setBgGradAngle(g.angle); setBgGradColor1(g.c1); setBgGradColor2(g.c2); n++; } } else { setBgUseGradient(false); const hex = parseHex(bg); const am = /rgba\([^)]*,\s*([\d.]+)\s*\)/i.exec(bg); if (hex) { setBtnBgColor(hex); setBtnOpacity(am ? Math.round(parseFloat(am[1]) * 100) : 100); n++; } else if (/transparent/i.test(bg)) { setBtnBgColor("#ffffff"); setBtnOpacity(0); n++; } } }
      if (m["backdrop-filter"] || m["-webkit-backdrop-filter"]) { const bf = /blur\(([\d.]+)px\)/.exec(m["backdrop-filter"] || m["-webkit-backdrop-filter"]); if (bf) { setBtnBackdropBlur(parseFloat(bf[1])); n++; } }
      if (m["border"]) { const bm = /([\d.]+)px\s+(\w+)\s+(.+)/.exec(m["border"]); if (bm) { setBtnBorderMode("unified"); setBtnBorderWidth(parseFloat(bm[1])); setBtnBorderStyle(bm[2]); const hc = parseHex(bm[3]); if (hc) setBtnBorderColor(hc); n++; } else if (/^none/i.test(m["border"])) { setBtnBorderWidth(0); n++; } }
      if (m["border-radius"]) { const v = parseFloat(m["border-radius"]); if (!isNaN(v)) { setBtnBorderRadius(v); n++; } }
      if (m["width"]) { setBtnWidth(/auto/i.test(m["width"]) ? "auto" : String(Math.round(parseFloat(m["width"]) || 0))); n++; }
      if (m["height"]) { setBtnHeight(/auto/i.test(m["height"]) ? "auto" : String(Math.round(parseFloat(m["height"]) || 0))); n++; }
      if (m["box-shadow"] && !/^none/i.test(m["box-shadow"])) { setBtnBoxShadow(m["box-shadow"]); n++; }
      if (m["opacity"]) { const v = parseFloat(m["opacity"]); if (!isNaN(v)) { setBtnOpacity(Math.round(v * 100)); n++; } }
      if (m["backdrop-filter"] || m["-webkit-backdrop-filter"]) { const bf = /blur\(([\d.]+)px\)/.exec(m["backdrop-filter"] || m["-webkit-backdrop-filter"]); if (bf) { setBtnBackdropBlur(parseFloat(bf[1])); n++; } }
      if (m["color"]) { const hc = parseHex(m["color"]); if (hc) { setTextColor(hc); n++; } }
      const span = ruleBody(text, ".button > span") || ruleBody(text, ".button>span");
      if (span) { applyTextDecls(splitDecls(span)); n++; }
      // 套到按鈕外觀時清掉預設標記
      setActiveButtonPreset(null);
    } else {
      const m = splitDecls(ruleBody(text, ".heading") || (/\{([^}]*)\}/.exec(text) || [])[1] || text);
      const before = JSON.stringify(m);
      applyTextDecls(m);
      n = Object.keys(m).length;
      if (before === "{}") n = 0;
      setActiveDesignPreset(null);
    }
    if (n > 0) { setPasteMode(false); setPasteMsg(""); toast.success(`已解析套用(${n} 項)`); }
    else { setPasteMsg("沒有解析到可用的屬性,請確認貼的是 CSS 宣告或 .button { … } / .heading { … } 區塊"); }
  };

  // ============ 自動保存 / 還原 + 命名儲存樣式 ============
  const styleSetters: Record<string, (v: any) => void> = {
    previewText: setPreviewText, selectedFont: setSelectedFont, fontSize: setFontSize, lineHeight: setLineHeight, letterSpacing: setLetterSpacing, wordSpacing: setWordSpacing, fontWeight: setFontWeight, textOpacity: setTextOpacity, textColor: setTextColor, previewBgColor: setPreviewBgColor, gallerySample: setGallerySample, previewMode: setPreviewMode,
    btnPaddingX: setBtnPaddingX, btnPaddingY: setBtnPaddingY, btnBorderRadius: setBtnBorderRadius, btnWidth: setBtnWidth, btnHeight: setBtnHeight,
    btnBorderMode: setBtnBorderMode, btnBorderWidth: setBtnBorderWidth, btnBorderTopWidth: setBtnBorderTopWidth, btnBorderRightWidth: setBtnBorderRightWidth, btnBorderBottomWidth: setBtnBorderBottomWidth, btnBorderLeftWidth: setBtnBorderLeftWidth, btnBorderColor: setBtnBorderColor, btnBorderStyle: setBtnBorderStyle, btnBorderGlowEnabled: setBtnBorderGlowEnabled, btnBorderGlowColor: setBtnBorderGlowColor, btnBorderGlowBlur: setBtnBorderGlowBlur, btnBorderGlowSpread: setBtnBorderGlowSpread,
    btnBgColor: setBtnBgColor, bgUseGradient: setBgUseGradient, bgGradColor1: setBgGradColor1, bgGradColor2: setBgGradColor2, bgGradAngle: setBgGradAngle,
    btnHoverBgColor: setBtnHoverBgColor, btnHoverScale: setBtnHoverScale, btnHoverShadow: setBtnHoverShadow, btnHoverShadowEnabled: setBtnHoverShadowEnabled,
    btnTransitionDuration: setBtnTransitionDuration, btnTransitionTiming: setBtnTransitionTiming,
    btnFocusBgColor: setBtnFocusBgColor, btnFocusBorderColor: setBtnFocusBorderColor, btnFocusBorderWidth: setBtnFocusBorderWidth, btnFocusOutlineEnabled: setBtnFocusOutlineEnabled, btnFocusOutlineColor: setBtnFocusOutlineColor, btnFocusOutlineWidth: setBtnFocusOutlineWidth, btnFocusShadow: setBtnFocusShadow, btnFocusShadowEnabled: setBtnFocusShadowEnabled,
    btnDisabledOpacity: setBtnDisabledOpacity, btnDisabledCursor: setBtnDisabledCursor, btnDisabledEnabled: setBtnDisabledEnabled, btnOpacity: setBtnOpacity,
    btnBoxShadow: setBtnBoxShadow, btnBackdropBlur: setBtnBackdropBlur, activeButtonPreset: setActiveButtonPreset,
    textShadowEnabled: setTextShadowEnabled, textShadowX: setTextShadowX, textShadowY: setTextShadowY, textShadowBlur: setTextShadowBlur, textShadowColor: setTextShadowColor, textShadowOpacity: setTextShadowOpacity,
    textStrokeEnabled: setTextStrokeEnabled, textStrokeWidth: setTextStrokeWidth, textStrokeColor: setTextStrokeColor,
    gradientEnabled: setGradientEnabled, gradientType: setGradientType, gradientAngle: setGradientAngle, gradientColor1: setGradientColor1, gradientColor2: setGradientColor2,
    textFillTransparent: setTextFillTransparent, textHighlightColor: setTextHighlightColor, effectShadow: setEffectShadow, activeDesignPreset: setActiveDesignPreset,
    combinedPresets: setCombinedPresets, combinedShadows: setCombinedShadows, activePreset: setActivePreset,
    cardStyle: setCardStyle, cardTextColor: setCardTextColor, activeCardPreset: setActiveCardPreset, cardOverride: setCardOverride, cardPadX: setCardPadX, cardPadY: setCardPadY, cardRadius: setCardRadius, cardWidth: setCardWidth, cardHeight: setCardHeight, cardBorderEnabled: setCardBorderEnabled, cardBorderMode: setCardBorderMode, cardBorderWidth: setCardBorderWidth, cardBorderTopWidth: setCardBorderTopWidth, cardBorderRightWidth: setCardBorderRightWidth, cardBorderBottomWidth: setCardBorderBottomWidth, cardBorderLeftWidth: setCardBorderLeftWidth, cardBorderColor: setCardBorderColor, cardBorderStyle: setCardBorderStyle, cardBorderGlowEnabled: setCardBorderGlowEnabled, cardBorderGlowColor: setCardBorderGlowColor, cardBorderGlowBlur: setCardBorderGlowBlur, cardBgEnabled: setCardBgEnabled, cardBgColor: setCardBgColor, cardBgUseGradient: setCardBgUseGradient, cardBgGradColor1: setCardBgGradColor1, cardBgGradColor2: setCardBgGradColor2, cardBgGradAngle: setCardBgGradAngle, cardShadowEnabled: setCardShadowEnabled, cardShadow: setCardShadow,
    sliderTrack: setSliderTrack, sliderFill: setSliderFill, sliderThumb: setSliderThumb, activeSliderPreset: setActiveSliderPreset,
  };
  const collectState = () => ({
    previewText, selectedFont, fontSize, lineHeight, letterSpacing, wordSpacing, fontWeight, textOpacity, textColor, previewBgColor, gallerySample, previewMode,
    btnPaddingX, btnPaddingY, btnBorderRadius, btnWidth, btnHeight,
    btnBorderMode, btnBorderWidth, btnBorderTopWidth, btnBorderRightWidth, btnBorderBottomWidth, btnBorderLeftWidth, btnBorderColor, btnBorderStyle, btnBorderGlowEnabled, btnBorderGlowColor, btnBorderGlowBlur, btnBorderGlowSpread,
    btnBgColor, bgUseGradient, bgGradColor1, bgGradColor2, bgGradAngle,
    btnHoverBgColor, btnHoverScale, btnHoverShadow, btnHoverShadowEnabled,
    btnTransitionDuration, btnTransitionTiming,
    btnFocusBgColor, btnFocusBorderColor, btnFocusBorderWidth, btnFocusOutlineEnabled, btnFocusOutlineColor, btnFocusOutlineWidth, btnFocusShadow, btnFocusShadowEnabled,
    btnDisabledOpacity, btnDisabledCursor, btnDisabledEnabled, btnOpacity,
    btnBoxShadow, btnBackdropBlur, activeButtonPreset,
    textShadowEnabled, textShadowX, textShadowY, textShadowBlur, textShadowColor, textShadowOpacity,
    textStrokeEnabled, textStrokeWidth, textStrokeColor,
    gradientEnabled, gradientType, gradientAngle, gradientColor1, gradientColor2,
    textFillTransparent, textHighlightColor, effectShadow, activeDesignPreset,
    combinedPresets, combinedShadows, activePreset,
    cardStyle, cardTextColor, activeCardPreset, cardOverride, cardPadX, cardPadY, cardRadius, cardWidth, cardHeight, cardBorderEnabled, cardBorderMode, cardBorderWidth, cardBorderTopWidth, cardBorderRightWidth, cardBorderBottomWidth, cardBorderLeftWidth, cardBorderColor, cardBorderStyle, cardBorderGlowEnabled, cardBorderGlowColor, cardBorderGlowBlur, cardBgEnabled, cardBgColor, cardBgUseGradient, cardBgGradColor1, cardBgGradColor2, cardBgGradAngle, cardShadowEnabled, cardShadow,
    sliderTrack, sliderFill, sliderThumb, activeSliderPreset,
  });
  const applyState = (s: any) => { if (!s || typeof s !== "object") return; Object.keys(styleSetters).forEach((k) => { if (k in s) styleSetters[k](s[k]); }); };

  const restoredRef = useRef(false);
  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem("fontTool:last") || "null"); if (s) applyState(s); } catch (e) { /* ignore */ }
    // 延後開放自動保存,避免在還原套用前就把快照覆蓋成預設(含 StrictMode 雙重掛載)
    const id = setTimeout(() => { restoredRef.current = true; }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!restoredRef.current) return;
    try { localStorage.setItem("fontTool:last", JSON.stringify(collectState())); } catch (e) { /* ignore (quota) */ }
  });

  const [savedStyles, setSavedStyles] = useState<{ name: string; state: any }[]>(() => {
    try { return JSON.parse(localStorage.getItem("fontTool:saved") || "[]"); } catch { return []; }
  });
  const [styleName, setStyleName] = useState("");
  const persistSaved = (list: { name: string; state: any }[]) => {
    setSavedStyles(list);
    try { localStorage.setItem("fontTool:saved", JSON.stringify(list)); } catch (e) { /* ignore */ }
  };
  const saveCurrentStyle = () => {
    const name = styleName.trim() || `樣式 ${savedStyles.length + 1}`;
    const entry = { name, state: collectState() };
    persistSaved([...savedStyles.filter((x) => x.name !== name), entry]);
    setStyleName("");
    toast.success(`已儲存「${name}」`);
  };
  const loadStyle = (entry: { name: string; state: any }) => { applyState(entry.state); toast.success(`已載入「${entry.name}」`); };
  const deleteStyle = (name: string) => { persistSaved(savedStyles.filter((x) => x.name !== name)); toast.success(`已刪除「${name}」`); };

  // ============ Frosted Studio：宣告式控制項小元件（用函式回傳 JSX，避免重掛失焦） ============
  const clamp = (v: number, min: number, max: number) =>
    Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  const sRow = (
    label: string, val: number, min: number, max: number, step: number,
    onChange: (n: number) => void, disp?: string,
  ) => (
    <div className="slider-row">
      <div className="top">
        <span className="lbl">{label}</span>
        <span className="val">{disp != null ? disp : val}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={val}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ ["--p" as any]: clamp(val, min, max) + "%" } as React.CSSProperties}
      />
    </div>
  );
  const cRow = (label: string, val: string, onChange: (s: string) => void) => (
    <div className="row-line">
      <span className="lbl sm">{label}</span>
      <span className="color-input">
        <input type="color" value={val} onChange={(e) => onChange(e.target.value)} />
        <input type="text" className="hex" value={val} onChange={(e) => onChange(e.target.value)} />
      </span>
    </div>
  );
  const selRow = (
    label: string, val: string, options: [string, string][], onChange: (s: string) => void,
  ) => (
    <div className="row-line">
      <span className="lbl sm">{label}</span>
      <select className="mini-select" value={val} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </div>
  );
  // 尺寸列:自動切換 + 數字輸入(取代固定下拉,讓貼上的尺寸能顯示與微調)
  const dimRow = (label: string, val: string, onChange: (s: string) => void, fallback: number) => {
    const isAuto = val === "auto" || val === "" || val == null;
    const num = isAuto ? fallback : (parseFloat(val) || fallback);
    return (
      <div className="row-line col">
        <div className="top" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="lbl sm">{label}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>自動</span>
            {togBtn(isAuto, () => onChange(isAuto ? String(num) : "auto"), true)}
          </span>
        </div>
        {!isAuto && (
          <span className="color-input" style={{ alignSelf: "stretch" }}>
            <input type="number" className="hex" style={{ width: "100%" }} value={num} min={0} max={1000}
              onChange={(e) => onChange(e.target.value === "" ? "auto" : String(parseFloat(e.target.value) || 0))} />
            <span style={{ fontSize: 11, color: "var(--faint)", fontFamily: "var(--mono)" }}>px</span>
          </span>
        )}
      </div>
    );
  };
  const segRow = (
    label: string, val: string, options: [string, string][], onChange: (s: string) => void,
  ) => (
    <div className="seg-line">
      <span className="lbl sm">{label}</span>
      <div className="mini-seg">
        {options.map(([v, t]) => (
          <button key={v} className={String(val) === v ? "on" : ""} onClick={() => onChange(v)}>{t}</button>
        ))}
      </div>
    </div>
  );
  const togBtn = (on: boolean, onClick: () => void, sm = false) => (
    <button type="button" className={`toggle${sm ? " sm" : ""}${on ? " on" : ""}`} onClick={onClick}>
      <span className="knob" />
    </button>
  );
  const togRow = (label: string, on: boolean, onClick: () => void) => (
    <div className="row-line">
      <span className="lbl sm">{label}</span>
      {togBtn(on, onClick, true)}
    </div>
  );
  const strRow = (val: string, onChange: (s: string) => void) => (
    <input
      type="text" className="str-input" value={val}
      onChange={(e) => onChange(e.target.value)}
      placeholder="CSS 值，例如 0 4px 12px rgba(0,0,0,.2)"
    />
  );
  const ctlCard = (
    key: string, eyebrow: string, title: string,
    headRight: React.ReactNode, body: React.ReactNode,
  ) => (
    <div className="ctl-card" key={key}>
      <div className="cc-head">
        <div className="cc-titles">
          {eyebrow && <span className="cc-eyebrow">{eyebrow}</span>}
          <span className="cc-title">{title}</span>
        </div>
        {headRight}
      </div>
      {body != null && <div className="cc-body">{body}</div>}
    </div>
  );

  // 常用選項
  const STYLE_OPTS: [string, string][] = [["solid", "實線"], ["dashed", "虛線"], ["dotted", "點線"], ["double", "雙線"]];
  const TIMING_OPTS: [string, string][] = [["ease", "ease"], ["linear", "linear"], ["ease-in", "ease-in"], ["ease-out", "ease-out"], ["ease-in-out", "ease-in-out"]];
  const CURSOR_OPTS: [string, string][] = [["not-allowed", "not-allowed"], ["default", "default"], ["wait", "wait"]];
  const BG_SWATCHES = ["#f9fafb", "#ffffff", "#111827", "#1e293b", "#f1f6f0", "#fff7ed", "#0b0f1a"];

  // ============ 左欄「設計效果」依模式取設定 ============
  const fxDesc =
    previewMode === "text" ? "文字效果：漸層 / 中空 / 多層陰影 / 螢光筆"
    : previewMode === "button" ? "按鈕效果：玻璃 / 漸層光暈 / 新擬態 / 立體 / 霓虹…（套完可用右側微調）"
    : previewMode === "card" ? "卡片效果：外框 / 質感 / 玻璃 / 霓虹 / 黏土…"
    : "滑桿效果：滑軌與把手樣式（含內外光暈）";
  const fxCfg: { list: any[]; active: string | null; apply: (p: any) => void; clear: () => void } =
    previewMode === "text" ? { list: DESIGN_PRESETS, active: activeDesignPreset, apply: applyDesignPreset, clear: clearDesignPreset }
    : previewMode === "button" ? { list: BUTTON_PRESETS, active: activeButtonPreset, apply: applyButtonPreset, clear: clearButtonPreset }
    : previewMode === "card" ? { list: CARD_PRESETS, active: activeCardPreset, apply: applyCardPreset, clear: clearCardPreset }
    : { list: SLIDER_PRESETS, active: activeSliderPreset, apply: applySliderPreset, clear: clearSliderPreset };
  const modeCN = previewMode === "text" ? "純文字" : previewMode === "button" ? "按鈕" : previewMode === "card" ? "卡片" : "滑桿";
  const modeTag = previewMode === "text" ? "Text" : previewMode === "button" ? "Button" : previewMode === "card" ? "Card" : "Slider";
  const modeInputLabel = previewMode === "text" ? "預覽文字" : previewMode === "card" ? "卡片標題文字" : previewMode === "slider" ? "滑桿說明文字" : "按鈕文字";

  // ============ 組裝控制面板卡片（依模式） ============
  const cards: React.ReactNode[] = [];

  // 排版（所有模式都有：作用在預覽文字 / 標題 / 說明）
  cards.push(ctlCard("typo", "", "排版", <span className="mtag">{modeCN}</span>, (
    <>
      {sRow("字型大小", fontSize, 12, 120, 1, (v) => setFontSize(v), `${fontSize}px`)}
      {sRow("行高", lineHeight, 1, 3, 0.1, (v) => setLineHeight(v), lineHeight.toFixed(1))}
      {sRow("字距", letterSpacing, -2, 10, 0.5, (v) => setLetterSpacing(v), `${letterSpacing.toFixed(1)}px`)}
      {sRow("詞距", wordSpacing, -2, 10, 0.5, (v) => setWordSpacing(v), `${wordSpacing.toFixed(1)}px`)}
      <div className="row-line col">
        <span className="lbl sm">字重</span>
        <div className="weight-grid">
          {[300, 400, 500, 600, 700, 800].map((w) => (
            <button key={w} className={`wbtn${fontWeight === w ? " active" : ""}`} onClick={() => setFontWeight(w)}>{w}</button>
          ))}
        </div>
      </div>
      {sRow("透明度", textOpacity, 0, 100, 5, (v) => setTextOpacity(v), `${textOpacity}%`)}
      {cRow("文字顏色", textColor, setTextColor)}
    </>
  )));

  // 文字漸層（純文字模式）
  if (previewMode === "text") {
    cards.push(ctlCard("fx-grad", "文字效果", "文字漸層", togBtn(gradientEnabled, () => setGradientEnabled(!gradientEnabled), true), gradientEnabled ? (
      <>
        {segRow("漸層類型", gradientType, [["linear", "線性"], ["radial", "徑向"]], (v) => setGradientType(v as any))}
        {gradientType === "linear" && sRow("角度", gradientAngle, 0, 360, 15, (v) => setGradientAngle(v), `${gradientAngle}°`)}
        {cRow("起始色", gradientColor1, setGradientColor1)}
        {cRow("結束色", gradientColor2, setGradientColor2)}
      </>
    ) : null));
  }

  // 文字陰影 / 描邊（純文字模式 + 組合快速效果未啟用時）
  if (previewMode === "text" && combinedPresets.length === 0) {
    cards.push(ctlCard("fx-shadow", "文字效果", "文字陰影", togBtn(textShadowEnabled, () => setTextShadowEnabled(!textShadowEnabled), true), textShadowEnabled ? (
      <>
        {sRow("X 偏移", textShadowX, -10, 10, 1, (v) => setTextShadowX(v), `${textShadowX}px`)}
        {sRow("Y 偏移", textShadowY, -10, 10, 1, (v) => setTextShadowY(v), `${textShadowY}px`)}
        {sRow("模糊度", textShadowBlur, 0, 20, 1, (v) => setTextShadowBlur(v), `${textShadowBlur}px`)}
        {cRow("顏色", textShadowColor, setTextShadowColor)}
        {sRow("透明度", Math.round(textShadowOpacity * 100), 0, 100, 5, (v) => setTextShadowOpacity(v / 100), `${Math.round(textShadowOpacity * 100)}%`)}
      </>
    ) : null));
    cards.push(ctlCard("fx-stroke", "文字效果", "文字描邊", togBtn(textStrokeEnabled, () => setTextStrokeEnabled(!textStrokeEnabled), true), textStrokeEnabled ? (
      <>
        {sRow("描邊寬度", textStrokeWidth, 0, 5, 0.1, (v) => setTextStrokeWidth(v), `${textStrokeWidth.toFixed(1)}px`)}
        {cRow("描邊顏色", textStrokeColor, setTextStrokeColor)}
      </>
    ) : null));
  }

  // ── 純文字模式專屬的新控制卡 ──
  if (previewMode === "text") {
    // 多層文字陰影
    cards.push(ctlCard("multi-shadow", "文字效果", "多層陰影", (
      <button className="clear-link" style={{fontSize:11}} onClick={addShadowLayer}>＋ 新增</button>
    ), (
      <>
        {textShadowLayers.length === 0 && <span style={{fontSize:12,color:"var(--muted)"}}>點右上角新增陰影層（可疊多層做浮雕）</span>}
        {textShadowLayers.map((l, i) => (
          <div key={l.id} style={{borderTop: i > 0 ? "1px solid var(--glass-line)" : undefined, paddingTop: i > 0 ? 10 : 0, marginTop: i > 0 ? 6 : 0}}>
            <div className="row-line"><span className="lbl sm">第 {i+1} 層</span><button className="clear-link" style={{fontSize:11}} onClick={() => removeShadowLayer(l.id)}>刪除</button></div>
            {sRow("X", l.x, -20, 20, 1, (v) => updateShadowLayer(l.id, {x:v}), `${l.x}px`)}
            {sRow("Y", l.y, -20, 20, 1, (v) => updateShadowLayer(l.id, {y:v}), `${l.y}px`)}
            {sRow("模糊", l.blur, 0, 30, 1, (v) => updateShadowLayer(l.id, {blur:v}), `${l.blur}px`)}
            {cRow("顏色", l.color, (v) => updateShadowLayer(l.id, {color:v}))}
            {sRow("透明度", Math.round(l.opacity*100), 0, 100, 5, (v) => updateShadowLayer(l.id, {opacity:v/100}), `${Math.round(l.opacity*100)}%`)}
          </div>
        ))}
      </>
    )));

    // 文字變形
    cards.push(ctlCard("fx-transform", "文字效果", "文字變形", null, (
      <>
        {sRow("旋轉", textRotate, -180, 180, 1, (v) => setTextRotate(v), `${textRotate}°`)}
        {sRow("傾斜 X (偽斜體)", textSkewX, -30, 30, 1, (v) => setTextSkewX(v), `${textSkewX}°`)}
        {sRow("傾斜 Y", textSkewY, -30, 30, 1, (v) => setTextSkewY(v), `${textSkewY}°`)}
        {sRow("橫向縮放", Math.round(textScaleX * 100), 50, 200, 5, (v) => setTextScaleX(v / 100), `${Math.round(textScaleX * 100)}%`)}
        <div className="row-line"><span className="lbl sm" style={{fontSize:10,opacity:.7}}>── 3D 透視擠出 ──</span></div>
        {sRow("透視距離", textPerspective, 0, 1000, 50, (v) => setTextPerspective(v), textPerspective === 0 ? "關" : `${textPerspective}px`)}
        {textPerspective > 0 && sRow("旋轉 X 軸", textRotateX, -60, 60, 1, (v) => setTextRotateX(v), `${textRotateX}°`)}
        {textPerspective > 0 && sRow("旋轉 Y 軸", textRotateY, -60, 60, 1, (v) => setTextRotateY(v), `${textRotateY}°`)}
      </>
    )));

    // 直書
    cards.push(ctlCard("fx-writing", "文字效果", "書寫方向", null, (
      segRow("方向", writingMode, [["horizontal-tb", "橫書"], ["vertical-rl", "直書（右→左）"], ["vertical-lr", "直書（左→右）"]], (v) => setWritingMode(v as any))
    )));

    // 文字裝飾線
    cards.push(ctlCard("fx-deco", "文字效果", "裝飾線", null, (
      <>
        {segRow("類型", textDecoLine, [["none", "無"], ["underline", "底線"], ["line-through", "刪除線"], ["overline", "上劃線"]], (v) => setTextDecoLine(v as any))}
        {textDecoLine !== "none" && (
          <>
            {segRow("樣式", textDecoStyle, [["solid", "實線"], ["wavy", "波浪"], ["dashed", "虛線"], ["dotted", "點線"]], (v) => setTextDecoStyle(v as any))}
            {cRow("顏色", textDecoColor, setTextDecoColor)}
            {sRow("粗細", textDecoThickness, 1, 10, 1, (v) => setTextDecoThickness(v), `${textDecoThickness}px`)}
            {textDecoLine === "underline" && sRow("底線偏移", textUnderlineOffset, 0, 20, 1, (v) => setTextUnderlineOffset(v), `${textUnderlineOffset}px`)}
          </>
        )}
      </>
    )));

    // 排版進階
    cards.push(ctlCard("fx-layout", "文字效果", "排版進階", null, (
      <>
        {segRow("大小寫", textTransformVal, [["none", "原始"], ["uppercase", "全大寫"], ["lowercase", "全小寫"], ["capitalize", "首字大寫"]], (v) => setTextTransformVal(v as any))}
        {segRow("對齊", textAlign, [["left", "左"], ["center", "中"], ["right", "右"], ["justify", "兩端"]], (v) => setTextAlign(v as any))}
        {sRow("首行縮排", textIndent, 0, 6, 0.5, (v) => setTextIndent(v), textIndent === 0 ? "無" : `${textIndent}em`)}
      </>
    )));

    // 濾鏡
    cards.push(ctlCard("fx-filter", "文字效果", "濾鏡", null, (
      <>
        {sRow("模糊", filterBlur, 0, 20, 0.5, (v) => setFilterBlur(v), `${filterBlur}px`)}
        {sRow("亮度", filterBrightness, 0, 300, 5, (v) => setFilterBrightness(v), `${filterBrightness}%`)}
        {sRow("對比度", filterContrast, 0, 300, 5, (v) => setFilterContrast(v), `${filterContrast}%`)}
        {sRow("色相旋轉", filterHueRotate, 0, 360, 5, (v) => setFilterHueRotate(v), `${filterHueRotate}°`)}
        {sRow("飽和度", filterSaturate, 0, 300, 5, (v) => setFilterSaturate(v), `${filterSaturate}%`)}
        {togRow("投影陰影", filterDropShadowEnabled, () => setFilterDropShadowEnabled(!filterDropShadowEnabled))}
        {filterDropShadowEnabled && (
          <>
            {sRow("X", filterDropShadowX, -20, 20, 1, (v) => setFilterDropShadowX(v), `${filterDropShadowX}px`)}
            {sRow("Y", filterDropShadowY, -20, 20, 1, (v) => setFilterDropShadowY(v), `${filterDropShadowY}px`)}
            {sRow("模糊", filterDropShadowBlur, 0, 30, 1, (v) => setFilterDropShadowBlur(v), `${filterDropShadowBlur}px`)}
            {cRow("顏色", filterDropShadowColor, setFilterDropShadowColor)}
          </>
        )}
      </>
    )));

    // OpenType
    cards.push(ctlCard("fx-opentype", "字型特性", "OpenType 特性", null, (
      <>
        {togRow("連字 liga", ligatures, () => setLigatures(!ligatures))}
        {togRow("花體 swash", swash, () => setSwash(!swash))}
        {togRow("舊式數字 onum", oldstyleNums, () => setOldstyleNums(!oldstyleNums))}
        {togRow("等寬數字 tnum", tabularNums, () => setTabularNums(!tabularNums))}
      </>
    )));

    // 可變字型軸
    cards.push(ctlCard("fx-variation", "字型特性", "可變字型軸", togBtn(fontVariationEnabled, () => setFontVariationEnabled(!fontVariationEnabled), true), fontVariationEnabled ? (
      <>
        {sRow("字重 wght（連續）", fontAxisWeight ?? fontWeight, 100, 900, 1, (v) => setFontAxisWeight(v), `${fontAxisWeight ?? fontWeight}`)}
        {sRow("字寬 wdth", fontAxisWidth, 50, 200, 5, (v) => setFontAxisWidth(v), `${fontAxisWidth}%`)}
        {sRow("光學尺寸 opsz", fontAxisOpticalSize ?? fontSize, 8, 144, 1, (v) => setFontAxisOpticalSize(v), `${fontAxisOpticalSize ?? fontSize}`)}
      </>
    ) : null));
  }

  // 混合模式（純文字 / 按鈕 / 卡片皆可）
  if (previewMode !== "slider") {
    const BLEND_OPTS: [string, string][] = [["normal","正常"],["multiply","正片疊底"],["screen","濾色"],["overlay","覆疊"],["darken","變暗"],["lighten","變亮"],["color-dodge","加亮"],["color-burn","加深"],["hard-light","實光"],["soft-light","柔光"],["difference","差異"],["exclusion","排除"],["hue","色相"],["saturation","飽和"],["color","顏色"],["luminosity","亮度"]];
    cards.push(ctlCard("fx-blend", "效果", "混合模式", null, (
      selRow("mix-blend-mode", blendMode, BLEND_OPTS, setBlendMode)
    )));
  }

  // 外框（按鈕 / 卡片）
  if (previewMode === "button") {
    cards.push(ctlCard("box-model", "外框", "盒模型", <span className="mtag">按鈕</span>, (
      <>
        {sRow("水平內距", btnPaddingX, 0, 64, 1, (v) => setBtnPaddingX(v), `${btnPaddingX}px`)}
        {sRow("垂直內距", btnPaddingY, 0, 40, 1, (v) => setBtnPaddingY(v), `${btnPaddingY}px`)}
        {sRow("圓角", btnBorderRadius, 0, 50, 1, (v) => setBtnBorderRadius(v), `${btnBorderRadius}px`)}
        {dimRow("寬度", btnWidth, setBtnWidth, 150)}
        {dimRow("高度", btnHeight, setBtnHeight, 44)}
        {sRow("背景透明度", btnOpacity, 0, 100, 1, (v) => setBtnOpacity(v), `${btnOpacity}%`)}
      </>
    )));
    cards.push(ctlCard("box-border", "外框", "邊框", null, (
      <>
        {segRow("邊框設定", btnBorderMode, [["unified", "四邊一致"], ["separate", "分別設定"]], (v) => setBtnBorderMode(v as any))}
        {btnBorderMode === "unified"
          ? sRow("邊框寬度", btnBorderWidth, 0, 10, 1, (v) => setBtnBorderWidth(v), `${btnBorderWidth}px`)
          : (
            <>
              {sRow("上邊框", btnBorderTopWidth, 0, 10, 1, (v) => setBtnBorderTopWidth(v), `${btnBorderTopWidth}px`)}
              {sRow("右邊框", btnBorderRightWidth, 0, 10, 1, (v) => setBtnBorderRightWidth(v), `${btnBorderRightWidth}px`)}
              {sRow("下邊框", btnBorderBottomWidth, 0, 10, 1, (v) => setBtnBorderBottomWidth(v), `${btnBorderBottomWidth}px`)}
              {sRow("左邊框", btnBorderLeftWidth, 0, 10, 1, (v) => setBtnBorderLeftWidth(v), `${btnBorderLeftWidth}px`)}
            </>
          )}
        {cRow("邊框顏色", btnBorderColor, setBtnBorderColor)}
        {selRow("邊框樣式", btnBorderStyle, STYLE_OPTS, setBtnBorderStyle)}
        {togRow("發光邊框", btnBorderGlowEnabled, () => setBtnBorderGlowEnabled(!btnBorderGlowEnabled))}
        {btnBorderGlowEnabled && (
          <>
            {cRow("發光顏色", btnBorderGlowColor, setBtnBorderGlowColor)}
            {sRow("模糊程度", btnBorderGlowBlur, 0, 20, 1, (v) => setBtnBorderGlowBlur(v), `${btnBorderGlowBlur}px`)}
            {sRow("擴散程度", btnBorderGlowSpread, 0, 10, 1, (v) => setBtnBorderGlowSpread(v), `${btnBorderGlowSpread}px`)}
          </>
        )}
      </>
    )));
    cards.push(ctlCard("box-bg", "外框", "背景", null, (
      <>
        {togRow("漸層", bgUseGradient, () => setBgUseGradient(!bgUseGradient))}
        {bgUseGradient ? (
          <>
            {sRow("角度", bgGradAngle, 0, 360, 1, (v) => setBgGradAngle(v), `${bgGradAngle}°`)}
            {cRow("起始色", bgGradColor1, setBgGradColor1)}
            {cRow("結束色", bgGradColor2, setBgGradColor2)}
          </>
        ) : cRow("背景顏色", btnBgColor, setBtnBgColor)}
      </>
    )));
    // 按鈕陰影（外陰影 / 內陰影 / 內外光暈）
    cards.push(ctlCard("box-shadow", "外框", "陰影", togBtn(btnShadowEnabled, () => setBtnShadowEnabled(!btnShadowEnabled), true), btnShadowEnabled ? (
      <>
        {segRow("類型", String(btnShadowInset), [["false", "外陰影/外光暈"], ["true", "內陰影/內光暈"]], (v) => setBtnShadowInset(v === "true"))}
        {sRow("X 偏移", btnShadowX, -30, 30, 1, (v) => setBtnShadowX(v), `${btnShadowX}px`)}
        {sRow("Y 偏移", btnShadowY, -30, 30, 1, (v) => setBtnShadowY(v), `${btnShadowY}px`)}
        {sRow("模糊", btnShadowBlur, 0, 60, 1, (v) => setBtnShadowBlur(v), `${btnShadowBlur}px`)}
        {sRow("擴散", btnShadowSpread, -20, 20, 1, (v) => setBtnShadowSpread(v), `${btnShadowSpread}px`)}
        {cRow("顏色", btnShadowColor, setBtnShadowColor)}
        {sRow("透明度", Math.round(btnShadowOpacity * 100), 0, 100, 5, (v) => setBtnShadowOpacity(v / 100), `${Math.round(btnShadowOpacity * 100)}%`)}
        <div className="row-line"><span className="lbl sm" style={{fontSize:10,opacity:.6}}>X/Y 均設 0 → 光暈效果</span></div>
      </>
    ) : null));
    // 互動狀態：合併成一張卡，移到最後（在「預覽底色」之後 push）
  } else if (previewMode === "card") {
    cards.push(ctlCard("cbox-model", "外框", "盒模型", <span className="mtag">卡片</span>, (
      <>
        {sRow("水平內距", cardPadX, 0, 64, 1, (v) => setCardPadX(v), `${cardPadX}px`)}
        {sRow("垂直內距", cardPadY, 0, 48, 1, (v) => setCardPadY(v), `${cardPadY}px`)}
        {sRow("圓角", cardRadius, 0, 60, 1, (v) => setCardRadius(v), `${cardRadius}px`)}
        {sRow("寬度", cardWidth, 200, 520, 1, (v) => setCardWidth(v), `${cardWidth}px`)}
        {selRow("高度", cardHeight, [["auto", "自動"], ["160", "160px"], ["200", "200px"], ["240", "240px"], ["300", "300px"]], setCardHeight)}
      </>
    )));
    cards.push(ctlCard("cbox-border", "外框", "邊框", null, (
      <>
        {togRow("邊框覆蓋", cardBorderEnabled, () => setCardBorderEnabled(!cardBorderEnabled))}
        {cardBorderEnabled && (
          <>
            {segRow("邊框設定", cardBorderMode, [["unified", "四邊一致"], ["separate", "分別設定"]], (v) => setCardBorderMode(v as any))}
            {cardBorderMode === "unified"
              ? sRow("邊框寬度", cardBorderWidth, 0, 10, 1, (v) => setCardBorderWidth(v), `${cardBorderWidth}px`)
              : (
                <>
                  {sRow("上邊框", cardBorderTopWidth, 0, 10, 1, (v) => setCardBorderTopWidth(v), `${cardBorderTopWidth}px`)}
                  {sRow("右邊框", cardBorderRightWidth, 0, 10, 1, (v) => setCardBorderRightWidth(v), `${cardBorderRightWidth}px`)}
                  {sRow("下邊框", cardBorderBottomWidth, 0, 10, 1, (v) => setCardBorderBottomWidth(v), `${cardBorderBottomWidth}px`)}
                  {sRow("左邊框", cardBorderLeftWidth, 0, 10, 1, (v) => setCardBorderLeftWidth(v), `${cardBorderLeftWidth}px`)}
                </>
              )}
            {cRow("邊框顏色", cardBorderColor, setCardBorderColor)}
            {selRow("邊框樣式", cardBorderStyle, STYLE_OPTS, setCardBorderStyle)}
          </>
        )}
        {togRow("發光邊框", cardBorderGlowEnabled, () => setCardBorderGlowEnabled(!cardBorderGlowEnabled))}
        {cardBorderGlowEnabled && (
          <>
            {cRow("發光顏色", cardBorderGlowColor, setCardBorderGlowColor)}
            {sRow("模糊程度", cardBorderGlowBlur, 0, 20, 1, (v) => setCardBorderGlowBlur(v), `${cardBorderGlowBlur}px`)}
          </>
        )}
      </>
    )));
    cards.push(ctlCard("cbox-bg", "外框", "背景", null, (
      <>
        {togRow("背景覆蓋", cardBgEnabled, () => setCardBgEnabled(!cardBgEnabled))}
        {cardBgEnabled && (
          <>
            {togRow("漸層", cardBgUseGradient, () => setCardBgUseGradient(!cardBgUseGradient))}
            {cardBgUseGradient ? (
              <>
                {sRow("角度", cardBgGradAngle, 0, 360, 1, (v) => setCardBgGradAngle(v), `${cardBgGradAngle}°`)}
                {cRow("起始色", cardBgGradColor1, setCardBgGradColor1)}
                {cRow("結束色", cardBgGradColor2, setCardBgGradColor2)}
              </>
            ) : cRow("背景顏色", cardBgColor, setCardBgColor)}
          </>
        )}
      </>
    )));
    cards.push(ctlCard("cbox-shadow", "外框", "陰影", null, (
      <>
        {togRow("陰影覆蓋", cardShadowEnabled, () => setCardShadowEnabled(!cardShadowEnabled))}
        {cardShadowEnabled && strRow(cardShadow, setCardShadow)}
      </>
    )));
    cards.push(ctlCard("cbox-tilt", "外框", "傾斜 Tilt", togBtn(cardTiltEnabled, () => setCardTiltEnabled(!cardTiltEnabled), true), cardTiltEnabled ? (
      sRow("強度", cardTiltIntensity, 1, 40, 1, (v) => setCardTiltIntensity(v), `${cardTiltIntensity}°`)
    ) : null));
  }

  // 預覽底色
  cards.push(ctlCard("bg", "", "預覽底色", <span className="mtag">背景</span>, (
    cRow("自訂底色", previewBgColor, setPreviewBgColor)
  )));

  // 互動狀態（按鈕模式專用）：全寬卡片、可收合、雙欄；右欄含「狀態預覽」
  const stCol = (children: React.ReactNode) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
  );
  const buttonStates = [
    { label: "平常看到的樣子", bg: btnBgCss(), extra: {} as React.CSSProperties, border: getBorderStyle(0.5), shadow: glowShadow(0.5) ?? "none" },
    { label: "滑鼠移上去", bg: bgUseGradient ? `linear-gradient(${bgGradAngle}deg, ${btnHoverBgColor}, ${btnHoverBgColor})` : btnHoverBgColor, extra: { transform: `scale(${btnHoverScale})` } as React.CSSProperties, border: getBorderStyle(0.5), shadow: [glowShadow(0.5), btnHoverShadowEnabled ? btnHoverShadow : null].filter(Boolean).join(", ") || "none" },
    { label: "點擊瞬間", bg: btnBgCss(), extra: { transform: "scale(0.95) translateY(2px)" } as React.CSSProperties, border: getBorderStyle(0.5), shadow: glowShadow(0.5) ?? "none" },
    { label: "鍵盤選到時", bg: bgUseGradient ? `linear-gradient(${bgGradAngle}deg, ${btnFocusBgColor}, ${btnFocusBgColor})` : btnFocusBgColor, extra: { border: `${btnFocusBorderWidth}px ${btnBorderStyle} ${btnFocusBorderColor}`, outline: btnFocusOutlineEnabled ? `${btnFocusOutlineWidth}px solid ${btnFocusOutlineColor}` : "none" } as React.CSSProperties, border: {} as React.CSSProperties, shadow: [glowShadow(0.5), btnFocusShadowEnabled ? btnFocusShadow : null].filter(Boolean).join(", ") || "none" },
    { label: "不能點擊時", bg: btnBgCss(), extra: { opacity: btnDisabledOpacity } as React.CSSProperties, border: getBorderStyle(0.5), shadow: glowShadow(0.5) ?? "none" },
  ];
  const interactCard = previewMode === "button" ? (
    <div style={{ padding: "0 16px 18px" }}>
      <div className="ctl-card">
        <div className="cc-head" style={{ cursor: "pointer" }} onClick={() => setInteractOpen((o) => !o)}>
          <div className="cc-titles"><span className="cc-title">互動狀態</span></div>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mtag">按鈕</span>
            <ChevronDown className="h-4 w-4" style={{ transition: "transform .15s", transform: interactOpen ? "none" : "rotate(-90deg)", color: "var(--muted)" }} />
          </span>
        </div>
        {interactOpen && (
          <div className="cc-body" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 18, alignItems: "start" }}>
            {/* 左欄：懸停 + 焦點 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {stCol(
                <>
                  <span className="cc-eyebrow">懸停效果</span>
                  {cRow("懸停背景色", btnHoverBgColor, setBtnHoverBgColor)}
                  {sRow("縮放", btnHoverScale, 0.8, 1.3, 0.01, (v) => setBtnHoverScale(v), btnHoverScale.toFixed(2))}
                  {togRow("懸停陰影", btnHoverShadowEnabled, () => setBtnHoverShadowEnabled(!btnHoverShadowEnabled))}
                  {btnHoverShadowEnabled && strRow(btnHoverShadow, setBtnHoverShadow)}
                </>,
              )}
              {stCol(
                <>
                  <span className="cc-eyebrow">按下 :active</span>
                  {sRow("X 位移", btnActiveOffsetX, -10, 10, 1, (v) => setBtnActiveOffsetX(v), `${btnActiveOffsetX}px`)}
                  {sRow("Y 位移", btnActiveOffsetY, -10, 10, 1, (v) => setBtnActiveOffsetY(v), `${btnActiveOffsetY}px`)}
                </>,
              )}
              {stCol(
                <>
                  <span className="cc-eyebrow">焦點狀態</span>
                  {cRow("焦點背景色", btnFocusBgColor, setBtnFocusBgColor)}
                  {sRow("焦點邊框寬度", btnFocusBorderWidth, 0, 10, 1, (v) => setBtnFocusBorderWidth(v), `${btnFocusBorderWidth}px`)}
                  {cRow("焦點邊框色", btnFocusBorderColor, setBtnFocusBorderColor)}
                  {togRow("外框線", btnFocusOutlineEnabled, () => setBtnFocusOutlineEnabled(!btnFocusOutlineEnabled))}
                  {btnFocusOutlineEnabled && (
                    <>
                      {sRow("外框線寬度", btnFocusOutlineWidth, 0, 10, 1, (v) => setBtnFocusOutlineWidth(v), `${btnFocusOutlineWidth}px`)}
                      {cRow("外框線顏色", btnFocusOutlineColor, setBtnFocusOutlineColor)}
                    </>
                  )}
                  {togRow("焦點陰影", btnFocusShadowEnabled, () => setBtnFocusShadowEnabled(!btnFocusShadowEnabled))}
                  {btnFocusShadowEnabled && strRow(btnFocusShadow, setBtnFocusShadow)}
                </>,
              )}
            </div>
            {/* 右欄：過渡 + 禁用 + 狀態預覽 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {stCol(
                <>
                  <span className="cc-eyebrow">過渡動畫</span>
                  {sRow("持續時間", btnTransitionDuration, 0, 2, 0.1, (v) => setBtnTransitionDuration(v), `${btnTransitionDuration.toFixed(1)}s`)}
                  {selRow("緩動函數", btnTransitionTiming, TIMING_OPTS, setBtnTransitionTiming)}
                </>,
              )}
              {stCol(
                <>
                  <span className="cc-eyebrow">禁用狀態</span>
                  {togRow("禁用樣式", btnDisabledEnabled, () => setBtnDisabledEnabled(!btnDisabledEnabled))}
                  {btnDisabledEnabled && (
                    <>
                      {sRow("透明度", Math.round(btnDisabledOpacity * 100), 0, 100, 1, (v) => setBtnDisabledOpacity(v / 100), `${Math.round(btnDisabledOpacity * 100)}%`)}
                      {selRow("游標", btnDisabledCursor, CURSOR_OPTS, setBtnDisabledCursor)}
                    </>
                  )}
                </>,
              )}
              {stCol(
                <>
                  <span className="cc-eyebrow">狀態預覽</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {buttonStates.map((s) => (
                      <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div style={{ padding: `${btnPaddingY * 0.5}px ${btnPaddingX * 0.5}px`, background: s.bg, ...s.border, borderRadius: `${btnBorderRadius}px`, cursor: "default", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: s.shadow, pointerEvents: "none", ...s.extra }}>
                          <span style={{ ...previewStyle, display: "inline-block", fontSize: "11px" }}>{previewText}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </>,
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  // ============ 中央預覽內容（依模式） ============
  const previewContent =
    previewMode === "text" ? (
      <div key={`pv-${fontStamp}`} style={previewStyle} className="preview-text">{previewText}</div>
    ) : previewMode === "card" ? (
      <div className="relative flex items-center justify-center">
        {(activeCardPreset === "frosted" || activeCardPreset === "liquidGlass") && (
          <div aria-hidden style={{ position: "absolute", inset: "-12px", borderRadius: 24, overflow: "hidden", background: "linear-gradient(135deg,#c7d2fe,#fbcfe8 45%,#fde68a)" }}>
            <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", background: "#a78bfa", filter: "blur(6px)", top: 8, left: 18, opacity: 0.75 }} />
            <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", background: "#f472b6", filter: "blur(8px)", bottom: -10, right: 8, opacity: 0.6 }} />
          </div>
        )}
        <div
          key={`card-${fontStamp}`}
          style={{ ...cardStyle, ...cardOverrideStyle, position: "relative", minHeight: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transition: "transform 0.1s ease", mixBlendMode: blendMode !== "normal" ? blendMode as any : undefined }}
          onMouseMove={cardTiltEnabled ? (e) => {
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            const cx = (e.clientX - rect.left) / rect.width - 0.5;
            const cy = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.transform = `perspective(600px) rotateY(${cx * cardTiltIntensity}deg) rotateX(${-cy * cardTiltIntensity}deg) scale(1.02)`;
          } : undefined}
          onMouseLeave={cardTiltEnabled ? (e) => { e.currentTarget.style.transform = "none"; } : undefined}
        >
          {activeCardPreset === "badges" ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {[["新品", "#22c55e"], ["熱門", "#ef4444"], ["限量", "#a855f7"], ["推薦", "#3b82f6"], ["精選", "#f59e0b"]].map(([t, c]) => (
                <span key={t} style={{ background: c as string, color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: 14, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          ) : (
            <>
              <div style={{ fontFamily: selectedFont.value, fontWeight: fontWeight, letterSpacing: `${letterSpacing}px`, fontSize: `${Math.min(fontSize, 40)}px`, color: cardTextColor, textAlign: "center", lineHeight: 1.2 }}>{previewText}</div>
              <p style={{ color: cardTextColor, opacity: 0.6, fontSize: 13, margin: 0 }}>副標題文字 · Subtitle</p>
            </>
          )}
        </div>
      </div>
    ) : previewMode === "slider" ? (
      <div style={{ width: 320, padding: "20px 0" }}>
        <div style={{ marginBottom: 14, textAlign: "center" }}>
          <span style={{ ...previewStyle, display: "inline-block" }}>{previewText}</span>
        </div>
        <div style={{ position: "relative", ...sliderTrack, width: "100%" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "62%", borderRadius: 999, ...sliderFill }} />
          <div style={{ position: "absolute", left: "62%", top: "50%", transform: "translate(-50%,-50%)", borderRadius: "50%", ...sliderThumb }} />
        </div>
      </div>
    ) : (
      <button
        style={getButtonBoxStyle()}
        onMouseEnter={(e) => {
          const t = e.currentTarget;
          t.style.background = bgUseGradient ? `linear-gradient(${bgGradAngle}deg, ${btnHoverBgColor}, ${btnHoverBgColor})` : btnHoverBgColor;
          t.style.transform = `scale(${btnHoverScale})`;
          const base = btnBoxShadowFinal();
          if (btnHoverShadowEnabled) { t.style.boxShadow = base !== "none" ? `${base}, ${btnHoverShadow}` : btnHoverShadow; }
          else { t.style.boxShadow = base; }
        }}
        onMouseLeave={(e) => {
          const t = e.currentTarget;
          t.style.background = btnBgCss();
          t.style.transform = "scale(1)";
          t.style.boxShadow = btnBoxShadowFinal();
        }}
        onMouseDown={(e) => {
          const t = e.currentTarget;
          t.style.transform = `scale(${btnHoverScale}) translate(${btnActiveOffsetX}px, ${btnActiveOffsetY}px)`;
        }}
        onMouseUp={(e) => {
          const t = e.currentTarget;
          t.style.transform = `scale(${btnHoverScale})`;
        }}
      >
        <span style={{ ...previewStyle, display: "inline-block" }}>{previewText}</span>
      </button>
    );

  // ============ 字型畫廊（內建 / 網路 / 本地，含搜尋過濾） ============
  const fq = fontSearch.trim().toLowerCase();
  const fmatch = (n: string, c?: string) => !fq || (n + (c || "")).toLowerCase().includes(fq);
  const galCard = (
    key: string, name: string, value: string, cn: string | undefined,
    selected: boolean, onSelect: () => void, sample: string, onDelete?: () => void,
  ) => (
    <button key={key} className={`gal-card${selected ? " active" : ""}`} onClick={onSelect}>
      <div className="g-name">
        <b>{name}</b>
        {cn && <span className="g-cn">{cn}</span>}
        {onDelete && (
          <span className="g-cn" style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); onDelete(); }}>刪除</span>
        )}
      </div>
      <div className="g-sample" style={{ fontFamily: value }}>{sample}</div>
    </button>
  );

  const builtinFonts = Array.from(fontCategories.entries())
    .filter(([category]) => category !== "本地字型")
    .flatMap(([, fonts]) => fonts)
    .filter((f) => fmatch(f.name));

  return comparisonMode ? (
    /* ============ 對比模式 ============ */
    <div className="wrap">
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-purple-900">選擇要對比的字型</h2>
            <button onClick={exitComparisonMode} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              <Eye className="w-4 h-4" />
              返回編輯
            </button>
          </div>
          <p className="text-sm text-purple-800 mb-4">最多可選擇 3 個字型進行並排對比 ({comparisonFonts.length}/3)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {Array.from(fontCategories.entries()).map(([category, fonts]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-purple-700 mb-2 uppercase">{category}</h3>
                <div className="space-y-1">
                  {fonts.map((font) => {
                    const isSelected = comparisonFonts.some((cf) => cf.font.name === font.name);
                    return (
                      <button
                        key={font.name}
                        onClick={() => addComparisonFont(font)}
                        disabled={isSelected || (comparisonFonts.length >= 3 && !isSelected)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          isSelected ? "bg-purple-600 text-white font-medium"
                          : comparisonFonts.length >= 3 ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-purple-900 border border-purple-200 hover:border-purple-400"
                        }`}
                      >
                        {font.name}
                        {isSelected && <Check className="w-3 h-3 inline ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {comparisonFonts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: "var(--ink)" }}>並排對比預覽</h2>
            <div className={`grid gap-4 ${comparisonFonts.length === 1 ? "grid-cols-1" : comparisonFonts.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {comparisonFonts.map((cf) => {
                const style: React.CSSProperties = {
                  fontFamily: cf.font.value, fontSize: `${fontSize}px`, lineHeight: lineHeight,
                  letterSpacing: `${letterSpacing}px`, wordSpacing: `${wordSpacing}px`, fontWeight: fontWeight,
                  opacity: textOpacity / 100, wordBreak: "break-all",
                };
                if (gradientEnabled) {
                  style.background = gradientType === "linear"
                    ? `linear-gradient(${gradientAngle}deg, ${gradientColor1}, ${gradientColor2})`
                    : `radial-gradient(circle, ${gradientColor1}, ${gradientColor2})`;
                  (style as any).WebkitBackgroundClip = "text";
                  (style as any).WebkitTextFillColor = "transparent";
                  style.backgroundClip = "text" as any;
                }
                if (combinedPresets.length > 0 && combinedShadows.length > 0) {
                  style.textShadow = combinedShadows.join(", ");
                } else if (textShadowEnabled) {
                  const rgb = hexToRgb(textShadowColor);
                  style.textShadow = `${textShadowX}px ${textShadowY}px ${textShadowBlur}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${textShadowOpacity})`;
                }
                if (textStrokeEnabled) (style as any).WebkitTextStroke = `${textStrokeWidth}px ${textStrokeColor}`;
                return (
                  <Card key={cf.id} className="p-6 border-gray-200 shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{cf.font.name}</h3>
                      <button onClick={() => removeComparisonFont(cf.id)} className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6 bg-gray-50 rounded border border-gray-200 min-h-48 flex items-center justify-center">
                      <div style={style} className="text-center text-gray-900">{previewText}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {comparisonFonts.length === 0 && (
          <div className="text-center py-12">
            <p style={{ color: "var(--muted)" }}>請選擇至少 1 個字型開始對比</p>
          </div>
        )}
      </div>
    </div>
  ) : (
    /* ============ 編輯模式 · Frosted Studio ============ */
    <div className="wrap">
      <header className="masthead">
        <div>
          <p className="eyebrow">2560 × 1080 Desktop Workspace · 介面重設計</p>
          <h1>字型預覽測試器</h1>
        </div>
        <div className="mast-actions">
          <span className="badge font">{selectedFont.name}</span>
          <a className="btn ghost-accent" href="/refs/gallery.html" target="_blank" rel="noopener noreferrer">
            <LayoutGrid className="h-4 w-4" />
            效果參考圖
          </a>
          <button className="btn" onClick={() => setComparisonMode(true)}>
            <Eye className="h-4 w-4" />
            對比模式
          </button>
          <button className="btn primary" onClick={handleCopyCSS}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            匯出 CSS
          </button>
        </div>
      </header>

      <div className="workspace">
        {/* 左：設計效果 + 快速效果 */}
        <aside className="col">
          <section className="panel">
            <div className="panel-h">
              <div>
                <h2>設計效果</h2>
                <p className="desc">{fxDesc}</p>
              </div>
              {fxCfg.active && (
                <button className="clear-link" onClick={fxCfg.clear}>
                  <X className="h-3 w-3" />
                  清除
                </button>
              )}
            </div>
            <div className="panel-b">
              <div className="preset-grid">
                {fxCfg.list.map((p) => (
                  <button key={`fx-${p.name}`} className={`preset${fxCfg.active === p.name ? " active" : ""}`} onClick={() => fxCfg.apply(p)}>
                    {p.label}
                    {fxCfg.active === p.name && <Check className="tick" />}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-h">
              <div>
                <h2>快速效果</h2>
                <p className="desc">可疊加最多 3 個預設（套在文字陰影上）</p>
              </div>
              {combinedPresets.length > 0 && <span className="count-pill">{combinedPresets.length}/3</span>}
            </div>
            <div className="panel-b">
              <div className="preset-grid q3">
                {EFFECT_PRESETS.map((preset) => (
                  <button key={`quick-${preset.name}`} className={`preset${combinedPresets.includes(preset.name) ? " active" : ""}`} onClick={() => toggleCombinedPreset(preset.name)}>
                    {preset.label}
                    {combinedPresets.includes(preset.name) && <Check className="tick" />}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </aside>

        {/* 中：預覽 */}
        <section className="col">
          <div className="panel preview-card">
            <div className="field-wrap">
              <label className="field-label">{modeInputLabel}</label>
              <input className="text-input" value={previewText} onChange={(e) => setPreviewText(e.target.value)} placeholder="輸入要預覽的文字" spellCheck={false} />
            </div>
            <div className="stage" style={{ background: previewBgColor }}>
              {previewContent}
            </div>
          </div>
        </section>

        {/* 右：控制面板 + CSS 輸出 */}
        <aside className="col">
          <section className="panel">
            <div className="mode-tabs">
              {(["text", "button", "card", "slider"] as const).map((m) => (
                <button key={m} className={`mode-tab${previewMode === m ? " active" : ""}`} onClick={() => setPreviewMode(m)}>
                  {m === "text" ? "純文字" : m === "button" ? "按鈕" : m === "card" ? "卡片" : "滑桿"}
                </button>
              ))}
            </div>
            <div className="panel-h">
              <div>
                <h2>控制面板</h2>
                <p className="desc">作用在目前選取的元件 · {modeCN}</p>
              </div>
              <span className="tag">{modeTag}</span>
            </div>
            <div className="ctl-cols">{cards}</div>
            {interactCard}
          </section>

          <section className="panel">
            <div className="panel-h" style={{ cursor: "pointer" }} onClick={() => setCssOpen((o) => !o)}>
              <div>
                <h2>CSS 輸出</h2>
                <p className="desc">{previewMode === "text" ? ".heading 文字樣式" : previewMode === "button" ? ".button 樣式" : previewMode === "card" ? ".card 樣式" : ".slider 樣式"}</p>
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="tag">Export</span>
                <ChevronDown className="h-4 w-4" style={{ transition: "transform .15s", transform: cssOpen ? "none" : "rotate(-90deg)", color: "var(--muted)" }} />
              </span>
            </div>
            {cssOpen && (
              <div className="panel-b">
                <div className="mini-seg" style={{ marginBottom: 10 }}>
                  <button className={!pasteMode ? "on" : ""} onClick={() => { setPasteMode(false); setPasteMsg(""); }}>輸出</button>
                  <button className={pasteMode ? "on" : ""} onClick={() => { if (!pasteMode) setPasteText(cssCode); setPasteMode(true); setPasteMsg(""); }}>貼上編輯</button>
                </div>
                {pasteMode ? (
                  <>
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      spellCheck={false}
                      placeholder=".button { background: ...; border: ...; border-radius: ...; box-shadow: ...; }"
                      style={{ width: "100%", minHeight: 200, resize: "vertical", background: "rgba(22,32,28,.82)", color: "rgba(225,240,232,.95)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 13, padding: "12px 14px", font: "500 12px/1.65 var(--mono)", outline: "none" }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button className="btn primary" onClick={applyPastedCss}>解析回控制項</button>
                      <button className="btn" onClick={() => { setPasteMode(false); setPasteMsg(""); }}>取消</button>
                    </div>
                    {pasteMsg && <p style={{ color: "#fda4af", fontSize: 12, marginTop: 9, lineHeight: 1.6 }}>{pasteMsg}</p>}
                    <p style={{ color: "var(--muted)", fontSize: 11.5, marginTop: 9, lineHeight: 1.65 }}>
                      貼上你專案按鈕的 CSS（<code>.button {"{ … }"}</code> 或直接貼宣告），按「解析回控制項」會把認得的屬性（背景／漸層、邊框、圓角、內距、陰影、文字色…）回填到右側控制，再微調。認不得的會略過。
                    </p>
                  </>
                ) : (
                  <div className="code">
                    <button className="code-copy" onClick={handleCopyCSS}>{copied ? "已複製" : "複製"}</button>
                    {cssCode}
                  </div>
                )}
              </div>
            )}
          </section>
        </aside>
      </div>

      {/* 下：儲存樣式 */}
      <section className="panel">
        <div className="panel-h">
          <div>
            <h2>儲存樣式</h2>
            <p className="desc">編輯中的樣式會自動保留——重整網頁不會不見。也可命名存成多組,隨時載入或刪除。</p>
          </div>
          <span className="tag">Saved</span>
        </div>
        <div className="panel-b">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: savedStyles.length ? 14 : 0 }}>
            <input className="text-input" style={{ height: 42, flex: "1 1 240px", maxWidth: 320 }} value={styleName} onChange={(e) => setStyleName(e.target.value)} placeholder="樣式名稱(可留空自動命名)" />
            <button className="btn primary" onClick={saveCurrentStyle}>儲存目前樣式</button>
          </div>
          {savedStyles.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
              {savedStyles.map((s) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 12, border: "1px solid var(--glass-line)", background: "var(--glass-2)" }}>
                  <span style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                  <button className="btn" style={{ height: 30, padding: "0 12px", fontSize: 12 }} onClick={() => loadStyle(s)}>載入</button>
                  <button className="clear-link" onClick={() => deleteStyle(s.name)} title="刪除"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 下：字型選擇 */}
      <section className="panel gallery">
        <div className="panel-h">
          <div>
            <h2>字型選擇</h2>
            <p className="desc">所有字型集中在這裡，點任一卡片即可套用到上方預覽。可上傳本機字型或一鍵匯入。</p>
          </div>
          <span className="tag">Fonts · Gallery</span>
        </div>
        <div className="panel-b">
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "stretch" }}>
            <div style={{ flex: "1 1 300px", minWidth: 260 }}>
              <FontUploader onUpload={handleUploadFont} isLoading={isLoading} error={error} />
            </div>
            <button className="btn" onClick={handleBulkImport} disabled={isImporting} style={{ alignSelf: "flex-start" }}>
              {isImporting ? "匯入中…" : "一鍵匯入已安裝字型"}
            </button>
          </div>

          <div className="gal-tools">
            <div className="fsearch" style={{ maxWidth: 280, flex: 1 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
              <input value={fontSearch} onChange={(e) => setFontSearch(e.target.value)} placeholder="搜尋字型名稱" />
            </div>
            <input id="gallerySample" value={gallerySample} onChange={(e) => setGallerySample(e.target.value)} placeholder="自訂範例字" />
            <span className="g-cn">自訂範例字</span>
          </div>

          {builtinFonts.length > 0 && (
            <div className="gal-group">
              <div className="gal-group-h">內建字型 <span>{builtinFonts.length}</span></div>
              <div className="gal-grid">
                {builtinFonts.map((font) =>
                  galCard(`builtin-${font.name}`, font.name, font.value, (font as any).category, selectedFont.name === font.name, () => { ensureFontLoaded(font.value); setSelectedFont(font); }, gallerySample),
                )}
              </div>
            </div>
          )}

          {groupByScript(WEB_FONTS).map(([script, fonts]) => {
            const items = fonts.filter((f) => fmatch(f.family, f.cn));
            if (!items.length) return null;
            return (
              <div className="gal-group" key={`web-${script}`}>
                <div className="gal-group-h">網路字型 · {script} <span>{items.length}</span></div>
                <div className="gal-grid">
                  {items.map((f) => {
                    const value = `'${f.family}'`;
                    const sample = script === "英文" ? "Aa Bb Cc 123" : gallerySample;
                    return galCard(`web-${f.family}`, f.family, value, f.cn, selectedFont.name === f.family, () => { ensureFontLoaded(value); setSelectedFont({ name: f.family, value, category: "網路字型" }); }, sample);
                  })}
                </div>
              </div>
            );
          })}

          {localFonts.length > 0 && groupByScript(localFonts).map(([script, fonts]) => {
            const items = fonts.filter((lf) => fmatch(lf.name));
            if (!items.length) return null;
            return (
              <div className="gal-group" key={`local-${script}`}>
                <div className="gal-group-h">本地字型 · {script} <span>{items.length}</span></div>
                <div className="gal-grid">
                  {items.map((lf) => {
                    const value = `'${lf.fontFamily}'`;
                    const sample = script === "英文" ? "Aa Bb Cc 123" : gallerySample;
                    return galCard(`local-${lf.id}`, lf.name, value, "本地", selectedFont.name === lf.name, () => { ensureFontLoaded(value); setSelectedFont({ name: lf.name, value, category: "本地字型" }); }, sample, () => deleteFont(lf.id));
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
