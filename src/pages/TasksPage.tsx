import { useState, useEffect } from "react";
import type { JSX } from "react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Timestamp } from "firebase/firestore";
import type { Task } from "../types/task";
import { useAuth } from "../features/auth/Authenticator";
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from "../services/taskService";
import TaskList from "../components/TaskList/taskList";
import TaskForm from "../components/TaskForm/taskForm";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import TodoSummarySection from "../components/buildSummary/TodoSummarySection";
import styles from "./TasksPage.module.css";

type FilterType = "all" | "pending" | "completed";

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

const FILTER_LABELS: Record<FilterType, string> = {
  all: "Todas",
  pending: "Pendientes",
  completed: "Completadas",
};

const EMPTY_MESSAGES: Record<FilterType, string> = {
  all: "No tenés tareas todavía. ¡Creá una!",
  pending: "No hay tareas pendientes.",
  completed: "No hay tareas completadas.",
};

function TasksPage(): JSX.Element {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

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

  async function handleAdd(title: string, description: string): Promise<void> {
    if (!user) {
      setError("No hay sesión activa. Volvé a iniciar sesión.");
      return;
    }
    const temporaryTask: Task = {
      id: `temp-${Date.now()}`,
      userId: user.uid,
      title,
      description,
      completed: false,
      createdAt: Timestamp.now(),
    };

    setError(null);
    setTasks((prev) => [temporaryTask, ...prev]);
    console.log("Tarea temporal creada:", temporaryTask);
    setShowAddForm(false);

    try {
      const created = await createTask({ userId: user.uid, title, description });
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

  async function handleUpdate(title: string, description: string): Promise<void> {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, { title, description });
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, title, description } : t))
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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <TaskList
          tasks={filteredTasks}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage={EMPTY_MESSAGES[filter]}
        />
      </DndContext>

      <TodoSummarySection tasks={tasks} />
    </div>
  );
}

export default TasksPage;
