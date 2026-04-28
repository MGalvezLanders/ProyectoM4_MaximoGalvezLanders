import type { JSX } from "react";
import { Link } from "react-router-dom";
import styles from "./LoginPag.module.css";

function LoginPag(): JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>Bienvenido de vuelta</p>

        <form>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
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
          <button className={styles.button} type="submit">Iniciar sesión</button>
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
