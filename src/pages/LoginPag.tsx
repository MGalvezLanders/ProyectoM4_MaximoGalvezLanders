import type { JSX } from "react";
import { Link } from "react-router-dom";
import styles from "./LoginPag.module.css";
import { useLoginForm } from "../features/auth/useLoginForm";
import FormField from "../components/FormField/FormField";
import GoogleSignInButton from "../components/GoogleSignInButton/GoogleSignInButton";

function LoginPag(): JSX.Element {
  const { form, errors, isSubmitting, firebaseError, handleChange, handleSubmit, handleGoogleSignIn } = useLoginForm();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>Bienvenido de vuelta</p>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="email"
            name="email"
            label="Email"
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
            autoComplete="current-password"
            error={errors.password}
          />
          {firebaseError && <p className={styles.error} role="alert">{firebaseError}</p>}
          <button
            className={styles.button}
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
          <GoogleSignInButton onClick={handleGoogleSignIn} />
        </form>

        <p className={styles.footer}>
          ¿No tenés cuenta?{" "}
          <Link className={styles.footerLink} to="/register">Registrarse</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPag;
