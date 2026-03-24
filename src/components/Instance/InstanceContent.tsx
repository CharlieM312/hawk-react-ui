import AceEditor from 'react-ace';
import { Button } from 'react-bootstrap';
import { useRef, useState, useEffect } from 'react';
import { BounceLoader } from 'react-spinners';
import { Link } from 'react-router';
import Select from 'react-select';

import Graph from '../Graph/Graph';

import Create from '../../js/client/Create';
import Send from '../../js/instances/query/Send';
import FetchResults from '../../js/instances/query/FetchResults';
import Cancel from '../../js/instances/query/Cancel';
import Languages from '../../js/instances/query/Languages';

import styles from './InstanceContent.module.css';

import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/theme-chrome';
import '../../js/syntax-highlighting/mode-eol';
import '../../js/syntax-highlighting/mode-epl';

type LanguageOption = {
  value: string;
  label: string;
}

export default function InstanceContent({ instance, url }: { instance: any; url: string }) {
    const [appTheme, setAppTheme]                 = useState(document.getElementById('root')?.getAttribute('data-theme') ?? 'light');
    const [result, setResult]                     = useState('');
    const [rawResult, setRawResult]               = useState('');
    const [query, setQuery]                       = useState('');
    const [queryTime, setQueryTime]               = useState('');
    const [queryId, setQueryId]                   = useState('');
    const [errorMessage, setErrorMessage]         = useState('');
    const [rawText, setRawText]                   = useState('View raw');
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

    useEffect(() => {
        const root = document.getElementById('root');
        if (!root) return;
        const observer = new MutationObserver(() => {
            setAppTheme(root?.getAttribute('data-theme') ?? 'light');
        });
        observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);


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
              })
              .catch((err) => {
                console.log(err);
                setErrorMessage(err?.reason?.includes('InvalidQuery') ? 'Invalid query' : 'Query failed');
                setShowErrorMessage(true);
                isRunning.current = false;
                setIsRunDisabled(false);
              });
          }, 1000);
        } else {
          setIsRunDisabled(true);
          Cancel(hawkClient, queryId);
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

    return (
        <div className={styles.instanceContent}>
            <div className={styles.linkDisplay}>
                <nav aria-label="Breadcrumb">
                <ol style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                    <li><Link to="/">Home</Link></li>
                    <li>&gt;</li>
                    <li>{instance?.name ?? 'Instance'}</li>
                    <li>&gt;</li>
                    <li aria-label="Go to instance settings"><Link to={`/instance/${instance.name}/settings`}
                        state={{ instance: instance, url: url }}>
                        Settings</Link></li>
                </ol>
                </nav>
            </div>
                <div className={styles.body}>
                    <div className={styles.queryOptions}>
                        <h4>Query Options</h4>
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
                        <h5 className={styles.queryLabel}>
                            Query
                            </h5>
                        <div className={styles.queryContainer}>
                        <AceEditor
                            key={`query-${appTheme}`}
                            placeholder="Enter your query here..."
                            height='120px'
                            width='100%'
                            onChange={onChange}
                            showPrintMargin={false}
                            showGutter={false}
                            theme={
                            appTheme === 'dark' ? 'dracula' : 'chrome'
                            }
                            mode={
                            aceMode
                            }
                            style={aceStyles}
                        />
                        </div>
                        <div className={styles.submission}>
                            <BounceLoader className={styles.spinner} size='20px' color='#7e56c2' loading={isRunning.current} />
                            <Button name="Submit Query" variant='primary' className={styles.run} onClick={onClickRun} disabled={isRunDisabled} aria-label={isRunning.current ? "Cancel query execution" : "Run query"}>
                                {isRunning.current ? "Cancel" : "Run"} Query
                            </Button>
                        </div>
                        {showErrorMessage && <div className={styles.errorContainer}>
                            <h5 className={styles.errorMessage}>{errorMessage}</h5>
                        </div>}
                        <div className={styles.resultHeader}>
                            <h5 className={styles.resultLabel}>Result {queryTime !== '' ? 'obtained in ' + queryTime + 'ms' : ''}</h5>
                            {!isGraph &&
                                <button name="RawText" className={styles.rawButton} onClick={onClickRaw}>{rawText}</button>
                            }
                        </div>
                        <div className={styles.resultContainer}>
                            {!isGraph &&
                                <AceEditor
                                key={`result-${appTheme}`}
                                height={hideRaw === false ? '280px' : '120px'}
                                width='100%'
                                showPrintMargin={false}
                                showGutter={false}
                                value={hideRaw === false ? rawResult : result}
                                theme={
                                    appTheme === 'dark' ? 'dracula' : 'chrome'
                                }
                                mode={aceMode}
                                style={aceStylesDark}
                                />
                            }
                        </div>
                    </div>
                    <div className={styles.graphOptions}>
                        <h4>Graph</h4>
                        {isGraph ? (
                                <Graph data={graphData} url={url} name={instance?.name}/>
                            ) : (
                                <div className={styles.emptyMessage}>No graph to display</div>
                            )}
                    </div>
                </div>
        </div>
    );
}
