import Modal from 'react-modal';
import { CloseButton } from 'react-bootstrap';
import Create  from '../../js/client/Create';
import styles from './New.module.css';
import { useEffect, useRef, useState } from 'react';

type NewProps = {
  isOpen: boolean;
  toggle: () => void;
  title: string;
}

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
    const formData = new FormData(e.target as HTMLFormElement);
    const instanceName = formData.get('instanceName') as string;
    const backend = formData.get('backend') as string;
    const minDelay = formData.get('minDelay') as string;
    const maxDelay = formData.get('maxDelay') as string;
    const pluginsSelected = formData.getAll('plugins') as string[];
    const indexFactory = formData.get('indexFactory') as string;

    if (minDelay === '' || maxDelay === '') {
      alert('Please provide both minimum and maximum delay periods.');
      return;
    }

    if (parseInt(minDelay) > parseInt(maxDelay)) {
      alert('Minimum delay period cannot be greater than maximum delay period.');
      return;
    }

    const args: any[] = [instanceName, backend, minDelay, maxDelay];
    if (pluginsSelected.length > 0) args.push(pluginsSelected);
    if (indexFactory !== '') args.push(indexFactory);

    try {
      clientRef.current?.createInstance(...args);
      alert(`Instance "${instanceName}" created successfully!`);
      toggle();
    } catch (error) {
      console.error('Failed to create instance:', error);
      alert('Failed to create instance. Please check the console for more details.');
    }

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
            <input type="text" name="instanceName" placeholder="Instance name" className={styles.input} />
            <label className={styles.label}>Backends</label>
            <select name="backend" id="backend" className={styles.input}>
              {backends.map((backend) => (
                <option key={backend} value={backend}>{backend}</option>
              ))}
            </select>
            <input type="number" name="minDelay" placeholder="Minimum Delay Period (ms)" className={styles.input} />
            <input type="number" name="maxDelay" placeholder="Maximum Delay Period (ms)" className={styles.input} />
            <br></br>
            <label className={styles.label}>Plugins</label>
            <select name="plugins" id="plugins" multiple={true} className={styles.input}>
              {plugins.map((plugin) => (
                <option key={plugin} value={plugin}>{plugin}</option>
              ))}
            </select>
            <input type="text" name="indexFactory" placeholder="Index Factory" className={styles.input} />
            <button type="submit" className={styles.input}>Create</button>
          </form>
      </div>
    </Modal>
  );
}
