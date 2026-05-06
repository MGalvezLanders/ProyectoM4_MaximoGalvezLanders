import { useState, useEffect } from "react";
import { useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Timestamp } from "firebase/firestore";
import type { Task } from "../../types/task";
import type { FilterType, SortType } from "../../types/taskFilter";
import { PRIORITY_ORDER, applyStoredOrder } from "../../types/taskFilter";
import { useAuth } from "../auth/Authenticator";
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from "../../services/taskService";
import type { TaskFormData } from "../../components/TaskForm/taskForm";

export function useTasks() {
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
    return () => { cancelled = true; };
  }, [user]);

  async function handleToggle(id: string): Promise<void> {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)));
    try {
      await toggleTask(id, newCompleted);
    } catch (e) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: task.completed } : t)));
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
      setTasks((prev) => prev.map((task) => (task.id === temporaryTask.id ? created : task)));
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
        localStorage.setItem(`taskOrder_${user.uid}`, JSON.stringify(reordered.map((t) => t.id)));
      }
      return reordered;
    });
  }

  return {
    tasks,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    loading,
    error,
    setError,
    showAddForm,
    setShowAddForm,
    editingTask,
    deletingTaskId,
    setDeletingTaskId,
    sensors,
    filteredAndSortedTasks,
    formVisible,
    handleToggle,
    handleAdd,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleConfirmDelete,
    handleCancel,
    handleDragEnd,
  };
}
