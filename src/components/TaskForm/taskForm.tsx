import { useState } from "react";
import type { JSX } from "react";
import type { Priority } from "../../types/task";
import styles from "./taskForm.module.css";

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: Date | null;
  priority: Priority;
}

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void | Promise<void>;
  onCancel: () => void;
  initialTitle?: string;
  initialDescription?: string;
  initialDueDate?: Date | null;
  initialPriority?: Priority;
  formTitle?: string;
  submitLabel?: string;
}

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function TaskForm({
  onSubmit,
  onCancel,
  initialTitle = "",
  initialDescription = "",
  initialDueDate = null,
  initialPriority = "medium",
  formTitle = "Nueva tarea",
  submitLabel = "Agregar tarea",
}: TaskFormProps): JSX.Element {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [dueDate, setDueDate] = useState(toDateInputValue(initialDueDate));
  const [priority, setPriority] = useState<Priority>(initialPriority);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }): Promise<void> {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        dueDate: parseDateInput(dueDate),
        priority,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>{formTitle}</h2>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="task-title">Título *</label>
        <input
          className={styles.input}
          id="task-title"
          type="text"
          placeholder="¿Qué tenés que hacer?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="task-description">Descripción</label>
        <textarea
          className={styles.textarea}
          id="task-description"
          placeholder="Detalles opcionales..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="task-duedate">
            Fecha de vencimiento
          </label>
          <input
            className={styles.input}
            id="task-duedate"
            type="date"
            value={dueDate}
            min={toDateInputValue(new Date())}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <span className={styles.hint}>Sin fecha: vence en 1 mes</span>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="task-priority">Prioridad</label>
          <select
            className={styles.select}
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.cancelButton}
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          className={styles.submitButton}
          type="submit"
          disabled={!title.trim() || isSubmitting}
        >
          {isSubmitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
