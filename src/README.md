# Mëku Storybook Studio

> A creative suite for animated storytelling — where AI meets imagination.

**Version 2.1.0** | Built for the Echoverse ecosystem

---

## 🎯 What is Mëku?

Mëku Storybook Studio is a unified creative platform for building:
- 📖 Illustrated storybooks
- 🎨 Graphic novels & comics
- 🌳 Branching choose-your-own-adventure stories
- 📺 Animated narratives with voice narration

**Primary destination**: Little Sister (dementia care app)  
**Also works as**: Standalone creative tool

---

## 🏗️ Architecture

### Three-Pane Layout
```
┌─────────────────┬──────────────────────┬─────────────────┐
│                 │                      │                 │
│  BuilderSidebar │    CanvasArea        │ InspectorPanel  │
│                 │                      │                 │
│  • Pages        │  • Page preview      │  • Properties   │
│  • Characters   │  • Panel selection   │  • AI prompts   │
│  • Layouts      │  • Zoom controls     │  • Generation   │
│  • History      │                      │  • Text/Image   │
│                 │                      │                 │
├─────────────────┴──────────────────────┴─────────────────┤
│                    PageThumbnailTray                     │
└──────────────────────────────────────────────────────────┘
```

### Provider Adapter Pattern
```
UI Components
     ↓
Provider Registry (selects best provider)
     ↓
┌─────────────────────────────────────────┐
│  Adapters                               │
│  ├── ReplicateAdapter (images)          │
│  ├── ElevenLabsAdapter (voice, avatar)  │
│  ├── GeminiAdapter (multimodal)         │
│  └── ...future providers                │
└─────────────────────────────────────────┘
     ↓
External APIs (with your own keys)
```

---

## 🔧 Setup

### Prerequisites
- Node.js 18+
- npm or bun

### Installation
```bash
# Clone/copy from Storybook-Builder-main
git clone [your-repo]
cd meku-storybook-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Add Your API Keys
1. Click the **Settings** button in the app
2. Go to **API Configuration**
3. Add your Replicate API key (get one at [replicate.com](https://replicate.com))
4. (Optional) Add ElevenLabs, Gemini keys for additional features

---

## 📁 Project Structure

```
src/
├── adapters/           # AI provider adapters
│   ├── base.adapter.ts
│   ├── replicate.adapter.ts
│   └── registry.ts
│
├── components/
│   ├── builder/        # Main layout components
│   │   ├── BuilderSidebar.tsx
│   │   ├── CanvasArea.tsx
│   │   └── InspectorPanel.tsx
│   │
│   ├── editor/         # Node editing components
│   └── ui/             # shadcn/ui components
│
├── hooks/
│   ├── useResponsivePanel.ts
│   └── useKeyboardShortcuts.ts
│
├── styles/
│   └── meku-globals.css
│
├── types/
│   ├── nodes.ts        # Split/Leaf node types
│   └── index.ts
│
└── pages/
    └── GraphicNovelBuilder.tsx  # Main app page
```

---

## 🎨 Features

### v2.1.0 (Current)
- ✅ Direct Replicate API (bring your own key)
- ✅ Multi-provider registry
- ✅ Responsive panel resizing (icon-only mode)
- ✅ Parchment canvas background
- ✅ Smaller inspector text
- ✅ Hover menus

### Coming Soon
- ⏳ Timeline Workspace (Visual/Audio/Effects tracks)
- ⏳ Text highlighting sync for reading mode
- ⏳ ElevenLabs Talking Avatar integration
- ⏳ Mini DevTools panel

---

## 🎹 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Undo | `Ctrl/Cmd + Z` |
| Redo | `Ctrl/Cmd + Shift + Z` |
| Save | `Ctrl/Cmd + S` |
| Zoom In | `Ctrl/Cmd + =` |
| Zoom Out | `Ctrl/Cmd + -` |
| Fit to View | `Ctrl/Cmd + 0` |

---

## 🔗 Related Repos

| Repo | Purpose | Status |
|------|---------|--------|
| Storybook-Builder | **BASE** - Core app | ✅ Using |
| C-dmedia-pipeline | Timeline, DevTools, Adapters | 📦 To port |
| B-text-reading-highlighting | Word sync for reading | 📦 To port |
| VTuber-Asset-Creator | Frame sequencing | 🔍 Review |
| A-miku-studio-v1 | Data models | 🔍 Reference |

---

## 🛠️ Development

### Code Style
- TypeScript strict mode
- React functional components
- Zustand for state management
- shadcn/ui for components
- Tailwind CSS for styling

### Testing
```bash
npm run test        # Run tests
npm run lint        # Lint code
npm run build       # Production build
```

---

## 📜 License

Private project for the Echoverse ecosystem.

---

## 💜 Credits

Built with love by Shannon (Nymfarious)  
Multi-AI collaboration: Claude Opus 4.5 + GPT 5.1 + Gemini 3 → Lovable

*Welcome to Mëku!* ✨
