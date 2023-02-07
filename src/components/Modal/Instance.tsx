import Modal from 'react-modal';
import AceEditor from 'react-ace';
import { Button, CloseButton } from 'react-bootstrap';
import { useState } from 'react';
import { BounceLoader } from 'react-spinners';
import Select from 'react-select';

import Create from '../../js/client/Create';
import Send from '../../js/instances/query/Send';
import FetchResults from '../../js/instances/query/FetchResults';
import Cancel from '../../js/instances/query/Cancel';
import Languages from '../../js/instances/query/Languages';

import styles from './Instance.module.css';

import 'ace-builds/src-noconflict/theme-dracula';

import '../../js/syntax-highlighting/mode-eol';
import '../../js/syntax-highlighting/mode-epl';

type InstanceType = {
  name: string;
  status: string;
  info: string;
}

type InstanceProps = {
  isOpen: boolean;
  toggle: () => void;
  instance: InstanceType;
  url: string;
}

export default function Instance({ isOpen, toggle, instance, url }: InstanceProps) {
  const [result, setResult]         = useState('');
  const [query, setQuery]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [hideRun, setHideRun]       = useState(false);
  const [hideCancel, setHideCancel] = useState(true);

  const hawkClient = Create(url);
  let selectedLanguage: string;

  const onChange = (newValue: string) => {
    setQuery(newValue);
  }

  type LanguageOption = {
    value: string;
    label: string;
  }

  const languages = Languages(hawkClient, instance?.name);
  const languageOptions: LanguageOption[] = [];
  const languageIdRegEx = new RegExp(/[A-Z]{3}/);

  languages.forEach(function (language) {
    languageOptions.push({
      value: language,
      label: language
    });
  });


  selectedLanguage = languageOptions[4].value;

  const onClick = () => {
    setIsLoading(true);
    // setHideRun(true);
    // setHideCancel(false);

    let queryId = Send(
      hawkClient,
      query,
      instance?.name,
      selectedLanguage
    );

    // const cancelButton = (document.getElementById('cancel') as HTMLInputElement);
    // cancelButton.addEventListener('click', () => {
    //   Cancel(hawkClient, queryId);
    //   return;
    // });

    FetchResults(hawkClient, queryId)
    .then((response) => {
      // setTimeout(() => {
        setResult(response['formattedResult'].toString());
        setIsLoading(false);
        // setHideRun(false);
        // setHideCancel(true);
      // }, 3000);
    });
  }

  const changeLanguage = (language: LanguageOption) => {
    selectedLanguage = language.value;
  }

  const closeModal = () => {
    toggle();
    setResult('');
    setQuery('');
    setIsLoading(false);
    setHideCancel(true);
    setHideRun(false);
  }

  let appTheme = document.getElementById('root')?.getAttribute('data-theme');

  const aceStyles = {
    borderRadius: '4px'
  };

  const aceStylesDark = {
    borderRadius: '4px',
    color: 'white'
  };

  return (
    <Modal
      isOpen={isOpen}
      contentLabel={ instance ? instance.name : ''}
      className={styles.content}
      overlayClassName={styles.overlay}
      appElement={document.getElementById('root') || undefined}
    >
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>{instance ? instance.name : ''}</h1>
          <hr className={styles.separator} />
        </div>
        <div className={styles.close}>
          <CloseButton onClick={closeModal} className={styles.closeButton} />
        </div>
      </div>
      <div className={styles.body}>
        <Select
          options={languageOptions}
          className={styles.languageDropdown}
          defaultValue={languageOptions[4]}
          // @ts-ignore
          onChange={language => {changeLanguage(language)}}
          placeholder='Query Language'
          theme={(theme) => (
            appTheme === 'light' ? {
            ...theme,
            colors: {
              ...theme.colors,
              primary50: '#7e56c2',
              primary25: 'rgba(126, 86, 194, 0.13)',
              primary: '#7e56c2',
            },
          } : {
            ...theme,
            colors: {
              ...theme.colors,
              neutral0: 'rgba(47, 47, 47, 1)',
              neutral80: 'rgba(255, 255, 255, 1)',
              neutral90: 'rgba(255, 255, 255, 1)',
              primary25: 'rgba(126, 86, 194, 0.13)',
              primary50: '#7e56c2',
              primary: '#7e56c2',
            },
          })}
        />
        <br />
        <h5 className={styles.queryLabel}>Query:</h5>
        <div className={styles.queryContainer}>
          <AceEditor
            height='90px'
            width='100%'
            onChange={onChange}
            showPrintMargin={false}
            showGutter={false}
            theme={
              appTheme === 'dark' ? 'dracula' : ''
            }
            mode={
              selectedLanguage.match(languageIdRegEx)?.[0] === 'EOL' ? 'eol' : selectedLanguage.match(languageIdRegEx)?.[0] === 'EPL' ? 'epl' : ''
            }
            style={aceStyles}
          />
        </div>
        <br />
        <div className={styles.submission}>
          <BounceLoader className={styles.spinner} size='20px' color='#7e56c2' loading={isLoading} />
          <Button variant='primary' className={styles.cancel} id='cancel' hidden={hideCancel}>Cancel</Button>
          <Button variant='primary' className={styles.run} onClick={onClick} hidden={hideRun}>Run</Button>
        </div>
        <br />
        <h5 className={styles.resultLabel}>Result:</h5>
        <div className={styles.resultContainer}>
          <AceEditor
            height='90px'
            width='100%'
            fontSize='15px'
            showPrintMargin={false}
            showGutter={false}
            placeholder={result}
            theme={
              appTheme === 'dark' ? 'dracula' : ''
            }
            style={aceStylesDark}
          />
        </div>
        {/* <div className={styles.resultContainer}>
          <pre>
            <span className={styles.result}>
              { result }
            </span>
          </pre>
        </div> */}
      </div>
    </Modal>
  );
}
