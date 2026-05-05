import { useState, useEffect } from "react";
import type { JSX } from "react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Timestamp } from "firebase/firestore";
import type { Task, Priority } from "../types/task";
import { useAuth } from "../features/auth/Authenticator";
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from "../services/taskService";
import TaskList from "../components/TaskList/taskList";
import TaskForm from "../components/TaskForm/taskForm";
import type { TaskFormData } from "../components/TaskForm/taskForm";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import TodoSummarySection from "../components/buildSummary/TodoSummarySection";
import styles from "./TasksPage.module.css";

type FilterType = "all" | "pending" | "completed";
type SortType = "custom" | "priority" | "dueDate";

const FILTER_LABELS: Record<FilterType, string> = {
  all: "Todas",
  pending: "Pendientes",
  completed: "Completadas",
};

const SORT_LABELS: Record<SortType, string> = {
  custom: "Personalizado",
  priority: "Prioridad",
  dueDate: "Fecha de vencimiento",
};

const EMPTY_MESSAGES: Record<FilterType, string> = {
  all: "No tenés tareas todavía. ¡Creá una!",
  pending: "No hay tareas pendientes.",
  completed: "No hay tareas completadas.",
};

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function applyStoredOrder(tasks: Task[], userId: string): Task[] {
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

function TasksPage(): JSX.Element {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("custom");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredAndSortedTasks = (() => {
    const filtered = tasks.filter((t) => {
      if (filter === "pending") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    });
    if (sortBy === "priority") {
      return [...filtered].sort(
        (a, b) => PRIORITY_ORDER[a.priority ?? "medium"] - PRIORITY_ORDER[b.priority ?? "medium"]
      );
    }
    if (sortBy === "dueDate") {
      return [...filtered].sort((a, b) => {
        const aMs = a.dueDate?.toDate().getTime() ?? Infinity;
        const bMs = b.dueDate?.toDate().getTime() ?? Infinity;
        return aMs - bMs;
      });
    }
    return filtered;
  })();

  const formVisible = showAddForm || editingTask !== null;

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadTasks() {
      try {
        setLoading(true);
        setError(null);
        const data = await getTasks(user!.uid);
        if (!cancelled) setTasks(applyStoredOrder(data, user!.uid));
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "No se pudieron cargar las tareas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleToggle(id: string): Promise<void> {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t))
    );
    try {
      await toggleTask(id, newCompleted);
    } catch (e) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: task.completed } : t))
      );
      setError(e instanceof Error ? e.message : "No se pudo actualizar la tarea.");
    }
  }

  async function handleAdd({ title, description, dueDate, priority }: TaskFormData): Promise<void> {
    if (!user) {
      setError("No hay sesión activa. Volvé a iniciar sesión.");
      return;
    }
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const temporaryTask: Task = {
      id: `temp-${Date.now()}`,
      userId: user.uid,
      title,
      description,
      completed: false,
      createdAt: Timestamp.now(),
      dueDate: dueDate ? Timestamp.fromDate(dueDate) : Timestamp.fromDate(oneMonthFromNow),
      priority,
    };

    setError(null);
    setTasks((prev) => [temporaryTask, ...prev]);
    setShowAddForm(false);

    try {
      const created = await createTask({ userId: user.uid, title, description, dueDate, priority });
      setTasks((prev) =>
        prev.map((task) => (task.id === temporaryTask.id ? created : task))
      );
    } catch (e) {
      setTasks((prev) => prev.filter((task) => task.id !== temporaryTask.id));
      setError(e instanceof Error ? e.message : "No se pudo crear la tarea.");
    }
  }

  function handleEdit(task: Task): void {
    setEditingTask(task);
    setShowAddForm(false);
  }

  async function handleUpdate({ title, description, dueDate, priority }: TaskFormData): Promise<void> {
    if (!editingTask) return;
    const dueDateTs = dueDate ? Timestamp.fromDate(dueDate) : editingTask.dueDate;
    try {
      await updateTask(editingTask.id, { title, description, dueDate: dueDateTs, priority });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id ? { ...t, title, description, dueDate: dueDateTs, priority } : t
        )
      );
      setEditingTask(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar la tarea.");
    }
  }

  function handleDelete(id: string): void {
    setDeletingTaskId(id);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deletingTaskId) return;
    try {
      await deleteTask(deletingTaskId);
      setTasks((prev) => prev.filter((t) => t.id !== deletingTaskId));
      setDeletingTaskId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar la tarea.");
      setDeletingTaskId(null);
    }
  }

  function handleCancel(): void {
    setShowAddForm(false);
    setEditingTask(null);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === active.id);
      const newIndex = prev.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      if (user) {
        localStorage.setItem(
          `taskOrder_${user.uid}`,
          JSON.stringify(reordered.map((t) => t.id))
        );
      }
      return reordered;
    });
  }

  if (loading) return <div>Cargando tareas...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis Tareas</h1>
        {!formVisible && (
          <button className={styles.addButton} onClick={() => setShowAddForm(true)}>
            + Nueva tarea
          </button>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {showAddForm && (
        <TaskForm onSubmit={handleAdd} onCancel={handleCancel} />
      )}

      {editingTask && (
        <TaskForm
          initialTitle={editingTask.title}
          initialDescription={editingTask.description}
          initialDueDate={editingTask.dueDate?.toDate() ?? null}
          initialPriority={editingTask.priority ?? "medium"}
          formTitle="Editar tarea"
          submitLabel="Guardar cambios"
          onSubmit={handleUpdate}
          onCancel={handleCancel}
        />
      )}

      {deletingTaskId && (
        <ConfirmModal
          message={`¿Seguro que querés eliminar "${tasks.find((t) => t.id === deletingTaskId)?.title}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTaskId(null)}
        />
      )}

      <div className={styles.toolbar}>
        <div className={styles.filterBar}>
          {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
            <button
              key={f}
              className={`${styles.filterButton} ${filter === f ? styles.filterButtonActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
        <div className={styles.sortBar}>
          <span className={styles.sortLabel}>Ordenar:</span>
          {(Object.keys(SORT_LABELS) as SortType[]).map((s) => (
            <button
              key={s}
              className={`${styles.filterButton} ${sortBy === s ? styles.filterButtonActive : ""}`}
              onClick={() => setSortBy(s)}
            >
              {SORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <TaskList
          tasks={filteredAndSortedTasks}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage={EMPTY_MESSAGES[filter]}
          sortable={sortBy === "custom"}
        />
      </DndContext>

      <TodoSummarySection tasks={tasks} />
    </div>
  );
}

export default TasksPage;
