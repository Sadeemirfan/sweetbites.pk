"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Drag-to-reorder for categories and products (§12).
 *
 * Every row also carries up/down buttons. Dragging a list on a phone
 * fights the page scroll, and the actual user is holding the phone one-
 * handed in a kitchen - so the buttons are the reliable path and the
 * drag handle is the nicety, not the other way round.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (ids: string[]) => void;
  renderItem: (item: T) => React.ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next.map((item) => item.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    if (from !== -1 && to !== -1) move(from, to);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              id={item.id}
              onUp={() => move(index, index - 1)}
              onDown={() => move(index, index + 1)}
              isFirst={index === 0}
              isLast={index === items.length - 1}
            >
              {renderItem(item)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  children,
  onUp,
  onDown,
  isFirst,
  isLast,
}: {
  id: string;
  children: React.ReactNode;
  onUp: () => void;
  onDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-stretch gap-2 rounded-md border border-cream-200 bg-cream-50",
        isDragging && "z-10 shadow-cream"
      )}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        aria-label="Drag to reorder"
        className="flex w-8 shrink-0 cursor-grab touch-none items-center justify-center text-ink/35 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1 py-2">{children}</div>

      <div className="flex shrink-0 flex-col justify-center gap-0.5 pr-1">
        <button
          type="button"
          onClick={onUp}
          disabled={isFirst}
          aria-label="Move up"
          className="flex h-8 w-8 items-center justify-center rounded-sm text-ink/55 disabled:opacity-25"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDown}
          disabled={isLast}
          aria-label="Move down"
          className="flex h-8 w-8 items-center justify-center rounded-sm text-ink/55 disabled:opacity-25"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
