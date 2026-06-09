# CSS Patterns for Text Effects

This reference document provides common CSS patterns used in the Font Preview Builder for implementing text effects.

## Text Shadow Pattern

Text shadow is the most versatile effect, supporting multiple shadows stacked together.

**Basic Syntax:**
```css
text-shadow: [X-offset] [Y-offset] [blur-radius] [color];
```

**With Transparency:**
```css
text-shadow: Xpx Ypx Blurpx rgba(R, G, B, Opacity);
```

**Multiple Shadows (Stacked):**
```css
text-shadow: 
  0px 0px 20px rgba(255, 0, 255, 1),
  4px 4px 8px rgba(0, 0, 0, 0.8),
  -2px -2px 4px rgba(255, 255, 255, 0.8);
```

**Parameters:**
- X-offset: Horizontal distance (-10 to 10px typical range)
- Y-offset: Vertical distance (-10 to 10px typical range)
- Blur-radius: Softness of shadow (0-20px typical range)
- Color: RGB or hex color value
- Opacity: 0 (transparent) to 1 (opaque)

---

## Text Stroke Pattern

Text stroke adds an outline around characters. Requires webkit prefix for broad compatibility.

**Basic Syntax:**
```css
-webkit-text-stroke: [width] [color];
```

**With Transparency (Limited):**
```css
-webkit-text-stroke: 0.5px rgba(51, 51, 51, 0.8);
```

**Parameters:**
- Width: Stroke thickness (0.1px to 5px typical range)
- Color: RGB, hex, or rgba color value

**Note:** Text stroke has limited transparency support; use hex colors for best compatibility.

**Browser Support:**
- Chrome: Full support
- Safari: Full support
- Firefox: Partial support (may render differently)
- Edge: Full support

---

## Text Gradient Pattern

Creates colored text with gradient fill using background-clip technique.

**Linear Gradient:**
```css
background: linear-gradient([angle]deg, [color1], [color2]);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

**Radial Gradient:**
```css
background: radial-gradient(circle, [color1], [color2]);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

**Parameters:**
- Angle: 0-360 degrees (0° = left to right, 90° = top to bottom, 180° = right to left, 270° = bottom to top)
- Color1/Color2: Starting and ending colors (hex or rgba)

**Browser Support:**
- Chrome: Full support
- Safari: Full support (requires webkit prefixes)
- Firefox: Full support (no webkit prefix needed)
- Edge: Full support

**Important:** Always include both prefixed and non-prefixed versions for maximum compatibility.

---

## Transparency Pattern

Adjust overall text opacity using the opacity property.

**Basic Syntax:**
```css
opacity: [value];
```

**Parameters:**
- Value: 0 (fully transparent) to 1 (fully opaque)
- Decimal values: 0.5 = 50% opacity

**CSS Output Example:**
```css
opacity: 0.7;
```

**Note:** Opacity affects the entire element, including all shadows and strokes. For selective transparency, use rgba colors in shadow or stroke instead.

---

## Letter Spacing Pattern

Adjust space between individual characters.

**Basic Syntax:**
```css
letter-spacing: [value];
```

**Parameters:**
- Value: Positive (spread out) or negative (compress) in pixels or em units
- Typical range: -2px to 10px

**CSS Output Example:**
```css
letter-spacing: 2px;
```

---

## Word Spacing Pattern

Adjust space between words.

**Basic Syntax:**
```css
word-spacing: [value];
```

**Parameters:**
- Value: Positive (spread out) or negative (compress) in pixels or em units
- Typical range: -2px to 10px

**CSS Output Example:**
```css
word-spacing: 1px;
```

---

## Combined Effects Pattern

Combining multiple effects creates complex visual results.

**Shadow + Stroke + Gradient:**
```css
/* Gradient fill */
background: linear-gradient(45deg, #ff00ff, #00ffff);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;

/* Shadow and stroke applied to the text */
text-shadow: 0px 0px 20px rgba(255, 0, 255, 0.8);
-webkit-text-stroke: 1px #ff00ff;
```

**Shadow + Opacity:**
```css
text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.8);
opacity: 0.85;
```

**Multiple Shadows (Layered):**
```css
text-shadow: 
  0px 0px 10px rgba(255, 0, 255, 1),
  0px 0px 20px rgba(0, 255, 255, 0.8),
  4px 4px 8px rgba(0, 0, 0, 0.6);
```

---

## Complete CSS Code Generation Example

When all effects are applied, the generated CSS should include:

```css
font-family: 'Font Name', sans-serif;
font-size: 48px;
line-height: 1.5;
letter-spacing: 2px;
word-spacing: 1px;
font-weight: 600;

/* Text effects */
text-shadow: 0px 0px 20px rgba(255, 0, 255, 1), 4px 4px 8px rgba(0, 0, 0, 0.8);
-webkit-text-stroke: 0.5px #333333;
opacity: 0.95;

/* Gradient (if enabled) */
background: linear-gradient(45deg, #ff00ff, #00ffff);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

---

## Performance Considerations

1. **Multiple Shadows**: Each shadow adds rendering cost. Limit to 3-4 shadows for smooth performance.
2. **Gradient + Stroke**: Combining gradients with strokes may cause rendering issues in some browsers; test thoroughly.
3. **Large Font Sizes**: Effects are more noticeable at larger sizes (48px+) but may impact performance on low-end devices.
4. **Opacity**: Using opacity on the entire element is cheaper than using rgba colors in shadows.

---

## Browser Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| text-shadow | ✓ | ✓ | ✓ | ✓ |
| -webkit-text-stroke | ✓ | ✗ | ✓ | ✓ |
| background-clip: text | ✓ | ✓ | ✓ (webkit) | ✓ |
| letter-spacing | ✓ | ✓ | ✓ | ✓ |
| word-spacing | ✓ | ✓ | ✓ | ✓ |
| opacity | ✓ | ✓ | ✓ | ✓ |

**Recommendation:** Always test generated CSS in target browsers before deployment.
