import Modal from 'react-modal';
import { CloseButton } from 'react-bootstrap';
import Create  from '../../js/client/Create';
import styles from './New.module.css';
import { useEffect, useRef, useState } from 'react';
import { ClipLoader } from 'react-spinners';

type NewProps = {
  isOpen: boolean;
  toggle: () => void;
  title: string;
}

type HawkState = 0 | 1 | 2;

type InstanceType = {
  name: string;
  message: string;
  state: HawkState;
}

export default function New({ isOpen, toggle, title }: NewProps) {

  const clientRef = useRef<HawkClient | null>(null);
  const [backends, setBackends] = useState<string[]>([]);
  const [updaters, setUpdaters] = useState<string[]>([]);
  const [metamodelParsers, setMetaModels] = useState<string[]>([]);
  const [modelParsers, setModels] = useState<string[]>([]);
  const [queryEngines, setQueryEngines] = useState<string[]>([]);
  const [plugins, setPlugins] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const envUrl = import.meta.env.VITE_APP_HAWK_URL ?? '';
        clientRef.current = Create(envUrl);
        const backendsList: string[] = await clientRef.current.listBackends();
        const pluginsList: string[] = await clientRef.current.listPlugins();
        const updaters = ['org.eclipse.hawk.graph.updater.GraphModelUpdater', 'org.eclipse.hawk.timeaware.graph.TimeAwareModelUpdater'];
        const metamodelParsers = ['org.eclipse.hawk.emf.metamodel.EMFMetaModelResourceFactory','org.eclipse.hawk.modelio.exml.metamodel.ModelioMetaModelResourceFactory','org.eclipse.hawk.uml.metamodel.UMLMetaModelResourceFactory'];
        const modelParsers =  ['org.eclipse.hawk.emf.metamodel.EMFModelParser', 'org.eclipse.hawk.modelio.exml.model.ModelioModelResourceFactory', 'org.eclipse.hawk.uml.model.UMLModelResourceFactory'];
        const queryEngines = ['org.eclipse.hawk.epsilon.emc.EOLQueryEngine','org.eclipse.hawk.epsilon.emc.EPLQueryEngine','org.eclipse.hawk.orientdb.query.OrientSQLQueryEngine','org.eclipse.hawk.timeaware.queries.TimeAwareEOLQueryEngine','org.eclipse.hawk.timeaware.queries.TimelineEOLQueryEngine']
        const validmetamodelParsers = pluginsList.filter((item) => metamodelParsers.includes(item));
        const validUpdaters = pluginsList.filter((item) => updaters.includes(item));
        const validModelParsers = pluginsList.filter((item) => modelParsers.includes(item));
        const validQueryEngines = pluginsList.filter((item) => queryEngines.includes(item));
        if (validUpdaters.length > 0) {
          setUpdaters(validUpdaters);
        } else {
          console.warn('No valid updaters found in plugins list:', pluginsList);
        }
        if (validmetamodelParsers.length > 0){
          setMetaModels(validmetamodelParsers);
        }
        if (validModelParsers.length > 0){
          setModels(validModelParsers);
        }
        if (validQueryEngines.length > 0){
          setQueryEngines(validQueryEngines);
        }

        let validPlugins = pluginsList
          .filter((item) => !updaters.includes(item))
          .filter((item) => !backendsList.includes(item))
          .filter((item) => !validmetamodelParsers.includes(item))
          .filter((item) => !validModelParsers.includes(item))
          .filter((item) => !validQueryEngines.includes(item));
        setBackends(backendsList);
        setPlugins(validPlugins);
      } catch (err) {
        console.error('Failed to create Hawk client or fetch backends:', err);
      }
    };
    init();
  }, []);

  const handleSubmission = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const instanceName = formData.get('instanceName') as string;
    const backend = formData.get('backend') as string;
    const minDelay = formData.get('minDelay') as string;
    const maxDelay = formData.get('maxDelay') as string;
    const updater = formData.get('updater') as string;
    const metamodelParser = formData.getAll('metamodelParser') as string[];
    const modelParser = formData.getAll('modelParser') as string[];
    const queryEngine = formData.getAll('queryEngine') as string[];
    const pluginsSelected = formData.getAll('plugins') as string[];
    const indexFactory = formData.get('indexFactory') as string;

    //Check if instance name is empty
    if (instanceName.trim() === '') {
      alert('Instance name cannot be empty.');
      return;
    }

    if (minDelay === '' || maxDelay === '') {
      alert('Please provide both minimum and maximum delay periods.');
      return;
    }

    if (parseInt(minDelay) > parseInt(maxDelay)) {
      alert('Minimum delay period cannot be greater than maximum delay period.');
      return;
    }
    const minDelayNumber = parseInt(minDelay);
    const maxDelayNumber = parseInt(maxDelay);

    //Get instances to check if one with this name already exists
    try {
      const existingInstances = clientRef.current ? await clientRef.current.listInstances() : [];
      if (Array.isArray(existingInstances) && existingInstances.some((instance: InstanceType) => instance.name === instanceName)) {
        alert('An instance with this name already exists. Please choose a different name.');
        return;
      }
    } catch (err) {
      console.error('Failed to fetch existing instances:', err);
      alert('Failed to validate instance name uniqueness. See console for details.');
      return;
    }

    const args: any[] = [instanceName, backend, minDelayNumber, maxDelayNumber];
    pluginsSelected.push(updater);
    // PluginsSelected will always have at least one element (the updater), so we can directly push it to the args array without checking its length
    if (modelParser.length > 0){
      for (const item of modelParser){
        pluginsSelected.push(item);
      }
    } else {
      alert('At least one model parser is required!');
      return;
    }
    if (metamodelParser.length > 0){
      for (const item of metamodelParser){
        pluginsSelected.push(item);
      }
    } else {
      alert('At least one metamodel parser is required!');
      return;
    }
    if (queryEngine.length > 0){
      for (const item of queryEngine){
        pluginsSelected.push(item);
      }
    } else {
      alert('At least one query engine is required!');
      return;
    }
    args.push(pluginsSelected);
    if (indexFactory !== '') args.push(indexFactory);

    try {
      setLoading(true);
      if (!clientRef.current) throw new Error('Hawk client is not initialized.');
      await clientRef.current?.createInstance(...args);
      alert(`Instance "${instanceName}" created successfully!`);
      toggle();
    } catch (err: any) {
      console.error('createInstance failed. args:', {
        instanceName, backend, minDelayNumber, maxDelayNumber, pluginsSelected, indexFactory
      });
      console.error('Thrift error/full object:', err);
      if (err && err.message) console.error('Thrift message:', err.message);
      if (err && err.stack) console.error(err.stack);
      alert('Failed to create instance. See console and server logs.');
    } finally {
      setLoading(false);
    }

  };

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
      <div className={styles.body}>
          <form onSubmit={handleSubmission}>
            <input type="text" name="instanceName" disabled={loading} placeholder="Instance name" className={styles.input} />
            <label className={styles.label}>Updater</label>
            <select aria-label="Updater" name="updater" id="updater" disabled={loading} className={styles.input}>
              {updaters.map((updater) => (
                <option key={updater} value={updater}>{updater}</option>
              ))}
            </select>
            <label className={styles.label}>Backends</label>
            <select name="backend" id="backend" disabled={loading} className={styles.input}>
              {backends.map((backend) => (
                <option key={backend} value={backend}>{backend}</option>
              ))}
            </select>
            <label className={styles.label}>Metamodel Parsers</label>
            <select aria-label="Metamodel Parsers" name="metamodelParser" id="metamodelParser" multiple={true} disabled={loading} className={styles.input}>
              {metamodelParsers.map((metamodel) => (
                <option key={metamodel} value={metamodel}>{metamodel}</option>
              ))}
            </select>
            <label className={styles.label}>Model Parsers</label>
            <select aria-label="Model Parsers" name="modelParser" id="modelParser" multiple={true} disabled={loading} className={styles.input}>
              {modelParsers.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            <label className={styles.label}>Query Engines</label>
            <select aria-label="Query Engines" name="queryEngine" id="queryEngine" multiple={true} disabled={loading} className={styles.input}>
              {queryEngines.map((engine) => (
                <option key={engine} value={engine}>{engine}</option>
              ))}
            </select>
            <input type="number" name="minDelay" disabled={loading} placeholder="Minimum Delay Period (ms)" className={styles.input} />
            <input type="number" name="maxDelay" disabled={loading} placeholder="Maximum Delay Period (ms)" className={styles.input} />
            <br></br>
            <label className={styles.label}>Plugins</label>
            <select name="plugins" id="plugins" multiple={true} disabled={loading} className={styles.input}>
              {plugins.map((plugin) => (
                <option key={plugin} value={plugin}>{plugin}</option>
              ))}
            </select>
            <input type="text" name="indexFactory" disabled={loading} placeholder="Index Factory" className={styles.input} />
            <button type="submit" disabled={loading} className={styles.input}>
              {loading ? <ClipLoader size={20} color="#7e56c2" /> : 'Create'}
            </button>
          </form>
      </div>
    </Modal>
  );
}
