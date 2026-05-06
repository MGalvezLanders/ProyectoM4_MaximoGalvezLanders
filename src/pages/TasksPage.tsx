import type { JSX } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { FILTER_LABELS, SORT_LABELS, EMPTY_MESSAGES } from "../types/taskFilter";
import type { FilterType, SortType } from "../types/taskFilter";
import { useTasks } from "../features/tasks/useTasks";
import TaskList from "../components/TaskList/taskList";
import TaskForm from "../components/TaskForm/taskForm";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import TodoSummarySection from "../components/buildSummary/TodoSummarySection";
import styles from "./TasksPage.module.css";

function TasksPage(): JSX.Element {
  const {
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
  } = useTasks();

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
