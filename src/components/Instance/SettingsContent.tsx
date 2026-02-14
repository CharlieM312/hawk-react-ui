import { Link, useNavigate } from "react-router";
import styles from './SettingsContent.module.css';
import { Button } from 'react-bootstrap';
import Create from '../../js/client/Create';
import { useState, useRef, useEffect } from "react";
import Languages from "../../js/instances/query/Languages";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

type LanguageOption = {
  value: string;
  label: string;
}

type Repository = {
    uri: string;
    type: string;
    isFrozen?: boolean;
}

type DerivedAttribute = {
    attributeName: string;
    attributeType?: string;
    derivationLanguage?: string;
    derivationLogic?: string;
    isMany?: boolean;
    isOrdered?: boolean;
    isUnique?: boolean;
    metamodelUri: string;
    typeName: string;
}

type IndexedAttribute = {
    attributeName: string;
    metamodelUri: string;
    typeName: string;
}

type HawkInstance = {
    name: string;
    message: string;
    state: 'RUNNING' | 'STOPPED' | 'UPDATING';
}

export default function SettingsContent({ instance, url }: { instance: any; url: string }) {

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
    const [indexedAttributes, setIndexedAttributes] = useState<string[]>([]);
    const [indexedLocations, setIndexedLocations] = useState<string[]>([]);
    const [instanceState, setInstanceState] = useState<0 | 1 | 2 | 'RUNNING' | 'STOPPED' | 'UPDATING'>(instance?.state);
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
    
    useEffect(() => {
        getInstanceInformation();
          
        // Poll for instance state updates every 5 seconds
        const interval = setInterval(() => {
            getInstanceInformation();
        }, 5000);
          
        return () => clearInterval(interval);
    }, [instance.name]);
    
    const onClickStartInstance = async () => {
    
        if(!instance?.name) return;
        setShowErrorMessage(false);
        setIsRunDisabled(true);
        try {
            await Promise.resolve(hawkClient.startInstance(instance.name));
            setErrorMessage(`Instance ${instance.name} started successfully.`);
            setShowErrorMessage(true);
            await getInstanceInformation();
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
            navigate('/');
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
              await getInstanceInformation();
            } catch (err: any) {
              setErrorMessage(`Failed to sync instance ${instance.name}. Reason: ${err.message}`);
              setShowErrorMessage(true);
            } finally {
              setIsRunDisabled(false);
            }
        };

        const [expandedSections, setExpandedSections] = useState({
            metaModels: false,
            derivedAttributes: false,
            indexedLocations: false,
            indexedAttributes: false
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
                const attributes: DerivedAttribute[] = await hawkClient.listDerivedAttributes(instance.name);
                const sortedAttributes = attributes.map((attr: DerivedAttribute) => attr.attributeName).sort();
                setDerivedAttributes(sortedAttributes);
            }
            catch (err) {
                console.error('Failed to fetch derived attributes:', err);
            }
        }
    
        const getIndexedAttributes = async () => {
            try {
                const attributes: IndexedAttribute[] = await hawkClient.listIndexedAttributes(instance.name);
                const sortedAttributes = attributes.map((attr: IndexedAttribute) => attr.attributeName).sort();
                setIndexedAttributes(sortedAttributes);
            }
            catch (err) {
                console.error('Failed to fetch indexed attributes:', err);
            }
        }
    
        // IndexedLocation = Repository
        const getIndexedLocations = async () => {
            try {
                const locations: Repository[] = await hawkClient.listRepositories(instance.name);
                const locationUris = locations.map((repo: Repository) => repo.uri);
                const sortedLocations = Array.isArray(locationUris) ? locationUris.sort() : [];
                setIndexedLocations(sortedLocations);
            }
            catch (err) {
                console.error('Failed to fetch indexed locations:', err);
            }
        }
    
        const deleteIndexedLocation = async (locationUri: string) => {
            try {
                hawkClient.removeRepository(instance.name, locationUri);
                setIndexedLocations(prev => prev.filter(uri => uri !== locationUri));
                alert(`Indexed location "${locationUri}" deleted successfully.`);
            } catch (err) {
                console.error(`Failed to delete indexed location ${locationUri}:`, err);
            }
        }
    
        const unregisterMetamodel = async (modelName: string) => {
    
            try {
                const modelList: string[] = []
                modelList.push(modelName);
                hawkClient.unregisterMetamodels(instance.name, modelList);
                setMetaModels(prev => prev.filter(model => model !== modelName));
                alert (`Metamodel "${modelName}" unregistered successfully.`);
            } catch (err) {
                console.error(`Failed to unregister metamodel ${modelName}:`, err);
            }
    
        }
    
        const deleteIndexedAttribute = async (attributeName: string) => {
            try {
                const attributes: IndexedAttribute[] = await hawkClient.listIndexedAttributes(instance.name);
                const indexedAttribute = attributes.find(attr => attr.attributeName === attributeName);
                if (!indexedAttribute) {
                    alert(`Indexed attribute "${attributeName}" not found.`);
                    return;
                }
                hawkClient.removeIndexedAttribute(instance.name, indexedAttribute);
                setIndexedAttributes(prev => prev.filter(attr => attr !== attributeName));
                alert(`Indexed attribute "${attributeName}" deleted successfully.`);
    
            } catch (err) {
                console.error(`Failed to delete indexed attribute ${attributeName}:`, err);
            }
        }
    
        const deleteDerivedAttribute = async (attributeName: string) => {
            try {
                const attributes: DerivedAttribute[] = await hawkClient.listDerivedAttributes(instance.name);
                const derivedAttribute = attributes.find(attr => attr.attributeName === attributeName);
                if (!derivedAttribute) {
                    alert(`Derived attribute "${attributeName}" not found.`);
                    return;
                }
                hawkClient.removeDerivedAttribute(instance.name, derivedAttribute);
                setDerivedAttributes(prev => prev.filter(attr => attr !== attributeName));
                alert(`Derived attribute "${attributeName}" deleted successfully.`);
            } catch (err) {
                console.error(`Failed to delete derived attribute ${attributeName}:`, err);
            }
        }
    
    
        const getInstanceInformation = async () => {
            try {
                const instances: HawkInstance[] = await hawkClient.listInstances();
                const currentInstance = instances.find((inst: HawkInstance) => inst.name === instance.name);
                if (currentInstance) {
                    setInstanceState(currentInstance.state);
                }
            }
            catch (err) {
                console.error('Failed to fetch instance information:', err);
            }
        }
    
        const changeLanguage = (language: LanguageOption) => {
            selectedLanguage = language.value;
        }
    

  return (
    <div className={styles.container}>
      <div className={styles.linkDisplay}>
        <nav aria-label="Breadcrumb">
          <ol style={{ display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
            <li><Link to="/">Home</Link></li>
            <li>&gt;</li>
            <li><Link to={`/instance/${instance?.name}`} state={{ instance, url }}>{instance?.name ?? 'Instance'}</Link></li>
            <li>&gt;</li>
            <li aria-current="page">Settings</li>
          </ol>
        </nav>
      </div>
      <div className={styles.instanceOptions}>
        <h2>Settings for {instance?.name}</h2>
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
                                            <span>{model}</span>
                                            <button aria-label={`Unregister metamodel ${model}`} className={styles.deleteButton} onClick={() => {
                                                if (window.confirm(`Are you sure you want to unregister the metamodel "${model}"? This action cannot be undone.`)) {
                                                    unregisterMetamodel(model);
                                                }
                                            } }>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className={styles.emptyStateContainer}>
                                    <p className={styles.emptyMessage}>No meta models found</p>
                                    <ul className={styles.configList}>
                                        <li>
                                            <button aria-label="Add metamodel" className={styles.addButton} onClick={() => alert('Add metamodel functionality not implemented yet.')}>
                                                <FontAwesomeIcon icon={faPlusCircle} /> Add Metamodel
                                            </button>
                                        </li>
                                    </ul>
                                </div>
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
                                    <span>{location}</span>
                                    <button aria-label={`Delete indexed location ${location}`} className={styles.deleteButton} onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete the indexed location "${location}"? This action cannot be undone.`)) {
                                            deleteIndexedLocation(location);
                                        }
                                    }}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
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
                                    <span>{attribute}</span>
                                    <button className={styles.deleteButton} onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete the derived attribute "${attribute}"? This action cannot be undone.`)) {
                                            deleteDerivedAttribute(attribute);
                                        }
                                    }}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className={styles.emptyMessage}>No derived attributes found</p>
                            )}
                            </div>
                        </div>
                        <div className={styles.collapsiblePanel}>
                            <button
                            className={styles.collapsibleHeader}
                            onClick={() => {
                                toggleSection('indexedAttributes');
                                if (!expandedSections.indexedAttributes && indexedAttributes.length === 0) {
                                getIndexedAttributes();
                                }
                            }}
                            >
                            <span>Indexed Attributes</span>
                            <span className={`${styles.chevron} ${expandedSections.indexedAttributes ? styles.rotated : ''}`}>▼</span>
                            </button>
                            <div className={`${styles.collapsibleContent} ${!expandedSections.indexedAttributes ? styles.collapsed : ''}`}>
                            {indexedAttributes.length > 0 ? (
                                <ul className={styles.configList}>
                                {indexedAttributes.map((attribute: string, idx: number) => (
                                    <li key={idx} className={styles.configItem}>
                                    <span>{attribute}</span>
                                    <button className={styles.deleteButton} onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete the attribute "${attribute}"? This action cannot be undone.`)) {
                                            deleteIndexedAttribute(attribute);
                                        }
                                    }}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className={styles.emptyMessage}>No indexed attributes found</p>
                            )}
                            </div>
                        </div>
            <h4> Instance Control</h4>
                <div className={styles.instanceControl}>
                    <Button variant='success' size='sm' onClick={onClickStartInstance} disabled={isRunDisabled || instanceState === 0 || instanceState === 1} style={{ marginRight: 8 }}>Start Instance</Button>
                    <Button variant='info' size='sm' onClick={onClickSyncInstance} disabled={isRunDisabled || instanceState === 1} style={{ marginRight: 8 }}>Sync Instance</Button>
                    <Button variant='danger' size='sm' onClick={onClickStopInstance} disabled={isRunDisabled || instanceState === 1 || instanceState === 2} style={{ marginRight: 16 }}>Stop Instance</Button>
                </div>
        </div>
    </div>
  );
}