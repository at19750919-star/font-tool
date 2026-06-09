/* ============================================================
   app.js — 字型預覽測試器（重設計 · 完整功能版）
   統一控制面板：固定骨架 + 可收合子區塊，作用在目前選取的元件
   ============================================================ */
(function () {
  "use strict";
  const FL = window.FL;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ---------- default state ---------- */
  const DEF = {
    mode: "text", font: FL.FONTS[0].css, fontName: FL.FONTS[0].name,
    text: "一杯森活力滿分", gallerySample: "永 國 字體 Aa 123", bgColor: "#f9fafb",
    typo: { size: 48, line: 1.5, letter: 0, word: 0, weight: 400, opacity: 100, color: "#111827" },
    fx: { gradient: { on: false, type: "linear", angle: 90, c1: "#ff3d7f", c2: "#3b82f6" },
          shadow: { on: false, x: 2, y: 2, blur: 4, color: "#000000", opacity: 50 },
          stroke: { on: false, width: 1, color: "#000000" } },
    fxRaw: { shadow: "", highlight: "", fill: false },
    btn: {
      padX: 24, padY: 13, radius: 8, width: "auto", height: "auto",
      border: { mode: "unified", width: 0, top: 0, right: 0, bottom: 0, left: 0, color: "#2563eb", style: "solid", glow: { on: false, color: "#0066cc", blur: 5, spread: 0 } },
      bg: { gradient: false, angle: 90, c1: "#3498db", c2: "#2980b9", color: "#3498db", raw: "" },
      shadow: { on: false, value: "0 4px 12px rgba(0,0,0,.15)" },
      hover: { bgColor: "#2980b9", scale: 1, shadowOn: true, shadow: "0 6px 18px rgba(0,0,0,.2)" },
      transition: { dur: 0.3, timing: "ease" },
      focus: { bgColor: "#2980b9", borderWidth: 2, borderColor: "#0066cc", outlineOn: true, outlineWidth: 2, outlineColor: "#0066cc", shadowOn: true, shadow: "0 0 0 3px rgba(0,102,204,.25)" },
      disabled: { on: true, opacity: 50, cursor: "not-allowed" },
    },
    card: {
      padX: 32, padY: 28, radius: 16, width: 360, height: "auto",
      border: { mode: "unified", width: 1, top: 0, right: 0, bottom: 0, left: 0, color: "#e5e7eb", style: "solid", glow: { on: false, color: "#0066cc", blur: 5, spread: 0 } },
      bg: { gradient: false, angle: 135, c1: "#a855f7", c2: "#ec4899", color: "#ffffff", raw: "" },
      shadow: { on: true, value: "0 8px 24px rgba(0,0,0,.12)" },
    },
    slider: { preset: "neon" },
    design: { text: null, button: null, card: null, slider: null }, quick: [],
  };
  let st = load();
  function load() {
    try { return deepMerge(clone(DEF), JSON.parse(localStorage.getItem("fl4") || "{}")); }
    catch (e) { return clone(DEF); }
  }
  function deepMerge(base, ov) {
    if (typeof base !== "object" || base === null || Array.isArray(base)) return ov === undefined ? base : ov;
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(ov || {}).forEach((k) => { out[k] = (k in base) ? deepMerge(base[k], ov[k]) : ov[k]; });
    return out;
  }
  function save() { try { localStorage.setItem("fl4", JSON.stringify(st)); } catch (e) {} }

  /* ---------- path helpers ---------- */
  const boxKey = () => (st.mode === "button" ? "btn" : "card");
  const resolve = (p) => (p.indexOf("box.") === 0 ? boxKey() + "." + p.slice(4) : p);
  function getR(path) { return resolve(path).split(".").reduce((a, k) => (a == null ? a : a[k]), st); }
  function setR(path, v) { const ks = resolve(path).split("."); const last = ks.pop(); let t = st; ks.forEach((k) => (t = t[k])); t[last] = v; }
  const g = (path) => getR(path);

  const MODE_CN = { text: "純文字", button: "按鈕", card: "卡片", slider: "滑桿" };
  const MODE_TAG = { text: "Text", button: "Button", card: "Card", slider: "Slider" };
  const MODE_LABEL = { text: "預覽文字", button: "按鈕文字", card: "卡片標題文字", slider: "滑桿說明文字" };
  const FX_DESC = {
    text: "文字效果：漸層 / 中空 / 多層陰影 / 螢光筆",
    button: "按鈕效果：玻璃 / 漸層光暈 / 新擬態 / 立體 / 霓虹…",
    card: "卡片效果：外框 / 質感 / 玻璃 / 霓虹 / 黏土…",
    slider: "滑桿效果：滑軌與把手樣式（含內外光暈）",
  };
  const hasBox = (m) => m === "button" || m === "card";
  const designListFor = (m) => ({ text: FL.DESIGN_PRESETS, button: FL.BUTTON_PRESETS, card: FL.CARD_PRESETS, slider: FL.SLIDER_PRESETS }[m]);

  function hex2rgba(hex, a) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "#000000");
    const r = m ? parseInt(m[1], 16) : 0, gg = m ? parseInt(m[2], 16) : 0, b = m ? parseInt(m[3], 16) : 0;
    return `rgba(${r}, ${gg}, ${b}, ${a})`;
  }

  /* ============================================================
     control renderers
     ============================================================ */
  function fmtVal(c) {
    let v = g(c.path);
    if (c.step && c.step < 1) v = (+v).toFixed(c.step >= 0.1 ? (c.unit === "" ? 2 : 1) : 2);
    return v + (c.unit || "");
  }
  function ctlHTML(c) {
    if (c.showIf && !c.showIf(g)) return "";
    switch (c.t) {
      case "slider": {
        const pct = Math.max(0, Math.min(100, ((+g(c.path) - c.min) / (c.max - c.min)) * 100));
        return `<div class="slider-row"><div class="top"><span class="lbl">${c.label}</span><span class="val">${fmtVal(c)}</span></div>
          <input type="range" data-path="${c.path}" data-type="num" min="${c.min}" max="${c.max}" step="${c.step}" value="${g(c.path)}" style="--p:${pct}%"></div>`;
      }
      case "color": {
        const v = g(c.path);
        return `<div class="row-line"><span class="lbl sm">${c.label}</span>
          <span class="color-input"><input type="color" data-path="${c.path}" data-type="str" value="${v}"><input type="text" class="hex" data-path="${c.path}" data-type="str" value="${esc(v)}"></span></div>`;
      }
      case "select":
        return `<div class="row-line"><span class="lbl sm">${c.label}</span>
          <select data-path="${c.path}" data-type="str" class="mini-select">${c.options.map((o) => `<option value="${o[0]}" ${String(g(c.path)) === o[0] ? "selected" : ""}>${o[1]}</option>`).join("")}</select></div>`;
      case "seg":
        return `<div class="seg-line"><span class="lbl sm">${c.label}</span><div class="mini-seg">${
          c.options.map((o) => `<button data-segpath="${c.path}" data-v="${o[0]}" class="${String(g(c.path)) === o[0] ? "on" : ""}">${o[1]}</button>`).join("")
        }</div></div>`;
      case "toggle":
        return `<div class="toggle-row"><span class="lbl sm">${c.label}</span>
          <button class="toggle ${g(c.path) ? "on" : ""}" data-togglepath="${c.path}"><span class="knob"></span></button></div>`;
      case "text":
        return `<input type="text" class="str-input" data-path="${c.path}" data-type="str" value="${esc(g(c.path))}" placeholder="CSS 值，例如 0 4px 12px rgba(0,0,0,.2)">`;
      case "weight":
        return `<div class="row-line col"><span class="lbl sm">字重</span><div class="weight-grid">${
          [300, 400, 500, 600, 700, 800].map((w) => `<button class="wbtn ${st.typo.weight === w ? "active" : ""}" data-weight="${w}">${w}</button>`).join("")
        }</div></div>`;
      case "bgswatches":
        return `<div class="color-grid">${FL.BG_COLORS.map((c2) => `<button class="swatch ${st.bgColor === c2 ? "active" : ""}" data-bgcolor="${c2}" style="background:${c2}"></button>`).join("")}</div>`;
      default: return "";
    }
  }
  // 一張控制卡片
  function card(opts) {
    const head = `<div class="cc-head"><div class="cc-titles">${opts.eyebrow ? `<span class="cc-eyebrow">${opts.eyebrow}</span>` : ""}<span class="cc-title">${opts.title}</span></div>${
      opts.toggle != null ? `<button class="toggle sm ${opts.toggle ? "on" : ""}" data-togglepath="${opts.togglePath}"><span class="knob"></span></button>` : (opts.badge ? `<span class="mtag">${opts.badge}</span>` : "")
    }</div>`;
    return `<div class="ctl-card ${opts.inactive ? "inactive" : ""}">${head}${opts.body != null ? `<div class="cc-body">${opts.body}</div>` : ""}</div>`;
  }
  function groupCard(f, grp) {
    const on = grp.toggle ? g(grp.toggle) : true;
    return card({
      eyebrow: f.title, title: grp.title,
      toggle: grp.toggle ? on : null, togglePath: grp.toggle,
      body: on ? grp.controls.map(ctlHTML).join("") : "",
    });
  }
  function renderInspector() {
    FL.setSchemaMode(st.mode);
    const cards = [];
    FL.FACETS.forEach((f) => {
      const active = f.always || (f.when && f.when(st.mode));
      if (!active) { cards.push(card({ title: f.title, badge: MODE_CN[st.mode] + "不適用", body: `<p class="off-note">${f.note || ""}</p>`, inactive: true })); return; }
      if (f.groups) f.groups.forEach((grp) => cards.push(groupCard(f, grp)));
      else cards.push(card({ title: f.title, badge: MODE_CN[st.mode], body: f.controls.map(ctlHTML).join("") }));
    });
    $("#inspectorHost").innerHTML = `<div class="ctl-cols">${cards.join("")}</div>`;
    $("#inspectorScope").textContent = "作用在目前選取的元件 · " + MODE_CN[st.mode];
    $("#inspectorTag").textContent = MODE_TAG[st.mode];
  }

  /* ---------- left presets ---------- */
  function renderDesignGrid() {
    const list = designListFor(st.mode), active = st.design[st.mode];
    $("#fxDesc").textContent = FX_DESC[st.mode];
    $("#designGrid").innerHTML = list.map((p) => `<button class="preset ${active === p.name ? "active" : ""}" data-design="${p.name}">${p.label}${active === p.name ? '<svg class="tick" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>' : ""}</button>`).join("");
    $("#fxClear").hidden = !active;
  }
  function renderQuick() {
    $("#quickGrid").innerHTML = FL.QUICK.map((p) => `<button class="preset ${st.quick.includes(p.name) ? "active" : ""}" data-quick="${p.name}">${p.label}${st.quick.includes(p.name) ? '<svg class="tick" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>' : ""}</button>`).join("");
    const pill = $("#quickCount"); pill.hidden = st.quick.length === 0; pill.textContent = st.quick.length + "/3";
  }
  function renderGallery() {
    const q = (($("#fontSearch") && $("#fontSearch").value) || "").trim().toLowerCase();
    const host = $("#galGroups"); host.innerHTML = "";
    FL.GROUP_ORDER.forEach((grp) => {
      const items = FL.FONTS.filter((f) => f.group === grp && (!q || (f.name + f.cn).toLowerCase().includes(q)));
      if (!items.length) return;
      const sec = document.createElement("div"); sec.className = "gal-group";
      sec.innerHTML = `<div class="gal-group-h">${grp}字型 <span>${items.length}</span></div><div class="gal-grid">${
        items.map((f) => `<button class="gal-card ${f.css === st.font ? "active" : ""}" data-font="${f.css}" data-name="${esc(f.name)}">
          <div class="g-name"><b>${esc(f.name)}</b><span class="g-cn">${f.cn || f.group}</span></div>
          <div class="g-sample" style="font-family:${f.css},serif">${esc(st.gallerySample)}</div></button>`).join("")
      }</div>`;
      host.appendChild(sec);
    });
  }

  /* ============================================================
     style computation
     ============================================================ */
  function textStyle() {
    const t = st.typo, fx = st.fx, raw = st.fxRaw;
    const s = {
      "font-family": st.font + ",serif", "font-size": t.size + "px", "line-height": t.line,
      "letter-spacing": t.letter + "px", "word-spacing": t.word + "px", "font-weight": t.weight, "opacity": (t.opacity / 100).toFixed(2),
    };
    const shadows = [];
    if (raw.shadow) shadows.push(raw.shadow);
    if (fx.shadow.on) shadows.push(`${fx.shadow.x}px ${fx.shadow.y}px ${fx.shadow.blur}px ${hex2rgba(fx.shadow.color, fx.shadow.opacity / 100)}`);
    st.quick.forEach((q) => { const e = FL.QUICK.find((x) => x.name === q); if (e) shadows.push(e.shadow); });
    if (fx.gradient.on) {
      const grd = fx.gradient.type === "linear" ? `linear-gradient(${fx.gradient.angle}deg, ${fx.gradient.c1}, ${fx.gradient.c2})` : `radial-gradient(circle, ${fx.gradient.c1}, ${fx.gradient.c2})`;
      s["background"] = grd; s["-webkit-background-clip"] = "text"; s["background-clip"] = "text"; s["-webkit-text-fill-color"] = "transparent"; s["color"] = "transparent";
    } else if (raw.highlight) {
      s["color"] = t.color; s["background"] = `linear-gradient(transparent 55%, ${raw.highlight} 55%)`;
    } else {
      s["color"] = t.color; if (raw.fill) s["-webkit-text-fill-color"] = "transparent";
    }
    if (fx.stroke.on) s["-webkit-text-stroke"] = `${fx.stroke.width}px ${fx.stroke.color}`;
    if (shadows.length) s["text-shadow"] = shadows.join(", ");
    return s;
  }
  function borderCss(bd) {
    if (bd.mode === "unified") return bd.width > 0 ? `${bd.width}px ${bd.style} ${bd.color}` : "none";
    return null; // separate -> longhand
  }
  function boxStyle(which) {
    const b = st[which];
    const o = {};
    o["padding"] = `${b.padY}px ${b.padX}px`;
    if (b.width && b.width !== "auto") o["width"] = b.width + "px";
    if (b.height && b.height !== "auto") o["height"] = b.height + "px";
    o["background"] = b.bg.gradient ? (b.bg.raw || `linear-gradient(${b.bg.angle}deg, ${b.bg.c1}, ${b.bg.c2})`) : b.bg.color;
    const bd = b.border;
    if (bd.mode === "unified") { if (bd.width > 0) o["border"] = `${bd.width}px ${bd.style} ${bd.color}`; }
    else {
      o["border-top"] = `${bd.top}px ${bd.style} ${bd.color}`; o["border-right"] = `${bd.right}px ${bd.style} ${bd.color}`;
      o["border-bottom"] = `${bd.bottom}px ${bd.style} ${bd.color}`; o["border-left"] = `${bd.left}px ${bd.style} ${bd.color}`;
    }
    o["border-radius"] = b.radius + "px";
    const sh = [];
    if (bd.glow.on) sh.push(`0 0 ${bd.glow.blur}px ${bd.glow.spread}px ${bd.glow.color}`);
    if (b.shadow.on && b.shadow.value) sh.push(b.shadow.value);
    if (sh.length) o["box-shadow"] = sh.join(", ");
    if (which === "btn") o["transition"] = `all ${st.btn.transition.dur}s ${st.btn.transition.timing}`;
    return o;
  }
  const toCss = (s) => Object.entries(s).map(([k, v]) => `${k}: ${v};`).join(" ");

  /* ---------- preview ---------- */
  function renderStage() {
    const stage = $("#stage"); stage.style.background = st.bgColor;
    let dyn = "";
    if (st.mode === "text") {
      stage.innerHTML = `<div class="preview-text" id="previewEl">${esc(st.text) || "預覽文字"}</div>`;
      $("#previewEl").style.cssText = toCss(textStyle());
    } else if (st.mode === "button") {
      stage.innerHTML = `<button class="preview-btn" id="previewEl"><span id="lbl">${esc(st.text) || "按鈕"}</span></button>`;
      $("#previewEl").style.cssText = "border-style:solid;" + toCss(boxStyle("btn"));
      $("#lbl").style.cssText = toCss(textStyle());
      const h = st.btn.hover, fo = st.btn.focus;
      dyn = `#previewEl:hover{background:${h.bgColor};transform:scale(${h.scale});${h.shadowOn ? "box-shadow:" + h.shadow + ";" : ""}}
        #previewEl:focus{background:${fo.bgColor};border:${fo.borderWidth}px solid ${fo.borderColor};${fo.outlineOn ? "outline:" + fo.outlineWidth + "px solid " + fo.outlineColor + ";outline-offset:2px;" : ""}${fo.shadowOn ? "box-shadow:" + fo.shadow + ";" : ""}}`;
    } else if (st.mode === "card") {
      stage.innerHTML = `<div class="preview-card-demo" id="previewEl" style="border-style:solid;${toCss(boxStyle("card"))}">
        <h3 id="lbl" style="margin:0 0 10px">${esc(st.text) || "卡片標題"}</h3>
        <p style="font-family:${st.font},serif;color:${st.typo.color};opacity:.7;margin:0;font-size:14px;line-height:1.7">這是一段卡片內文，檢視字型在卡片版面中的呈現。</p></div>`;
      $("#lbl").style.cssText = toCss(textStyle());
    } else {
      const p = FL.SLIDER_PRESETS.find((x) => x.name === (st.design.slider || "neon")) || FL.SLIDER_PRESETS[0];
      stage.innerHTML = `<div class="slider-demo" id="previewEl">
        <div class="lab" id="lbl">${esc(st.text) || "滑桿說明"}</div>
        <div class="sd-track" style="${p.track}"><div class="sd-fill" style="${p.fill}"></div><div class="sd-thumb" style="${p.thumb};width:22px;height:22px"></div></div></div>`;
      $("#lbl").style.cssText = toCss(textStyle());
    }
    let dynEl = $("#dynState"); if (!dynEl) { dynEl = document.createElement("style"); dynEl.id = "dynState"; document.head.appendChild(dynEl); }
    dynEl.textContent = dyn;
  }

  /* ---------- CSS output ---------- */
  function blockText(sel, obj) { return `${sel} {\n` + Object.entries(obj).map(([k, v]) => `  ${k}: ${v};`).join("\n") + "\n}"; }
  function renderCode() {
    let scope, plain;
    const ts = textStyle();
    if (st.mode === "text") { scope = ".heading 文字樣式"; plain = blockText(".heading", ts); }
    else if (st.mode === "button") {
      scope = ".button 樣式";
      const box = boxStyle("btn"); box["cursor"] = "pointer";
      const parts = [blockText(".button", box)];
      const h = st.btn.hover; parts.push(blockText(".button:hover", Object.assign({ background: h.bgColor, transform: `scale(${h.scale})` }, h.shadowOn ? { "box-shadow": h.shadow } : {})));
      const fo = st.btn.focus; parts.push(blockText(".button:focus", Object.assign({ background: fo.bgColor, border: `${fo.borderWidth}px solid ${fo.borderColor}` }, fo.outlineOn ? { outline: `${fo.outlineWidth}px solid ${fo.outlineColor}` } : {}, fo.shadowOn ? { "box-shadow": fo.shadow } : {})));
      if (st.btn.disabled.on) parts.push(blockText(".button:disabled", { opacity: (st.btn.disabled.opacity / 100).toFixed(2), cursor: st.btn.disabled.cursor }));
      parts.push(blockText(".button > span", ts));
      plain = parts.join("\n\n");
    } else if (st.mode === "card") {
      scope = ".card 樣式";
      plain = blockText(".card", boxStyle("card")) + "\n\n" + blockText(".card-title", ts);
    } else {
      const p = FL.SLIDER_PRESETS.find((x) => x.name === (st.design.slider || "neon")) || FL.SLIDER_PRESETS[0];
      scope = ".slider 樣式";
      const blk = (s, c) => `${s} {\n` + c.split(";").filter(Boolean).map((l) => "  " + l.trim() + ";").join("\n") + "\n}";
      plain = [blk(".slider-track", p.track), blk(".slider-fill", p.fill), blk(".slider-thumb", p.thumb)].join("\n\n");
    }
    $("#cssScope").textContent = scope;
    $("#codeOut").innerHTML = esc(plain)
      .replace(/^([.\w][\w-]*(?::[\w-]+)?(?: &gt; \w+)?) \{/gm, '<span class="k">$1</span> {')
      .replace(/^(\s+)([\w-]+):/gm, '$1<span class="k">$2</span>:');
    $("#codeOut").dataset.plain = plain;
  }

  /* ---------- refresh ---------- */
  function refresh() { renderStage(); renderCode(); $("#curFontBadge").textContent = st.fontName; var il = $("#inputLabel"); if (il) il.textContent = MODE_LABEL[st.mode]; var pi = $("#previewInput"); if (pi) pi.placeholder = MODE_LABEL[st.mode]; save(); }
  function modeRefresh() { $$("#modeTabs .mode-tab").forEach((t) => t.classList.toggle("active", t.dataset.mode === st.mode)); renderDesignGrid(); renderInspector(); refresh(); }
  function fullRefresh() { renderQuick(); renderGallery(); modeRefresh(); }

  /* ============================================================
     events
     ============================================================ */
  // continuous inputs (sliders / color / text) — light update, no inspector re-render
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.id === "previewInput") { st.text = el.value; refresh(); return; }
    if (el.id === "fontSearch") { renderGallery(); return; }
    if (el.id === "gallerySample") { st.gallerySample = el.value; renderGallery(); save(); return; }
    const path = el.dataset && el.dataset.path;
    if (!path) return;
    let v = el.value;
    if (el.dataset.type === "num") v = +v;
    setR(path, v);
    clearDesignIfCustom();
    // update slider value label / paired hex live without re-render
    if (el.type === "range") { const row = el.closest(".slider-row"); if (row) row.querySelector(".val").textContent = v + unitFor(path); const mn = +el.min, mx = +el.max; el.style.setProperty("--p", Math.max(0, Math.min(100, ((v - mn) / (mx - mn)) * 100)) + "%"); }
    if (el.type === "color") { const pair = el.parentElement.querySelector(".hex"); if (pair) pair.value = v; }
    refresh();
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.tagName === "SELECT" && el.dataset.path) { setR(el.dataset.path, el.value); clearDesignIfCustom(); refresh(); }
  });
  // discrete clicks — re-render inspector (visibility may change)
  document.addEventListener("click", (e) => {
    const fontBtn = e.target.closest("[data-font]");
    if (fontBtn) { st.font = fontBtn.dataset.font; st.fontName = fontBtn.dataset.name; renderGallery(); refresh(); return; }
    const mt = e.target.closest("#modeTabs .mode-tab");
    if (mt) { st.mode = mt.dataset.mode; modeRefresh(); return; }
    const dz = e.target.closest("[data-design]");
    if (dz) { applyDesign(dz.dataset.design); return; }
    if (e.target.closest("#fxClear")) { st.design[st.mode] = null; clearTextRaw(); renderDesignGrid(); renderInspector(); refresh(); return; }
    const qz = e.target.closest("[data-quick]");
    if (qz) { const n = qz.dataset.quick; if (st.quick.includes(n)) st.quick = st.quick.filter((x) => x !== n); else { if (st.quick.length >= 3) { toast("最多只能組合 3 個效果"); return; } st.quick.push(n); } renderQuick(); refresh(); return; }
    const seg = e.target.closest("[data-segpath]");
    if (seg) { setR(seg.dataset.segpath, seg.dataset.v); clearDesignIfCustom(); renderInspector(); refresh(); return; }
    const tg = e.target.closest("[data-togglepath]");
    if (tg) { setR(tg.dataset.togglepath, !getR(tg.dataset.togglepath)); clearDesignIfCustom(); renderInspector(); refresh(); return; }
    const wb = e.target.closest("[data-weight]");
    if (wb) { st.typo.weight = +wb.dataset.weight; renderInspector(); refresh(); return; }
    const bgc = e.target.closest("[data-bgcolor]");
    if (bgc) { st.bgColor = bgc.dataset.bgcolor; renderInspector(); refresh(); return; }
    if (e.target.closest("#codeCopy")) { copy($("#codeOut").dataset.plain || ""); toast("已複製 CSS"); return; }
    if (e.target.closest("#exportBtn")) { copy(fullCSS()); toast("已複製完整 CSS（含 @font-face 提示）"); return; }
    if (e.target.closest("#compareBtn")) { toast("對比模式：並排比較最多 3 個字型（示意）"); return; }
    if (e.target.closest("#refLink")) { e.preventDefault(); toast("效果參考圖：開啟效果牆 refs/gallery.html"); return; }
  });

  function unitFor(path) {
    let u = "";
    FL.FACETS.forEach((f) => {
      const cs = f.controls ? f.controls : (f.groups || []).reduce((a, gp) => a.concat(gp.controls), []);
      cs.forEach((c) => { if (c.path === path && c.unit != null) u = c.unit; });
    });
    return u;
  }
  function clearDesignIfCustom() { if (hasBox(st.mode) && st.design[st.mode]) { st.design[st.mode] = null; renderDesignGrid(); } }
  function clearTextRaw() { st.fxRaw = { shadow: "", highlight: "", fill: false }; st.fx.gradient.on = false; st.fx.stroke.on = false; }

  function applyDesign(name) {
    const cur = st.design[st.mode];
    if (cur === name) { st.design[st.mode] = null; if (st.mode === "text") clearTextRaw(); }
    else {
      st.design[st.mode] = name;
      const p = designListFor(st.mode).find((x) => x.name === name);
      if (st.mode === "text" && p) {
        clearTextRaw();
        if (p.gradient) { st.fx.gradient = { on: true, type: "linear", angle: p.gradient.angle, c1: p.gradient.c1, c2: p.gradient.c2 }; }
        else if (p.color) st.typo.color = p.color;
        st.fxRaw.shadow = p.shadow || ""; st.fxRaw.highlight = p.highlight || ""; st.fxRaw.fill = !!p.fill;
        if (p.stroke) st.fx.stroke = { on: true, width: p.stroke.width, color: p.stroke.color };
      } else if (hasBox(st.mode) && p && p.box) {
        const b = st[boxKey()];
        b.radius = p.box.radius; b.border.mode = "unified"; b.border.width = p.box.borderW; b.border.color = p.box.borderColor;
        b.shadow = { on: !!p.box.shadowOn, value: p.box.shadow || b.shadow.value };
        if (String(p.box.bg).indexOf("gradient") >= 0) { b.bg.gradient = true; b.bg.raw = p.box.bg; }
        else { b.bg.gradient = false; b.bg.raw = ""; b.bg.color = p.box.bg; }
        st.typo.color = p.box.textColor;
      }
    }
    renderDesignGrid(); renderInspector(); refresh();
  }

  function fullCSS() { const fam = st.font.replace(/'/g, ""); return `/* 目前字型：${st.fontName} */\n@font-face { font-family: ${st.font}; src: url("${fam}.woff2") format("woff2"); }\n\n` + ($("#codeOut").dataset.plain || ""); }
  function copy(t) { try { navigator.clipboard.writeText(t); } catch (e) {} }
  let tT; function toast(m) { let el = $("#toast"); if (!el) { el = document.createElement("div"); el.id = "toast"; document.body.appendChild(el); } el.textContent = m; requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(0)"; }); clearTimeout(tT); tT = setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateX(-50%) translateY(-8px)"; }, 2200); }

  /* ---------- init ---------- */
  $("#previewInput").value = st.text;
  $("#gallerySample").value = st.gallerySample;
  fullRefresh();
})();
