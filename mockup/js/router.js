import { renderBoardList } from './view-board-list.js';
import { renderBoardDetail } from './view-board-detail.js';
import { closeCardModal } from './card-modal.js';

const viewBoardList = document.getElementById('view-board-list');
const viewBoardDetail = document.getElementById('view-board-detail');
const breadcrumb = document.getElementById('breadcrumb');

function showView(name) {
  viewBoardList.classList.toggle('hidden', name !== 'board-list');
  viewBoardDetail.classList.toggle('hidden', name !== 'board-detail');
}

export function navigateToBoards() {
  location.hash = '#/boards';
}

export function navigateToBoard(boardId) {
  location.hash = `#/boards/${boardId}`;
}

export function route() {
  closeCardModal();
  const hash = location.hash || '#/boards';
  const match = hash.match(/^#\/boards\/([^/]+)$/);

  if (match) {
    showView('board-detail');
    renderBoardDetail(match[1]);
  } else {
    showView('board-list');
    breadcrumb.textContent = '';
    renderBoardList();
  }
}

export function initRouter() {
  window.addEventListener('hashchange', route);
  route();
}
