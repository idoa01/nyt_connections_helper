/**
 * @jest-environment jsdom
 */

'use strict';

// Minimal stubs for Chrome extension APIs used at module-load time.
global.chrome = {
  runtime: { onMessage: { addListener: () => {} } },
  storage: { sync: { get: () => {}, set: () => {} } },
};

// Silence console noise from the content script during tests.
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  // createCustomContextMenu uses fetch to load a template; stub it so it
  // resolves silently in jsdom instead of throwing.
  global.fetch = jest.fn(() => Promise.reject(new Error('fetch not available in tests')));
});
afterEach(() => {
  jest.restoreAllMocks();
});

// ─── helpers ─────────────────────────────────────────────────────────────────

function buildCards(count = 16) {
  const form = document.createElement('form');
  form.id = 'default-choices';
  for (let i = 0; i < count; i++) {
    const label = document.createElement('label');
    label.setAttribute('for', `inner-card-${i}`);
    label.setAttribute('data-testid', 'card-label');
    label.setAttribute('data-flip-id', `WORD_${i}`);
    label.setAttribute('draggable', 'true');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `inner-card-${i}`;
    input.setAttribute('data-testid', 'card-input');
    label.appendChild(input);
    form.appendChild(label);
  }
  document.body.appendChild(form);
}

function buildActionGroup() {
  const section = document.createElement('section');
  section.className = 'Game-module_boardActionGroup__JqzYT';

  ['shuffle-btn', 'deselect-btn', 'submit-btn'].forEach((testId) => {
    const btn = document.createElement('button');
    btn.setAttribute('data-testid', testId);
    btn.className = 'ActionButton-module_button__IlhXt';
    section.appendChild(btn);
  });

  document.body.appendChild(section);
  return section;
}

// Load the class definition only — stop before the module-level initialization
// code fires by reading the source and stripping the bottom bootstrap block.
const fs = require('fs');
const path = require('path');

{
  const src = fs.readFileSync(
    path.resolve(__dirname, '../scripts/content.js'),
    'utf8'
  );
  // Strip the module-level bootstrap that fires on load — keep only the class.
  const classOnlySrc = src.split('// Initialize the extension')[0];
  // Wrap in a block that assigns to global so the class survives the eval scope.
  // eslint-disable-next-line no-eval
  eval(classOnlySrc + '\nglobal.ConnectionsHelper = ConnectionsHelper;');
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('addResetButton', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    ConnectionsHelper.instance = null;
  });

  test('does not throw when action group is absent', () => {
    buildCards();
    // Action group deliberately absent — this was the crashing scenario.
    expect(() => ConnectionsHelper.getInstance()).not.toThrow();
    expect(document.querySelector('.connections-helper-reset-btn')).toBeNull();
  });

  test('inserts exactly one reset button when action group is present', () => {
    buildCards();
    buildActionGroup();
    expect(() => ConnectionsHelper.getInstance()).not.toThrow();
    const btns = document.querySelectorAll('.connections-helper-reset-btn');
    expect(btns).toHaveLength(1);
  });

  test('does not duplicate the button on re-entry', () => {
    buildCards();
    buildActionGroup();
    const helper = ConnectionsHelper.getInstance();
    helper.addResetButton();
    helper.addResetButton();
    expect(document.querySelectorAll('.connections-helper-reset-btn')).toHaveLength(1);
  });

  test('reset button calls resetOrder', () => {
    buildCards();
    buildActionGroup();
    const helper = ConnectionsHelper.getInstance();
    const spy = jest.spyOn(helper, 'resetOrder').mockImplementation(() => {});
    document.querySelector('.connections-helper-reset-btn').click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('inserts button when action group appears after initial load', () => {
    buildCards();
    // Init without the action group — should not throw.
    const helper = ConnectionsHelper.getInstance();
    expect(document.querySelector('.connections-helper-reset-btn')).toBeNull();

    // Simulate the action group appearing later (mutation observer path).
    buildActionGroup();
    helper.addResetButton();
    helper.addStatusIndicator();

    expect(document.querySelectorAll('.connections-helper-reset-btn')).toHaveLength(1);
  });
});
