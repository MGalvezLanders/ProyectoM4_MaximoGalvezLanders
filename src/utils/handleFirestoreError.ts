import { FirebaseError } from "firebase/app";

export function handleFirestoreError(e: unknown): never {
  if (e instanceof FirebaseError) {
    switch (e.code) {
      case "permission-denied":
        throw new Error("No tenés permisos para realizar esta acción.");
      case "not-found":
        throw new Error("La tarea no existe.");
      case "unauthenticated":
        throw new Error("Sesión expirada. Volvé a iniciar sesión.");
      case "unavailable":
        throw new Error("Servicio no disponible. Revisá tu conexión.");
      default:
        throw new Error(`Error inesperado (${e.code}).`);
    }
  }
  throw new Error(e instanceof Error ? e.message : "Error desconocido.");
}
