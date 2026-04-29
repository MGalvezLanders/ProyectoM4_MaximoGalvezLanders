import type { JSX } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/Authenticator";
import styles from "./navbar.module.css";

function NavBar(): JSX.Element {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogOut(): Promise<void> {
    await logOut();
    navigate("/login");
  }

  return (
    <div className={styles.navContainer}>
      <nav className={styles.linkContainer}>
        <Link className={styles.link} to="/">Inicio</Link>
        <span className={styles.separator}>|</span>
        <Link className={styles.link} to="/about">Acerca de</Link>
        <span className={styles.separator}>|</span>
        <Link className={styles.link} to="/contact">Contacto</Link>
        {user ? (
          <>
            <span className={styles.separator}>|</span>
            <Link className={styles.link} to="/tasks">Mis Tareas</Link>
            <span className={styles.separator}>|</span>
            <button className={styles.link} onClick={handleLogOut}>Cerrar sesión</button>
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
