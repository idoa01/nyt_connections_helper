// Background script for context menu
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for color coding
  const colors = [
    { id: 'yellow', title: '🟡 Yellow (Easy)', color: '#f9df6d' },
    { id: 'green', title: '🟢 Green (Medium)', color: '#a0c35a' },
    { id: 'blue', title: '🔵 Blue (Hard)', color: '#b0c4ef' },
    { id: 'purple', title: '🟣 Purple (Hardest)', color: '#ba81c5' },
    { id: 'pink', title: '🩷 Light Pink', color: '#ffc1cc' },
    { id: 'orange', title: '🧡 Light Orange', color: '#ffcba4' },
    { id: 'cyan', title: '🩵 Light Cyan', color: '#a4e4ff' },
    { id: 'lavender', title: '💜 Light Lavender', color: '#d4a4ff' },
    { id: 'clear', title: '⚪ Clear Color', color: '#ffffff' }
  ];

  chrome.contextMenus.create({
    id: 'connections-helper',
    title: 'Color Code',
    contexts: ['all'],
    documentUrlPatterns: ['https://www.nytimes.com/games/connections*']
  });

  colors.forEach(color => {
    chrome.contextMenus.create({
      id: `color-${color.id}`,
      parentId: 'connections-helper',
      title: color.title,
      contexts: ['all']
    });
  });

  // Add reset option
  chrome.contextMenus.create({
    id: 'reset-order',
    parentId: 'connections-helper',
    title: '🔄 Reset to Original Order',
    contexts: ['all']
  });

  // Add clear colors option
  chrome.contextMenus.create({
    id: 'clear-colors',
    parentId: 'connections-helper',
    title: '🧹 Clear All Colors',
    contexts: ['all']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith('color-')) {
    const colorId = info.menuItemId.replace('color-', '');
    chrome.tabs.sendMessage(tab.id, {
      action: 'colorElement',
      color: colorId
    });
  } else if (info.menuItemId === 'reset-order') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'resetOrder'
    });
  } else if (info.menuItemId === 'clear-colors') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'clearColors'
    });
  }
});