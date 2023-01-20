import Modal from 'react-modal';
import AceEditor from 'react-ace';
import Query from '../js/instances/Query';
import { Button, CloseButton } from 'react-bootstrap';
import { useState } from 'react';
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
  const customStyles = {
    content: {
      height: '80%',
      width: '70%',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

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
      style={customStyles}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>{instance ? instance.name : ''}</h1>
        <CloseButton variant='black' onClick={toggle} className={styles.closeButton} />
      </div>
      <div className={styles.body}>
        <AceEditor height='150px' width='950px' onChange={onChange} theme='dracula' />
        <br />
        <Button variant='primary' className={styles.submit} onClick={onClick}>Submit</Button>
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
