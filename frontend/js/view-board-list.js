import { fetchBoards } from './api.js';
import { navigateToBoard } from './router.js';

const container = document.getElementById('board-grid');

export async function renderBoardList() {
  container.innerHTML = '<p class="loading">読み込み中...</p>';

  let boards;
  try {
    boards = await fetchBoards();
  } catch (err) {
    container.innerHTML = `<p class="error">ボード一覧の取得に失敗しました: ${err.message}</p>`;
    return;
  }

  container.innerHTML = '';
  if (boards.length === 0) {
    container.innerHTML = '<p class="empty">ボードがありません</p>';
    return;
  }

  boards.forEach((board) => {
    container.appendChild(renderBoardTile(board));
  });
}

function renderBoardTile(board) {
  const tile = document.createElement('div');
  tile.className = 'board-tile';

  const nameEl = document.createElement('span');
  nameEl.className = 'board-tile-name';
  nameEl.textContent = board.name;

  const openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.className = 'board-tile-open';
  openBtn.textContent = 'ボードを開く →';
  openBtn.addEventListener('click', () => navigateToBoard(board.id));

  tile.appendChild(nameEl);
  tile.appendChild(openBtn);
  return tile;
}
