import { useState } from "react";
import type { JSX } from "react";
import type { Task } from "../types/task";
import { MOCK_TASKS } from "../mocks/tasks";
import TaskList from "../components/TaskList/taskList";
import TaskForm from "../components/TaskForm/taskForm";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import styles from "./TasksPage.module.css";

function TasksPage(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const formVisible = showAddForm || editingTask !== null;

  function handleToggle(id: string): void {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function handleAdd(title: string, description: string): void {
    const newTask: Task = {
      id: crypto.randomUUID(),
      userId: "user1",
      title,
      description,
      completed: false,
      createdAt: new Date(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setShowAddForm(false);
  }

  function handleEdit(task: Task): void {
    setEditingTask(task);
    setShowAddForm(false);
  }

  function handleUpdate(title: string, description: string): void {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTask!.id ? { ...task, title, description } : task
      )
    );
    setEditingTask(null);
  }

  function handleDelete(id: string): void {
    setDeletingTaskId(id);
  }

  function handleConfirmDelete(): void {
    setTasks((prev) => prev.filter((task) => task.id !== deletingTaskId));
    setDeletingTaskId(null);
  }

  function handleCancel(): void {
    setShowAddForm(false);
    setEditingTask(null);
  }

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
