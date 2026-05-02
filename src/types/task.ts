import type { Timestamp } from "firebase/firestore";

export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Timestamp;
}

export type NewTaskInput = {
  title: string;
  userId: string;
  description?: string;
}