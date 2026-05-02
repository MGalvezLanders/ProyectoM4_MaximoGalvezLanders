import { useState, useEffect } from "react";
import type { JSX } from "react";
import { Timestamp } from "firebase/firestore";
import type { Task } from "../types/task";
import { useAuth } from "../features/auth/Authenticator";
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from "../services/taskService";
import TaskList from "../components/TaskList/taskList";
import TaskForm from "../components/TaskForm/taskForm";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import styles from "./TasksPage.module.css";

function TasksPage(): JSX.Element {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const formVisible = showAddForm || editingTask !== null;

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadTasks() {
      try {
        setLoading(true);
        setError(null);
        const data = await getTasks(user!.uid);
        if (!cancelled) setTasks(data);
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

      <TaskList
        tasks={tasks}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default TasksPage;
