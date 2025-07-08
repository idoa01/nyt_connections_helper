# NY Times Connections Helper Chrome Extension

A Chrome extension that enhances the NY Times Connections game with color coding and drag-and-drop functionality.

## Features

### 🎨 Color Coding
- **NY Times Theme Colors**: Yellow (Easy), Green (Medium), Blue (Hard), Purple (Hardest)
- **Additional Pastel Colors**: Light Pink, Light Orange, Light Cyan, Light Lavender
- Right-click any card to assign colors via context menu

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
3. Choose from 8 available colors
4. Cards will be highlighted with your chosen color

### Reordering Cards
1. Click and drag any card to a new position
2. Drop it on another card to swap positions
3. Visual feedback shows dragging state

### Reset & Clear
- **Reset Order**: Right-click → "Reset to Original Order"
- **Clear Colors**: Right-click → "Clear All Colors"
- **Reset Button**: Fixed button in top-right corner

## Color Scheme

### NY Times Official Colors
- 🟡 **Yellow**: Easy category (#f9df6d)
- 🟢 **Green**: Medium category (#a0c35a)
- 🔵 **Blue**: Hard category (#b0c4ef)
- 🟣 **Purple**: Hardest category (#ba81c5)

### Additional Pastel Colors
- 🩷 **Light Pink**: (#ffc1cc)
- 🧡 **Light Orange**: (#ffcba4)
- 🩵 **Light Cyan**: (#a4e4ff)
- 💜 **Light Lavender**: (#d4a4ff)

## Technical Details

- **Manifest Version**: 3
- **Target URL**: https://www.nytimes.com/games/connections*
- **Target Elements**: `label[data-testid="card-label"]`
- **Permissions**: activeTab, contextMenus

## Files Structure

```
├── manifest.json       # Extension configuration
├── background.js       # Context menu and message handling
├── content.js         # Main functionality injected into page
├── styles.css         # Styling for colors and UI
├── popup.html         # Extension popup interface
└── README.md          # This file
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

## Future Enhancements

- [ ] Save color schemes between sessions
- [ ] Export/import color configurations
- [ ] Keyboard shortcuts for common actions
- [ ] Undo/redo functionality
- [ ] Multiple color schemes

---

Enjoy solving Connections puzzles with enhanced organization! 🎮