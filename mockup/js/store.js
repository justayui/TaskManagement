const STORAGE_KEY = 'kanban-mockup-state';

let state = null;

function genId() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function seedData() {
  const now = nowIso();
  const board1 = { id: genId(), name: 'Webサイトリニューアル', createdAt: now, updatedAt: now };
  const board2 = { id: genId(), name: '個人タスク', createdAt: now, updatedAt: now };

  const makeLists = (board) =>
    ['未着手', '進行中', '完了'].map((name, i) => ({
      id: genId(),
      boardId: board.id,
      name,
      order: i,
      createdAt: now,
      updatedAt: now,
    }));

  const b1Lists = makeLists(board1);
  const b2Lists = makeLists(board2);

  const cards = [];
  const addCard = (list, title, description) => {
    const order = list.__count = (list.__count ?? 0) + 1;
    cards.push({
      id: genId(),
      listId: list.id,
      title,
      description,
      order: order - 1,
      createdAt: now,
      updatedAt: now,
    });
  };

  addCard(b1Lists[0], 'トップページのワイヤーフレーム作成', 'デザイナーと共有し、レビューを受ける');
  addCard(b1Lists[0], '競合サイトの調査', '3〜5社のサイト構成を比較する');
  addCard(b1Lists[1], 'デザインカンプの作成', 'Figmaでトップ〜下層まで一式作成');
  addCard(b1Lists[2], 'キックオフミーティング', '要件のすり合わせ完了');

  addCard(b2Lists[0], '本を返却する', '');
  addCard(b2Lists[1], '確定申告の書類準備', '');

  // clean up temporary counters
  [...b1Lists, ...b2Lists].forEach((l) => delete l.__count);

  return {
    boards: [board1, board2],
    lists: [...b1Lists, ...b2Lists],
    cards,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.boards) && Array.isArray(parsed.lists) && Array.isArray(parsed.cards)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load state from localStorage, reseeding.', e);
  }
  return seedData();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function initStore() {
  state = loadState();
  saveState();
}

// --- Read ---
export function getBoards() {
  return [...state.boards].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getBoard(boardId) {
  return state.boards.find((b) => b.id === boardId) || null;
}

export function getLists(boardId) {
  return state.lists.filter((l) => l.boardId === boardId).sort((a, b) => a.order - b.order);
}

export function getCards(listId) {
  return state.cards.filter((c) => c.listId === listId).sort((a, b) => a.order - b.order);
}

export function getCard(cardId) {
  return state.cards.find((c) => c.id === cardId) || null;
}

// --- internal helpers ---
function reindex(items) {
  items.forEach((item, i) => {
    item.order = i;
  });
}

function touch(entity) {
  entity.updatedAt = nowIso();
}

// --- Board CRUD ---
export function createBoard(name) {
  const now = nowIso();
  const board = { id: genId(), name, createdAt: now, updatedAt: now };
  state.boards.push(board);
  saveState();
  return board;
}

export function renameBoard(boardId, name) {
  const board = getBoard(boardId);
  if (!board) return;
  board.name = name;
  touch(board);
  saveState();
}

export function deleteBoard(boardId) {
  const listIds = state.lists.filter((l) => l.boardId === boardId).map((l) => l.id);
  state.cards = state.cards.filter((c) => !listIds.includes(c.listId));
  state.lists = state.lists.filter((l) => l.boardId !== boardId);
  state.boards = state.boards.filter((b) => b.id !== boardId);
  saveState();
}

// --- List CRUD ---
export function createList(boardId, name) {
  const now = nowIso();
  const order = getLists(boardId).length;
  const list = { id: genId(), boardId, name, order, createdAt: now, updatedAt: now };
  state.lists.push(list);
  saveState();
  return list;
}

export function renameList(listId, name) {
  const list = state.lists.find((l) => l.id === listId);
  if (!list) return;
  list.name = name;
  touch(list);
  saveState();
}

export function deleteList(listId) {
  const list = state.lists.find((l) => l.id === listId);
  if (!list) return;
  state.cards = state.cards.filter((c) => c.listId !== listId);
  state.lists = state.lists.filter((l) => l.id !== listId);
  reindex(getLists(list.boardId));
  saveState();
}

export function reorderLists(boardId, orderedListIds) {
  orderedListIds.forEach((id, i) => {
    const list = state.lists.find((l) => l.id === id);
    if (list) {
      list.order = i;
      touch(list);
    }
  });
  saveState();
}

// --- Card CRUD ---
export function createCard(listId, title) {
  const now = nowIso();
  const order = getCards(listId).length;
  const card = { id: genId(), listId, title, description: '', order, createdAt: now, updatedAt: now };
  state.cards.push(card);
  saveState();
  return card;
}

export function updateCard(cardId, { title, description }) {
  const card = getCard(cardId);
  if (!card) return;
  if (title !== undefined) card.title = title;
  if (description !== undefined) card.description = description;
  touch(card);
  saveState();
}

export function deleteCard(cardId) {
  const card = getCard(cardId);
  if (!card) return;
  state.cards = state.cards.filter((c) => c.id !== cardId);
  reindex(getCards(card.listId));
  saveState();
}

/**
 * Moves a card to targetListId, inserting it at targetIndex among the
 * *other* cards already in that list. No-op if dropped back at the same
 * position within the same list (UC-06).
 */
export function moveCard(cardId, targetListId, targetIndex) {
  const card = getCard(cardId);
  if (!card) return;
  const sourceListId = card.listId;

  const targetSiblings = getCards(targetListId).filter((c) => c.id !== cardId);
  const clampedIndex = Math.max(0, Math.min(targetIndex, targetSiblings.length));

  if (sourceListId === targetListId && clampedIndex === card.order) {
    return; // dropped at the same position: no-op
  }

  if (sourceListId !== targetListId) {
    const sourceSiblings = getCards(sourceListId).filter((c) => c.id !== cardId);
    reindex(sourceSiblings);
    card.listId = targetListId;
  }

  targetSiblings.splice(clampedIndex, 0, card);
  reindex(targetSiblings);
  touch(card);
  saveState();
}
