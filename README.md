# NY Times Connections Helper Chrome Extension

A Chrome extension that enhances the NY Times Connections game with color coding and drag-and-drop functionality.

## Features

### 🎨 Color Coding
- **NY Times Theme Colors**: Yellow (Easy), Green (Medium), Blue (Hard), Purple (Hardest)
- **Additional Pastel Colors**: Light Orange, Light Turquoise, Light Cyan, Light Lavender
- Right-click any card to assign colors via context menu
- **Color Swapping**: Easily swap all cards of one color with another

### 🔄 Drag & Drop
- Click and drag cards to reorder them
- Visual feedback during dragging
- Smooth animations and hover effects

### 🔧 Management Tools
- **Reset Order**: Return cards to original position (sorted by 'for' attribute)
- **Clear Colors**: Remove all color coding
- **Status Indicators**: Real-time feedback for actions

## Installation

1. **Download the extension files** to a folder on your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the folder containing the extension files
5. **Navigate to** https://www.nytimes.com/games/connections
6. **Start using the extension!**

## Usage

### Color Coding Cards
1. Right-click on any card
2. Select "Color Code" from the context menu
3. Choose from 8 available colors or "Clear" to remove color from a specific card
4. Cards will be highlighted with your chosen color

### Swapping Colors Between Groups
1. Right-click on any card
2. Select "Swap Colors" from the context menu
3. A popup will appear with two dropdown menus
4. The source color will automatically be set to the color of the card you right-clicked (if it has one)
5. Select a target color from the second dropdown
6. Click "Swap" to exchange colors between all cards in both groups

### Reordering Cards
1. Click and drag any card to a new position
2. Drop it on another card to swap positions
3. Visual feedback shows dragging state

### Reset & Clear
- **Reset Order**: Right-click → "Reset to Original Order"
- **Clear Individual Color**: Right-click card → "Color Code" → "Clear"
- **Clear All Colors**: Right-click → "Clear All Colors"
- **Reset Button**: Fixed button in top-right corner

## Color Scheme

### NY Times Official Colors
- 🟡 **Yellow**: Easy category (#f9df6d)
- 🟢 **Green**: Medium category (#a0c35a)
- 🔵 **Blue**: Hard category (#b0c4ef)
- 🟣 **Purple**: Hardest category (#ba81c5)

### Additional Pastel Colors
- 🧡 **Light Orange**: (#ffcba4)
- 💚️ **Light Turquoise'**: (#9fe2bf)
- 🩵 **Light Cyan**: (#a4e4ff)
- 💜 **Light Lavender**: (#d4a4ff)

## Technical Details

- **Manifest Version**: 3
- **Target URL**: https://www.nytimes.com/games/connections*
- **Target Elements**: `label[data-testid="card-label"]`
- **Permissions**: activeTab, contextMenus
- **Persistence**: Uses sessionStorage to retain state across page refreshes
- **Game Date Detection**: Automatically detects game date changes to reset saved data
- **Animations**: Smooth CSS transitions when swapping colors between groups

## Files Structure

```
├── manifest.json       # Extension configuration
├── background.js       # Context menu and message handling
├── content.js          # Main functionality injected into page
├── styles.css          # Styling for colors and UI
├── popup.html          # Extension popup interface
└── README.md           # This file
```

## Browser Support

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## Privacy

This extension:
- ✅ Only works on NY Times Connections pages
- ✅ Stores no personal data
- ✅ Makes no external requests
- ✅ Only modifies page appearance locally
- ✅ Uses sessionStorage to save preferences (cleared when you close the browser)

## Implementation Details

### Class Structure
- Uses a main `ConnectionsHelper` class with methods for:
  - Card color management (including individual card color clearing)
  - Drag and drop implementation
  - Order management and restoration
  - MutationObserver for monitoring card state changes
  - Color swapping between groups with animated transitions

### State Management
- Card colors are stored in a Map and sessionStorage
- Card order is tracked and can be restored
- Target card for coloring is remembered between clicks
- Game date tracking prevents stale data between daily puzzles
- Intelligent color selection for swapping based on right-clicked card

### Color Management
- Colors can be applied to individual cards through context menu
- Individual card colors can be cleared without affecting other cards
- All colors can be cleared at once with the "Clear All Colors" option
- Card colors persist across page refreshes via sessionStorage
- Cards can be mass-recolored by swapping colors between groups
- Smooth animated transitions when colors are changed or swapped

## Troubleshooting

**Extension not working?**
1. Refresh the Connections page
2. Check if Developer Mode is enabled
3. Reload the extension in chrome://extensions/

**Cards not dragging?**
1. Make sure you're on the correct URL
2. Wait for the game to fully load
3. Try refreshing the page

**Context menu not showing?**
1. Right-click directly on a card
2. Check if extension is enabled
3. Reload the extension

**Color not applying correctly?**
1. Try right-clicking the card again
2. Check console for error messages
3. Try using the Clear Colors option and start fresh

## Future Enhancements

- [x] Swap colors between groups
- [x] Smooth color transition animations
- [ ] Save color schemes between sessions
- [ ] Export/import color configurations
- [ ] Keyboard shortcuts for common actions
- [ ] Undo/redo functionality
- [ ] Multiple color schemes
- [ ] Improved animation compatibility
- [ ] Auto-sorting cards by color

---

Enjoy solving Connections puzzles with enhanced organization! 🎮