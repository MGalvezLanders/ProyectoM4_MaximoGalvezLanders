import type { JSX } from "react";
import type { Task } from "../../types/task";
import TaskCard from "../TaskCard/TaskCard";
import styles from "./taskList.module.css";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

function TaskList({ tasks, onToggle, onEdit, onDelete }: TaskListProps): JSX.Element {
  if (tasks.length === 0) {
    return <p className={styles.empty}>No tenés tareas todavía. ¡Creá una!</p>;
  }

  return (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
