import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Query from './components/Query';
import Nav from './components/Nav';
import styles from './styles/app.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <Nav />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='query' element={<Query />} />
      </Routes>
    </div>
  );
}

export default App;
