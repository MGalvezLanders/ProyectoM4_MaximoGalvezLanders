import type { JSX } from "react";
import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps): JSX.Element {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancelar
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
