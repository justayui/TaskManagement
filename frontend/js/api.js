const API_BASE_URL = 'http://localhost:8080';

async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${path}`);
  }
  return res.json();
}

export function fetchBoards() {
  return apiGet('/api/boards');
}

export function fetchBoard(boardId) {
  return apiGet(`/api/boards/${boardId}`);
}

export function fetchBoardLists(boardId) {
  return apiGet(`/api/boards/${boardId}/lists`);
}

export function fetchCards() {
  return apiGet('/api/cards');
}
