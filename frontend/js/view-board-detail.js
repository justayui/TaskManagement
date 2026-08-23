import { fetchBoard, fetchBoardLists, fetchCards } from './api.js';

const listsRow = document.getElementById('lists-row');
const breadcrumb = document.getElementById('breadcrumb');

export async function renderBoardDetail(boardId) {
  listsRow.innerHTML = '<p class="loading">読み込み中...</p>';
  breadcrumb.innerHTML = '';

  let board;
  let lists;
  let cards;
  try {
    [board, lists, cards] = await Promise.all([
      fetchBoard(boardId),
      fetchBoardLists(boardId),
      fetchCards(),
    ]);
  } catch (err) {
    listsRow.innerHTML = `<p class="error">ボードの取得に失敗しました: ${err.message}</p>`;
    return;
  }

  renderBreadcrumb(board);

  const cardsByListId = groupCardsByListId(cards);

  listsRow.innerHTML = '';
  lists
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((list) => {
      listsRow.appendChild(renderListColumn(list, cardsByListId.get(list.id) || []));
    });
}

function groupCardsByListId(cards) {
  const map = new Map();
  cards.forEach((card) => {
    if (!map.has(card.listId)) {
      map.set(card.listId, []);
    }
    map.get(card.listId).push(card);
  });
  map.forEach((cardsInList) => cardsInList.sort((a, b) => a.order - b.order));
  return map;
}

function renderBreadcrumb(board) {
  const backLink = document.createElement('a');
  backLink.href = '#/boards';
  backLink.className = 'breadcrumb-link';
  backLink.textContent = 'ボード一覧';

  const sep = document.createElement('span');
  sep.textContent = '/';

  const current = document.createElement('span');
  current.className = 'breadcrumb-current';
  current.textContent = board.name;

  breadcrumb.appendChild(backLink);
  breadcrumb.appendChild(sep);
  breadcrumb.appendChild(current);
}

function renderListColumn(list, cards) {
  const col = document.createElement('div');
  col.className = 'list-column';

  const header = document.createElement('div');
  header.className = 'list-header';

  const nameEl = document.createElement('span');
  nameEl.className = 'list-name';
  nameEl.textContent = list.name;

  const countEl = document.createElement('span');
  countEl.className = 'list-count';
  countEl.textContent = String(cards.length);

  header.appendChild(nameEl);
  header.appendChild(countEl);
  col.appendChild(header);

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'list-cards';
  cards.forEach((card) => {
    cardsContainer.appendChild(renderCardTile(card));
  });
  col.appendChild(cardsContainer);

  return col;
}

function renderCardTile(card) {
  const el = document.createElement('div');
  el.className = 'card';

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

  return el;
}
