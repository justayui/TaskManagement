import { useState, type FormEvent } from 'react';
import { createCard } from '../api';
import type { Card, TaskList } from '../types';

interface Props {
  list: TaskList;
  cards: Card[];
  onCardCreated: (card: Card) => void;
}

export default function ListColumn({ list, cards, onCardCreated }: Props) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createCard({ listId: list.id, title: trimmed });
      onCardCreated(created);
      setTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カードの追加に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-none w-[272px] bg-gray-200 rounded-lg flex flex-col">
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
        <span className="text-sm font-semibold flex-1 truncate">{list.name}</span>
        <span className="text-xs text-gray-500 bg-black/5 rounded-full px-2 py-0.5">
          {cards.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 px-2 pb-2 overflow-y-auto">
        {cards.map((card) => (
          <div key={card.id} className="bg-white rounded-md shadow-sm px-2.5 py-2">
            <p className="text-sm font-medium whitespace-pre-wrap break-words">{card.title}</p>
            {card.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 px-2 pb-2.5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="カードのタイトルを入力"
          disabled={submitting}
          className="text-sm rounded-md border border-gray-300 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="text-sm text-left text-gray-600 hover:bg-black/5 rounded-md px-2.5 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + カードを追加
        </button>
      </form>
    </div>
  );
}
