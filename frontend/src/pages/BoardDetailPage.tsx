import { useEffect, useState } from 'react';
import { fetchBoard, fetchBoardLists, fetchCards } from '../api';
import ListColumn from '../components/ListColumn';
import type { Board, Card, TaskList } from '../types';

interface Props {
  boardId: string;
  onBack: () => void;
}

function groupCardsByListId(cards: Card[]): Map<string, Card[]> {
  const map = new Map<string, Card[]>();
  for (const card of cards) {
    const list = map.get(card.listId) ?? [];
    list.push(card);
    map.set(card.listId, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.order - b.order);
  }
  return map;
}

export default function BoardDetailPage({ boardId, onBack }: Props) {
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchBoard(boardId), fetchBoardLists(boardId), fetchCards()])
      .then(([boardRes, listsRes, cardsRes]) => {
        setBoard(boardRes);
        setLists(listsRes);
        setCards(cardsRes);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [boardId]);

  const cardsByListId = groupCardsByListId(cards);
  const sortedLists = [...lists].sort((a, b) => a.order - b.order);

  const handleCardCreated = (card: Card) => {
    setCards((prev) => [...prev, card]);
  };

  return (
    <main className="px-6 py-5">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <button type="button" className="text-blue-600 hover:underline" onClick={onBack}>
          ボード一覧
        </button>
        {board && (
          <>
            <span>/</span>
            <span className="font-semibold text-gray-900">{board.name}</span>
          </>
        )}
      </nav>

      {loading && <p className="text-gray-500">読み込み中...</p>}
      {error && <p className="text-red-600">ボードの取得に失敗しました: {error}</p>}

      {!loading && !error && (
        <div className="flex items-start gap-3 overflow-x-auto pb-3">
          {sortedLists.map((list) => (
            <ListColumn
              key={list.id}
              list={list}
              cards={cardsByListId.get(list.id) ?? []}
              onCardCreated={handleCardCreated}
            />
          ))}
        </div>
      )}
    </main>
  );
}
