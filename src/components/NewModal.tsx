import Modal from 'react-modal';
import { CloseButton } from 'react-bootstrap';
import styles from '../styles/newModal.module.css';

type NewModalProps = {
  isOpen: boolean;
  toggle: () => void;
  title: string;
}

export default function NewModal({ isOpen, toggle, title }: NewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      contentLabel={title}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Instance</h1>
        <CloseButton variant='black' onClick={toggle} className={styles.closeButton} />
      </div>
    </Modal>
  );
}
