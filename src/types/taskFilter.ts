import type { Task, Priority } from "./task";

export type FilterType = "all" | "pending" | "completed";
export type SortType = "custom" | "priority" | "dueDate";

export const FILTER_LABELS: Record<FilterType, string> = {
  all: "Todas",
  pending: "Pendientes",
  completed: "Completadas",
};

export const SORT_LABELS: Record<SortType, string> = {
  custom: "Personalizado",
  priority: "Prioridad",
  dueDate: "Fecha de vencimiento",
};

export const EMPTY_MESSAGES: Record<FilterType, string> = {
  all: "No tenés tareas todavía. ¡Creá una!",
  pending: "No hay tareas pendientes.",
  completed: "No hay tareas completadas.",
};

export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function applyStoredOrder(tasks: Task[], userId: string): Task[] {
  try {
    const saved = localStorage.getItem(`taskOrder_${userId}`);
    if (!saved) return tasks;
    const ids: string[] = JSON.parse(saved);
    const idToTask = new Map(tasks.map((t) => [t.id, t]));
    const ordered = ids.flatMap((id) => {
      const t = idToTask.get(id);
      return t ? [t] : [];
    });
    const orderedSet = new Set(ids);
    const rest = tasks.filter((t) => !orderedSet.has(t.id));
    return [...ordered, ...rest];
  } catch {
    return tasks;
  }
}
