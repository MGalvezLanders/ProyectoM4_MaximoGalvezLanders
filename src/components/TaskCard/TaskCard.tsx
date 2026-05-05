import type { JSX } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../types/task";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function formatTaskDate(createdAt: Task["createdAt"]): string {
  if (!createdAt || typeof createdAt.toDate !== "function") return "";
  return createdAt.toDate().toLocaleDateString("es-AR");
}

function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps): JSX.Element {
  const formattedDate = formatTaskDate(task.createdAt);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${styles.taskCard} ${task.completed ? styles.completed : ""} ${isDragging ? styles.dragging : ""}`}
    >
      <div className={styles.topRow}>
        <button
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          aria-label="Arrastrar tarea"
        >
          ⠿
        </button>
        <input
          className={styles.checkbox}
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <div className={styles.content}>
          <h2 className={styles.taskTitle}>{task.title}</h2>
          {task.description && (
            <p className={styles.taskDescription}>{task.description}</p>
          )}
          {formattedDate && <span className={styles.date}>{formattedDate}</span>}
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
