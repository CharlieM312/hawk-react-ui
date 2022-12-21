import { Link } from 'react-router-dom';
import styles from '../styles/nav.module.css';

export default function Nav() {
  return (
    <div>
      <nav className={styles.nav}>
        <Link to='/' className={styles.navLink}>Home</Link>
        <Link to='query' className={styles.navLink}>Query</Link>
      </nav>
    </div>
  );
}
