import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db } from "./firebase.config";
import type { Task, NewTaskInput } from "../types/task";
import { handleFirestoreError } from "../utils/handleFirestoreError";

const TASKS_COLLECTION = "tasks";

export async function getTasks(userId: string): Promise<Task[]> {
  try {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where("userId", "==", userId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Task);
  } catch (e) {
    return handleFirestoreError(e);
  }
}

export async function createTask(input: NewTaskInput): Promise<Task> {
  try {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const taskData = {
      userId: input.userId,
      title: input.title,
      description: input.description ?? "",
      completed: false,
      createdAt: serverTimestamp(),
      dueDate: input.dueDate
        ? Timestamp.fromDate(input.dueDate)
        : Timestamp.fromDate(oneMonthFromNow),
      priority: input.priority ?? "medium",
    };
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), taskData);
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...snapshot.data() } as Task;
  } catch (e) {
    return handleFirestoreError(e);
  }
}

export async function updateTask(
  id: string,
  data: Partial<Pick<Task, "title" | "description" | "completed" | "dueDate" | "priority">>,
): Promise<void> {
  try {
    await updateDoc(doc(db, TASKS_COLLECTION, id), data);
  } catch (e) {
    return handleFirestoreError(e);
  }
}

export async function toggleTask(id: string, completed: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, TASKS_COLLECTION, id), { completed });
  } catch (e) {
    return handleFirestoreError(e);
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, TASKS_COLLECTION, id));
  } catch (e) {
    return handleFirestoreError(e);
  }
}
