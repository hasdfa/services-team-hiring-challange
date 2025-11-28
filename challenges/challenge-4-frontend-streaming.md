# Challenge 4: Visual Preview Editor

**Difficulty**: Medium-High  
**Focus**: Frontend Engineering, DOM Manipulation, State Management  
**Time**: 4-6 hours

## Problem Statement

The current CodePreview component renders AI-generated components in a read-only iframe. Users can see the output but cannot interact with it to make visual edits. To improve the user experience, we want to add a **Design Mode** that allows users to:

1. Select elements visually by clicking on them
2. Edit properties through a properties panel
3. Drag and drop elements to reorder them
4. See changes reflected in the generated code

## Current Implementation

The existing `CodePreview.tsx` renders components in a sandboxed iframe:

```typescript
// apps/frontend/src/components/chat/preview/CodePreview.tsx

{status.status === 'finished' && (
  <Box
    component="iframe"
    src={iframeUrl}
    sx={{ flex: 1, width: '100%', border: 'none' }}
    title="Code Preview"
    sandbox="allow-scripts allow-same-origin"
  />
)}
```

This is purely for viewing - no editing capability exists.

## Your Task

Implement a visual editor with these core features:

1. ✅ **Design Mode Toggle**: Switch between View and Design modes
2. ✅ **Element Selection**: Click to select elements in the preview
3. ✅ **Properties Panel**: Edit selected element's props (text, styles, etc.)
4. ✅ **Visual Highlighting**: Show selection outlines and hover states
5. ✅ **Code Sync**: Update source code when visual changes are made

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Visual Editor                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Toolbar   │  │                 │  │  Properties │ │
│  │  - Mode     │  │     Preview     │  │    Panel    │ │
│  │  - Undo     │  │     Iframe      │  │  - Text     │ │
│  │  - Redo     │  │  (with overlay) │  │  - Styles   │ │
│  └─────────────┘  │                 │  │  - Props    │ │
│                   │  [Click to      │  │             │ │
│                   │   select]       │  │             │ │
│                   └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────┤
│                   Code Preview Panel                     │
│  (Shows updated code with visual changes)               │
└─────────────────────────────────────────────────────────┘
```

## Bonus Points

- **Undo/Redo**: Track changes and allow reverting
- **Drag and Drop**: Reorder elements visually
- **Component Tree**: Show element hierarchy
- **Quick Actions**: Right-click context menu
- **Keyboard Shortcuts**: Select parent, delete, duplicate
- **Responsive Preview**: Test at different breakpoints while editing
- **AI Suggestions**: "Make this button larger" via chat

## Common Pitfalls

❌ **Iframe security**: Cross-origin issues blocking communication  
✅ Use postMessage API with proper origin checking

❌ **State sync**: Preview and code out of sync  
✅ Single source of truth, derive preview from code

❌ **AST corruption**: Breaking code during updates  
✅ Use proper parsing or conservative regex updates

❌ **Performance**: Slow selection on complex DOMs  
✅ Debounce hover events, optimize selectors

❌ **Z-index conflicts**: Overlay not showing correctly  
✅ Proper stacking context management

---

**Ready to start?** Review `apps/frontend/src/components/chat/preview/CodePreview.tsx` to understand the current iframe setup, then design your visual editor!

Good luck!
