"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { moveOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/admin/constants";
import { OrderFlags, SourceBadge, StatusDot } from "@/components/admin/AdminBits";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { AdminOrderRow } from "@/lib/admin/queries";

/**
 * §12 - kanban, columns are the seven statuses, drag to move, and every
 * move writes an order_events row (handled in the server action).
 *
 * Two ways to move an order, on purpose. Dragging is the desktop
 * gesture, but the actual user is "a home baker on a phone", and
 * drag-and-drop across seven columns on a 390px screen is a bad
 * interaction - so every card also carries a status menu, which is the
 * two-tap path §12 asks for. The board scrolls horizontally rather than
 * shrinking columns to nothing.
 */
export function OrdersBoard({ orders }: { orders: AdminOrderRow[] }) {
  const [pending, startTransition] = useTransition();
  // Open on the first status that actually has orders, so the board
  // doesn't greet the baker with an empty column.
  const [mobileStatus, setMobileStatus] = useState<string>(
    () =>
      ORDER_STATUSES.find((status) => orders.some((order) => order.status === status.value))
        ?.value ?? "pending"
  );
  const [optimistic, setOptimistic] = useOptimistic(
    orders,
    (current: AdminOrderRow[], move: { id: string; status: string }) =>
      current.map((order) => (order.id === move.id ? { ...order, status: move.status } : order))
  );

  const sensors = useSensors(
    // A small activation distance keeps a tap on the card's link from
    // being swallowed by the drag sensor.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } })
  );

  function move(id: string, status: string) {
    startTransition(async () => {
      setOptimistic({ id, status });
      const result = await moveOrderStatus(id, status);
      if (!result.ok) toast.error(result.message);
      else toast.success(`Moved to ${STATUS_LABELS[status]}`);
    });
  }

  function onDragEnd(event: DragEndEvent) {
    const orderId = String(event.active.id);
    const target = event.over ? String(event.over.id) : null;
    if (!target) return;

    const current = optimistic.find((order) => order.id === orderId);
    if (!current || current.status === target) return;

    move(orderId, target);
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-6 text-sm text-ink/70">
        No orders match these filters.
      </div>
    );
  }

  return (
    <>
      {/*
        Phones get one status at a time, full width. A seven-column board
        at 390px puts each card in a 240px column that has to be scrolled
        to horizontally - the move control ends up off-screen, which is
        the opposite of the two-tap rule in §12.
      */}
      <div className={cn("lg:hidden", pending && "opacity-90")}>
        <div className="-mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 pb-1">
          {ORDER_STATUSES.map((status) => {
            const count = optimistic.filter((order) => order.status === status.value).length;
            return (
              <button
                key={status.value}
                type="button"
                onClick={() => setMobileStatus(status.value)}
                aria-pressed={mobileStatus === status.value}
                className={cn(
                  "flex min-h-11 shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors",
                  mobileStatus === status.value
                    ? "border-rosewood bg-rosewood/10 font-medium text-ink"
                    : "border-cream-200 bg-cream-50 text-ink/70"
                )}
              >
                <StatusDot status={status.value} />
                {status.label}
                <span className="text-xs text-ink/45">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {optimistic.filter((order) => order.status === mobileStatus).length === 0 ? (
            <p className="rounded-md border border-dashed border-cream-200 bg-cream-100/60 p-6 text-sm text-ink/60">
              Nothing in {STATUS_LABELS[mobileStatus]}.
            </p>
          ) : (
            optimistic
              .filter((order) => order.status === mobileStatus)
              .map((order) => <Card key={order.id} order={order} onMove={move} draggable={false} />)
          )}
        </div>
      </div>

      {/* Desktop keeps the real kanban, with drag between columns. */}
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className={cn("hidden gap-3 overflow-x-auto pb-3 lg:flex", pending && "opacity-90")}>
          {ORDER_STATUSES.map((status) => (
            <Column
              key={status.value}
              status={status.value}
              label={status.label}
              orders={optimistic.filter((order) => order.status === status.value)}
              onMove={move}
            />
          ))}
        </div>
      </DndContext>
    </>
  );
}

function Column({
  status,
  label,
  orders,
  onMove,
}: {
  status: string;
  label: string;
  orders: AdminOrderRow[];
  onMove: (id: string, status: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[15rem] shrink-0 flex-col rounded-md border bg-cream-100/70 transition-colors",
        isOver ? "border-rosewood bg-rosewood/5" : "border-cream-200"
      )}
    >
      <header className="flex items-center gap-2 border-b border-cream-200 px-3 py-2">
        <StatusDot status={status} />
        <h2 className="text-sm font-medium text-ink">{label}</h2>
        <span className="ml-auto text-xs text-ink/50">{orders.length}</span>
      </header>

      <div className="flex flex-col gap-2 p-2">
        {orders.length === 0 ? (
          <p className="px-1 py-3 text-xs text-ink/40">Nothing here</p>
        ) : (
          orders.map((order) => <Card key={order.id} order={order} onMove={onMove} />)
        )}
      </div>
    </section>
  );
}

function Card({
  order,
  onMove,
  draggable = true,
}: {
  order: AdminOrderRow;
  onMove: (id: string, status: string) => void;
  /** Off in the mobile list - there is nowhere to drag to there. */
  draggable?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    disabled: !draggable,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Without this the menu only closed by picking a status or hitting the
  // same button again - tapping anywhere else left it hanging open, and
  // opening one on every card left them all open at once.
  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <article
      ref={draggable ? setNodeRef : undefined}
      style={
        draggable && transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={cn(
        "rounded-md border border-cream-200 bg-cream-50 p-2.5",
        isDragging && "z-10 opacity-90 shadow-cream"
      )}
    >
      <div
        {...(draggable ? listeners : {})}
        {...(draggable ? attributes : {})}
        className={cn(draggable && "cursor-grab touch-none active:cursor-grabbing")}
      >
        <div className="flex flex-wrap items-center gap-1">
          <SourceBadge source={order.source} />
          <OrderFlags
            isFirstOrder={order.is_first_order}
            advanceRequired={order.advance_required}
            paymentStatus={order.payment_status}
          />
        </div>

        <p className="mt-1.5 text-sm font-medium text-ink">
          {order.customer_name || order.phone}
        </p>
        <p className="text-xs text-ink/55">
          {order.order_number} · {order.required_date}
        </p>
        <p className="mt-1 text-sm text-ghee">{formatPrice(order.total)}</p>
      </div>

      <div className="mt-2 flex items-center gap-1 border-t border-cream-200 pt-2">
        <Link
          href={`/admin/orders/${order.id}`}
          className="flex min-h-9 flex-1 items-center rounded-sm px-1 text-xs text-rosewood hover:underline"
        >
          Open
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            className="flex min-h-9 items-center gap-1 rounded-sm border border-cream-200 px-2 text-xs text-ink"
          >
            Move
            <ChevronDown className="h-3 w-3" />
          </button>

          {menuOpen ? (
            <div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-cream-200 bg-cream-50 p-1 shadow-cream">
              {ORDER_STATUSES.filter((status) => status.value !== order.status).map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onMove(order.id, status.value);
                  }}
                  className="flex min-h-10 w-full items-center gap-2 rounded-sm px-2 text-left text-xs text-ink hover:bg-cream-100"
                >
                  <StatusDot status={status.value} />
                  {status.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
