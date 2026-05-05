import type { JSX } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, Priority } from "../../types/task";
import styles from "./TaskCard.module.css";

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  sortable?: boolean;
}

function formatDate(ts: Task["createdAt"] | Task["dueDate"]): string {
  if (!ts || typeof ts.toDate !== "function") return "";
  return ts.toDate().toLocaleDateString("es-AR");
}

function isOverdue(task: Task): boolean {
  if (task.completed || !task.dueDate || typeof task.dueDate.toDate !== "function") return false;
  return task.dueDate.toDate() < new Date();
}

function TaskCard({ task, onToggle, onEdit, onDelete, sortable = true }: TaskCardProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const overdue = isOverdue(task);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${styles.taskCard} ${task.completed ? styles.completed : ""} ${isDragging ? styles.dragging : ""}`}
    >
      <div className={styles.topRow}>
        {sortable && (
          <button
            className={styles.dragHandle}
            {...attributes}
            {...listeners}
            aria-label="Arrastrar tarea"
          >
            ⠿
          </button>
        )}
        <input
          className={styles.checkbox}
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h2 className={styles.taskTitle}>{task.title}</h2>
            {task.priority && (
              <span className={`${styles.priorityBadge} ${styles[`priority_${task.priority}`]}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
            )}
          </div>
          {task.description && (
            <p className={styles.taskDescription}>{task.description}</p>
          )}
          <div className={styles.meta}>
            <span className={styles.date}>{formatDate(task.createdAt)}</span>
            {task.dueDate && (
              <span className={`${styles.dueDate} ${overdue ? styles.overdue : ""}`}>
                {overdue ? "⚠ Vencida:" : "Vence:"} {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.editButton}
          onClick={() => onEdit(task)}
          disabled={task.completed}
        >
          Editar
        </button>
        <button
          className={styles.deleteButton}
          onClick={() => onDelete(task.id)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
