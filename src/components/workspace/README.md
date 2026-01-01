# Timeline Workspace for Mëku Storybook Studio

The heart of the creative pipeline — combines images, video, and audio on synchronized tracks with a scrubber timeline interface.

## Features

- **3 Track Types**: Visual, Audio, FX (Effects)
- **Drag & Drop**: Drop assets onto tracks
- **Cut Inside/Outside**: Remove or keep selected ranges
- **Mending Animation**: Visual feedback when clips are stitched
- **Mobile Support**: Vertical rail layout on mobile devices
- **Zoom Controls**: Ctrl+Scroll or slider
- **Snap to Grid**: Configurable snap intervals
- **Undo/Redo**: 50-step history

## Installation

### 1. Copy the workspace folder

Copy the `workspace` folder to:
```
src/components/workspace/
```

### 2. Copy the lib files

Copy `lib/haptics.ts` and `lib/timelineLogger.ts` to:
```
src/lib/haptics.ts
src/lib/timelineLogger.ts
```

### 3. Check dependencies

Make sure you have these in `package.json`:
```bash
npm install zustand
```

The UI components should already exist from shadcn/ui:
- Button, Slider, Tooltip, DropdownMenu
- ResizablePanelGroup (if not present, install: `npx shadcn-ui add resizable`)

### 4. Add a route (optional)

In `App.tsx`, add a route for the timeline workspace:
```tsx
import { TimelineWorkspace } from '@/components/workspace';

// In your routes:
<Route path="/timeline" element={
  <ProtectedRoute>
    <TimelineWorkspace />
  </ProtectedRoute>
} />
```

### 5. Or embed in a page

```tsx
import { TimelineRail } from '@/components/workspace';

function MyPage() {
  return (
    <div className="h-64">
      <TimelineRail />
    </div>
  );
}
```

## Components

| Component | Purpose |
|-----------|---------|
| `TimelineWorkspace` | Full page workspace with preview + timeline |
| `TimelineRail` | The timeline tracks + playhead |
| `Track` | Individual track (Visual/Audio/FX) |
| `Clip` | Draggable/resizable clip on a track |
| `PlaybackControls` | Play/pause, loop, snap settings |
| `Playhead` | Draggable playhead indicator |
| `CutToolbar` | Cut Inside/Outside buttons |
| `PreviewCanvas` | Video/image preview area |

## State Management

Uses Zustand store at `TimelineStore.ts`:

```tsx
import { useTimelineStore } from '@/components/workspace';

function MyComponent() {
  const { 
    clips, 
    addClip, 
    playheadPosition, 
    setPlayheadPosition,
    isPlaying,
    togglePlayback 
  } = useTimelineStore();
  
  // ...
}
```

## Keyboard Shortcuts

- `Space` - Play/Pause
- `Ctrl+Scroll` - Zoom in/out
- `←/→` - Move playhead
- `Delete` - Remove selected clip

## Customization

### Track Colors

Edit the `tracks` array in `TimelineRail.tsx`:
```tsx
const tracks = [
  { id: 'visual', label: 'Visual', icon: Image, colorClass: 'bg-blue-500/20 text-blue-400' },
  { id: 'audio', label: 'Audio', icon: Music, colorClass: 'bg-green-500/20 text-green-400' },
  { id: 'fx', label: 'FX', icon: Sparkles, colorClass: 'bg-purple-500/20 text-purple-400' },
];
```

### Default Duration

Edit `TimelineStore.ts`:
```tsx
duration: 120, // 2 minutes default
```
