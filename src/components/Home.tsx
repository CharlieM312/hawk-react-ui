import Table from './Table';
import UseModal from './UseModal';
import NewModal from './NewModal';
import { Button } from 'react-bootstrap';
import styles from '../styles/home.module.css';

export default function Home() {
  const { isOpen, toggle } = UseModal();

  return (
    <div className={styles.home}>
      <div className={styles.header}>
        <h2 className={styles.title}>Existing Instances</h2>
        <Button variant='primary' className={styles.new} onClick={toggle}>+ New</Button>
        <NewModal
          isOpen={isOpen}
          toggle={toggle}
          title={'Create a New Instance'}
        />
      </div>
      <Table />
    </div>
  );
}
