import type { JSX } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import { useAuth } from "../features/auth/Authenticator";

function Home(): JSX.Element {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ListArg</h1>
      <p className={styles.description}>
        Organizá tus tareas de manera simple y eficiente.
        Creá, editá y completá todo desde un solo lugar.
      </p>
      {user ? (
        <Link className={styles.cta} to="/tasks">Ir a mis tareas</Link>
      ) : (
        <Link className={styles.cta} to="/register">Empezar ahora</Link>
      )}
    </div>
  );
}

export default Home;