import type { ButtonHTMLAttributes, ReactNode } from "react";
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
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export type DragHandleProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref: (el: HTMLElement | null) => void;
};

interface Props<T extends { id: string }> {
  items: T[];
  onReorder(next: T[]): void;
  layout?: "list" | "grid";
  className?: string;
  renderItem(item: T, handle: DragHandleProps, dragging: boolean): ReactNode;
}

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  layout = "list",
  className,
  renderItem,
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from >= 0 && to >= 0) onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div className={className}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {(handle, dragging) => renderItem(item, handle, dragging)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  children,
}: {
  id: string;
  children(handle: DragHandleProps, dragging: boolean): ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const handle = {
    ref: setActivatorNodeRef,
    ...(attributes as unknown as ButtonHTMLAttributes<HTMLButtonElement>),
    ...(listeners as unknown as ButtonHTMLAttributes<HTMLButtonElement>),
  };
  return (
    <div
      ref={setNodeRef}
      className={`sortable-item${isDragging ? " dragging" : ""}`}
      style={{ transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 5 : undefined }}
    >
      {children(handle, isDragging)}
    </div>
  );
}

export function DragHandle({ handle, label = "Sürükleyerek sırala" }: { handle: DragHandleProps; label?: string }) {
  return (
    <button type="button" className="drag-handle" aria-label={label} title={label} {...handle}>
      <GripVertical size={16} />
    </button>
  );
}
