import { useState } from 'react';
import ReactFlow, { Background, Controls, Edge, Node } from 'reactflow';
import type { CSSProperties } from 'react';
import 'reactflow/dist/style.css';
import styles from './Graph.module.css';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type GraphProps = {
  data: QueryReport | null;
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

type ReferenceValue = {
  name?: string;
  id?: number;
  ids?: number[];
}

type SelectedNodeInfo = {
  id: string;
  typeName?: string;
  file?: string;
  metamodelUri?: string
  attributes?: SlotValue | null;
  references?: ReferenceValue | null;
  repositoryUrl?: string;
} | null;

export default function Graph({ data }: GraphProps) {
  const [nodeInfo, setNodeInfo] = useState<SelectedNodeInfo>(null);
  const hasNodeInfo = nodeInfo !== null;
  const graphHeight = hasNodeInfo ? '400px' : '600px';

  if (data === null) {
    return (<></>);
  }

  console.log(data);

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

  function getReferenceValue(ref: ReferenceValue): string {

    if (typeof ref.id === 'number') {
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
            <button className={styles.closeButton} onClick={() => setNodeInfo(null)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <div className={styles.nodeInfoGrid}>
            <div>
              <h4>Basic Info</h4>
              <p><strong>ID:</strong> {nodeInfo.id}</p>
              <p><strong>Type Name:</strong> {nodeInfo.typeName ?? 'N/A'}</p>
              <p><strong>File:</strong> {nodeInfo.file ?? 'N/A'}</p>
              <p><strong>Metamodel Uri:</strong> {nodeInfo.metamodelUri ?? 'N/A'}</p>
              <p><strong>Repository URL:</strong> {nodeInfo.repositoryUrl ?? 'N/A'}</p>
            </div>
            <div>
              <h4>Attributes</h4>
              {Array.isArray(nodeInfo.attributes) ? (
                nodeInfo.attributes.length > 0 ? (
                  <ul>
                    {(nodeInfo.attributes as AttributeSlot[]).map((attr, i) => (
                      <li key={`${attr.name ?? 'attr'}-${i}`}>
                      <strong>{attr.name ?? 'N/A'}:</strong> {getAttributeValue(attr.value)}
                      </li>
                    ))}
                  </ul>
                ) : <p>N/A</p>
                ) : (
                  <p>{nodeInfo.attributes ? String(nodeInfo.attributes) : 'N/A'}</p>
                )}
            </div>
            <div>
              <h4>References</h4>
              {Array.isArray(nodeInfo.references) ? (
                nodeInfo.references.length > 0 ? (
                  <ul>
                    {(nodeInfo.references as ReferenceValue[]).map((ref, i) => (
                      <li key={`${ref.name ?? 'ref'}-${i}`}>
                        <strong>{ref.name ?? 'N/A'}:</strong> {getReferenceValue(ref)}
                      </li>
                    ))}
                  </ul>
                ) : <p>N/A</p>
                ) : (
                  <p>{nodeInfo.references ? String(nodeInfo.references) : 'N/A'}</p>
                )}
            </div>
          </div>
      </div>
      )}
    </div>
  );
}
