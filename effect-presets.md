# Effect Presets Configuration

This reference document provides detailed configurations for the 6 text effect presets included in the Font Preview Builder.

## Preset Definitions

### 1. Neon (霓虹燈)
Creates a glowing neon light effect with vibrant magenta color.

**Parameters:**
- Shadow Enabled: true
- Shadow X: 0px
- Shadow Y: 0px
- Shadow Blur: 20px
- Shadow Color: #ff00ff (magenta)
- Shadow Opacity: 1.0 (100%)
- Stroke Enabled: false

**CSS Output:**
```css
text-shadow: 0px 0px 20px rgba(255, 0, 255, 1);
```

**Use Case:** Retro gaming, cyberpunk designs, attention-grabbing headlines

---

### 2. 3D (立體)
Creates a 3D depth effect with black shadow and subtle stroke.

**Parameters:**
- Shadow Enabled: true
- Shadow X: 4px
- Shadow Y: 4px
- Shadow Blur: 8px
- Shadow Color: #000000 (black)
- Shadow Opacity: 0.8 (80%)
- Stroke Enabled: true
- Stroke Width: 0.5px
- Stroke Color: #333333 (dark gray)

**CSS Output:**
```css
text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.8);
-webkit-text-stroke: 0.5px #333333;
```

**Use Case:** Product titles, modern UI, depth emphasis

---

### 3. Emboss (浮雕)
Creates a raised/embossed effect with light shadow and subtle stroke.

**Parameters:**
- Shadow Enabled: true
- Shadow X: -2px
- Shadow Y: -2px
- Shadow Blur: 4px
- Shadow Color: #ffffff (white)
- Shadow Opacity: 0.8 (80%)
- Stroke Enabled: true
- Stroke Width: 0.3px
- Stroke Color: #cccccc (light gray)

**CSS Output:**
```css
text-shadow: -2px -2px 4px rgba(255, 255, 255, 0.8);
-webkit-text-stroke: 0.3px #cccccc;
```

**Use Case:** Elegant designs, premium branding, subtle depth

---

### 4. Engrave (陰刻)
Creates an engraved/inset effect with dark shadow.

**Parameters:**
- Shadow Enabled: true
- Shadow X: 2px
- Shadow Y: 2px
- Shadow Blur: 4px
- Shadow Color: #000000 (black)
- Shadow Opacity: 0.6 (60%)
- Stroke Enabled: false

**CSS Output:**
```css
text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
```

**Use Case:** Carved effects, stone/metal textures, classical designs

---

### 5. Metal (金屬)
Creates a metallic gold effect with gold glow and stroke.

**Parameters:**
- Shadow Enabled: true
- Shadow X: 0px
- Shadow Y: 0px
- Shadow Blur: 10px
- Shadow Color: #ffcc00 (gold)
- Shadow Opacity: 0.7 (70%)
- Stroke Enabled: true
- Stroke Width: 1px
- Stroke Color: #cc9900 (dark gold)

**CSS Output:**
```css
text-shadow: 0px 0px 10px rgba(255, 204, 0, 0.7);
-webkit-text-stroke: 1px #cc9900;
```

**Use Case:** Luxury branding, awards, premium content

---

### 6. Glow (發光)
Creates a soft cyan glow effect.

**Parameters:**
- Shadow Enabled: true
- Shadow X: 0px
- Shadow Y: 0px
- Shadow Blur: 15px
- Shadow Color: #00ffff (cyan)
- Shadow Opacity: 0.9 (90%)
- Stroke Enabled: false

**CSS Output:**
```css
text-shadow: 0px 0px 15px rgba(0, 255, 255, 0.9);
```

**Use Case:** Tech designs, sci-fi themes, modern interfaces

---

## Combining Presets

The Font Preview Builder supports combining up to 3 presets for complex effects. When combined, shadow parameters are merged using comma-separated values.

### Example Combinations

**Neon + 3D:**
```css
text-shadow: 0px 0px 20px rgba(255, 0, 255, 1), 4px 4px 8px rgba(0, 0, 0, 0.8);
-webkit-text-stroke: 0.5px #333333;
```
Creates a glowing 3D effect with magenta glow and black depth.

**Emboss + Metal:**
```css
text-shadow: -2px -2px 4px rgba(255, 255, 255, 0.8), 0px 0px 10px rgba(255, 204, 0, 0.7);
-webkit-text-stroke: 1px #cc9900;
```
Creates an elegant metallic embossed effect.

**Neon + Glow:**
```css
text-shadow: 0px 0px 20px rgba(255, 0, 255, 1), 0px 0px 15px rgba(0, 255, 255, 0.9);
```
Creates a dual-color glow effect (magenta and cyan).

---

## Adding New Presets

To add a new preset to the application:

1. Define the preset in the `EFFECT_PRESETS` array in `Home.tsx`:
```typescript
{
  name: "preset-id",
  label: "Display Name",
  shadowEnabled: true/false,
  shadowX: number,
  shadowY: number,
  shadowBlur: number,
  shadowColor: "#hexcolor",
  shadowOpacity: 0-1,
  strokeEnabled: true/false,
  strokeWidth: number,
  strokeColor: "#hexcolor",
}
```

2. Test the preset with various fonts and sizes
3. Verify CSS code generation is correct
4. Test combining with other presets
5. Add to this reference document

---

## Browser Compatibility

- **text-shadow**: Supported in all modern browsers
- **-webkit-text-stroke**: Requires webkit prefix; supported in Chrome, Safari, Edge
- **Gradient effects**: Use `-webkit-background-clip` and `-webkit-text-fill-color` for compatibility

For maximum compatibility, always include both prefixed and non-prefixed versions in generated CSS.
