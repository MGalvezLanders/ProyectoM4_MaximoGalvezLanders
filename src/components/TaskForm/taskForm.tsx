import { useState } from "react";
import type { JSX } from "react";
import styles from "./taskForm.module.css";

interface TaskFormProps {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialDescription?: string;
  formTitle?: string;
  submitLabel?: string;
}

function TaskForm({
  onSubmit,
  onCancel,
  initialTitle = "",
  initialDescription = "",
  formTitle = "Nueva tarea",
  submitLabel = "Agregar tarea",
}: TaskFormProps): JSX.Element {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  function handleSubmit(e: { preventDefault(): void }): void {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim(), description.trim());
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
      <div className={styles.actions}>
        <button className={styles.cancelButton} type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button className={styles.submitButton} type="submit" disabled={!title.trim()}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
