/* ============================================================
   inspector-schema.js — 統一控制面板的宣告式結構
   path 規則：
     'box.*'  → 依目前模式對應到 st.btn / st.card
     'btn.*'  → 按鈕專屬（互動狀態）
   showIf(g) → g(path) 取得目前值決定是否顯示
   ============================================================ */
window.FL = window.FL || {};

(function () {
  const sl = (path, label, min, max, step, unit, showIf) => ({ t: "slider", path, label, min, max, step, unit: unit || "", showIf });
  const col = (path, label, showIf) => ({ t: "color", path, label, showIf });
  const sel = (path, label, options, showIf) => ({ t: "select", path, label, options, showIf });
  const seg = (path, label, options, showIf) => ({ t: "seg", path, label, options, showIf });
  const tog = (path, label, showIf) => ({ t: "toggle", path, label, showIf });
  const txt = (path, label, showIf) => ({ t: "text", path, label, showIf });

  FL.FACETS = [
    {
      id: "typo", title: "排版", always: true, open: true,
      controls: [
        sl("typo.size", "字型大小", 12, 120, 1, "px"),
        sl("typo.line", "行高", 1, 3, 0.1, ""),
        sl("typo.letter", "字距", -2, 10, 0.5, "px"),
        sl("typo.word", "詞距", -2, 10, 0.5, "px"),
        { t: "weight", path: "typo.weight", label: "字重" },
        sl("typo.opacity", "透明度", 0, 100, 5, "%"),
        col("typo.color", "文字顏色"),
      ],
    },
    {
      id: "fx", title: "文字效果", always: true, open: true,
      groups: [
        { title: "文字漸層", toggle: "fx.gradient.on", controls: [
          seg("fx.gradient.type", "漸層類型", [["linear", "線性"], ["radial", "徑向"]]),
          sl("fx.gradient.angle", "角度", 0, 360, 15, "°", (g) => g("fx.gradient.type") === "linear"),
          col("fx.gradient.c1", "起始色"), col("fx.gradient.c2", "結束色"),
        ] },
        { title: "文字陰影", toggle: "fx.shadow.on", controls: [
          sl("fx.shadow.x", "X 偏移", -10, 10, 1, "px"),
          sl("fx.shadow.y", "Y 偏移", -10, 10, 1, "px"),
          sl("fx.shadow.blur", "模糊度", 0, 20, 1, "px"),
          col("fx.shadow.color", "顏色"),
          sl("fx.shadow.opacity", "透明度", 0, 100, 5, "%"),
        ] },
        { title: "文字描邊", toggle: "fx.stroke.on", controls: [
          sl("fx.stroke.width", "描邊寬度", 0, 5, 0.1, "px"),
          col("fx.stroke.color", "描邊顏色"),
        ] },
      ],
    },
    {
      id: "box", title: "外框", when: (m) => m === "button" || m === "card", open: true,
      note: "「外框」只在 按鈕 / 卡片 作用。切到那兩個模式，這區會亮起，效果只落在你選的元件。",
      groups: [
        { title: "盒模型", controls: [
          sl("box.padX", "水平內距", 0, 64, 1, "px"),
          sl("box.padY", "垂直內距", 0, 48, 1, "px"),
          sl("box.radius", "圓角", 0, 60, 1, "px"),
          sel("box.width", "寬度", [["auto", "自動"], ["100", "100px"], ["150", "150px"], ["200", "200px"], ["250", "250px"]], () => MODE() === "button"),
          sl("box.width", "寬度", 200, 520, 1, "px", () => MODE() === "card"),
          sel("box.height", "高度", [["auto", "自動"], ["40", "40px"], ["50", "50px"], ["60", "60px"]], () => MODE() === "button"),
          sel("box.height", "高度", [["auto", "自動"], ["160", "160px"], ["200", "200px"], ["240", "240px"], ["300", "300px"]], () => MODE() === "card"),
        ] },
        { title: "邊框", controls: [
          seg("box.border.mode", "邊框設定", [["unified", "四邊一致"], ["separate", "分別設定"]]),
          sl("box.border.width", "邊框寬度", 0, 10, 1, "px", (g) => g("box.border.mode") === "unified"),
          sl("box.border.top", "上邊框", 0, 10, 1, "px", (g) => g("box.border.mode") === "separate"),
          sl("box.border.right", "右邊框", 0, 10, 1, "px", (g) => g("box.border.mode") === "separate"),
          sl("box.border.bottom", "下邊框", 0, 10, 1, "px", (g) => g("box.border.mode") === "separate"),
          sl("box.border.left", "左邊框", 0, 10, 1, "px", (g) => g("box.border.mode") === "separate"),
          col("box.border.color", "邊框顏色"),
          sel("box.border.style", "邊框樣式", [["solid", "實線"], ["dashed", "虛線"], ["dotted", "點線"], ["double", "雙線"]]),
          tog("box.border.glow.on", "發光邊框"),
          col("box.border.glow.color", "發光顏色", (g) => g("box.border.glow.on")),
          sl("box.border.glow.blur", "模糊程度", 0, 20, 1, "px", (g) => g("box.border.glow.on")),
          sl("box.border.glow.spread", "擴散程度", 0, 10, 1, "px", (g) => g("box.border.glow.on")),
        ] },
        { title: "背景", controls: [
          tog("box.bg.gradient", "漸層"),
          sl("box.bg.angle", "角度", 0, 360, 1, "°", (g) => g("box.bg.gradient")),
          col("box.bg.c1", "起始色", (g) => g("box.bg.gradient")),
          col("box.bg.c2", "結束色", (g) => g("box.bg.gradient")),
          col("box.bg.color", "背景顏色", (g) => !g("box.bg.gradient")),
        ] },
        { title: "陰影", controls: [
          tog("box.shadow.on", "陰影"),
          txt("box.shadow.value", "", (g) => g("box.shadow.on")),
        ] },
      ],
    },
    {
      id: "state", title: "互動狀態", when: (m) => m === "button", open: false,
      note: "「互動狀態」只在 按鈕 作用。把游標移到預覽按鈕上即可看到懸停/焦點效果。",
      groups: [
        { title: "懸停效果", controls: [
          col("btn.hover.bgColor", "懸停背景色"),
          sl("btn.hover.scale", "縮放", 0.8, 1.3, 0.01, ""),
          tog("btn.hover.shadowOn", "懸停陰影"),
          txt("btn.hover.shadow", "", (g) => g("btn.hover.shadowOn")),
        ] },
        { title: "過渡動畫", controls: [
          sl("btn.transition.dur", "持續時間", 0, 2, 0.1, "s"),
          sel("btn.transition.timing", "緩動函數", [["ease", "ease"], ["linear", "linear"], ["ease-in", "ease-in"], ["ease-out", "ease-out"], ["ease-in-out", "ease-in-out"]]),
        ] },
        { title: "焦點狀態", controls: [
          col("btn.focus.bgColor", "焦點背景色"),
          sl("btn.focus.borderWidth", "焦點邊框寬度", 0, 10, 1, "px"),
          col("btn.focus.borderColor", "焦點邊框色"),
          tog("btn.focus.outlineOn", "外框線"),
          sl("btn.focus.outlineWidth", "外框線寬度", 0, 10, 1, "px", (g) => g("btn.focus.outlineOn")),
          col("btn.focus.outlineColor", "外框線顏色", (g) => g("btn.focus.outlineOn")),
          tog("btn.focus.shadowOn", "焦點陰影"),
          txt("btn.focus.shadow", "", (g) => g("btn.focus.shadowOn")),
        ] },
        { title: "禁用狀態", controls: [
          tog("btn.disabled.on", "禁用樣式"),
          sl("btn.disabled.opacity", "透明度", 0, 100, 1, "%", (g) => g("btn.disabled.on")),
          sel("btn.disabled.cursor", "游標", [["not-allowed", "not-allowed"], ["default", "default"], ["wait", "wait"]], (g) => g("btn.disabled.on")),
        ] },
      ],
    },
    { id: "bg", title: "預覽底色", always: true, open: true, controls: [{ t: "bgswatches", path: "bgColor" }] },
  ];

  // 由 app.js 設定，schema 的 showIf 需要知道目前模式
  let _mode = "text";
  FL.setSchemaMode = (m) => { _mode = m; };
  function MODE() { return _mode; }
})();
