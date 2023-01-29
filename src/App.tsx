import Header from './components/Header';
import Home from './components/Home';
import SideBanner from './components/SideBanner';
import styles from './styles/app.module.css';

export default function App() {
  return (
    <div className={styles.app}>
      <SideBanner />
      <Header />
      <Home />
    </div>
  );
}
