// Content script for NY Times Connections Helper
class ConnectionsHelper {
  constructor() {
    this.originalOrder = [];
    this.currentTarget = null;
    this.cardColors = new Map(); // Store card colors by 'for' attribute
    this.colors = {
      yellow: '#f9df6d',
      green: '#a0c35a', 
      blue: '#b0c4ef',
      purple: '#ba81c5',
      pink: '#ffc1cc',
      orange: '#ffcba4',
      cyan: '#a4e4ff',
      lavender: '#d4a4ff'
    };
    this.init();
  }

  init() {
    console.log('🎮 NY Times Connections Helper initialized');
    this.setupDragAndDrop();
    this.storeOriginalOrder();
    this.addResetButton();
    this.addStatusIndicator();
    this.setupClassObserver();
  }

  // Store the original order of cards based on 'for' attribute
  storeOriginalOrder() {
    const cards = document.querySelectorAll('label[data-testid="card-label"]');
    this.originalOrder = Array.from(cards).map(card => card.getAttribute('for'));
    console.log('📝 Original order stored:', this.originalOrder);
  }

  // Add reset button to the page
  addResetButton() {
    if (document.querySelector('.connections-helper-reset-btn')) return;

    const buttonGroup = document.querySelector('[class^="Board-module_boardActionGroup"]');
    const buttonClass = buttonGroup.children[0].className;

    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 Reset Order';
    resetBtn.className = buttonClass + ' connections-helper-reset-btn';
    resetBtn.onclick = () => this.resetOrder();
    //document.body.appendChild(resetBtn);
    buttonGroup.appendChild(resetBtn);
  }

  // Add status indicator
  addStatusIndicator() {
    if (document.querySelector('.connections-helper-status')) return;

    const status = document.createElement('div');
    status.className = 'connections-helper-status';
    status.id = 'connections-helper-status';
    document.body.appendChild(status);
  }

  // Show temporary status message
  showStatus(message, duration = 2000) {
    const status = document.getElementById('connections-helper-status');
    if (status) {
      status.textContent = message;
      status.classList.add('show');
      setTimeout(() => status.classList.remove('show'), duration);
    }
  }

  // Setup drag and drop functionality
  setupDragAndDrop() {
    const cards = document.querySelectorAll('label[data-testid="card-label"]');
    
    // Remove any existing event listeners first to prevent duplicates
    cards.forEach(card => {
      // Skip if already set up
      if (card.hasAttribute('data-drag-setup')) return;

      card.draggable = true;
      card.setAttribute('data-drag-setup', 'true');
      
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.getAttribute('for'));
        card.classList.add('connections-helper-dragging');
        this.showStatus('Dragging card...');
      });

      card.addEventListener('dragend', (e) => {
        card.classList.remove('connections-helper-dragging');
        this.clearDragStyles();
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.classList.add('connections-helper-drag-over');
      });

      card.addEventListener('dragleave', (e) => {
        card.classList.remove('connections-helper-drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop event propagation to prevent multiple triggers
        console.log('🎯 Drop event triggered for:', card.textContent);
        const draggedFor = e.dataTransfer.getData('text/plain');
        const draggedCard = document.querySelector(`label[for="${draggedFor}"]`);
        
        if (draggedCard && draggedCard !== card) {
          console.log('🔄 Swapping cards:', draggedCard.textContent, '↔', card.textContent);
          this.swapCards(draggedCard, card);
          this.showStatus('Cards swapped!');
        }
        
        this.clearDragStyles();
      });

      // Store right-click target for context menu
      card.addEventListener('contextmenu', (e) => {
        this.currentTarget = card;
      });
    });
  }

  // Clear drag styling
  clearDragStyles() {
    const cards = document.querySelectorAll('label[data-testid="card-label"]');
    cards.forEach(card => {
      card.classList.remove('connections-helper-drag-over', 'connections-helper-dragging');
    });
  }

  // Swap two cards in the DOM while preserving their color classes
  swapCards(card1, card2) {
    // Store color classes before swapping
    const card1Colors = this.getColorClasses(card1);
    const card2Colors = this.getColorClasses(card2);

    const parent = card1.parentNode;
    const next1 = card1.nextElementSibling;
    const next2 = card2.nextElementSibling;

    if (next1 === card2) {
      parent.insertBefore(card2, card1);
    } else if (next2 === card1) {
      parent.insertBefore(card1, card2);
    } else {
      parent.insertBefore(card1, next2);
      parent.insertBefore(card2, next1);
    }

    // Restore color classes after swapping
    this.setColorClasses(card1, card1Colors);
    this.setColorClasses(card2, card2Colors);
  }

  // Get all color classes from a card
  getColorClasses(card) {
    const colorClasses = [];
    Object.keys(this.colors).forEach(color => {
        if (card.classList.contains(`connections-helper-${color}`)) {
            colorClasses.push(`connections-helper-${color}`);
        }
    })
    return colorClasses;
  }

  // Reset color classes for a card
  setColorClasses(card, colorClasses) {
    Object.keys(this.colors).forEach(color => {
      card.classList.remove(`connections-helper-${color}`);
    });
    colorClasses.forEach(colorClass => {
      card.classList.add(colorClass);
    });
  }

  // Color a card
  colorCard(card, color) {
    // Remove existing color classes
    Object.keys(this.colors).forEach(c => {
      card.classList.remove(`connections-helper-${c}`);
    });
    
    // Add new color class
    card.classList.add(`connections-helper-${color}`);

    // Store the color for this card
    const cardId = card.getAttribute('for');
    this.cardColors.set(cardId, color);
    
    const colorName = color.charAt(0).toUpperCase() + color.slice(1);
    this.showStatus(`Card colored ${colorName}!`);
  }

  // Setup observer to watch for class changes on cards
  setupClassObserver() {
    const classObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const card = mutation.target;
          const cardId = card.getAttribute('for');

          // If this card had a stored color and no longer has color classes
          if (this.cardColors.has(cardId) && this.getColorClasses(card).length === 0) {
            const storedColor = this.cardColors.get(cardId);
            // Re-apply the stored color
            card.classList.add(`connections-helper-${storedColor}`);
          }
        }
      });
    });

    const cards = document.querySelectorAll('label[data-testid="card-label"]');
    cards.forEach(card => {
        classObserver.observe(card, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // Reset cards to original order
  resetOrder() {
    const parent = document.querySelector('label[data-testid="card-label"]')?.parentNode;
    if (!parent) return;

    // Get all cards and sort by original order
    const cards = Array.from(document.querySelectorAll('label[data-testid="card-label"]'));
    const sortedCards = cards.sort((a, b) => {
      const aIndex = this.originalOrder.indexOf(a.getAttribute('for'));
      const bIndex = this.originalOrder.indexOf(b.getAttribute('for'));
      return aIndex - bIndex;
    });

    // Re-append cards in correct order
    sortedCards.forEach(card => parent.appendChild(card));
    
    this.showStatus('Order reset to original!');
    console.log('🔄 Cards reset to original order');
  }

  // Clear all colors
  clearColors() {
    const cards = document.querySelectorAll('label[data-testid="card-label"]');
    cards.forEach(card => {
      Object.keys(this.colors).forEach(color => {
        card.classList.remove(`connections-helper-${color}`);
      });
    });
    // Clear stored colors
    this.cardColors.clear();
    this.showStatus('All colors cleared!');
  }
}

// Initialize the extension
let connectionsHelper = null;
let initialized = false;

// Wait for page to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHelper);
} else {
  initializeHelper();
}

function initializeHelper() {
  // If already initialized, skip
  if (initialized) return;
  
  // Wait a bit more for the game to fully load
  setTimeout(() => {
    const gameCards = document.querySelectorAll('label[data-testid="card-label"]');
    if (gameCards.length > 0) {
      connectionsHelper = new ConnectionsHelper();
      initialized = true;
      console.log('✅ NY Times Connections Helper initialized');
    } else {
      console.log('⏳ Game not loaded yet, retrying...');
      setTimeout(initializeHelper, 1000);
    }
  }, 500);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!connectionsHelper) {
    console.log('⚠️ Helper not initialized yet');
    return;
  }

  switch (request.action) {
    case 'colorElement':
      if (connectionsHelper.currentTarget) {
        connectionsHelper.colorCard(connectionsHelper.currentTarget, request.color);
      }
      break;
    case 'resetOrder':
      connectionsHelper.resetOrder();
      break;
    case 'clearColors':
      connectionsHelper.clearColors();
      break;
  }
});

// Re-initialize if the game reloads
const observer = new MutationObserver((mutations) => {
  const gameCards = document.querySelectorAll('label[data-testid="card-label"]');
  if (gameCards.length > 0) {
    if (!connectionsHelper) {
      connectionsHelper = new ConnectionsHelper();
      initialized = true;
      console.log('🔄 NY Times Connections Helper re-initialized');
    } else if (initialized) {
      // If we already have an instance, just refresh the drag and drop functionality
      // This ensures we have event listeners on any new cards
      connectionsHelper.setupDragAndDrop();
      console.log('🔄 Refreshed drag and drop functionality');
    }
  } else {
    // Game might have unloaded
    initialized = false;
    connectionsHelper = null;
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});