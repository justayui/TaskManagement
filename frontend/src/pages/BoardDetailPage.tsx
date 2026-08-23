import { useEffect, useState } from 'react';
import { fetchBoard, fetchBoardLists, fetchCards } from '../api';
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
          {sortedLists.map((list) => {
            const listCards = cardsByListId.get(list.id) ?? [];
            return (
              <div key={list.id} className="flex-none w-[272px] bg-gray-200 rounded-lg flex flex-col">
                <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
                  <span className="text-sm font-semibold flex-1 truncate">{list.name}</span>
                  <span className="text-xs text-gray-500 bg-black/5 rounded-full px-2 py-0.5">
                    {listCards.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2 px-2 pb-2 overflow-y-auto">
                  {listCards.map((card) => (
                    <div key={card.id} className="bg-white rounded-md shadow-sm px-2.5 py-2">
                      <p className="text-sm font-medium whitespace-pre-wrap break-words">{card.title}</p>
                      {card.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
