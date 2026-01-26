import Modal from 'react-modal';
import AceEditor from 'react-ace';
import { Button, CloseButton } from 'react-bootstrap';
import { useRef, useState } from 'react';
import { BounceLoader } from 'react-spinners';
import Select from 'react-select';

import Graph from '../Graph/Graph';

import Create from '../../js/client/Create';
import Send from '../../js/instances/query/Send';
import FetchResults from '../../js/instances/query/FetchResults';
import Cancel from '../../js/instances/query/Cancel';
import Languages from '../../js/instances/query/Languages';

import styles from './Instance.module.css';

import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/ext-language_tools';
import '../../js/syntax-highlighting/mode-eol';
import '../../js/syntax-highlighting/mode-epl';

type LanguageOption = {
  value: string;
  label: string;
}

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
  const [result, setResult]                     = useState('');
  const [rawResult, setRawResult]               = useState('');
  const [query, setQuery]                       = useState('');
  const [queryTime, setQueryTime]               = useState('');
  const [queryId, setQueryId]                   = useState('');
  const [errorMessage, setErrorMessage]         = useState('');
  const [rawText, setRawText]                   = useState('View raw');
  const [runButtonText, setRunButtonText]       = useState('Run');
  const [hideRaw, setHideRaw]                   = useState(true);
  const [isGraph, setIsGraph]                   = useState(false);
  const [isRunDisabled, setIsRunDisabled]       = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [graphData, setGraphData]               = useState(null);
  const isRunning                               = useRef(false);

  let hawkClient: HawkClient;
  let languageIdRegEx: RegExp;
  let selectedLanguage: string;
  let languageOptions: LanguageOption[] = [];

  try {
    hawkClient = Create(url);

    const languages = Languages(hawkClient, instance?.name);
    languageIdRegEx = new RegExp(/[A-Z]{3}/);

    languages.forEach(function (language) {
      languageOptions.push({
        value: language,
        label: language
      });
    });
    selectedLanguage = languageOptions[4]?.value ?? languageOptions[0]?.value ?? '';
  } catch (err) {
    throw err;
  }
  const aceMode = selectedLanguage && languageIdRegEx.test(selectedLanguage)
    ? (selectedLanguage.match(languageIdRegEx)![0] === 'EOL' ? 'eol' : 'epl')
    : undefined;

  let appTheme = document.getElementById('root')?.getAttribute('data-theme');

  const aceStyles = {
    borderRadius: '4px'
  };

  const aceStylesDark = {
    borderRadius: '4px',
  };

  const onChange = (newValue: string) => {
    setQuery(newValue);
  }

  const onClickStartInstance = async () => {

    if(!instance?.name) return;
    setShowErrorMessage(false);
    setIsRunDisabled(true);
    try {
      await Promise.resolve(hawkClient.startInstance(instance.name));
      setErrorMessage(`Instance ${instance.name} started successfully.`);
      setShowErrorMessage(true);

    } catch (err: any) {
      setErrorMessage(`Failed to start instance ${instance.name}. Reason: ${err.message}`);
      setShowErrorMessage(true);
    } finally {
      setIsRunDisabled(false);
    }

  };

  const onClickStopInstance = async () => {

    if(!instance?.name) return;
    setShowErrorMessage(false);
    setIsRunDisabled(true);
    try {
      await Promise.resolve(hawkClient.stopInstance(instance.name));
      setErrorMessage(`Instance ${instance.name} stopped successfully.`);
      setShowErrorMessage(true);

    } catch (err: any) {
      setErrorMessage(`Failed to stop instance ${instance.name}. Reason: ${err.message}`);
      setShowErrorMessage(true);
    } finally {
      setIsRunDisabled(false);
    }

  };


  const onClickRun = () => {
    let newIsRunning = !isRunning.current;
    isRunning.current = newIsRunning;

    if (isRunning.current) {
      setRunButtonText('Cancel');
      setResult('');
      setQueryTime('');
      setShowErrorMessage(false);
      let localQueryId = Send(
        hawkClient,
        query,
        instance?.name,
        selectedLanguage
      );

      setQueryId(localQueryId);

      setTimeout(() => {
        FetchResults(hawkClient, localQueryId)
          .then((response) => {
            setResult(response['formattedResult'].toString());
            setRawResult(response['raw']);
            // @ts-ignore
            setGraphData(response['result'] ?? null);
            setIsGraph(response['isGraph']);
            setQueryTime(response['queryTime']);
            isRunning.current = false;
            setIsRunDisabled(false);
            setRunButtonText('Run');
          })
          .catch((err) => {
            setErrorMessage(err['reason'].includes('InvalidQuery') ? 'Invalid query' : 'Query failed');
            setShowErrorMessage(true);
            isRunning.current = false;
            setIsRunDisabled(false);
            setRunButtonText('Run');
          });
      }, 1000);
    } else {
      setIsRunDisabled(true);
      Cancel(hawkClient, queryId);
      setRunButtonText('Run');
      setIsRunDisabled(false);
    }
  }

  const onClickRaw = () => {
    setHideRaw(hideRaw === false ? true : false);
    setRawText(rawText === 'View raw' ? 'View simplified' : 'View raw');
  }

  const changeLanguage = (language: LanguageOption) => {
    selectedLanguage = language.value;
  }

  const closeModal = () => {
    toggle();
    setResult('');
    setQuery('');
    isRunning.current = false;
    setQueryTime('');
    setIsGraph(false);
    setIsRunDisabled(false);
    setShowErrorMessage(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      contentLabel={ instance ? instance.name : ''}
      onRequestClose={closeModal}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className={styles.content}
      overlayClassName={styles.overlay}
      ariaHideApp={false}
    >
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>{instance ? instance.name : ''}</h1>
          <hr className={styles.separator} />
        </div>
        <div className={styles.close}>
          <Button variant='success' size='sm' onClick={onClickStartInstance} disabled={isRunDisabled} style={{ marginRight: 8 }}>▶</Button>
          <Button variant='danger' size='sm' onClick={onClickStopInstance} disabled={isRunDisabled} style={{ marginRight: 16 }}>■</Button>
          <CloseButton onClick={closeModal} variant={appTheme === 'dark' ? 'white' : undefined} className={styles.closeButton} />
        </div>
      </div>
      <div className={styles.body}>
        <Select
          options={languageOptions}
          className={styles.languageDropdown}
          defaultValue={languageOptions[4] ?? languageOptions[0]}
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
        <h5 className={styles.queryLabel}>Query</h5>
        <div className={styles.queryContainer}>
          <AceEditor
            height='120px'
            width='100%'
            onChange={onChange}
            showPrintMargin={false}
            showGutter={false}
            theme={
              appTheme === 'dark' ? 'dracula' : ''
            }
            mode={
              aceMode
            }
            style={aceStyles}
          />
        </div>
        <div className={styles.submission}>
          <BounceLoader className={styles.spinner} size='20px' color='#7e56c2' loading={isRunning.current} />
          <Button variant='primary' className={styles.run} onClick={onClickRun} disabled={isRunDisabled}>{runButtonText}</Button>
        </div>
        {showErrorMessage && <div className={styles.errorContainer}>
            <h5 className={styles.errorMessage}>{errorMessage}</h5>
        </div>}
        <div className={styles.resultHeader}>
          <h5 className={styles.resultLabel}>Result {queryTime !== '' ? 'obtained in ' + queryTime + 'ms' : ''}</h5>
          {!isGraph &&
            <button className={styles.rawButton} onClick={onClickRaw}>{rawText}</button>
          }
        </div>
        <div className={styles.resultContainer}>
          {!isGraph &&
            <AceEditor
              height={hideRaw === false ? '280px' : '120px'}
              width='100%'
              showPrintMargin={false}
              showGutter={false}
              value={hideRaw === false ? rawResult : result}
              theme={
                appTheme === 'dark' ? 'dracula' : ''
              }
              mode={aceMode}
              style={aceStylesDark}
            />
          }
          {isGraph &&
            <Graph data={graphData} />
          }
        </div>
      </div>
    </Modal>
  );
}
