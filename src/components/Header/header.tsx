import type { JSX } from "react";
import styles from "./header.module.css";

function Header(): JSX.Element {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>ListArg</h1>
    </header>
  );
}

export default Header;
