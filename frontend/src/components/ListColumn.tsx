import { useState, type FormEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createCard } from '../api';
import CardItem from './CardItem';
import type { Card, Priority, TaskList } from '../types';

interface Props {
  list: TaskList;
  cards: Card[];
  onCardCreated: (card: Card) => void;
}

type SortMode = 'manual' | 'priority' | 'dueDate';

const PRIORITY_RANK: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function sortCards(cards: Card[], mode: SortMode): Card[] {
  if (mode === 'manual') {
    return cards;
  }
  if (mode === 'priority') {
    return [...cards].sort((a, b) => {
      const rankA = a.priority ? PRIORITY_RANK[a.priority] : 3;
      const rankB = b.priority ? PRIORITY_RANK[b.priority] : 3;
      return rankA - rankB;
    });
  }
  return [...cards].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0;
    }
    if (a.dueDate) {
      return -1;
    }
    if (b.dueDate) {
      return 1;
    }
    return 0;
  });
}

export default function ListColumn({ list, cards, onCardCreated }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('manual');
  const dragDisabled = sortMode !== 'manual';
  const { setNodeRef } = useDroppable({ id: list.id, disabled: dragDisabled });
  const displayCards = sortCards(cards, sortMode);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createCard({
        listId: list.id,
        title: trimmed,
        priority: priority || null,
        dueDate: dueDate || null,
      });
      onCardCreated(created);
      setTitle('');
      setPriority('');
      setDueDate('');
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
      <div className="px-3 pb-1.5">
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="text-xs w-full rounded-md border border-gray-300 bg-white px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="manual">並び替え: 手動</option>
          <option value="priority">並び替え: 優先度順</option>
          <option value="dueDate">並び替え: 期限順</option>
        </select>
      </div>
      <div ref={setNodeRef} className="flex flex-col gap-2 px-2 pb-2 overflow-y-auto min-h-[8px]">
        <SortableContext items={displayCards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {displayCards.map((card) => (
            <CardItem key={card.id} card={card} disabled={dragDisabled} />
          ))}
        </SortableContext>
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
        <div className="flex gap-1.5">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | '')}
            disabled={submitting}
            className="text-xs flex-1 rounded-md border border-gray-300 bg-white px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">優先度: 未設定</option>
            <option value="HIGH">優先度: 高</option>
            <option value="MEDIUM">優先度: 中</option>
            <option value="LOW">優先度: 低</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={submitting}
            className="text-xs flex-1 rounded-md border border-gray-300 bg-white px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
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
