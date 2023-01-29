import { Button } from 'react-bootstrap';
import Table from '../Table/Table';
import Use from '../Modal/Use';
import New from '../Modal/New';
import styles from './Home.module.css';

export default function Home() {
  const { isOpen, toggle } = Use();

  return (
    <div className={styles.home}>
      <div className={styles.header}>
        <h2 className={styles.title}>Existing Instances</h2>
        <Button variant='primary' className={styles.new} onClick={toggle}>+ New</Button>
        <New
          isOpen={isOpen}
          toggle={toggle}
          title={'Create a New Instance'}
        />
      </div>
      <Table />
    </div>
  );
}
