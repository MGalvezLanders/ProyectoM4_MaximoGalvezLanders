import type { JSX } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./navbar.module.css";

function NavBar(): JSX.Element {
  const { user, logout } = useAuth();

  return (
    <div className={styles.navContainer}>
      <nav className={styles.linkContainer}>
        <Link className={styles.link} to="/">Inicio</Link>
        <span className={styles.separator}>|</span>
        <Link className={styles.link} to="/about">Acerca de</Link>
        {user ? (
          <>
            <span className={styles.separator}>|</span>
            <Link className={styles.link} to="/tasks">Mis Tareas</Link>
            <span className={styles.separator}>|</span>
            <button className={styles.link} onClick={logout}>Cerrar sesión</button>
          </>
        ) : (
          <>
            <span className={styles.separator}>|</span>
            <Link className={styles.link} to="/login">Iniciar sesión</Link>
            <span className={styles.separator}>|</span>
            <Link className={styles.link} to="/register">Registrarse</Link>
          </>
        )}
      </nav>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}

export default NavBar;
