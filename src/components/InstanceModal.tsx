import Modal from 'react-modal';
import AceEditor from 'react-ace';
import { Button, CloseButton } from 'react-bootstrap';
import { useState } from 'react';
import Query from '../js/instances/Query';
import styles from '../styles/instanceModal.module.css';
import "ace-builds/src-noconflict/theme-dracula";

type InstanceType = {
  name: string;
  location: string;
  status: string;
  info: string;
}

type InstanceModalProps = {
  isOpen: boolean;
  toggle: () => void;
  instance: InstanceType;
}

export default function InstanceModal({ isOpen, toggle, instance }: InstanceModalProps) {
  let query: string;
  const onChange = (newValue: string) => {
    query = newValue;
  }

  const [result, setResult] = useState('');

  const onClick = () => {
    setResult(Query(query, instance?.name));
  }

  return (
    <Modal
      isOpen={isOpen}
      contentLabel={ instance ? instance.name : ''}
      className={styles.content}
      overlayClassName={styles.overlay}
    >
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>{instance ? instance.name : ''}</h1>
          <hr className={styles.separator} />
        </div>
        <div className={styles.close}>
          <CloseButton onClick={toggle} className={styles.closeButton} />
        </div>
      </div>
      <div className={styles.body}>
        <AceEditor height='150px' width='100%' onChange={onChange} theme='dracula' />
        <br />
        <Button variant='primary' className={styles.run} onClick={onClick}>Run</Button>
        <br />
        <div className={styles.resultContainer}>
          <pre>
            <span className={styles.result}>
              { result }
            </span>
          </pre>
        </div>
      </div>
    </Modal>
  );
}
