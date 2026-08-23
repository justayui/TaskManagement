import { useEffect, useRef, useState, type FormEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateCard } from '../api';
import type { Card, Priority } from '../types';

interface Props {
  card: Card;
  disabled?: boolean;
  onCardUpdated: (card: Card) => void;
}

const PRIORITY_STYLES: Record<string, { label: string; className: string }> = {
  HIGH: { label: '優先度: 高', className: 'bg-red-100 text-red-700' },
  MEDIUM: { label: '優先度: 中', className: 'bg-amber-100 text-amber-700' },
  LOW: { label: '優先度: 低', className: 'bg-slate-100 text-slate-600' },
};

const DUE_SOON_THRESHOLD_DAYS = 2;

function daysUntil(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  return Math.round((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

function dueDateBadgeClassName(dueDate: string): string {
  const diff = daysUntil(dueDate);
  if (diff < 0) {
    return 'bg-red-100 text-red-700';
  }
  if (diff <= DUE_SOON_THRESHOLD_DAYS) {
    return 'bg-amber-100 text-amber-700';
  }
  return 'bg-gray-100 text-gray-600';
}

export default function CardItem({ card, disabled = false, onCardUpdated }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? '');
  const [priority, setPriority] = useState<Priority | ''>(card.priority ?? '');
  const [dueDate, setDueDate] = useState(card.dueDate ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityStyle = card.priority ? PRIORITY_STYLES[card.priority] : null;

  const openEditor = (e: ReactMouseEvent) => {
    e.stopPropagation();
    setTitle(card.title);
    setDescription(card.description ?? '');
    setPriority(card.priority ?? '');
    setDueDate(card.dueDate ?? '');
    setError(null);
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setError(null);
  };

  useEffect(() => {
    if (!isEditing) {
      return;
    }
    titleInputRef.current?.focus();

    const handlePointerDown = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        closeEditor();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeEditor();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateCard(card.id, {
        title: trimmed,
        description: description.trim() || null,
        priority: priority || null,
        dueDate: dueDate || null,
      });
      onCardUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カードの更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditing ? {} : attributes)}
      {...(isEditing ? {} : listeners)}
      className={`bg-white rounded-md shadow-sm px-2.5 py-2 ${isEditing ? '' : 'touch-none'} ${
        isEditing || disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {isEditing ? (
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-1.5">
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="カードのタイトルを入力"
            disabled={submitting}
            className="text-sm rounded-md border border-gray-300 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="説明(任意)"
            disabled={submitting}
            rows={2}
            className="text-sm rounded-md border border-gray-300 bg-white px-2.5 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="text-sm rounded-md bg-blue-600 text-white px-2.5 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存
            </button>
            <button
              type="button"
              onClick={closeEditor}
              className="text-sm text-gray-500 hover:bg-black/5 rounded-md px-2 py-1"
            >
              閉じる
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-medium whitespace-pre-wrap break-words flex-1">{card.title}</p>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={openEditor}
              className="text-xs text-gray-400 hover:text-gray-700 shrink-0"
            >
              編集
            </button>
          </div>
          {card.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
          )}
          {(priorityStyle || card.dueDate) && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {priorityStyle && (
                <span className={`text-[11px] rounded px-1.5 py-0.5 ${priorityStyle.className}`}>
                  {priorityStyle.label}
                </span>
              )}
              {card.dueDate && (
                <span className={`text-[11px] rounded px-1.5 py-0.5 ${dueDateBadgeClassName(card.dueDate)}`}>
                  期限: {card.dueDate}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
