import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import Table from '../Table/Table';
import Use from '../Modal/Use';
import New from '../Modal/New';

import styles from './Home.module.css';

export default function Home() {
  const [showTable, setShowTable] = useState(false);
  const { isOpen, toggle }        = Use();

  let url = localStorage.getItem('url') ?? '';

  useEffect(() => {
    setShowTable(url.length !== 0 ? true : false);
  }, [url.length]);

  const onSubmit = () => {
    localStorage.setItem('url', url);
    setShowTable(true);
  }

  return (
    <div className={styles.home}>
      <div className={styles.manage}>
        <div className={styles.header}>
          <h2 className={styles.title}>Manage Instances</h2>
          <button type='button' className={styles.new} onClick={toggle}>+</button>
          <New
            isOpen={isOpen}
            toggle={toggle}
            title={'Create a New Instance'}
          />
        </div>
        <div className={styles.body}>
          <input
            type='text'
            className={styles.input}
            placeholder='Please enter URL of Hawk Server...'
            onChange={e => {url = e.target.value}}
          />
          <Button className={styles.submit} onClick={onSubmit}>Submit</Button>
        </div>
      </div>
      { showTable &&
      <>
        <hr className={styles.divider} />
        <div className={styles.table}>
          <h2 className={styles.tableTitle}>Results for <em>{ url }</em></h2>
          <Table url={url} />
        </div>
      </>
      }
    </div>
  );
}
