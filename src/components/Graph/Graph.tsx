import { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, Edge, Node } from 'reactflow';
import type { CSSProperties } from 'react';
import 'reactflow/dist/style.css';
import styles from './Graph.module.css';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Create from '../../js/client/Create';

type GraphProps = {
  data: QueryReport | null;
  url: string;
  name: string;
}

type SlotValue = {
  vBoolean?: boolean | null;
  vBooleans?: boolean[] | null;
  vByte?: number | null;
  vBytes?: number[] | null;
  vDouble?: number | null;
  vDoubles?: number[] | null;
  vInteger?: number | null;
  vIntegers?: number[] | null;
  vLists?: unknown[] | null;
  vLong?: number | null;
  vLongs?: number[] | null;
  vShort?: number | null;
  vShorts?: number[] | null;
  vString?: string | null;
  vStrings?: string[] | null;
}

type AttributeSlot = {
  name: string;
  value: SlotValue;
}

type ReferenceSlot = {
  name: string;
  value: ReferenceValue;
}


type ReferenceValue = {
  name?: string;
  id?: number;
  ids?: number[];
}

type ModelElement = {
  attributes?: AttributeSlot[],
  containers?: string[],
  file?: string,
  id?: string,
  metamodelUri?: string,
  references?: ReferenceSlot[],
  repositoryURL?: string,
  typeName?: string
}

type QueryOptions = {
  defaultNamespaces?: string;
  filePatterns?: string[];
  includeAttributes?: boolean;
  includeContainedElements?: boolean;
  includeDerived?: boolean;
  includeNodeIds?: boolean;
  includeReferences?: boolean;
  repositoryPattern?: string;
}

type SelectedNodeInfo = {
  id: string;
  typeName?: string;
  file?: string;
  metamodelUri?: string
  attributes?: AttributeSlot[] | null;
  references?: ReferenceSlot[] | null;
  repositoryUrl?: string;
} | null;

export default function Graph({ data, url, name }: GraphProps) {
  const [nodeInfo, setNodeInfo] = useState<SelectedNodeInfo>(null);
  const hasNodeInfo = nodeInfo !== null;
  const graphHeight = hasNodeInfo ? '400px' : '550px';
  let hawkClient: HawkClient;

  useEffect(() => {
      if (!name) return;
      try {
        hawkClient = Create(url);
      } catch (err) {
        console.error('Error creating Hawk client:', err);
      }
  }, [url]);

  if (data === null) {
    return (<></>);
  }

  const vList = data.result?.vList;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const vMap = data.result?.vMap;
  const vModelElement = data.result?.vModelElement;

  // Use vList if available, otherwise use vModelElement as a single-item array
  const itemsToRender = (vList && Array.isArray(vList) && vList.length > 0)
    ? vList
    : (vModelElement ? [{ vModelElement }] : []);

  if (!itemsToRender || itemsToRender.length === 0) {
    console.warn('Graph: no valid vList or vModelElement — skipping graph render', data);
    return (<></>);
  }
  const elements: { data: {
    source: any; target: any; id: any; label: any; typeName: any; file: any; metamodelUri: any; repositoryUrl: any; attributes: any; references?: any;
  }; }[] = [];
  for (const item of itemsToRender) {
    const modelElem = item?.vModelElement;
    if (modelElem && modelElem.id != null) {
      const id = String(modelElem.id);
      const label = modelElem.typeName ? `${modelElem.typeName} (#${modelElem.id})` : id;
      elements.push({ data: { id, label, typeName: modelElem.typeName, file: modelElem.file, source: modelElem.source, target: modelElem.target, metamodelUri: modelElem.metamodelUri, repositoryUrl: modelElem.repositoryURL, attributes: modelElem.attributes, references: modelElem.references } });
    }
  }

  const displayNodeInfo = (event: React.MouseEvent, node: Node) => {
    const nodeData = node.data;
    setNodeInfo({
      id: String(nodeData.id),
      typeName: nodeData.typeName,
      file: nodeData.file,
      metamodelUri: nodeData.metamodelUri,
      attributes: nodeData.attributes,
      references: nodeData.references,
      repositoryUrl: nodeData.repositoryUrl
    });
  };

  function getAttributeValue(value?: SlotValue | null): string {
    if (value == null) return 'N/A';

    const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined);
    if (entries.length === 0) return 'N/A';

    const [, raw] = entries[0];

    if (Array.isArray(raw)) {
      return raw.length ? raw.map(String).join(', ') : '[]';
    }

    return String(raw);

  };

  const getModelElement = async (value: string) => {

    if (value != 'N/A') {

      try {
        let listtoAdd: string[] = [];
        let options: QueryOptions = {includeAttributes: true, includeReferences: true, includeNodeIds: true};
        hawkClient = Create(url);
        listtoAdd.push(value);
        const modelElements: ModelElement[] = await hawkClient.resolveProxies(name, listtoAdd, options);
        console.log(modelElements);
        if (modelElements.length > 0) {
          const elem = modelElements[0];
          setNodeInfo({
            id: elem.id ?? 'N/A',
            typeName: elem.typeName,
            file: elem.file,
            metamodelUri: elem.metamodelUri,
            repositoryUrl: elem.repositoryURL,
            attributes: elem.attributes ?? null,
            references: elem.references ?? null
          });
        }

      } catch(err) {
        throw err;
      }
    }
  }

  function getReferenceValue(ref: ReferenceValue): string {

    if (typeof ref.id === 'number') {
      return String(ref.id);
    }

    if (typeof ref.id === 'string') {
      return String(ref.id);
    }

    if (Array.isArray(ref.ids) && ref.ids.length > 0) {
      return ref.ids.join(', ');
    }

    return 'N/A';
  };

  const nodeStyle: CSSProperties = {
    border: '1px solid #777',
    padding: '10px',
    borderRadius: '5px',
    width: 150,
    fontSize: '12px',
    textAlign: 'center',
    };

  const nodes: Node[] = elements
    .filter((el) => !el.data.source)
    .map((el, index) => ({
    id: String(el.data.id),
    data: {
       ...el.data,
       label: String(el.data.label ?? '') },
    position: { x: (index % 5) * 220, y: Math.floor(index / 5) * 140 },
    style: nodeStyle,
  }));

  // Edges code if edges are needed
  const edges: Edge[] = elements
    .filter((el) => el.data.source && el.data.target)
    .map((el) => ({
    id: `e${String(el.data.source)}-${String(el.data.target)}`,
    source: String(el.data.source),
    target: String(el.data.target),
    }));

  const basicInfoRows = [
    ['ID', nodeInfo?.id ?? 'N/A'],
    ['Type Name', nodeInfo?.typeName ?? 'N/A'],
    ['File', nodeInfo?.file ?? 'N/A'],
    ['Metamodel URI', nodeInfo?.metamodelUri ?? 'N/A'],
    ['Repository URL', nodeInfo?.repositoryUrl ?? 'N/A']
  ]

  const attributeRows = Array.isArray(nodeInfo?.attributes)
  ? (nodeInfo.attributes as AttributeSlot[]).map((attr) => [
      `${attr.name ?? 'N/A'}`,
      getAttributeValue(attr.value)
    ] as [string, string])
  : [['Attributes', nodeInfo?.attributes ? String(nodeInfo.attributes) : 'N/A'] as [string, string]];

const referenceRows = Array.isArray(nodeInfo?.references)
  ? (nodeInfo.references as ReferenceSlot[]).map((ref) => [
      `${ref.name ?? 'N/A'}`,
      getReferenceValue(ref)
    ] as [string, string])
  : [['References', nodeInfo?.references ? String(nodeInfo.references) : 'N/A'] as [string, string]];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '100vw', height: graphHeight, border: '1px solid #ccc' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={displayNodeInfo}
          fitView
        >
          <Background color="#aaa" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
      {hasNodeInfo && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <div className={styles.nodeInfoHeader}>
            <h3 className={styles.nodeInfoTitle}>Selected Node Info</h3>
            <button className={styles.closeButton} aria-label="Close node info" onClick={() => setNodeInfo(null)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <table className={styles.infoTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {basicInfoRows.map(([name, value], i) => (
              <tr key={`${name}-${i}`}>
                <td>{name}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
          <thead>
            <tr>
              <th>Attribute Name</th>
              <th>Attribute Value</th>
            </tr>
          </thead>
          <tbody>
            {attributeRows.map(([name, value], i) => (
              <tr key={`${name}-${i}`}>
                <td>{name}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
          <thead>
            <tr>
              <th>Reference Name</th>
              <th>Reference IDs</th>
            </tr>
          </thead>
          <tbody>
            {referenceRows.map(([name, value], i) => (
              <tr key={`${name}-${i}`}>
                <td>{name}</td>
                <td>
                  {value.split(', ').map((id, idx) => (
                    <span key={idx}>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          getModelElement(id.trim());
                        }}
                        style={{ cursor: 'pointer', marginRight: '8px' }}
                      >
                        {id.trim()}
                      </a>
                      {idx < value.split(', ').length - 1 && ', '}
                    </span>
                  ))}
              </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
