import type { Task } from "../types/task";

export const MOCK_TASKS: Task[] = [
  {
    id: "1",
    userId: "user1",
    title: "Aprender React Router",
    description: "Estudiar rutas anidadas y rutas protegidas.",
    completed: true,
    createdAt: new Date("2024-04-20"),
  },
  {
    id: "2",
    userId: "user1",
    title: "Configurar Firebase",
    description: "Crear proyecto y conectar autenticación.",
    completed: false,
    createdAt: new Date("2024-04-22"),
  },
  {
    id: "3",
    userId: "user1",
    title: "Diseñar componentes",
    description: "",
    completed: false,
    createdAt: new Date("2024-04-25"),
  },
];
