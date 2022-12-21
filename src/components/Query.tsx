import AceEditor from 'react-ace';
import styles from '../styles/query.module.css';

export default function Query() {
  return (
    <div className={styles.query}>
      <br />
      <AceEditor
        mode='../eol.tmlanguage'
        className={styles.queryEditor}
      />
      <br />
      <button className={styles.submit}>Submit</button>
    </div>
  );
}
