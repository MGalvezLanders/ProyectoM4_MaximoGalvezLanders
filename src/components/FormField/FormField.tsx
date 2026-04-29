import type { ChangeEvent, JSX } from "react";
import styles from "./FormField.module.css";

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}

function FormField({ id, name, label, type = "text", value, onChange, placeholder, autoComplete, error }: FormFieldProps): JSX.Element {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <input
        className={styles.input}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
    </div>
  );
}

export default FormField;
