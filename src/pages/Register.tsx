import type { JSX } from "react";
import { Link } from "react-router-dom";
import styles from "./Register.module.css";

function Register(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>Empezá a organizar tus tareas</p>

        <form>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Nombre de usuario</label>
            <input
              className={styles.input}
              id="name"
              type="text"
              placeholder="Tu nombre"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Correo electrónico</label>
            <input
              className={styles.input}
              id="email"
              type="email"
              placeholder="tu@email.com"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Contraseña</label>
            <input
              className={styles.input}
              id="password"
              type="password"
              placeholder="••••••••"
            />
          </div>
          <button className={styles.button} type="submit">Registrarse</button>
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
