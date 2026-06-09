# Font Preview Builder - Development Checklist

## Phase 1: Project Setup
- [ ] Initialize static web project with `webdev_init_project`
- [ ] Set up 3-column responsive layout (1 col on mobile, 2 on tablet, 3 on desktop)
- [ ] Import Google Fonts in HTML (Playfair Display for titles, Inter for body)
- [ ] Configure Tailwind CSS theme colors (white background, dark gray text, green accents)
- [ ] Create basic page structure with header, font list, preview area, control panel

## Phase 2: Core Functionality
- [ ] Define `FONT_LIST` array with 9 common Chinese fonts
- [ ] Implement font selection state management
- [ ] Create preview area that renders selected font
- [ ] Build typography control sliders:
  - [ ] Font size (12-120px)
  - [ ] Line height (1.0-3.0)
  - [ ] Letter spacing (-2 to 10px)
  - [ ] Word spacing (-2 to 10px)
  - [ ] Font weight buttons (300, 400, 500, 600, 700, 800)
- [ ] Implement CSS code generator
- [ ] Add copy-to-clipboard functionality with toast notification

## Phase 3: Text Effects
- [ ] Implement text shadow controls:
  - [ ] Enable/disable toggle
  - [ ] X offset slider (-10 to 10px)
  - [ ] Y offset slider (-10 to 10px)
  - [ ] Blur slider (0 to 20px)
  - [ ] Color picker
  - [ ] Opacity slider (0-100%)
- [ ] Implement text stroke controls:
  - [ ] Enable/disable toggle
  - [ ] Width slider (0.1 to 5px)
  - [ ] Color picker
- [ ] Create 6 effect presets:
  - [ ] Neon (magenta glow)
  - [ ] 3D (black shadow with depth)
  - [ ] Emboss (light shadow, subtle stroke)
  - [ ] Engrave (dark shadow, inset effect)
  - [ ] Metal (gold glow, gold stroke)
  - [ ] Glow (cyan glow)
- [ ] Implement preset application with state reset
- [ ] Build combined effects interface:
  - [ ] Multi-select preset buttons (max 3)
  - [ ] Show selection count (X/3)
  - [ ] Merge shadow parameters
  - [ ] Clear combination button

## Phase 4: Advanced Features
- [ ] Create `useLocalFonts` hook:
  - [ ] FileReader API integration
  - [ ] localStorage persistence
  - [ ] Font family name extraction
  - [ ] Add/delete operations
- [ ] Build FontUploader component:
  - [ ] Drag-and-drop support
  - [ ] Multiple file selection
  - [ ] File type validation (TTF, OTF, WOFF, WOFF2)
  - [ ] File size limit (10MB)
  - [ ] Error handling
- [ ] Add transparency control (0-100% opacity)
- [ ] Implement text gradient effects:
  - [ ] Linear gradient with angle (0-360°)
  - [ ] Radial gradient
  - [ ] Color picker for start and end colors
  - [ ] CSS background-clip implementation
- [ ] Build comparison mode:
  - [ ] Mode toggle button
  - [ ] Font selection UI (up to 3 fonts)
  - [ ] Side-by-side preview cards
  - [ ] Unified settings application
  - [ ] Delete individual comparisons
  - [ ] Return to edit mode

## Phase 5: Polish & Optimization
- [ ] Responsive design testing:
  - [ ] Mobile (< 640px)
  - [ ] Tablet (640px - 1024px)
  - [ ] Desktop (> 1024px)
- [ ] Cross-browser testing:
  - [ ] Chrome/Edge (webkit prefixes)
  - [ ] Firefox
  - [ ] Safari
- [ ] Performance optimization:
  - [ ] Memoize expensive calculations
  - [ ] Lazy-load font list if needed
  - [ ] Optimize re-renders
- [ ] User feedback:
  - [ ] Toast notifications for all actions
  - [ ] Clear error messages
  - [ ] Loading states for font uploads
- [ ] Accessibility:
  - [ ] Keyboard navigation
  - [ ] Color contrast verification
  - [ ] ARIA labels where needed

## Testing Checklist
- [ ] Font switching works smoothly
- [ ] All typography controls update preview in real-time
- [ ] Text shadow effect renders correctly
- [ ] Text stroke effect renders correctly
- [ ] All 6 presets apply correctly
- [ ] Combined effects merge shadows properly
- [ ] Local font upload works (TTF, OTF, WOFF, WOFF2)
- [ ] Uploaded fonts appear in list and can be selected
- [ ] Transparency control works (0-100%)
- [ ] Gradient effects render correctly (linear and radial)
- [ ] Comparison mode shows 1-3 fonts side-by-side
- [ ] CSS code generation is accurate
- [ ] Copy to clipboard works
- [ ] All controls are responsive on mobile

## Common Issues & Solutions

### Local fonts not loading
- Check FileReader error handling
- Verify font format is supported
- Check browser console for CORS issues
- Ensure font file is valid

### CSS code not updating
- Verify all dependencies in `useMemo` hook
- Check state updates are triggering re-renders
- Test with simple state changes first

### Gradient not displaying
- Ensure `-webkit-` prefixes are included
- Test in different browsers
- Verify color values are valid hex codes

### Performance lag with many fonts
- Consider virtualizing long lists
- Lazy-load font categories
- Memoize font list calculations
