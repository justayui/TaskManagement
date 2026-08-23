import { useEffect, useState } from 'react';
import { fetchBoards } from '../api';
import type { Board } from '../types';

interface Props {
  onOpenBoard: (boardId: string) => void;
}

export default function BoardListPage({ onOpenBoard }: Props) {
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBoards()
      .then(setBoards)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold mb-5">ボード一覧</h1>
      {error && <p className="text-red-600">ボード一覧の取得に失敗しました: {error}</p>}
      {!error && boards === null && <p className="text-gray-500">読み込み中...</p>}
      {!error && boards?.length === 0 && <p className="text-gray-500">ボードがありません</p>}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {boards?.map((board) => (
          <div
            key={board.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-3 min-h-24"
          >
            <span className="font-semibold">{board.name}</span>
            <button
              type="button"
              className="self-start text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline mt-auto"
              onClick={() => onOpenBoard(board.id)}
            >
              ボードを開く →
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
