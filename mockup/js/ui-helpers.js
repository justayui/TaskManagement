export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

let currentPopover = null;
let currentOutsideHandler = null;

function closeCurrentPopover() {
  if (currentPopover) {
    currentPopover.remove();
    currentPopover = null;
  }
  if (currentOutsideHandler) {
    document.removeEventListener('click', currentOutsideHandler, true);
    currentOutsideHandler = null;
  }
}

/**
 * Small floating confirm panel anchored near a trigger element, used in
 * place of the native confirm() for destructive actions.
 */
export function confirmPopover(anchorEl, message, onConfirm) {
  closeCurrentPopover();

  const pop = document.createElement('div');
  pop.className = 'confirm-popover';
  pop.innerHTML = `
    <p class="confirm-popover-message"></p>
    <div class="confirm-popover-actions">
      <button type="button" class="btn btn-ghost btn-sm" data-action="cancel">キャンセル</button>
      <button type="button" class="btn btn-danger btn-sm" data-action="confirm">削除</button>
    </div>
  `;
  pop.querySelector('.confirm-popover-message').textContent = message;
  document.body.appendChild(pop);

  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 6;
  const maxLeft = window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 8;
  const left = Math.min(rect.left + window.scrollX, Math.max(8, maxLeft));
  pop.style.top = `${top}px`;
  pop.style.left = `${left}px`;

  pop.querySelector('[data-action="cancel"]').addEventListener('click', closeCurrentPopover);
  pop.querySelector('[data-action="confirm"]').addEventListener('click', () => {
    closeCurrentPopover();
    onConfirm();
  });

  currentPopover = pop;
  currentOutsideHandler = (e) => {
    if (!pop.contains(e.target) && e.target !== anchorEl) {
      closeCurrentPopover();
    }
  };
  // Deferred so the click that opened the popover doesn't immediately close it.
  setTimeout(() => document.addEventListener('click', currentOutsideHandler, true), 0);
}

/**
 * Swaps a display element for a text input in place, committing the new
 * value on Enter/blur and reverting on Escape.
 */
export function startInlineEdit(displayEl, { value, onCommit }) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'inline-edit-input';
  input.value = value;
  input.draggable = false;
  displayEl.replaceWith(input);
  input.focus();
  input.select();

  let settled = false;
  const commit = () => {
    if (settled) return;
    settled = true;
    const newValue = input.value.trim();
    if (newValue && newValue !== value) {
      onCommit(newValue);
    }
  };
  const cancel = () => {
    if (settled) return;
    settled = true;
    input.replaceWith(displayEl);
  };

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  });
}

/**
 * Reusable "+ 追加" affordance that expands into an inline create form.
 * Used for board / list / card creation.
 */
export function createInlineCreateAffordance({ buttonLabel, placeholder, onSubmit, variant = 'default' }) {
  const wrapper = document.createElement('div');
  wrapper.className = `inline-create inline-create-${variant}`;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'create-affordance';
  btn.textContent = buttonLabel;

  const form = document.createElement('form');
  form.className = 'inline-create-form hidden';
  form.innerHTML = `
    <input type="text" name="value" placeholder="${escapeHtml(placeholder)}" autocomplete="off" />
    <p class="field-error hidden">入力してください</p>
    <div class="inline-create-actions">
      <button type="submit" class="btn btn-primary btn-sm">作成</button>
      <button type="button" class="btn btn-ghost btn-sm" data-action="cancel">キャンセル</button>
    </div>
  `;

  const showForm = () => {
    btn.classList.add('hidden');
    form.classList.remove('hidden');
    form.querySelector('input').focus();
  };
  const hideForm = () => {
    form.reset();
    form.querySelector('.field-error').classList.add('hidden');
    form.classList.add('hidden');
    btn.classList.remove('hidden');
  };

  btn.addEventListener('click', showForm);
  form.querySelector('[data-action="cancel"]').addEventListener('click', hideForm);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[name="value"]');
    const value = input.value.trim();
    const error = form.querySelector('.field-error');
    if (!value) {
      error.classList.remove('hidden');
      return;
    }
    error.classList.add('hidden');
    onSubmit(value);
  });

  wrapper.appendChild(btn);
  wrapper.appendChild(form);
  return wrapper;
}
