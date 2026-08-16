import { getBoards, createBoard, renameBoard, deleteBoard } from './store.js';
import { navigateToBoard } from './router.js';
import { startInlineEdit, confirmPopover, createInlineCreateAffordance } from './ui-helpers.js';

const container = document.getElementById('board-grid');

export function renderBoardList() {
  const boards = getBoards();
  container.innerHTML = '';

  boards.forEach((board) => {
    container.appendChild(renderBoardTile(board));
  });

  container.appendChild(renderCreateBoardTile());
}

function renderBoardTile(board) {
  const tile = document.createElement('div');
  tile.className = 'board-tile';

  const header = document.createElement('div');
  header.className = 'board-tile-header';

  const nameEl = document.createElement('span');
  nameEl.className = 'board-tile-name';
  nameEl.textContent = board.name;
  nameEl.title = 'クリックして名前を変更';
  nameEl.addEventListener('click', (e) => {
    e.stopPropagation();
    startInlineEdit(nameEl, {
      value: board.name,
      onCommit: (newName) => {
        renameBoard(board.id, newName);
        renderBoardList();
      },
    });
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'icon-btn danger';
  deleteBtn.setAttribute('aria-label', 'ボードを削除');
  deleteBtn.textContent = '🗑';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    confirmPopover(
      deleteBtn,
      `「${board.name}」を削除しますか？配下のリスト・カードもすべて削除されます。`,
      () => {
        deleteBoard(board.id);
        renderBoardList();
      }
    );
  });

  header.appendChild(nameEl);
  header.appendChild(deleteBtn);

  const openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.className = 'board-tile-open';
  openBtn.textContent = 'ボードを開く →';
  openBtn.addEventListener('click', () => navigateToBoard(board.id));

  tile.appendChild(header);
  tile.appendChild(openBtn);
  return tile;
}

function renderCreateBoardTile() {
  const affordance = createInlineCreateAffordance({
    buttonLabel: '＋ 新規ボード作成',
    placeholder: 'ボード名を入力',
    variant: 'board',
    onSubmit: (name) => {
      createBoard(name);
      renderBoardList();
    },
  });
  affordance.classList.add('board-tile', 'board-tile-create');
  return affordance;
}
