/* ============================================================
   data.js — 忠於 src/pages/Home.tsx 的字型與效果資料
   ============================================================ */
window.FL = window.FL || {};

/* 字型清單（網路字型 + 本地字型），sample 為列表小範例字 */
FL.FONTS = [
  // 中文 / 日文（含漢字）— Google Fonts
  { name: "Dela Gothic One", css: "'Dela Gothic One'", cn: "演唱會海報黑體", group: "中文" },
  { name: "Zen Old Mincho", css: "'Zen Old Mincho'", cn: "金色裝飾明朝", group: "中文" },
  { name: "Kaisei Opti", css: "'Kaisei Opti'", cn: "日式優雅明朝", group: "中文" },
  { name: "Chocolate Classical Sans", css: "'Chocolate Classical Sans'", cn: "優雅現代", group: "中文" },
  { name: "Rampart One", css: "'Rampart One'", cn: "中空立體", group: "中文" },
  { name: "Reggae One", css: "'Reggae One'", cn: "複古反白", group: "中文" },
  { name: "Potta One", css: "'Potta One'", cn: "超粗膨脹黑體", group: "中文" },
  { name: "RocknRoll One", css: "'RocknRoll One'", cn: "活力手感黑體", group: "中文" },
  { name: "Hachi Maru Pop", css: "'Hachi Maru Pop'", cn: "手寫圓滑", group: "中文" },
  // 本地字型（@font-face）
  { name: "源雲明體", css: "'GenWanMin'", cn: "文鼎開源宋體", group: "本地" },
  { name: "Glow Sans TC", css: "'GlowSans'", cn: "多字重無襯線", group: "本地" },
  { name: "漢儀齊黑", css: "'HanYiQiHei'", cn: "方正均勻黑體", group: "本地" },
  { name: "辰宇落雁體", css: "'ChenYuluoyan'", cn: "極細毛筆楷書", group: "本地" },
  { name: "源暎黑體 Heavy", css: "'GenEiHeavy'", cn: "圓角超粗黑", group: "本地" },
  // 英文（拉丁）
  { name: "Bebas Neue", css: "'Bebas Neue'", cn: "", group: "英文" },
  { name: "Playfair Display", css: "'Playfair Display'", cn: "", group: "英文" },
  { name: "DM Serif Display", css: "'DM Serif Display'", cn: "", group: "英文" },
  { name: "Bodoni Moda", css: "'Bodoni Moda'", cn: "", group: "英文" },
  { name: "Abril Fatface", css: "'Abril Fatface'", cn: "", group: "英文" },
  { name: "Pacifico", css: "'Pacifico'", cn: "", group: "英文" },
  { name: "Caveat", css: "'Caveat'", cn: "", group: "英文" },
];
FL.GROUP_ORDER = ["中文", "本地", "英文"];

/* 多層長陰影 */
FL.longShadow = (color, n = 16) =>
  Array.from({ length: n }, (_, i) => `${i + 1}px ${i + 1}px 0 ${color}`).join(", ");

/* 設計文字效果（文字模式）— 對應 DESIGN_PRESETS */
FL.DESIGN_PRESETS = [
  { name: "gold", label: "金屬金漸層", gradient: { angle: 100, c1: "#fff3b0", c2: "#b8860b" }, stroke: { width: 0.5, color: "#6b4e00" }, shadow: "0 1px 0 #fff8d8, 0 2px 4px rgba(0,0,0,.32)" },
  { name: "vivid", label: "鮮豔漸層", gradient: { angle: 95, c1: "#7c3aed", c2: "#fb7185" }, shadow: "0 2px 7px rgba(124,58,237,.35)" },
  { name: "chrome", label: "鍍鉻銀", gradient: { angle: 180, c1: "#ffffff", c2: "#6b7280" }, stroke: { width: 0.5, color: "#4b5563" }, shadow: "0 1px 0 #fff, 0 -1px 0 #cbd5e1, 0 3px 5px rgba(0,0,0,.4)" },
  { name: "neon", label: "霓虹發光", color: "#ff2db6", shadow: "0 0 2px #fff, 0 0 6px #ff2db6, 0 0 14px #ff2db6, 0 0 28px #ff2db6, 0 0 52px #ff2db6" },
  { name: "extrude3d", label: "立體 3D", color: "#ece3cf", shadow: "-1px -1px 0 #fff, 1px 1px 0 #c9bd99, 2px 2px 0 #c0b48f, 3px 3px 0 #b6aa85, 4px 4px 0 #ac9f7a, 5px 5px 0 #a29570, 6px 6px 0 #988b66, 7px 7px 0 #8d815b, 8px 8px 0 #837751, 11px 11px 17px rgba(0,0,0,.38)" },
  { name: "longshadow", label: "長陰影", color: "#14b8a6", shadow: FL.longShadow("rgba(13,90,84,.45)", 22) },
  { name: "hollow", label: "中空描邊", fill: true, stroke: { width: 2.5, color: "#111827" }, shadow: "3px 3px 0 rgba(17,24,39,.12)" },
  { name: "neonHollow", label: "霓虹中空", fill: true, stroke: { width: 1.6, color: "#ff2d95" }, shadow: "0 0 6px #ff2d95, 0 0 14px #ff2d95, 0 0 28px #ff2d95" },
  { name: "misprint", label: "套印錯位", color: "#111827", shadow: "3px 3px 0 #00b4d8, -3px -3px 0 #ff006e" },
  { name: "glitch", label: "故障 glitch", color: "#111827", shadow: "3px 0 #ff006e, -3px 0 #00e5ff, 0 2px 0 #00e5ff" },
  { name: "emboss2", label: "浮雕", color: "#d8dde3", shadow: "0 1px 0 #fff, 0 -1px 1px rgba(0,0,0,.25)" },
  { name: "marker", label: "螢光筆", color: "#1f2937", highlight: "#fde047" },
];

/* 快速效果（可疊加）— 對應 EFFECT_PRESETS */
FL.QUICK = [
  { name: "neon", label: "霓虹燈", shadow: "0 0 20px rgba(255,0,255,1)" },
  { name: "3d", label: "立體", shadow: "4px 4px 8px rgba(0,0,0,.8)" },
  { name: "emboss", label: "浮雕", shadow: "-2px -2px 4px rgba(255,255,255,.8)" },
  { name: "engrave", label: "陰刻", shadow: "2px 2px 4px rgba(0,0,0,.6)" },
  { name: "metal", label: "金屬", shadow: "0 0 10px rgba(255,204,0,.7)" },
  { name: "glow", label: "發光", shadow: "0 0 15px rgba(0,255,255,.9)" },
];

/* 設計按鈕效果 — box 形式（可被右側「外框」控制驅動） */
FL.BUTTON_PRESETS = [
  { name:"glass", label:"玻璃擬態", box:{ bg:"rgba(255,255,255,0.4)", radius:16, borderW:1, borderColor:"#ffffff", shadowOn:true, shadow:"0 8px 32px rgba(31,38,135,.18)", textColor:"#1f2937" } },
  { name:"gradGlow", label:"漸層光暈", box:{ bg:"linear-gradient(95deg,#a855f7,#ec4899)", radius:999, borderW:0, borderColor:"#a855f7", shadowOn:true, shadow:"0 10px 28px rgba(168,85,247,.5)", textColor:"#ffffff" } },
  { name:"neu", label:"新擬態", box:{ bg:"#e0e5ec", radius:16, borderW:0, borderColor:"#e0e5ec", shadowOn:true, shadow:"8px 8px 16px #b8bcc4, -8px -8px 16px #fff", textColor:"#555f6d" } },
  { name:"brutal", label:"neo-brutalism", box:{ bg:"#ffde59", radius:4, borderW:2, borderColor:"#111111", shadowOn:true, shadow:"5px 5px 0 #111", textColor:"#111111" } },
  { name:"neonBorder", label:"霓虹邊框", box:{ bg:"#0b0f1a", radius:10, borderW:2, borderColor:"#22d3ee", shadowOn:true, shadow:"0 0 8px #22d3ee, 0 0 18px #22d3ee", textColor:"#22d3ee" } },
  { name:"press3d", label:"3D 按下", box:{ bg:"#ff7a18", radius:12, borderW:0, borderColor:"#ff7a18", shadowOn:true, shadow:"0 6px 0 #b3530f", textColor:"#ffffff" } },
  { name:"ghost", label:"Ghost 描邊", box:{ bg:"transparent", radius:8, borderW:2, borderColor:"#3b82f6", shadowOn:false, shadow:"", textColor:"#3b82f6" } },
  { name:"metal", label:"金屬質感", box:{ bg:"linear-gradient(180deg,#f7f7f7,#9aa0a6)", radius:8, borderW:1, borderColor:"#7c7c7c", shadowOn:true, shadow:"inset 0 1px 0 #fff, 0 2px 5px rgba(0,0,0,.35)", textColor:"#2b2f33" } },
  { name:"clay", label:"黏土擬態", box:{ bg:"#c9a7ff", radius:26, borderW:0, borderColor:"#c9a7ff", shadowOn:true, shadow:"10px 10px 22px rgba(0,0,0,.2), inset -5px -5px 10px rgba(0,0,0,.18), inset 5px 6px 14px rgba(255,255,255,.7)", textColor:"#4c1d95" } },
];

/* 設計卡片效果 — box 形式（可被右側「外框」控制驅動） */
FL.CARD_PRESETS = [
  { name:"frosted", label:"毛玻璃", box:{ bg:"rgba(255,255,255,0.55)", radius:18, borderW:1, borderColor:"#ffffff", shadowOn:true, shadow:"0 8px 32px rgba(31,38,135,.15)", textColor:"#1f2937" } },
  { name:"neonBorder", label:"霓虹外框", box:{ bg:"#0b0f1a", radius:12, borderW:2, borderColor:"#22d3ee", shadowOn:true, shadow:"0 0 10px #22d3ee, inset 0 0 12px rgba(34,211,238,.25)", textColor:"#22d3ee" } },
  { name:"clay", label:"黏土擬態", box:{ bg:"#c9a7ff", radius:32, borderW:0, borderColor:"#c9a7ff", shadowOn:true, shadow:"30px 30px 60px rgba(0,0,0,.22), inset -8px -8px 16px rgba(0,0,0,.18), inset 8px 10px 22px rgba(255,255,255,.65)", textColor:"#4c1d95" } },
  { name:"neumorph", label:"新擬物", box:{ bg:"#e0e5ec", radius:20, borderW:0, borderColor:"#e0e5ec", shadowOn:true, shadow:"9px 9px 18px #b8bcc4, -9px -9px 18px #fff", textColor:"#555f6d" } },
  { name:"brutal", label:"手繪粗框", box:{ bg:"#fffef5", radius:14, borderW:2, borderColor:"#111111", shadowOn:true, shadow:"3px 4px 0 rgba(17,17,17,.85)", textColor:"#111111" } },
  { name:"stripe", label:"Stripe 風", box:{ bg:"#ffffff", radius:16, borderW:1, borderColor:"#eef0f5", shadowOn:true, shadow:"0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08)", textColor:"#635bff" } },
  { name:"darkmode", label:"深色模式", box:{ bg:"#1e293b", radius:14, borderW:1, borderColor:"#334155", shadowOn:true, shadow:"0 8px 24px rgba(0,0,0,.4)", textColor:"#e2e8f0" } },
  { name:"tropical", label:"熱帶漸層", box:{ bg:"linear-gradient(135deg,#34d399,#06b6d4 50%,#fbbf24)", radius:20, borderW:0, borderColor:"#34d399", shadowOn:true, shadow:"0 10px 24px rgba(6,182,212,.35)", textColor:"#ffffff" } },
  { name:"holographic", label:"全像虹彩", box:{ bg:"linear-gradient(135deg,#a1c4fd,#c2e9fb 30%,#fbc2eb 60%,#fda085)", radius:18, borderW:0, borderColor:"#a1c4fd", shadowOn:true, shadow:"0 8px 24px rgba(0,0,0,.15)", textColor:"#3a2d55" } },
  { name:"japaneseFresh", label:"日系清新", box:{ bg:"#f7fbf5", radius:16, borderW:1, borderColor:"#dcebd6", shadowOn:true, shadow:"0 6px 16px rgba(120,160,110,.18)", textColor:"#4b6b46" } },
  { name:"synthwave", label:"合成波", box:{ bg:"linear-gradient(180deg,#241734,#43225b)", radius:12, borderW:1, borderColor:"#ff2d95", shadowOn:true, shadow:"0 0 20px rgba(255,45,149,.5)", textColor:"#ff6ad5" } },
  { name:"flat", label:"極簡扁平", box:{ bg:"#ffffff", radius:6, borderW:1, borderColor:"#e5e7eb", shadowOn:false, shadow:"", textColor:"#111827" } },
];

/* 設計滑桿效果 — 對應 SLIDER_PRESETS */
FL.SLIDER_PRESETS = [
  { name: "neon", label: "霓虹內外光", track: "height:8px;background:#0b0f1a;box-shadow:inset 0 0 6px rgba(34,211,238,.4)", fill: "background:#22d3ee;box-shadow:0 0 8px #22d3ee,0 0 16px #22d3ee", thumb: "background:#0b0f1a;border:2px solid #22d3ee;box-shadow:0 0 10px #22d3ee" },
  { name: "inset", label: "內凹軌道", track: "height:10px;background:#e0e5ec;box-shadow:inset 3px 3px 6px #b8bcc4, inset -3px -3px 6px #fff", fill: "background:#94a3b8", thumb: "background:#f0f3f7;box-shadow:3px 3px 6px #b8bcc4,-3px -3px 6px #fff" },
  { name: "neumorph", label: "新擬態凸起", track: "height:10px;background:#e0e5ec;box-shadow:3px 3px 6px #b8bcc4,-3px -3px 6px #fff", fill: "background:#a3aab8", thumb: "background:#e0e5ec;box-shadow:3px 3px 6px #b8bcc4,-3px -3px 6px #fff" },
  { name: "gradient", label: "漸層軌道", track: "height:8px;background:#e5e7eb", fill: "background:linear-gradient(90deg,#a855f7,#ec4899)", thumb: "background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.3)" },
  { name: "glass", label: "玻璃", track: "height:10px;background:rgba(160,170,190,.4);border:1px solid rgba(255,255,255,.7)", fill: "background:rgba(168,85,247,.55)", thumb: "background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.85);box-shadow:0 4px 10px rgba(0,0,0,.2)" },
  { name: "solid3d", label: "立體把手", track: "height:8px;background:#e5e7eb", fill: "background:#3b82f6", thumb: "background:#3b82f6;box-shadow:0 4px 0 #1e40af" },
  { name: "thick", label: "粗描邊", track: "height:12px;background:#fff;border:2px solid #111", fill: "background:#ffde59", thumb: "background:#fff;border:2px solid #111;box-shadow:3px 3px 0 #111" },
  { name: "minimal", label: "極簡", track: "height:4px;background:#e5e7eb", fill: "background:#111", thumb: "background:#111;width:14px;height:14px" },
];

/* 文字 / 底色色票 */
FL.TEXT_COLORS = ["#111827", "#3f8f5b", "#cf952f", "#3f6fb0", "#b34a36", "#7c3aed", "#ffffff"];
FL.BG_COLORS = ["#f9fafb", "#ffffff", "#111827", "#1e293b", "#f1f6f0", "#fff7ed", "#0b0f1a"];
/* 外框：背景 / 邊框色票 */
FL.BOX_BG = ["#ffffff", "#0b0f1a", "#1e293b", "#3498db", "#34d399", "#f7fbf5", "#ffde59", "#c9a7ff", "transparent"];
FL.BOX_BORDER = ["transparent", "#111827", "#e5e7eb", "#22d3ee", "#3b82f6", "#ff2d95", "#34d399", "#ffffff"];
