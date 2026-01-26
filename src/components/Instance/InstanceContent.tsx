import AceEditor from 'react-ace';
import { Button } from 'react-bootstrap';
import { useRef, useState } from 'react';
import { BounceLoader } from 'react-spinners';
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
import '../../js/syntax-highlighting/mode-eol';
import '../../js/syntax-highlighting/mode-epl';
import { useNavigate } from 'react-router';

type LanguageOption = {
  value: string;
  label: string;
}

type Repository = {
    uri: string;
    type: string;
    isFrozen: boolean;
}

export default function InstanceContent({ instance, url }: { instance: any; url: string }) {
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
    const [metaModels, setMetaModels]         = useState<string[]>([]);
    const [derivedAttributes, setDerivedAttributes] = useState<string[]>([]);
    const [indexedLocations, setIndexedLocations] = useState<string[]>([]);
    const isRunning                               = useRef(false);
    const navigate                                = useNavigate();

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
          // Navigate back to the homepage after stopping the instance
          navigate(-1);
        } catch (err: any) {
          setErrorMessage(`Failed to stop instance ${instance.name}. Reason: ${err.message}`);
          setShowErrorMessage(true);
        } finally {
          setIsRunDisabled(false);
        }

    };

    const onClickSyncInstance = async () => {
        if(!instance?.name) return;
        setShowErrorMessage(false);
        setIsRunDisabled(true);
        try {
          await Promise.resolve(hawkClient.syncInstance(instance.name));
          setErrorMessage(`Instance ${instance.name} synced successfully.`);
          setShowErrorMessage(true);

        } catch (err: any) {
          setErrorMessage(`Failed to sync instance ${instance.name}. Reason: ${err.message}`);
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

    const [expandedSections, setExpandedSections] = useState({
        metaModels: false,
        derivedAttributes: false,
        indexedLocations: false
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getMetaModels = async () => {
        try {
            const models = await hawkClient.listMetamodels(instance.name);
            const sortedModels = Array.isArray(models) ? models.sort() : [];
            setMetaModels(sortedModels);
        } catch (err) {
            console.error('Failed to fetch meta models:', err);
        }
    }

    const getDerivedAttributes = async () => {
        try {
            const attributes = await hawkClient.listDerivedAttributes(instance.name);
            const sortedAttributes = Array.isArray(attributes) ? attributes.sort() : [];
            setDerivedAttributes(sortedAttributes);
        }
        catch (err) {
            console.error('Failed to fetch derived attributes:', err);
        }
    }

    const getIndexedLocations = async () => {
        try {
            const locations = await hawkClient.listRepositories(instance.name);
            const locationUris = locations.map((repo: Repository) => repo.uri);
            const sortedLocations = Array.isArray(locationUris) ? locationUris.sort() : [];
            setIndexedLocations(sortedLocations);
        }
        catch (err) {
            console.error('Failed to fetch indexed locations:', err);
        }
    }

    const changeLanguage = (language: LanguageOption) => {
        selectedLanguage = language.value;
    }

    return (
        <div className={styles.instanceContent}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>{instance ? instance.name : ''}</h1>
                    <hr className={styles.separator} />
                </div>
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
                    <div className={styles.instanceOptions}>
                        <h4>Instance Options</h4>
                        <div className={styles.collapsiblePanel}>
                            <button
                            className={styles.collapsibleHeader}
                            onClick={() => {
                                toggleSection('metaModels');
                                if (!expandedSections.metaModels && metaModels.length === 0) {
                                getMetaModels();
                                }
                            }}
                            >
                            <span>Meta Models</span>
                            <span className={`${styles.chevron} ${expandedSections.metaModels ? styles.rotated : ''}`}>▼</span>
                            </button>
                            <div className={`${styles.collapsibleContent} ${!expandedSections.metaModels ? styles.collapsed : ''}`}>
                            {metaModels.length > 0 ? (
                                <ul className={styles.configList}>
                                {metaModels.map((model: string, idx: number) => (
                                    <li key={idx} className={styles.configItem}>
                                    {model}
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className={styles.emptyMessage}>No meta models found</p>
                            )}
                            </div>
                        </div>
                        <div className={styles.collapsiblePanel}>
                            <button
                            className={styles.collapsibleHeader}
                            onClick={() => {
                                toggleSection('indexedLocations');
                                if (!expandedSections.indexedLocations && indexedLocations.length === 0) {
                                getIndexedLocations();
                                }
                            }}
                            >
                            <span>Indexed Locations</span>
                            <span className={`${styles.chevron} ${expandedSections.indexedLocations ? styles.rotated : ''}`}>▼</span>
                            </button>
                            <div className={`${styles.collapsibleContent} ${!expandedSections.indexedLocations ? styles.collapsed : ''}`}>
                            {indexedLocations.length > 0 ? (
                                <ul className={styles.configList}>
                                {indexedLocations.map((location: string, idx: number) => (
                                    <li key={idx} className={styles.configItem}>
                                    {location}
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className={styles.emptyMessage}>No indexed locations found</p>
                            )}
                            </div>
                        </div>
                        <div className={styles.collapsiblePanel}>
                            <button
                            className={styles.collapsibleHeader}
                            onClick={() => {
                                toggleSection('derivedAttributes');
                                if (!expandedSections.derivedAttributes && derivedAttributes.length === 0) {
                                getDerivedAttributes();
                                }
                            }}
                            >
                            <span>Derived Attributes</span>
                            <span className={`${styles.chevron} ${expandedSections.derivedAttributes ? styles.rotated : ''}`}>▼</span>
                            </button>
                            <div className={`${styles.collapsibleContent} ${!expandedSections.derivedAttributes ? styles.collapsed : ''}`}>
                            {derivedAttributes.length > 0 ? (
                                <ul className={styles.configList}>
                                {derivedAttributes.map((attribute: string, idx: number) => (
                                    <li key={idx} className={styles.configItem}>
                                    {attribute}
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className={styles.emptyMessage}>No derived attributes found</p>
                            )}
                            </div>
                        </div>
                        <h4> Instance Control</h4>
                        <div className={styles.instanceControl}>
                            <Button variant='success' size='sm' onClick={onClickStartInstance} disabled={isRunDisabled} style={{ marginRight: 8 }}>Start Instance</Button>
                            <Button variant='info' size='sm' onClick={onClickSyncInstance} disabled={isRunDisabled} style={{ marginRight: 8 }}>Sync Instance</Button>
                            <Button variant='danger' size='sm' onClick={onClickStopInstance} disabled={isRunDisabled} style={{ marginRight: 16 }}>Stop Instance</Button>
                            <Button variant='info' size='sm' style={{ marginRight: 16 }} onClick={() => navigate(-1)}>← Back</Button>
                        </div>
                    </div>

                </div>
        </div>
    );
}
