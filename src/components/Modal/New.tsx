import Modal from 'react-modal';
import { CloseButton } from 'react-bootstrap';

import styles from './New.module.css';

type NewProps = {
  isOpen: boolean;
  toggle: () => void;
  title: string;
}
// TODO: Implement form to create new instance
export default function New({ isOpen, toggle, title }: NewProps) {
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
    </Modal>
  );
}
