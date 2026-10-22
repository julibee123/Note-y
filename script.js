/**
 * Note-y - Sticky Note Gallery Application
 * Pure Vanilla JavaScript implementation with LocalStorage persistence.
 *
 * NOTE: Strict semicolon rule is enforced for CI/CD ESLint pipeline ("semi": ["error", "always"]).
 * Every statement concludes with a semicolon.
 */

'use strict';

// ============================================================================
// 🧪 CI/CD PIPELINE TEST TARGET (FOR GITHUB ACTIONS ESLINT TEST)
// Delete the semicolon at the very end of the line below to intentionally fail
// the ESLint check during your CI/CD pipeline assignment test!
// ============================================================================
const CI_LINTER_TEST_TARGET = "Delete the semicolon at the end of this line to trigger CI failure"

// Storage Key for LocalStorage
const STORAGE_KEY = 'notey_sticky_notes';

// DOM Element References
const noteInput = document.getElementById('note-input');
const saveBtn = document.getElementById('save-btn');
const clearBtn = document.getElementById('clear-btn');
const charCounter = document.getElementById('char-counter');
const creatorCard = document.getElementById('creator-card');
const notesGallery = document.getElementById('notes-gallery');
const emptyState = document.getElementById('empty-state');
const noteCountBadge = document.getElementById('note-count-badge');
const colorRadios = document.querySelectorAll('input[name="note-color"]');

/**
 * Color gradients mapping for creator card and notes.
 */
const COLOR_GRADIENTS = {
  yellow: 'linear-gradient(135deg, #fffbc7 0%, #ffea78 100%)',
  pink: 'linear-gradient(135deg, #ffe4ec 0%, #ffb3c6 100%)',
  blue: 'linear-gradient(135deg, #e0f4ff 0%, #a8dcff 100%)',
  green: 'linear-gradient(135deg, #e3fde6 0%, #b0eeb7 100%)',
  purple: 'linear-gradient(135deg, #f1ebff 0%, #d4c2ff 100%)',
  orange: 'linear-gradient(135deg, #ffeedd 0%, #ffcaa0 100%)'
};

/**
 * Pin color variants for visual variety.
 */
const PIN_VARIANTS = ['pin-red', 'pin-blue', 'pin-green', 'pin-yellow'];

/**
 * Retrieve notes array from LocalStorage safely.
 * @returns {Array<Object>} List of saved note objects.
 */
function getNotesFromStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    return rawData ? JSON.parse(rawData) : [];
  } catch (error) {
    console.error('Failed to parse notes from localStorage:', error);
    return [];
  }
}

/**
 * Save notes array to LocalStorage.
 * @param {Array<Object>} notes - Array of note objects.
 */
function saveNotesToStorage(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to write notes to localStorage:', error);
  }
}

/**
 * Formats a Date object or timestamp into an aesthetic date string.
 * e.g., "Oct 22, 2026 • 10:25 AM"
 * @param {string|number|Date} dateInput - Date to format.
 * @returns {string} Formatted date string.
 */
function formatNoteDate(dateInput) {
  const date = new Date(dateInput);
  const optionsDate = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  const optionsTime = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  const datePart = date.toLocaleDateString(undefined, optionsDate);
  const timePart = date.toLocaleTimeString(undefined, optionsTime);
  return `${datePart} • ${timePart}`;
}

/**
 * Updates the note counter badge and empty state visibility.
 * @param {number} count - Total number of active notes.
 */
function updateBoardStatus(count) {
  if (count === 1) {
    noteCountBadge.textContent = '1 Note Pinned';
  } else {
    noteCountBadge.textContent = `${count} Notes Pinned`;
  }

  if (count === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
  }
}

/**
 * Creates the DOM element for a single sticky note card.
 * @param {Object} note - The note data object.
 * @param {number} index - Index for pin color selection.
 * @returns {HTMLElement} The card element.
 */
function createNoteElement(note, index) {
  const card = document.createElement('article');
  card.className = `sticky-note-card note-${note.color}`;
  card.id = `note-${note.id}`;

  // Assign a rotating push pin color
  const pinClass = PIN_VARIANTS[index % PIN_VARIANTS.length];
  const pinDiv = document.createElement('div');
  pinDiv.className = `card-pin ${pinClass}`;
  pinDiv.setAttribute('aria-hidden', 'true');

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-note-btn';
  deleteBtn.innerHTML = '&times;';
  deleteBtn.title = 'Remove this note';
  deleteBtn.setAttribute('aria-label', 'Delete note');
  deleteBtn.addEventListener('click', function () {
    deleteNote(note.id);
  });

  // Note Content
  const textDiv = document.createElement('div');
  textDiv.className = 'card-text';
  textDiv.textContent = note.text;

  // Footer with Date
  const footerDiv = document.createElement('footer');
  footerDiv.className = 'card-footer';

  const dateSpan = document.createElement('span');
  dateSpan.className = 'card-date';
  dateSpan.innerHTML = `🗓️ ${formatNoteDate(note.createdAt)}`;

  footerDiv.appendChild(dateSpan);

  // Assemble Card
  card.appendChild(pinDiv);
  card.appendChild(deleteBtn);
  card.appendChild(textDiv);
  card.appendChild(footerDiv);

  return card;
}

/**
 * Renders all saved sticky notes to the corkboard gallery.
 */
function renderGallery() {
  const notes = getNotesFromStorage();
  notesGallery.innerHTML = '';

  notes.forEach(function (note, index) {
    const noteEl = createNoteElement(note, index);
    notesGallery.appendChild(noteEl);
  });

  updateBoardStatus(notes.length);
}

/**
 * Gets currently selected color value from radio buttons.
 * @returns {string} Selected color name (e.g. 'yellow').
 */
function getSelectedColor() {
  const checkedRadio = document.querySelector('input[name="note-color"]:checked');
  return checkedRadio ? checkedRadio.value : 'yellow';
}

/**
 * Handles adding a new note from user input.
 */
function handleSaveNote() {
  const text = noteInput.value.trim();

  // Validate input
  if (!text) {
    noteInput.focus();
    creatorCard.style.outline = '2px solid #e74c3c';
    setTimeout(function () {
      creatorCard.style.outline = 'none';
    }, 1200);
    return;
  }

  const selectedColor = getSelectedColor();

  const newNote = {
    id: 'note_' + Date.now(),
    text: text,
    color: selectedColor,
    createdAt: new Date().toISOString()
  };

  const notes = getNotesFromStorage();
  // Prepend note so newest notes appear at the top of the gallery
  notes.unshift(newNote);
  saveNotesToStorage(notes);

  // Clear input area and reset char count
  noteInput.value = '';
  updateCharCount();

  // Re-render gallery
  renderGallery();

  // Bring focus back to input for rapid note taking
  noteInput.focus();
}

/**
 * Handles removing a sticky note by ID with animation.
 * @param {string} noteId - ID of the note to remove.
 */
function deleteNote(noteId) {
  const cardElement = document.getElementById(`note-${noteId}`);
  if (cardElement) {
    cardElement.classList.add('removing');
    setTimeout(function () {
      const notes = getNotesFromStorage();
      const filteredNotes = notes.filter(function (note) {
        return note.id !== noteId;
      });
      saveNotesToStorage(filteredNotes);
      renderGallery();
    }, 250);
  } else {
    const notes = getNotesFromStorage();
    const filteredNotes = notes.filter(function (note) {
      return note.id !== noteId;
    });
    saveNotesToStorage(filteredNotes);
    renderGallery();
  }
}

/**
 * Resets the note creator textarea.
 */
function handleClearInput() {
  noteInput.value = '';
  updateCharCount();
  noteInput.focus();
}

/**
 * Updates the character counter display.
 */
function updateCharCount() {
  const currentLength = noteInput.value.length;
  charCounter.textContent = `${currentLength} / 500`;
}

/**
 * Updates the creator card background based on active color swatch.
 * @param {string} color - The color key.
 */
function updateCreatorBackground(color) {
  if (COLOR_GRADIENTS[color]) {
    creatorCard.style.background = COLOR_GRADIENTS[color];
  }
}

/**
 * Initialize event listeners on page load.
 */
function init() {
  // Save button click
  saveBtn.addEventListener('click', handleSaveNote);

  // Clear button click
  clearBtn.addEventListener('click', handleClearInput);

  // Character counter listener
  noteInput.addEventListener('input', updateCharCount);

  // Keyboard shortcut: Ctrl + Enter or Cmd + Enter to save
  noteInput.addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSaveNote();
    }
  });

  // Color radio buttons switch
  colorRadios.forEach(function (radio) {
    radio.addEventListener('change', function (event) {
      updateCreatorBackground(event.target.value);
    });
  });

  // Initial render from LocalStorage
  renderGallery();
}

// Attach init handler when DOM is ready
document.addEventListener('DOMContentLoaded', init);
