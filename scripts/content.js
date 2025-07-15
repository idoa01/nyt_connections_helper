// Content script for NY Times Connections Helper
class ConnectionsHelper {
  // Static instance property to hold the singleton
  static instance = null;
  
  // Static getInstance method to get the singleton instance
  static getInstance() {
    if (!ConnectionsHelper.instance) {
      ConnectionsHelper.instance = new ConnectionsHelper();
    }
    return ConnectionsHelper.instance;
  }
  
  // Private constructor - should only be called from getInstance()
  constructor() {
    // Prevent multiple instances if constructor is called directly
    if (ConnectionsHelper.instance) {
      console.warn('ConnectionsHelper already exists! Use ConnectionsHelper.getInstance()');
      return ConnectionsHelper.instance;
    }
    
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
    
    // Set this instance as the singleton instance
    ConnectionsHelper.instance = this;
    
    // Initialize the helper
    this.init();
  }

  init() {
    console.log('🎮 NY Times Connections Helper initialized');
    this.checkGameDate();
    this.setupDragAndDrop();
    this.storeOriginalOrder();
    this.addResetButton();
    this.addStatusIndicator();
    this.setupClassObserver();
    this.createCustomContextMenu(); // Add custom context menu
    this.restoreTargetFromStorage();
    this.restoreColorsFromStorage(); // Restore saved card colors
    this.restoreOrderFromStorage(); // Restore saved card order
  }
  
  // Check if game date has changed and clear stored data if needed
  checkGameDate() {
    const dateElement = document.querySelector('#portal-game-date span');
    if (dateElement) {
      const currentDate = dateElement.textContent.trim();
      const storedDate = sessionStorage.getItem('connections-helper-game-date');
      
      console.log('📅 Current game date:', currentDate, 'Stored date:', storedDate);
      
      if (storedDate && storedDate !== currentDate) {
        // Date changed, clear stored target
        console.log('📅 Game date changed. Clearing stored targets, colors, and card order.');
        sessionStorage.removeItem('connections-helper-target-id');
        sessionStorage.removeItem('connections-helper-target-text');
        sessionStorage.removeItem('connections-helper-card-colors');
        sessionStorage.removeItem('connections-helper-card-order');
        // Clear stored colors too
        this.cardColors.clear();
      }
      
      // Update stored date
      sessionStorage.setItem('connections-helper-game-date', currentDate);
    }
  }

  // Restore the current target from sessionStorage
  restoreTargetFromStorage() {
    const targetId = sessionStorage.getItem('connections-helper-target-id');
    if (targetId) {
      const target = document.querySelector(`label[for="${targetId}"]`);
      if (target) {
        this.currentTarget = target;
        console.log('🔄 Restored target from sessionStorage:', 
                   sessionStorage.getItem('connections-helper-target-text'));
      }
    }
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

  // Create custom context menu
  createCustomContextMenu() {
    // Check if custom menu already exists
    if (document.getElementById('connections-custom-menu')) return;

    // Create the menu container
    const menu = document.createElement('div');
    menu.id = 'connections-custom-menu';
    menu.className = 'connections-custom-menu';
    menu.style.display = 'none';
    
    // Define color options - matching those in background.js
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
    
    // Create color submenu
    const colorSection = document.createElement('div');
    colorSection.className = 'menu-section';
    
    const colorTitle = document.createElement('div');
    colorTitle.className = 'menu-section-title';
    colorTitle.textContent = 'Color Code';
    colorSection.appendChild(colorTitle);
    
    colors.forEach(color => {
      const option = document.createElement('div');
      option.className = 'menu-item';
      option.textContent = color.title;
      option.style.borderLeft = `4px solid ${color.color}`;
      
      option.addEventListener('click', () => {
        this.hideCustomMenu();
        if (this.currentTarget) {
          this.colorCard(this.currentTarget, color.id);
        }
      });
      
      colorSection.appendChild(option);
    });
    
    menu.appendChild(colorSection);
    
    // Create utilities section with the swap colors option
    const utilSection = document.createElement('div');
    utilSection.className = 'menu-section';
    
    // Swap colors option
    const swapOption = document.createElement('div');
    swapOption.className = 'menu-item';
    swapOption.textContent = '🔄 Swap Colors';
    swapOption.addEventListener('click', () => {
      this.hideCustomMenu();
      this.showSwapColorsPopup(colors.slice(0, 8)); // Exclude "Clear Color" option
    });
    utilSection.appendChild(swapOption);
    
    // Reset order option
    const resetOption = document.createElement('div');
    resetOption.className = 'menu-item';
    resetOption.textContent = '🔄 Reset to Original Order';
    resetOption.addEventListener('click', () => {
      this.hideCustomMenu();
      this.resetOrder();
    });
    utilSection.appendChild(resetOption);
    
    // Clear colors option
    const clearOption = document.createElement('div');
    clearOption.className = 'menu-item';
    clearOption.textContent = '🧹 Clear All Colors';
    clearOption.addEventListener('click', () => {
      this.hideCustomMenu();
      this.clearColors();
    });
    utilSection.appendChild(clearOption);
    
    menu.appendChild(utilSection);
    
    // Append the menu to the body
    document.body.appendChild(menu);
    
    // Setup event listener for right clicks
    document.addEventListener('contextmenu', (e) => {
      const card = e.target.closest('label[data-testid="card-label"]');
      if (card) {
        e.preventDefault();
        this.currentTarget = card;
        // Deselect card
        this.currentTarget.firstChild.dispatchEvent(
          new KeyboardEvent('keydown', { key: ' ', bubbles: true })
        );
        
        // Store target in sessionStorage
        const cardId = card.getAttribute('for');
        const cardText = card.textContent.trim();
        sessionStorage.setItem('connections-helper-target-id', cardId);
        sessionStorage.setItem('connections-helper-target-text', cardText);
        console.log('🎯 Right-clicked on card:', cardText, 'with ID:', cardId);
        
        // Position and show the menu
        menu.style.top = `${e.pageY}px`;
        menu.style.left = `${e.pageX}px`;
        menu.style.display = 'block';
      }
    });
    
    // Hide menu when clicking elsewhere
    document.addEventListener('click', () => {
      this.hideCustomMenu();
    });
    
    // Create the swap colors popup (hidden by default)
    this.createSwapColorsPopup();
  }
  
  // Create the swap colors popup
  createSwapColorsPopup() {
    // Check if popup already exists
    if (document.getElementById('swap-colors-popup')) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'swap-colors-overlay';
    overlay.className = 'popup-overlay';
    overlay.style.display = 'none';
    
    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'swap-colors-popup';
    popup.className = 'swap-colors-popup';
    popup.style.display = 'none';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'swap-popup-header';
    
    const title = document.createElement('div');
    title.className = 'swap-popup-title';
    title.textContent = 'Swap Colors';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'swap-popup-close';
    closeButton.textContent = '✕';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.onclick = () => this.hideSwapColorsPopup();
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create content
    const content = document.createElement('div');
    content.className = 'swap-popup-content';
    
    // Source color selector
    const sourceGroup = document.createElement('div');
    sourceGroup.className = 'color-select-group';
    
    const sourceLabel = document.createElement('label');
    sourceLabel.className = 'color-select-label';
    sourceLabel.textContent = 'Source Color';
    sourceLabel.setAttribute('for', 'source-color-select');
    
    const sourceSelect = document.createElement('select');
    sourceSelect.id = 'source-color-select';
    sourceSelect.className = 'color-select';
    // Options will be added when the popup is shown
    
    sourceGroup.appendChild(sourceLabel);
    sourceGroup.appendChild(sourceSelect);
    
    // Target color selector
    const targetGroup = document.createElement('div');
    targetGroup.className = 'color-select-group';
    
    const targetLabel = document.createElement('label');
    targetLabel.className = 'color-select-label';
    targetLabel.textContent = 'Target Color';
    targetLabel.setAttribute('for', 'target-color-select');
    
    const targetSelect = document.createElement('select');
    targetSelect.id = 'target-color-select';
    targetSelect.className = 'color-select';
    // Options will be added when the popup is shown
    
    targetGroup.appendChild(targetLabel);
    targetGroup.appendChild(targetSelect);
    
    content.appendChild(sourceGroup);
    content.appendChild(targetGroup);
    
    // Create actions
    const actions = document.createElement('div');
    actions.className = 'swap-popup-actions';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'swap-popup-button swap-popup-cancel';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => this.hideSwapColorsPopup();
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'swap-popup-button swap-popup-confirm';
    confirmButton.textContent = 'Swap';
    confirmButton.onclick = () => this.executeColorSwap();
    
    actions.appendChild(cancelButton);
    actions.appendChild(confirmButton);
    
    // Assemble popup
    popup.appendChild(header);
    popup.appendChild(content);
    popup.appendChild(actions);
    
    // Add to document
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
  }
  
  // Show swap colors popup with color options
  showSwapColorsPopup(colors) {
    const popup = document.getElementById('swap-colors-popup');
    const overlay = document.getElementById('swap-colors-overlay');
    const sourceSelect = document.getElementById('source-color-select');
    const targetSelect = document.getElementById('target-color-select');
    
    if (!popup || !overlay || !sourceSelect || !targetSelect) {
      console.error('❌ Swap colors popup elements not found');
      return;
    }
    
    // Clear existing options
    sourceSelect.innerHTML = '';
    targetSelect.innerHTML = '';
    
    // Add options to both selects
    colors.forEach(color => {
      const sourceOption = document.createElement('option');
      sourceOption.value = color.id;
      sourceOption.textContent = color.title;
      sourceOption.style.background = color.color;
      sourceSelect.appendChild(sourceOption);
      
      const targetOption = document.createElement('option');
      targetOption.value = color.id;
      targetOption.textContent = color.title;
      targetOption.style.background = color.color;
      targetSelect.appendChild(targetOption);
    });
    
    // Determine the color of the current target card
    let currentCardColor = null;
    if (this.currentTarget) {
      // Check which color class the current target has
      for (const colorId of Object.keys(this.colors)) {
        if (this.currentTarget.classList.contains(`connections-helper-${colorId}`)) {
          currentCardColor = colorId;
          break;
        }
      }
    }
    
    // Set source color to the color of the current card if available
    if (currentCardColor) {
      for (let i = 0; i < sourceSelect.options.length; i++) {
        if (sourceSelect.options[i].value === currentCardColor) {
          sourceSelect.selectedIndex = i;
          break;
        }
      }
      
      // Set target to a different color
      const sourceIndex = sourceSelect.selectedIndex;
      
      // Find the next valid color that's not the same as source
      let targetIndex = (sourceIndex + 1) % colors.length;
      if (targetIndex === sourceIndex) {
        targetIndex = (targetIndex + 1) % colors.length;
      }
      
      targetSelect.selectedIndex = targetIndex;
    } else {
      // Default behavior if no color is found
      // Set second option as default for target (to avoid same selection)
      if (targetSelect.options.length > 1) {
        targetSelect.selectedIndex = 1;
      }
    }
    
    // Show popup and overlay
    popup.style.display = 'block';
    overlay.style.display = 'block';
    
    // Close popup when clicking overlay
    overlay.onclick = () => this.hideSwapColorsPopup();
    
    // Prevent closing when clicking popup itself
    popup.onclick = (e) => e.stopPropagation();
  }
  
  // Hide swap colors popup
  hideSwapColorsPopup() {
    const popup = document.getElementById('swap-colors-popup');
    const overlay = document.getElementById('swap-colors-overlay');
    
    if (popup) popup.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
  }
  
  // Execute color swap based on selected values
  executeColorSwap() {
    const sourceSelect = document.getElementById('source-color-select');
    const targetSelect = document.getElementById('target-color-select');
    
    if (!sourceSelect || !targetSelect) {
      console.error('❌ Color select elements not found');
      return;
    }
    
    const sourceColor = sourceSelect.value;
    const targetColor = targetSelect.value;
    
    if (sourceColor === targetColor) {
      this.showStatus("Can't swap a color with itself!", 2000);
      return;
    }
    
    this.swapCardColors(sourceColor, targetColor);
    this.hideSwapColorsPopup();
    
    const sourceText = sourceSelect.options[sourceSelect.selectedIndex].textContent;
    const targetText = targetSelect.options[targetSelect.selectedIndex].textContent;
    
    this.showStatus(`Swapped ${sourceText} with ${targetText}`, 3000);
  }
  
  // Hide custom context menu
  hideCustomMenu() {
    const menu = document.getElementById('connections-custom-menu');
    if (menu) {
      menu.style.display = 'none';
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
        draggedCard.firstChild.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
        this.clearDragStyles();
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
    
    // Save the new order to storage
    this.saveOrderToStorage();
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

    if (color !== 'clear') {
      // Add new color class
      card.classList.add(`connections-helper-${color}`);
    }

    // Store the color for this card
    const cardId = card.getAttribute('for');
    if (color !== 'clear') {
      this.cardColors.set(cardId, color);
    } else {
      this.cardColors.delete(cardId);
    }

    // Save colors to sessionStorage for persistence
    this.saveColorsToStorage();
    
    const colorName = color.charAt(0).toUpperCase() + color.slice(1);
    this.showStatus(`Card colored ${colorName}!`);
  }

  // Setup observer to watch for class changes on cards
  setupClassObserver() {
    const cards = document.querySelectorAll('label[data-testid="card-label"]');
    cards.forEach(card => {
        // Create a new observer for this card
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
        
        // Store the observer on the card element for later access
        card._classObserver = classObserver;
        
        // Start observing
        classObserver.observe(card, { attributes: true, attributeFilter: ['class'] });
    });
  }

  // Save card colors to sessionStorage
  saveColorsToStorage() {
    const colorData = {};
    this.cardColors.forEach((color, cardId) => {
      colorData[cardId] = color;
    });
    
    //if (Object.keys(colorData).length > 0) {
    sessionStorage.setItem('connections-helper-card-colors', JSON.stringify(colorData));
    console.log('💾 Saved colors for', Object.keys(colorData).length, 'cards to storage');
    //}
  }
  
  // Restore card colors from sessionStorage
  restoreColorsFromStorage() {
    const storedColors = sessionStorage.getItem('connections-helper-card-colors');
    
    if (storedColors) {
      try {
        const colorData = JSON.parse(storedColors);
        
        // Restore colors to the cardColors Map
        Object.entries(colorData).forEach(([cardId, color]) => {
          this.cardColors.set(cardId, color);
        });
        
        console.log('🎨 Restored colors for', Object.keys(colorData).length, 'cards');
        
        // Apply colors to actual DOM elements
        const cards = document.querySelectorAll('label[data-testid="card-label"]');
        cards.forEach(card => {
          const cardId = card.getAttribute('for');
          if (this.cardColors.has(cardId)) {
            const color = this.cardColors.get(cardId);
            // Remove any existing color classes first
            Object.keys(this.colors).forEach(c => {
              card.classList.remove(`connections-helper-${c}`);
            });
            // Add the stored color class
            card.classList.add(`connections-helper-${color}`);
          }
        });
      } catch (error) {
        console.error('❌ Error restoring card colors:', error);
      }
    }
  }

  // Save current card order to sessionStorage
  saveOrderToStorage() {
    const cards = document.querySelectorAll('label[data-testid="card-label"]');
    const currentOrder = Array.from(cards).map(card => card.getAttribute('for'));
    
    sessionStorage.setItem('connections-helper-card-order', JSON.stringify(currentOrder));
    console.log('💾 Saved current card order to storage');
  }
  
  // Restore card order from sessionStorage
  restoreOrderFromStorage() {
    const storedOrder = sessionStorage.getItem('connections-helper-card-order');
    
    if (storedOrder) {
      try {
        const orderData = JSON.parse(storedOrder);
        const parent = document.querySelector('label[data-testid="card-label"]')?.parentNode;
        
        if (!parent || orderData.length === 0) return;
        
        console.log('🔄 Restoring card order from storage');
        
        // Get all current cards
        const cards = Array.from(document.querySelectorAll('label[data-testid="card-label"]'));
        
        // Sort cards based on the stored order
        const sortedCards = cards.sort((a, b) => {
          const aIndex = orderData.indexOf(a.getAttribute('for'));
          const bIndex = orderData.indexOf(b.getAttribute('for'));
          // If card is not in stored order, put it at the end
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
        
        // Re-append cards in correct order
        sortedCards.forEach(card => parent.appendChild(card));
        
        console.log('✅ Card order restored successfully');
      } catch (error) {
        console.error('❌ Error restoring card order:', error);
      }
    }
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
    
    // Save the original order to storage
    this.saveOrderToStorage();
    
    this.showStatus('Order reset to original!');
    console.log('🔄 Cards reset to original order');
  }

  // Swap colors between all cards of two colors
  swapCardColors(sourceColor, targetColor) {
    // Temporarily disable observers to prevent flickering
    const classObservers = this.disableClassObservers();
    
    // Get all cards with source and target colors
    const sourceCards = document.querySelectorAll(`label.connections-helper-${sourceColor}`);
    const targetCards = document.querySelectorAll(`label.connections-helper-${targetColor}`);
    
    console.log(`🔄 Swapping colors: ${sourceColor} (${sourceCards.length} cards) ↔ ${targetColor} (${targetCards.length} cards)`);
    
    // Add transition class to all affected cards
    sourceCards.forEach(card => card.classList.add('color-transition'));
    targetCards.forEach(card => card.classList.add('color-transition'));
    
    // Create a promise-based delay function
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    // Use an async function to handle the transition with delays
    (async () => {
      // First step: Remove original colors
      sourceCards.forEach(card => {
        card.classList.remove(`connections-helper-${sourceColor}`);
      });
      
      targetCards.forEach(card => {
        card.classList.remove(`connections-helper-${targetColor}`);
      });
      
      // Wait a moment for the transition to be visible
      await delay(50);
      
      // Second step: Add new colors
      sourceCards.forEach(card => {
        card.classList.add(`connections-helper-${targetColor}`);
        // Update stored color in Map
        const cardId = card.getAttribute('for');
        this.cardColors.set(cardId, targetColor);
      });
      
      targetCards.forEach(card => {
        card.classList.add(`connections-helper-${sourceColor}`);
        // Update stored color in Map
        const cardId = card.getAttribute('for');
        this.cardColors.set(cardId, sourceColor);
      });
      
      // Wait for the transition to complete
      await delay(600);
      
      // Remove transition class
      sourceCards.forEach(card => card.classList.remove('color-transition'));
      targetCards.forEach(card => card.classList.remove('color-transition'));
      
      // Save updated colors to storage
      this.saveColorsToStorage();
      
      // Re-enable observers
      this.enableClassObservers(classObservers);
    })();
  }

  // Clear all colors
  clearColors() {
    // First, temporarily disable the observer to prevent auto-restoration
    const classObservers = this.disableClassObservers();
    
    // Now clear colors from DOM elements
    const cards = document.querySelectorAll('label[data-testid="card-label"]');
    cards.forEach(card => {
      Object.keys(this.colors).forEach(color => {
        card.classList.remove(`connections-helper-${color}`);
      });
    });
    
    // Clear stored colors from Map
    this.cardColors.clear();
    
    // Remove from sessionStorage
    sessionStorage.removeItem('connections-helper-card-colors');
    
    // Re-enable observers after a small delay to ensure changes are complete
    setTimeout(() => {
      this.enableClassObservers(classObservers);
      console.log('🔄 Class observers re-enabled after color clearing');
    }, 100);
    
    this.showStatus('All colors cleared!');
  }
  
  // Disable class observers and return them for later re-enabling
  disableClassObservers() {
    const cards = document.querySelectorAll('label[data-testid="card-label"]');
    const observers = [];
    
    // We need to create a new observer for each card and store the existing one
    cards.forEach(card => {
      // Store the current observer in the DOM element for retrieval
      const observer = card._classObserver;
      if (observer) {
        observer.disconnect();
        observers.push({ card, observer });
      }
    });
    
    console.log('🛑 Disabled class observers for color clearing');
    return observers;
  }
  
  // Re-enable previously disabled class observers
  enableClassObservers(observers) {
    if (!observers || !observers.length) {
      // If no observers were disabled, set up new ones
      this.setupClassObserver();
      return;
    }
    
    // Re-connect each observer to its card
    observers.forEach(({ card, observer }) => {
      if (card && observer) {
        observer.observe(card, { attributes: true, attributeFilter: ['class'] });
      }
    });
    
    console.log('✅ Re-enabled', observers.length, 'class observers');
  }

  // Find the current target card, either from instance or from sessionStorage
  findTargetCard() {
    let target = this.currentTarget;
    
    // If current target is null, try to retrieve from sessionStorage
    if (!target) {
      const targetId = sessionStorage.getItem('connections-helper-target-id');
      if (targetId) {
        target = document.querySelector(`label[for="${targetId}"]`);
        console.log('📋 Retrieved target from sessionStorage:', 
                   sessionStorage.getItem('connections-helper-target-text'));
        
        // Update the instance's currentTarget for future use
        if (target) {
          this.currentTarget = target;
        }
      }
    }
    
    return target;
  }
}

// Initialize the extension
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
      // Use the getInstance method to get the singleton instance
      ConnectionsHelper.getInstance();
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
  // Check if the helper has been initialized
  if (!initialized) {
    console.log('⚠️ Helper not initialized yet');
    return;
  }

  // Get the singleton instance
  const helper = ConnectionsHelper.getInstance();
  
  switch (request.action) {
    case 'colorElement':
      const target = helper.findTargetCard();
      
      if (target) {
        helper.colorCard(target, request.color);
        target.firstChild.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      } else {
        console.log('⚠️ No target found for coloring');
      }
      break;
    case 'resetOrder':
      helper.resetOrder();
      break;
    case 'clearColors':
      helper.clearColors();
      break;
  }
});

// Re-initialize if the game reloads
const observer = new MutationObserver((mutations) => {
  const gameCards = document.querySelectorAll('label[data-testid="card-label"]');
  if (gameCards.length > 0) {
    if (!initialized) {
      // Use the getInstance method to get or create the singleton instance
      ConnectionsHelper.getInstance();
      initialized = true;
      console.log('🔄 NY Times Connections Helper re-initialized');
    } else {
      // If already initialized, just refresh the drag and drop functionality
      // This ensures we have event listeners on any new cards
      ConnectionsHelper.getInstance().setupDragAndDrop();
      console.log('🔄 Refreshed drag and drop functionality');
    }
  } else {
    // Game might have unloaded
    initialized = false;
    
    // Reset the singleton instance
    ConnectionsHelper.instance = null;
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});