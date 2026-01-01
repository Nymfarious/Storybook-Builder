# DevTools Upgrade for Mëku Storybook Studio v2.1.0

Comprehensive DevTools upgrade with API key management, AI agents console, route flowchart, and text-audio sync.

## What's Included

### New Panels
| Panel | Description |
|-------|-------------|
| **API Keys** | Manage API keys for Replicate, Claude, Gemini, ElevenLabs, OpenAI |
| **AI Agents** | Test prompts with different AI agents (Story Helper, Grammar Cop, etc.) |
| **Route Map** | Visual flowchart of app routes with draggable nodes |
| **Logs** | Error/warning console with filtering and search |

### Text-Audio Sync Components
| Component | Description |
|-----------|-------------|
| **WordHighlighter** | Displays text with word-level highlights synced to audio |
| **SequentialHighlighter** | UI for creating word-audio sync (auto-generate, manual selection) |

### Stores
| Store | Description |
|-------|-------------|
| **apiKeysStore** | Zustand store for API key management with localStorage persistence |
| **devLogsStore** | Centralized logging with error/warn counts |

## Installation

### 1. Copy stores to `src/stores/`
```
stores/apiKeysStore.ts → src/stores/apiKeysStore.ts
stores/devLogsStore.ts → src/stores/devLogsStore.ts
```

### 2. Copy panels to `src/components/MiniDevTools/panels/`
```
panels/APIsPanel.tsx → src/components/MiniDevTools/panels/APIsPanel.tsx
panels/AgentsPanel.tsx → src/components/MiniDevTools/panels/AgentsPanel.tsx
panels/FlowchartPanel.tsx → src/components/MiniDevTools/panels/FlowchartPanel.tsx
panels/LogsPanel.tsx → src/components/MiniDevTools/panels/LogsPanel.tsx
```

### 3. Copy text-sync components to `src/components/text-sync/`
```
components/text-sync/ → src/components/text-sync/
```

### 4. Replace MiniDevToolsPanel
```
MiniDevToolsPanel.tsx → src/components/MiniDevTools/MiniDevToolsPanel.tsx
```

### 5. Install zustand persist middleware (if not already)
```bash
npm install zustand
```

## API Keys Required

| Provider | Where to Get | Tier |
|----------|-------------|------|
| **Replicate** | [replicate.com](https://replicate.com) | Freemium - pay per use |
| **Claude (Anthropic)** | [console.anthropic.com](https://console.anthropic.com) | Paid - separate from Max subscription! |
| **Google AI (Gemini)** | [aistudio.google.com](https://aistudio.google.com) | Free tier available |
| **ElevenLabs** | [elevenlabs.io](https://elevenlabs.io) | Freemium - free tier has limits |
| **OpenAI** | [platform.openai.com](https://platform.openai.com) | Paid |

### Important Note About Claude API

Your **Claude Max subscription** (what you use to chat with Claude on claude.ai) is **separate** from the **Claude API**. The API requires:
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account (separate from your claude.ai account)
3. Add a payment method
4. Generate an API key

## Usage

### API Keys Panel
Keys are stored in localStorage (never sent to servers other than the AI providers).
1. Click "Add API Key" for any provider
2. Paste your key
3. Click "Test" to verify connection

### AI Agents Panel
1. Select an agent (Story Helper, Grammar Cop, etc.)
2. Type a prompt
3. Get AI response
4. View history

### Route Map
- Drag nodes to rearrange
- Click a node to see its route
- Zoom in/out with controls
- Reset to default layout

### Logs Panel
- Filters: All, Error, Warn, Info
- Search by message or source
- Clear all or mark as read

## Text-Audio Sync Usage

```tsx
import { SequentialHighlighter, WordEvent } from '@/components/text-sync';

function MyPage() {
  const [wordEvents, setWordEvents] = useState<WordEvent[]>([]);
  const text = "Once upon a time in a magical forest...";
  
  return (
    <SequentialHighlighter
      text={text}
      wordEvents={wordEvents}
      audioDuration={30} // seconds
      onWordEventsChange={setWordEvents}
    />
  );
}
```

## Keyboard Shortcuts

- `Ctrl+Alt+V` - Toggle DevTools
- `Escape` - Close DevTools

## File Structure After Installation

```
src/
├── components/
│   ├── MiniDevTools/
│   │   ├── index.tsx
│   │   ├── DevToolsTrigger.tsx
│   │   ├── MiniDevToolsPanel.tsx    ← UPDATED
│   │   └── panels/
│   │       ├── APIsPanel.tsx        ← NEW
│   │       ├── AgentsPanel.tsx      ← NEW
│   │       ├── FlowchartPanel.tsx   ← NEW
│   │       └── LogsPanel.tsx        ← NEW
│   └── text-sync/
│       ├── index.ts                 ← NEW
│       ├── types.ts                 ← NEW
│       ├── wordFilter.ts            ← NEW
│       ├── WordHighlighter.tsx      ← NEW
│       └── SequentialHighlighter.tsx← NEW
└── stores/
    ├── apiKeysStore.ts              ← NEW
    └── devLogsStore.ts              ← NEW
```
