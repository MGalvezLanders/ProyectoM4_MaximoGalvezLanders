import type { JSX } from "react";
import { Link } from "react-router-dom";
import styles from "./Register.module.css";
import { useRegisterForm } from "../features/auth/useRegisterForm";
import FormField from "../components/FormField/FormField";
import GoogleSignInButton from "../components/GoogleSignInButton/GoogleSignInButton";

function Register(): JSX.Element {
  const { form, errors, isSubmitting, firebaseError, handleChange, handleSubmit, handleGoogleSignIn } = useRegisterForm();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>Empezá a organizar tus tareas</p>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="email"
            name="email"
            label="Correo electrónico"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            autoComplete="email"
            error={errors.email}
          />
          <FormField
            id="password"
            name="password"
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password}
          />
          {firebaseError && <p className={styles.error} role="alert">{firebaseError}</p>}
          <button
            className={styles.button}
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </button>
          <GoogleSignInButton onClick={handleGoogleSignIn} />
        </form>

        <p className={styles.footer}>
          ¿Ya tenés cuenta?{" "}
          <Link className={styles.footerLink} to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
