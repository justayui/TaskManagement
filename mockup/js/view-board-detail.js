import {
  getBoard,
  getLists,
  getCards,
  createList,
  renameList,
  deleteList,
  reorderLists,
  createCard,
  deleteCard,
  moveCard,
} from './store.js';
import { navigateToBoards } from './router.js';
import { openCardModal } from './card-modal.js';
import { startInlineEdit, confirmPopover, createInlineCreateAffordance } from './ui-helpers.js';

const listsRow = document.getElementById('lists-row');
const breadcrumb = document.getElementById('breadcrumb');

let draggedListId = null;
let draggedCardId = null;

export function renderBoardDetail(boardId) {
  const board = getBoard(boardId);
  if (!board) {
    navigateToBoards();
    return;
  }

  renderBreadcrumb(board);

  listsRow.innerHTML = '';
  getLists(boardId).forEach((list) => {
    listsRow.appendChild(renderListColumn(list, boardId));
  });
  listsRow.appendChild(renderAddListAffordance(boardId));

  listsRow.ondragover = (e) => {
    if (draggedListId == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  listsRow.ondrop = (e) => {
    if (draggedListId == null) return;
    e.preventDefault();
    const index = computeListDropIndex(listsRow, e.clientX);
    const orderedIds = getLists(boardId)
      .filter((l) => l.id !== draggedListId)
      .map((l) => l.id);
    orderedIds.splice(index, 0, draggedListId);
    reorderLists(boardId, orderedIds);
    renderBoardDetail(boardId);
  };
}

function renderBreadcrumb(board) {
  breadcrumb.innerHTML = '';

  const backLink = document.createElement('a');
  backLink.href = '#/boards';
  backLink.className = 'breadcrumb-link';
  backLink.textContent = 'ボード一覧';

  const sep = document.createElement('span');
  sep.className = 'breadcrumb-sep';
  sep.textContent = '/';

  const current = document.createElement('span');
  current.className = 'breadcrumb-current';
  current.textContent = board.name;

  breadcrumb.appendChild(backLink);
  breadcrumb.appendChild(sep);
  breadcrumb.appendChild(current);
}

function computeListDropIndex(container, clientX) {
  const colEls = [...container.querySelectorAll('.list-column:not(.dragging)')];
  for (let i = 0; i < colEls.length; i++) {
    const rect = colEls[i].getBoundingClientRect();
    if (clientX < rect.left + rect.width / 2) return i;
  }
  return colEls.length;
}

function computeCardDropIndex(container, clientY) {
  const cardEls = [...container.querySelectorAll('.card:not(.dragging)')];
  for (let i = 0; i < cardEls.length; i++) {
    const rect = cardEls[i].getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) return i;
  }
  return cardEls.length;
}

function renderListColumn(list, boardId) {
  const col = document.createElement('div');
  col.className = 'list-column';
  col.draggable = true;
  col.dataset.listId = list.id;

  col.addEventListener('dragstart', (e) => {
    draggedListId = list.id;
    col.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  col.addEventListener('dragend', () => {
    col.classList.remove('dragging');
    draggedListId = null;
  });

  col.appendChild(renderListHeader(list, boardId));

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'list-cards';
  cardsContainer.dataset.listId = list.id;

  getCards(list.id).forEach((card) => {
    cardsContainer.appendChild(renderCardTile(card, boardId));
  });

  cardsContainer.addEventListener('dragover', (e) => {
    if (draggedCardId == null) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    cardsContainer.classList.add('drag-over');
  });
  cardsContainer.addEventListener('dragleave', (e) => {
    if (!cardsContainer.contains(e.relatedTarget)) {
      cardsContainer.classList.remove('drag-over');
    }
  });
  cardsContainer.addEventListener('drop', (e) => {
    if (draggedCardId == null) return;
    e.preventDefault();
    e.stopPropagation();
    cardsContainer.classList.remove('drag-over');
    const index = computeCardDropIndex(cardsContainer, e.clientY);
    moveCard(draggedCardId, list.id, index);
    renderBoardDetail(boardId);
  });

  col.appendChild(cardsContainer);

  const addCard = createInlineCreateAffordance({
    buttonLabel: '＋ カードを追加',
    placeholder: 'カードのタイトルを入力',
    variant: 'card',
    onSubmit: (title) => {
      createCard(list.id, title);
      renderBoardDetail(boardId);
    },
  });
  col.appendChild(addCard);

  return col;
}

function renderListHeader(list, boardId) {
  const header = document.createElement('div');
  header.className = 'list-header';

  const nameEl = document.createElement('span');
  nameEl.className = 'list-name';
  nameEl.title = 'クリックして名前を変更';
  nameEl.textContent = list.name;
  nameEl.addEventListener('click', () => {
    startInlineEdit(nameEl, {
      value: list.name,
      onCommit: (newName) => {
        renameList(list.id, newName);
        renderBoardDetail(boardId);
      },
    });
  });

  const countEl = document.createElement('span');
  countEl.className = 'list-count';
  countEl.textContent = String(getCards(list.id).length);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'icon-btn danger';
  deleteBtn.setAttribute('aria-label', 'リストを削除');
  deleteBtn.textContent = '🗑';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    confirmPopover(
      deleteBtn,
      `「${list.name}」を削除しますか？配下のカードもすべて削除されます。`,
      () => {
        deleteList(list.id);
        renderBoardDetail(boardId);
      }
    );
  });

  header.appendChild(nameEl);
  header.appendChild(countEl);
  header.appendChild(deleteBtn);
  return header;
}

function renderCardTile(card, boardId) {
  const el = document.createElement('div');
  el.className = 'card';
  el.draggable = true;
  el.dataset.cardId = card.id;
  el.tabIndex = 0;

  const title = document.createElement('p');
  title.className = 'card-title';
  title.textContent = card.title;
  el.appendChild(title);

  if (card.description) {
    const desc = document.createElement('p');
    desc.className = 'card-description-preview';
    desc.textContent = card.description;
    el.appendChild(desc);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'icon-btn danger card-delete';
  deleteBtn.setAttribute('aria-label', 'カードを削除');
  deleteBtn.textContent = '🗑';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    confirmPopover(deleteBtn, 'このカードを削除しますか？', () => {
      deleteCard(card.id);
      renderBoardDetail(boardId);
    });
  });
  el.appendChild(deleteBtn);

  el.addEventListener('click', () => openCardModal(card.id));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') openCardModal(card.id);
  });

  el.addEventListener('dragstart', (e) => {
    e.stopPropagation();
    draggedCardId = card.id;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  el.addEventListener('dragend', (e) => {
    e.stopPropagation();
    el.classList.remove('dragging');
    draggedCardId = null;
  });

  return el;
}

function renderAddListAffordance(boardId) {
  const affordance = createInlineCreateAffordance({
    buttonLabel: '＋ 新規リスト作成',
    placeholder: 'リスト名を入力',
    variant: 'list',
    onSubmit: (name) => {
      createList(boardId, name);
      renderBoardDetail(boardId);
    },
  });
  affordance.classList.add('add-list-column');
  return affordance;
}
