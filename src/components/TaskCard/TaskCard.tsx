import type { JSX } from "react";
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

  return (
    <div className={`${styles.taskCard} ${task.completed ? styles.completed : ""}`}>
      <div className={styles.topRow}>
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
