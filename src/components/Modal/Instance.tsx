import Modal from 'react-modal';
import * as ace from 'ace-builds';
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

ace.config.set('basePath', 'path');

export default function Instance({ isOpen, toggle, instance, url }: InstanceProps) {
  const [result, setResult]                     = useState('');
  const [rawResult, setRawResult]               = useState('');
  const [query, setQuery]                       = useState('');
  const [queryTime, setQueryTime]               = useState('');
  const [queryId, setQueryId]                   = useState('');
  const [rawText, setRawText]                   = useState('View raw');
  const [runButtonText, setRunButtonText]       = useState('Run');
  const [hideRaw, setHideRaw]                   = useState(true);
  const [isGraph, setIsGraph]                   = useState(false);
  const [isRunDisabled, setIsRunDisabled]       = useState(false);
  const [graphData, setGraphData]               = useState(new QueryReport());
  const isRunning                               = useRef(false);

  const hawkClient = Create(url);

  let selectedLanguage: string;
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

  const onClickRun = () => {
    let newIsRunning = !isRunning.current;
    isRunning.current = newIsRunning;

    if (isRunning.current) {
      setRunButtonText('Cancel');
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
            setGraphData(response['result'] ?? null);
            setIsGraph(response['isGraph']);
            setQueryTime(response['queryTime']);
            isRunning.current = false;
            setIsRunDisabled(false);
            setRunButtonText('Run');
          })
          .catch(() => {
            isRunning.current = false;
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
  }

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
          <CloseButton onClick={closeModal} variant={appTheme === 'dark' ? 'white' : undefined} className={styles.closeButton} />
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
              selectedLanguage.match(languageIdRegEx)?.[0] === 'EOL' ? 'eol' : selectedLanguage.match(languageIdRegEx)?.[0] === 'EPL' ? 'epl' : ''
            }
            style={aceStyles}
          />
        </div>
        <div className={styles.submission}>
          <BounceLoader className={styles.spinner} size='20px' color='#7e56c2' loading={isRunning.current} />
          <Button variant='primary' className={styles.run} onClick={onClickRun} disabled={isRunDisabled}>{runButtonText}</Button>
        </div>
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
