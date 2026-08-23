import type { Board, Card, TaskList } from './types';

const API_BASE_URL = 'http://localhost:8080';

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

export function fetchBoards(): Promise<Board[]> {
  return apiGet<Board[]>('/api/boards');
}

export function fetchBoard(boardId: string): Promise<Board> {
  return apiGet<Board>(`/api/boards/${boardId}`);
}

export function fetchBoardLists(boardId: string): Promise<TaskList[]> {
  return apiGet<TaskList[]>(`/api/boards/${boardId}/lists`);
}

export function fetchCards(): Promise<Card[]> {
  return apiGet<Card[]>('/api/cards');
}

export function createCard(input: { listId: string; title: string; description?: string | null }): Promise<Card> {
  return apiPost<Card>('/api/cards', input);
}

export function moveCard(cardId: string, input: { listId: string; order: number }): Promise<Card[]> {
  return apiPatch<Card[]>(`/api/cards/${cardId}/position`, input);
}
