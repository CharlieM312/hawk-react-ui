import Header from './components/Header';
import Home from './components/Home';
import styles from './styles/app.module.css';

export default function App() {
  return (
    <div className={styles.app}>
      <Header />
      <Home />
    </div>
  );
}
