import type { JSX } from "react";
import styles from "./footer.module.css";

function Footer(): JSX.Element {
  return (
    <footer className={styles.footer}>
      <p>© 2026 Maximo Galvez Landers. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
