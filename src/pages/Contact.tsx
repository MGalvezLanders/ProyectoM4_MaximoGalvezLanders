import type { JSX } from "react";
import styles from "./Contact.module.css";
import gitHub from "../assets/github.svg";
import email from "../assets/envelope-at-fill.svg";

function Contact(): JSX.Element {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Contacto del desarrollador</h1>
      <p className={styles.description}>
        Si tenés alguna pregunta, sugerencia o simplemente querés saludar, no dudes en contactarme.
        Estoy siempre abierto a recibir feedback y conectar con otros desarrolladores y usuarios
        interesados en el proyecto.
      </p>
      <p className={styles.description}>Podés encontrarme en:</p>
      <ul className={styles.contactList}>
        <li className={styles.contactItem}>
          <a className={styles.contactLink} href="mailto:galvezlandersmaximo@gmail.com">
            <img className={styles.icon} src={email} alt="Email" />
            galvezlandersmaximo@gmail.com
          </a>
        </li>
        <li className={styles.contactItem}>
          <a className={styles.contactLink} href="https://github.com/MGalvezLanders" target="_blank" rel="noreferrer">
            <img className={styles.icon} src={gitHub} alt="GitHub" />
            MGalvezLanders
          </a>
        </li>
      </ul>
    </div>
  );
}

export default Contact;
