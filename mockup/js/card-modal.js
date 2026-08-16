import { getCard, updateCard } from './store.js';
import { route } from './router.js';

const dialog = document.getElementById('card-modal');
const form = document.getElementById('card-modal-form');
const titleInput = document.getElementById('card-modal-title');
const descInput = document.getElementById('card-modal-description');
const titleError = document.getElementById('card-modal-title-error');
const closeBtn = document.getElementById('card-modal-close');
const cancelBtn = document.getElementById('card-modal-cancel');

let currentCardId = null;

export function openCardModal(cardId) {
  const card = getCard(cardId);
  if (!card) return;
  currentCardId = cardId;
  titleInput.value = card.title;
  descInput.value = card.description || '';
  titleError.classList.add('hidden');
  dialog.showModal();
  titleInput.focus();
}

export function closeCardModal() {
  if (dialog.open) dialog.close();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    titleError.classList.remove('hidden');
    titleInput.focus();
    return;
  }
  updateCard(currentCardId, { title, description: descInput.value });
  dialog.close();
  route();
});

closeBtn.addEventListener('click', () => dialog.close());
cancelBtn.addEventListener('click', () => dialog.close());

// Clicking the backdrop (outside the dialog's content box) targets the
// dialog element itself, so this closes without saving on outside click.
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});

// Fires on every close path (save, cancel, backdrop click, Escape).
dialog.addEventListener('close', () => {
  currentCardId = null;
});
