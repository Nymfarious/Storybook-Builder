# 📖 Meku Storybook Builder

A creative platform for building visual stories, comics, and illustrated narratives. Part of the AppVerse ecosystem.

![Meku Storybook Builder Interface](./docs/images/builder-screenshot.png)

## ✨ Features

### 🎨 Story Builder
Create stunning visual stories with customizable panels, layouts, and rich formatting. Perfect for comics, manga, and graphic novels.

### 📄 Page Builder  
Build book-style pages with text panels, images, and spreads. Ideal for illustrated children's books and picture books.

### 🖼️ Asset Library
Manage your character library and reference images in one organized place.

### 📚 My Stories
View and organize your completed storybook pages in collections.

### 🎬 Story Demo
Interactive demo showcasing the story player with animations and effects.

### 🔧 Mini DevTools
Developer dashboard with API management, logging, flowcharts, and debugging tools.

---

## 🚀 Quick Start

1. **Choose Your Path** - Story Builder for panel layouts, or Page Builder for book-style pages
2. **Import Your Content** - Upload images to the library, or paste your manuscript text
3. **Design Your Layout** - Pick a layout preset or create custom panel arrangements
4. **Add AI Polish** *(Optional)* - Use Writing Studio for grammar, reading level, or expansion tools
5. **Preview & Export** - Preview your story in the reader, then export or share

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **State** | Zustand + LocalStorage persistence |
| **Animation** | CSS animations, Lottie-ready |
| **Drag & Drop** | react-dnd |
| **Icons** | Lucide React |
| **Backend** | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |

---

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or bun

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (Lovable)
npm run build

# Build for GitHub Pages
npm run build:ghpages
```

### Deployment

This app supports **dual deployment**:

| Command | Base Path | Use For |
|---------|-----------|---------|
| `npm run build` | `/` | Lovable platform |
| `npm run build:ghpages` | `/MeKu-Storybook-Builder/` | GitHub Pages |

See [DUAL_DEPLOYMENT.md](./docs/DUAL_DEPLOYMENT.md) for detailed setup instructions.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── builder/         # Story Builder components
│   ├── pagebuilder/     # Page Builder components
│   ├── story/           # Story player components
│   ├── workspace/       # Timeline workspace
│   └── MiniDevTools/    # Developer tools panels
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── pages/               # Route pages
├── stores/              # Zustand stores
├── types/               # TypeScript types
└── styles/              # Global styles
```

---

## 🎯 Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | 🟢 Complete | DevTools Mini Foundation |
| Phase 1 | 🟡 In Progress | Core Storybook MVP |
| Phase 2 | 🔴 Planned | Collaboration (up to 3 users) |
| Phase 3 | 🔴 Planned | Art & Character Pipeline (Nano Banana) |
| Phase 4 | 🔴 Planned | Multi-Format & PYOA |
| Phase 5 | 🔴 Planned | Magic Layer (VTuber narrator, ambient animations) |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `←` `→` | Navigate pages |
| `Ctrl+N` | New page |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+G` | Toggle grid |
| `Ctrl+0` | Fit to viewport |
| `Ctrl++` / `Ctrl+-` | Zoom in/out |

---

## 🤝 Contributing

This is a personal project developed with AI assistance (Claude, GPT, Gemini) via the Lovable platform.

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

---

## 💜 Credits

Built with love using [Lovable](https://lovable.dev) and a multi-AI team collaboration approach.

**Version:** 2.3.0 "Wordsmith"
