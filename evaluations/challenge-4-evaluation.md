# Challenge 4: Visual Preview Editor - Evaluation

**See [general-rubric.md](./general-rubric.md) for base scoring (70 points)**

This file contains **Challenge-Specific Criteria (30 points)**

## Challenge-Specific Scoring

### Component Architecture (12 points)

**Excellent (11-12)**

- Clean separation between editor, overlay, and properties panel
- Proper iframe ↔ parent communication via postMessage
- Efficient state management (no unnecessary re-renders)
- Excellent TypeScript types for element info, updates
- Reusable component structure

**Good (8-10)**

- Components work well
- Basic iframe communication
- Some state management issues
- Good TypeScript usage

**Acceptable (5-7)**

- Components work but tightly coupled
- Fragile iframe communication
- State sync issues
- Minimal TypeScript

**Poor (0-4)**

- Architecture broken
- No proper separation
- Poor TypeScript

### UX Design (10 points)

**Excellent (9-10)**

- Clear hover vs selection visual distinction
- Intuitive properties panel organization
- Smooth mode transitions
- Responsive to different element types
- Proper loading/error states

**Good (7-8)**

- Selection works well
- Properties panel functional
- Some UX rough edges

**Acceptable (5-6)**

- Basic selection works
- Confusing properties panel
- Missing feedback

**Poor (0-4)**

- Poor selection UX
- Confusing interface

### Code Synchronization (8 points)

**Excellent (7-8)**

- Visual changes correctly update source code
- No code corruption on updates
- Handles edge cases (empty props, nested elements)
- Proper sx prop generation

**Good (5-6)**

- Basic property updates work
- Some edge cases fail
- Minor code formatting issues

**Acceptable (3-4)**

- Simple updates work
- Many edge cases fail
- Code formatting inconsistent

**Poor (0-2)**

- Code sync broken
- Corrupts source code

---

## What to Look For

### Must Have

- ✅ Design Mode toggle (view/edit modes)
- ✅ Element selection via click in iframe
- ✅ Visual selection highlighting
- ✅ Properties panel showing element details
- ✅ At least 3 editable properties (text, color, spacing)
- ✅ Changes reflected in preview

### Should Have

- ✅ Hover highlighting distinct from selection
- ✅ Code updates when properties change
- ✅ Proper iframe communication (postMessage)
- ✅ Error handling for edge cases
- ✅ TypeScript types for element info

### Nice to Have (Bonus)

- 🌟 Undo/Redo functionality
- 🌟 Drag and drop reordering
- 🌟 Element tree view
- 🌟 Right-click context menu
- 🌟 Keyboard navigation
- 🌟 Responsive preview editing

---

## Testing Checklist

### Mode Toggle

- [ ] Can switch between View and Design modes
- [ ] Design mode shows visual indicator
- [ ] View mode disables selection

### Element Selection

- [ ] Hover shows highlight on elements
- [ ] Click selects element
- [ ] Selection highlight visible and distinct
- [ ] Can select different elements
- [ ] Clicking empty area deselects

### Properties Panel

- [ ] Shows element tag name
- [ ] Shows component name if available
- [ ] Text content editable (if applicable)
- [ ] Font properties editable
- [ ] Colors editable (with color picker)
- [ ] Spacing editable

### Code Sync

- [ ] Text changes update in preview
- [ ] Style changes update in preview
- [ ] Generated code reflects changes
- [ ] Code stays valid after changes
- [ ] No infinite update loops

### Edge Cases

- [ ] Handles nested elements
- [ ] Handles elements without text
- [ ] Handles MUI components
- [ ] Handles elements with existing sx props
- [ ] Works with complex component trees

---

## Common Issues to Watch For

❌ **Cross-origin errors**: iframe blocking postMessage  
❌ **State desync**: Properties panel out of sync with selection  
❌ **Code corruption**: Updates breaking JSX syntax  
❌ **Performance**: Slow selection on large DOMs  
❌ **Z-index issues**: Overlay not visible  
❌ **Memory leaks**: Event listeners not cleaned up  
❌ **No error boundaries**: Crashes on edge cases

---

## Architecture Review Points

### Good Signs

- postMessage for iframe communication
- Single source of truth (code → preview)
- Debounced hover events
- Proper cleanup in useEffect
- TypeScript interfaces for all data shapes

### Warning Signs

- Direct iframe DOM manipulation
- Multiple sources of truth
- No event debouncing
- Missing cleanup functions
- Any types everywhere

---

## Visual Review

Check the visual quality:

1. **Selection Box**: Clear, not too intrusive?
2. **Hover State**: Obviously different from selection?
3. **Properties Panel**: Well organized, scannable?
4. **Mode Toggle**: Clear which mode is active?
5. **Transitions**: Smooth mode switching?
6. **Error States**: Handled gracefully?
