import { useNavigate, useParams, useLocation } from 'react-router';
import { useEffect } from 'react';
import InstanceContent from './InstanceContent';
import styles from './InstancePage.module.css';

export default function InstancePage() {
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
    <div className={styles.instancePage}>
      <InstanceContent instance={instance} url={url} />
    </div>

  );
}