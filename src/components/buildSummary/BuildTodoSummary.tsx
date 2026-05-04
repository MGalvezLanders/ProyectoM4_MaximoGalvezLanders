import React, { useState } from "react";
import type { Task } from "../../types/task";
import styles from "./BuildTodoSummary.module.css";

interface Props {
  todos: Task[];
  userEmail: string;
}

export function buildTodoSummary(todos: Task[]): string {
  const pendientes = todos.filter((t) => !t.completed);
  const completadas = todos.filter((t) => t.completed);

  const formatDate = (ts: Task["createdAt"]) =>
    ts.toDate().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatList = (tasks: Task[]) =>
    tasks.length === 0
      ? "  (ninguna)\n"
      : tasks
          .map((t) => {
            const desc = t.description ? `\n     ${t.description}` : "";
            return `  - ${t.title} (creada: ${formatDate(t.createdAt)})${desc}`;
          })
          .join("\n") + "\n";

  return (
    `Resumen de tareas — ${new Date().toLocaleDateString("es-AR")}\n` +
    `${"=".repeat(45)}\n\n` +
    `Pendientes (${pendientes.length}):\n` +
    formatList(pendientes) +
    `\nCompletadas (${completadas.length}):\n` +
    formatList(completadas)
  );
}

export default function EmailSummaryButton({ todos, userEmail }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    setStatus("loading");
    setErrorMsg("");

    const summary = buildTodoSummary(todos);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: userEmail, summary }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data?.message || "Ocurrió un error al enviar el email.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("No se pudo conectar con el servidor.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.button}
        onClick={handleSend}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Enviando..." : "Enviar mi resumen"}
      </button>
      {status === "success" && (
        <span className={styles.success}>¡Email enviado correctamente!</span>
      )}
      {status === "error" && (
        <span className={styles.error}>{errorMsg}</span>
      )}
    </div>
  );
}
