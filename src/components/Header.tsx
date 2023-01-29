import styles from '../styles/header.module.css';

export default function Header() {
  return (
    <div className={styles.header}>
      <h1>Hawk Docker</h1>
      <hr className={styles.line} />
    </div>
  );
}
