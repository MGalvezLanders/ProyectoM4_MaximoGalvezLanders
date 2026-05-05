import type { JSX } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task } from "../../types/task";
import TaskCard from "../TaskCard/TaskCard";
import styles from "./taskList.module.css";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

function TaskList({ tasks, onToggle, onEdit, onDelete, emptyMessage = "No tenés tareas todavía. ¡Creá una!" }: TaskListProps): JSX.Element {
  if (tasks.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
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
    </SortableContext>
  );
}

export default TaskList;
