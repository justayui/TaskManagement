import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { fetchBoard, fetchBoardLists, fetchCards, moveCard } from '../api';
import CardItem from '../components/CardItem';
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

function renumbered(cards: Card[]): Card[] {
  return cards.map((card, index) => ({ ...card, order: index }));
}

export default function BoardDetailPage({ boardId, onBack }: Props) {
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchBoard(boardId), fetchBoardLists(boardId), fetchCards()])
      .then(([boardRes, listsRes, cardsRes]) => {
        setBoard(boardRes);
        setLists(listsRes);
        setCards(cardsRes);
      })
      .catch((err: Error) => setError(`ボードの取得に失敗しました: ${err.message}`))
      .finally(() => setLoading(false));
  }, [boardId]);

  const cardsByListId = groupCardsByListId(cards);
  const sortedLists = [...lists].sort((a, b) => a.order - b.order);

  const handleCardCreated = (card: Card) => {
    setCards((prev) => [...prev, card]);
  };

  const isListId = (id: string) => lists.some((list) => list.id === id);

  const containerIdFor = (id: string): string | undefined =>
    isListId(id) ? id : cards.find((card) => card.id === id)?.listId;

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id);
    setActiveCard(card ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const activeId = String(active.id);
    const overId = String(over.id);
    const sourceListId = containerIdFor(activeId);
    const targetListId = containerIdFor(overId);
    if (!sourceListId || !targetListId || sourceListId === targetListId) {
      return;
    }

    setCards((prev) => {
      const movingCard = prev.find((c) => c.id === activeId);
      if (!movingCard) {
        return prev;
      }
      const destCards = prev
        .filter((c) => c.listId === targetListId && c.id !== activeId)
        .sort((a, b) => a.order - b.order);
      const overIndex = destCards.findIndex((c) => c.id === overId);
      const insertAt = overIndex >= 0 ? overIndex : destCards.length;
      destCards.splice(insertAt, 0, { ...movingCard, listId: targetListId });

      const others = prev.filter((c) => c.listId !== targetListId && c.id !== activeId);
      return [...others, ...renumbered(destCards)];
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) {
      return;
    }
    const activeId = String(active.id);
    const overId = String(over.id);
    const listId = containerIdFor(overId);
    if (!listId) {
      return;
    }

    const listCards = cards.filter((c) => c.listId === listId).sort((a, b) => a.order - b.order);
    const oldIndex = listCards.findIndex((c) => c.id === activeId);
    if (oldIndex === -1) {
      return;
    }
    const overIndex = listCards.findIndex((c) => c.id === overId);
    const targetIndex = overIndex >= 0 ? overIndex : listCards.length - 1;
    const reordered = renumbered(arrayMove(listCards, oldIndex, targetIndex));
    const finalOrder = reordered.find((c) => c.id === activeId)?.order ?? targetIndex;

    setCards((prev) => {
      const others = prev.filter((c) => c.listId !== listId);
      return [...others, ...reordered];
    });

    moveCard(activeId, { listId, order: finalOrder })
      .then((touched) => {
        setCards((prev) => {
          const touchedById = new Map(touched.map((c) => [c.id, c]));
          return prev.map((c) => touchedById.get(c.id) ?? c);
        });
      })
      .catch(() => {
        setError('カードの移動に失敗しました。最新の状態を再取得します。');
        Promise.all([fetchBoardLists(boardId), fetchCards()])
          .then(([listsRes, cardsRes]) => {
            setLists(listsRes);
            setCards(cardsRes);
            setError(null);
          })
          .catch((err: Error) => setError(err.message));
      });
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
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
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
          <DragOverlay>{activeCard && <CardItem card={activeCard} />}</DragOverlay>
        </DndContext>
      )}
    </main>
  );
}
