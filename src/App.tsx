import { Link, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Query from './components/Query';
import styles from './styles/app.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <nav className={styles.nav}>
        <Link to='/' className={styles.navLink}>Home</Link>
        <Link to='query' className={styles.navLink}>Query</Link>
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='query' element={<Query />} />
      </Routes>
    </div>
  );
}

export default App;
