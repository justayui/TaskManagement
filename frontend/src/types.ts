export interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  boardId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}
