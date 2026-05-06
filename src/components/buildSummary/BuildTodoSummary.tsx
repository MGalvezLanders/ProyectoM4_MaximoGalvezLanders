import { useState } from "react";
import type { Task } from "../../types/task";
import styles from "./BuildTodoSummary.module.css";

interface Props {
  todos: Task[];
  userEmail: string;
}

const PRIORITY_LABELS = { high: "Alta", medium: "Media", low: "Baja" } as const;

export function buildTodoSummary(todos: Task[]): string {
  const pendientes = todos.filter((t) => !t.completed);
  const completadas = todos.filter((t) => t.completed);
  const now = new Date();

  const formatDate = (ts: Task["createdAt"] | Task["dueDate"]) => {
    if (!ts || typeof ts.toDate !== "function") return null;
    return ts.toDate().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatList = (tasks: Task[], showOverdue: boolean) =>
    tasks.length === 0
      ? "  (ninguna)\n"
      : tasks
          .map((t) => {
            const priority = t.priority ? `[${PRIORITY_LABELS[t.priority]}]` : "";
            const dueDateStr = formatDate(t.dueDate);
            const isOverdue =
              showOverdue &&
              t.dueDate &&
              typeof t.dueDate.toDate === "function" &&
              t.dueDate.toDate() < now;
            const duePart = dueDateStr
              ? ` | vence: ${dueDateStr}${isOverdue ? " ⚠ VENCIDA" : ""}`
              : "";
            const desc = t.description ? `\n     ${t.description}` : "";
            return `  - ${t.title} ${priority} (creada: ${formatDate(t.createdAt)}${duePart})${desc}`;
          })
          .join("\n") + "\n";

  return (
    `Resumen de tareas — ${new Date().toLocaleDateString("es-AR")}\n` +
    `${"=".repeat(45)}\n\n` +
    `Pendientes (${pendientes.length}):\n` +
    formatList(pendientes, true) +
    `\nCompletadas (${completadas.length}):\n` +
    formatList(completadas, false)
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
        if (data?.error === "MessageRejected") {
          setErrorMsg("Tu email no está verificado para recibir correos. Contactá al administrador para habilitarlo.");
        } else {
          setErrorMsg(data?.message || "Ocurrió un error al enviar el email.");
        }
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
