import type { JSX } from "react";
import styles from "./About.module.css";

function About(): JSX.Element {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Acerca de ListArg</h1>
      <p className={styles.description}>
        ListArg es una aplicación de gestión de tareas diseñada para ayudarte a organizar tu día a día de manera eficiente.
         Con ListArg, puedes crear, editar y completar tus tareas en un solo lugar, manteniendo todo bajo control y aumentando tu productividad.
      </p>
    </div>
  );
}

export default About;
