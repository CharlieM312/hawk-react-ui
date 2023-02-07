import Header from './components/Header/Header';
import Home from './components/Home/Home';
import SideBar from './components/SideBar/SideBar';

// import styles from './app.module.css';

export default function App() {
  return (
    <div className={styles.app}>
      <SideBar />
      <div className={styles.main}>
        <Header />
        <Home />
      </div>
    </div>
  );
}
