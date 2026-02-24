import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import SettingsContent from "./SettingsContent";
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const { name } = useParams<{ name: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const passed = (location.state as any)?.instance;
  const url = (location.state as any)?.url ?? window.location.origin;
  const instance = passed ?? { name: name ?? '', status: '', info: '' };

  useEffect(() => {
    // block direct access: if no instance was passed, redirect to home
    if (!passed) {
      navigate('/', { replace: true });
    }
  }, [passed, navigate]);

  if (!passed) return null;


  return (
    <div className={styles.settingsPage}>
      <SettingsContent instance={instance} url={url} />
    </div>

  );
}