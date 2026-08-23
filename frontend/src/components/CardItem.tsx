import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '../types';

interface Props {
  card: Card;
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

export default function CardItem({ card }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityStyle = card.priority ? PRIORITY_STYLES[card.priority] : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-md shadow-sm px-2.5 py-2 cursor-grab active:cursor-grabbing touch-none"
    >
      <p className="text-sm font-medium whitespace-pre-wrap break-words">{card.title}</p>
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
    </div>
  );
}
