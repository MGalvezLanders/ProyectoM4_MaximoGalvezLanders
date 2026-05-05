import type { Timestamp } from "firebase/firestore";

export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Timestamp;
  dueDate?: Timestamp;
  priority?: Priority;
}

export type NewTaskInput = {
  title: string;
  userId: string;
  description?: string;
  dueDate?: Date | null;
  priority?: Priority;
}
