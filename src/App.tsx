import Header from './components/Header/Header';
import Home from './components/Home/Home';
import SideBar from './components/SideBar/SideBar';
import InstancePage from './components/Instance/InstancePage';
import SettingsPage from './components/Instance/SettingsPage';
import styles from './App.module.css';
import { Routes, Route } from 'react-router';

export default function App() {
  return (
    <div className={styles.app}>
      <SideBar />
      <div className={styles.main}>
        <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/instance/:name" element={<InstancePage />} />
        <Route path="/instance/:name/settings" element={<SettingsPage />} />
      </Routes>
      </div>
    </div>
  );
}
