# Mëku Storybook Studio - Changelog

## [2.1.0] - 2024-12-31

### 🎨 Rebranding
- **Name Change**: Storybook-Builder → Mëku Storybook Studio
- Added Mëku brand colors and gradient utilities
- New mascot character placeholder (Mëku - design TBD)

### 🔌 API & Adapters
- **Direct Replicate API**: No longer requires going through a platform
  - Users can add their own Replicate API key
  - Supports Flux Schnell, Flux Dev, Flux Pro models
  - Built-in background removal (RemBG)
  - Built-in upscaling (Real-ESRGAN)
  
- **Provider Registry**: Hot-swappable AI providers
  - Multi-provider support for cost/tier options
  - Automatic fallback when primary provider unavailable
  - Cost tier selection: cheapest | balanced | quality
  
- **API Settings UI**: New dialog for managing API keys
  - Secure local storage
  - Connection testing
  - Per-provider capability display

### 📐 Responsive Panel System
- **Smart Shrinking**: Panels respond to resize intelligently
  - Full mode (>200px): Full text + icons
  - Compact mode (140-200px): Smaller text, abbreviated labels
  - Icon-only mode (<140px): Just icons with hover tooltips
  
- **Text Scaling**: Text shrinks proportionally as panels resize
- **Icon Adaptation**: Icons switch to smaller size in compact modes
- **Hover Tooltips**: All actions accessible via hover when labels hidden

### 🎨 Visual Improvements
- **Canvas Background**: Updated to warm parchment color (`#f5f0e6`)
  - Multiple variants: cream, ivory, aged parchment
  - Subtle gradient overlay for depth
  - Enhanced drop shadow on hover

- **Inspector Panel**: Reduced static text size
  - Section headers: 11px
  - Field labels: 12px
  - Field values: 13px
  - Code snippets: 11px
  
- **Hover Menus**: New utility classes for hover-activated menus
  - Four positioning options (top, bottom, left, right)
  - Smooth fade-in animation
  - Consistent styling

### 🔧 Technical Foundation
- New hooks:
  - `useResponsivePanel`: Track panel width and calculate display mode
  - `useScaledText`: Calculate scaled font sizes
  
- New utilities:
  - `getResponsiveClasses`: Generate CSS classes based on panel state
  - Provider factory functions for easy adapter creation

### 📁 Files Added
```
src/
├── adapters/
│   ├── base.adapter.ts       # Abstract base for all providers
│   ├── replicate.adapter.ts  # Direct Replicate API implementation
│   └── registry.ts           # Provider registry and key management
├── components/
│   ├── builder/
│   │   └── InspectorPanel.tsx  # Updated with responsive behavior
│   └── ApiSettings.tsx         # API key management UI
├── hooks/
│   └── useResponsivePanel.ts   # Responsive panel state management
└── styles/
    └── meku-globals.css        # Global styles, canvas, hover menus
```

### 🚧 Migration Notes
To migrate from Storybook-Builder:

1. **Copy new files** from this package into your project
2. **Import global styles** in your main CSS:
   ```css
   @import './styles/meku-globals.css';
   ```
3. **Update canvas components** to use `.canvas-page` class
4. **Add API settings** button to your settings/nav area
5. **Update InspectorPanel** import to use new version
6. **Initialize provider registry** on app load:
   ```ts
   import { loadApiKeys, providerRegistry } from '@/adapters/registry';
   providerRegistry.initialize(loadApiKeys());
   ```

### 🔜 Coming in v2.2.0
- Timeline Workspace (from C-dmedia-pipeline)
- Mini DevTools integration
- Text highlighting sync (from B-text-reading-highlighting)
- ElevenLabs adapter for Talking Avatar

---

## Previous Versions (Storybook-Builder)

### [2.0.0] - Pre-rebrand
- Three-pane resizable layout
- Page management with thumbnails
- Character system with profiles
- AI image generation via Supabase Edge Functions
- History/undo/redo system
- Layout presets (14 templates)
- Export to PNG
