import Modal from 'react-modal';
import { CloseButton } from 'react-bootstrap';
import Create  from '../../js/client/Create';
import styles from './New.module.css';
import { useEffect, useRef, useState } from 'react';
import { create } from 'node:domain';

type NewProps = {
  isOpen: boolean;
  toggle: () => void;
  title: string;
}
// TODO: Implement form to create new instance
export default function New({ isOpen, toggle, title }: NewProps) {

  const clientRef = useRef<HawkClient | null>(null);
  const [backends, setBackends] = useState<string[]>([]);
  const [plugins, setPlugins] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const envUrl = import.meta.env.VITE_APP_HAWK_URL ?? '';
        clientRef.current = Create(envUrl);
        const list = await clientRef.current.listBackends();
        setBackends(list);
        const pluginsList = await clientRef.current.listPlugins();
        setPlugins(pluginsList);
      } catch (err) {
        console.error('Failed to create Hawk client or fetch backends:', err);
      }
    };
    init();
  }, []);

  const handleSubmission = (e: React.SubmitEvent) => {
    e.preventDefault();

  };


  
  return (
    <Modal
      isOpen={isOpen}
      contentLabel={title}
      className={styles.content}
      overlayClassName={styles.overlay}
      ariaHideApp={false}
    >
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>Create new instance</h1>
          <hr className={styles.separator} />
        </div>
        <div className={styles.close}>
          <CloseButton onClick={toggle} className={styles.closeButton} />
        </div>
      </div>
      <div className={styles.body}>
          <form onSubmit={handleSubmission}>
            <input type="text" placeholder="Instance name" className={styles.input} />
            <label className={styles.label}>Backends</label>
            <select name="backends" id="backends" className={styles.input}>
              {backends.map((backend) => (
                <option key={backend} value={backend}>{backend}</option>
              ))}
            </select>
            <input type="number" placeholder="Minimum Delay Period (ms)" className={styles.input} />
            <input type="number" placeholder="Maximum Delay Period (ms)" className={styles.input} />
            <br></br>
            <label className={styles.label}>Plugins</label>
            <select name="plugins" id="plugins" multiple={true} className={styles.input}>
              {plugins.map((plugin) => (
                <option key={plugin} value={plugin}>{plugin}</option>
              ))}
            </select>
            <input type="text" placeholder="Index Factory" className={styles.input} />
            <button type="submit" className={styles.input}>Create</button>
          </form>
      </div>
    </Modal>
  );
}
