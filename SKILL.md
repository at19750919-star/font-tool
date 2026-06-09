---
name: font-preview-builder
description: Build interactive font preview and testing tools with real-time effects. Use for creating web-based font testers that support local font uploads, instant preview, side-by-side comparison, and text effects (shadows, strokes, gradients, opacity). Ideal for designers and developers who need to test fonts before committing to code.
---

# Font Preview Builder

## Overview

This skill enables you to build a complete interactive font preview and testing application. Users can upload local fonts, instantly preview text with various effects, compare multiple fonts side-by-side, and export CSS code. The application supports Chinese fonts, text effects (shadows, strokes, gradients, transparency), and provides a professional workflow for font selection and testing.

## Core Capabilities

### 1. Font Management
- **Predefined Font Library**: 9 common Chinese fonts across categories (System, Google Fonts, Adobe, Open Source)
- **Local Font Upload**: Support TTF, OTF, WOFF, WOFF2 formats; batch upload multiple files
- **Font Organization**: Auto-categorized font list with easy switching

### 2. Real-Time Preview
- **Custom Text Input**: Enter any text to preview with current font
- **Instant Rendering**: Changes apply immediately as user adjusts settings
- **Live CSS Generation**: Auto-generate CSS code that reflects all current settings

### 3. Text Effects
- **Text Shadow**: Adjustable X/Y offset, blur, color, opacity
- **Text Stroke**: Configurable width and color
- **Text Gradient**: Linear (0-360° angle) or radial gradients with custom colors
- **Transparency**: 0-100% opacity control
- **Effect Presets**: 6 pre-configured effects (Neon, 3D, Emboss, Engrave, Metal, Glow)
- **Combined Effects**: Stack up to 3 presets for complex visual effects

### 4. Typography Controls
- **Font Size**: 12-120px range
- **Line Height**: Adjustable line spacing (1.0-3.0)
- **Letter Spacing**: Character-level spacing (-2 to 10px)
- **Word Spacing**: Word-level spacing (-2 to 10px)
- **Font Weight**: Quick buttons for 300, 400, 500, 600, 700, 800

### 5. Comparison Mode
- **Side-by-Side Preview**: Compare up to 3 fonts simultaneously
- **Unified Settings**: All fonts use same text, size, effects for fair comparison
- **Quick Switching**: Toggle between comparison and edit modes seamlessly

## Development Workflow

### Phase 1: Project Setup
1. Initialize static web project with React + Tailwind CSS
2. Set up responsive 3-column layout (font list, preview, controls)
3. Configure Google Fonts and system fonts

### Phase 2: Core Functionality
1. Implement font selection and preview rendering
2. Build typography control sliders (size, line height, letter spacing, word spacing)
3. Create CSS code generator

### Phase 3: Text Effects
1. Add text shadow controls (X/Y offset, blur, color, opacity)
2. Add text stroke controls (width, color)
3. Create 6 effect presets with predefined parameters
4. Implement combined effects (up to 3 presets stacked)

### Phase 4: Advanced Features
1. Implement local font upload with FileReader API
2. Add comparison mode with font selection UI
3. Add text gradient effects (linear and radial)
4. Add transparency control

### Phase 5: Polish & Optimization
1. Ensure responsive design across screen sizes
2. Add toast notifications for user feedback
3. Optimize performance for smooth interactions
4. Test all effects and combinations

## Implementation Details

### Technology Stack
- **Frontend**: React 19 + Tailwind CSS 4
- **UI Components**: shadcn/ui (Button, Input, Slider, Card, Dialog)
- **Icons**: lucide-react
- **Notifications**: sonner (toast library)
- **Font Loading**: CSS @font-face with dynamic injection

### Key Components

**Home.tsx** (Main Component)
- State management for all font, typography, and effect settings
- Preview rendering with dynamic styles
- CSS code generation and copying
- Mode switching (edit vs. comparison)

**useLocalFonts Hook**
- Manages local font uploads and storage
- Uses FileReader API to read font files
- Stores fonts in browser localStorage
- Provides add/delete operations

**FontUploader Component**
- Drag-and-drop file upload interface
- Multiple file selection support
- File type validation (TTF, OTF, WOFF, WOFF2)
- Error handling and user feedback

### Design System
- **Color Palette**: White background, dark gray text, green accents
- **Typography**: Playfair Display (titles), Inter (body)
- **Spacing**: Consistent padding and margins using Tailwind utilities
- **Interactive States**: Hover, active, disabled states for all controls

### CSS Effects Implementation

**Text Shadow**:
```css
text-shadow: Xpx Ypx Blurpx rgba(R, G, B, Opacity);
```

**Text Stroke**:
```css
-webkit-text-stroke: Widthpx Color;
```

**Text Gradient**:
```css
background: linear-gradient(Angle, Color1, Color2);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

## Common Patterns

### Adding a New Effect Preset
1. Add preset definition to `EFFECT_PRESETS` array
2. Include shadow and stroke parameters
3. Test with preview rendering
4. Verify CSS code generation

### Extending Font Categories
1. Add fonts to `FONT_LIST` with category
2. Font list auto-groups by category
3. Local fonts automatically appear in "本地字型" category

### Customizing UI Colors
1. Edit Tailwind color classes in component JSX
2. Update CSS variables in `index.css` for theme consistency
3. Test across light/dark modes if applicable

## Troubleshooting

**Local fonts not appearing**: Check browser console for FileReader errors; ensure font format is supported (TTF, OTF, WOFF, WOFF2)

**CSS code not updating**: Verify all state dependencies in `useMemo` hook for `cssCode` variable

**Gradient not showing**: Ensure `-webkit-` prefixes are applied; test in different browsers

**Performance issues with many fonts**: Consider lazy-loading font list or virtualizing long lists

## Resources

### references/
- `development-checklist.md` - Phase-by-phase development checklist
- `effect-presets.md` - Detailed effect preset configurations
- `css-patterns.md` - Common CSS patterns for text effects

### templates/
- React component templates for reusable UI patterns
- Tailwind utility snippets for consistent styling

---

**Skill Status**: Ready for use. Tested with React 19, Tailwind CSS 4, and shadcn/ui components.
