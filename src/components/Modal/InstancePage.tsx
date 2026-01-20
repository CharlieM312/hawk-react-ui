import { useNavigate, useParams, useLocation } from 'react-router';
import Instance from './Instance';
import { useEffect } from 'react';

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

  const close = () => navigate(-1);

  return <Instance isOpen={true} toggle={close} instance={instance} url={url} />;
}