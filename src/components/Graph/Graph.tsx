import { useCallback, useEffect, useState, useRef } from 'react';
import { ReactFlow, Background, Controls, Edge, MarkerType, Node, NodeChange, applyNodeChanges, Panel } from '@xyflow/react';
import type { CSSProperties } from 'react';
import '@xyflow/react/dist/style.css';
import styles from './Graph.module.css';
import { faMaximize, faMinimize, faXmark } from '@fortawesome/free-solid-svg-icons';
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
  position?: number | null;
  positions?: number[] | null;
  id?: string | null;
  ids?: string[] | null;
  mixed?: Array<{ id?: string | null; position?: number | null }> | null;
};

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
  const [appTheme, setAppTheme] = useState(document.getElementById('root')?.getAttribute('data-theme') ?? 'light');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [nodeInfo, setNodeInfo] = useState<SelectedNodeInfo>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const hasNodeInfo = nodeInfo !== null;
  const graphHeight = hasNodeInfo ? '400px' : '650px';
  const NODE_WIDTH = 150;
  const NODE_HEIGHT = 80;
  const STEP_X = 70;
  const STEP_Y = 60;

  useEffect(() => {
    if (!data) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const initialElements: {
      data: {
        source: any; target: any; id: any; label: any; typeName: any; file: any;
        metamodelUri: any; repositoryUrl: any; attributes: any; references?: any;
      };
    }[] = [];

    const vList = data.result?.vList;
    const vModelElement = data.result?.vModelElement;
    const itemsToRender = (vList && Array.isArray(vList) && vList.length > 0)
      ? vList
      : (vModelElement ? [{ vModelElement }] : []);

    for (const item of itemsToRender) {
      const modelElem = item?.vModelElement;
      if (modelElem?.id != null) {
        const id = String(modelElem.id);
        const label = modelElem.typeName ? `${modelElem.typeName} (#${modelElem.id})` : id;
        initialElements.push({
          data: {
            id,
            label,
            typeName: modelElem.typeName,
            file: modelElem.file,
            source: modelElem.source,
            target: modelElem.target,
            metamodelUri: modelElem.metamodelUri,
            repositoryUrl: modelElem.repositoryURL,
            attributes: modelElem.attributes,
            references: modelElem.references
          }
        });
      }
    }

    const nodeStyle: CSSProperties = {
      border: '1px solid #777',
      padding: '10px',
      borderRadius: '5px',
      width: 150,
      fontSize: '12px',
      textAlign: 'center',
    };

    const initialNodes: Node[] = initialElements
      .filter((el) => !el.data.source)
      .map((el, index) => ({
        id: String(el.data.id),
        data: { ...el.data, label: String(el.data.label ?? '') },
        position: { x: (index % 5) * 220, y: Math.floor(index / 5) * 140 },
        style: nodeStyle
      }));

    const initialEdges: Edge[] = initialElements
      .filter((el) => el.data.source && el.data.target)
      .map((el) => ({
        id: `e${String(el.data.source)}-${String(el.data.target)}`,
        source: String(el.data.source),
        target: String(el.data.target)
      }));

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [data]);

  useEffect(() => {
        const root = document.getElementById('root');
        if (!root) return;
        const observer = new MutationObserver(() => {
            setAppTheme(root?.getAttribute('data-theme') ?? 'light');
        });
        observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);

  const onNodesChange = useCallback(
   (changes: NodeChange[]) => {
    setNodes((changed) => applyNodeChanges(changes, changed));
   },
   [setNodes]
  )

  const toggleFullScreen = useCallback(() => {
    console.log('Toggling fullscreen');
    if (!reactFlowWrapper.current) return;

    if (!document.fullscreenElement) {
      reactFlowWrapper.current.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  }, []);

  const displayNodeInfo = (event: React.MouseEvent, node: Node) => {
    const nodeData = node.data;
    setNodeInfo({
      id: String(nodeData.id),
      typeName: String(nodeData.typeName),
      file: String(nodeData.file),
      metamodelUri: String(nodeData.metamodelUri),
      attributes: nodeData.attributes as AttributeSlot[],
      references: nodeData.references as ReferenceSlot[],
      repositoryUrl: String(nodeData.repositoryUrl)
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

  const isOccupied = (nodes: Node[], x: number, y: number) => {
    return nodes.some((n) => Math.abs(n.position.x - x) < NODE_WIDTH && Math.abs(n.position.y - y) < NODE_HEIGHT);
  }

  const getNextChildNodePosition =(nodes: Node[], sourceNode: Node | undefined) => {
    if (!sourceNode) {
      return { x: (nodes.length % 5) * 220, y: Math.floor(nodes.length / 5) * 140 };
    }

    // Position new node in a different place, so also check if occupied
    const offsets = [0, 1, -1, 2, -2, 3, -3, 4, -4];
    for (const k of offsets) {
      const x = sourceNode.position.x + STEP_X;
      const y = sourceNode.position.y + k * STEP_Y;
      if (!isOccupied(nodes, x, y)) return { x, y };

    }

    return { x: sourceNode.position.x + STEP_X * 2, y: sourceNode.position.y };

  }

  const getModelElement = async (value: string, sourceNodeId: string, attributeName: string) => {

    if (!value || value === 'N/A') return;

    try {
      const options: QueryOptions = {
        includeAttributes: true,
        includeReferences: true,
        includeNodeIds: true
      };

      const client = Create(url);
      const modelElements: ModelElement[] = await client.resolveProxies(name, [value], options);
      if (modelElements.length === 0) return;

      const elem = modelElements[0];
      const targetId = elem.id && elem.id !== 'N/A' ? String(elem.id) : value;
      if (!targetId || targetId === 'N/A') return;

      const label = elem.typeName ? `${elem.typeName} (#${targetId})` : targetId;

      setNodes((prev) => {
        const exists = prev.some((n) => n.id === targetId);
        if (exists) return prev;

        const sourceNode = prev.find((n) => n.id === sourceNodeId);
        const position = getNextChildNodePosition(prev, sourceNode);

        return [
          ...prev,
          {
            id: targetId,
            data: {
              id: targetId,
              label,
              typeName: elem.typeName,
              file: elem.file,
              metamodelUri: elem.metamodelUri,
              repositoryUrl: elem.repositoryURL,
              attributes: elem.attributes ?? null,
              references: elem.references ?? null
            },
            position,
            style: nodeStyle
          }
        ];
      });

      setEdges((prev) => {
        const edgeId = `e${sourceNodeId}-${targetId}`;
        const exists = prev.some((e) => e.id === edgeId);
        if (exists) return prev;
        return [...prev, { id: edgeId, source: sourceNodeId, target: targetId, label: attributeName, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 } }];
      });

      setNodeInfo({
        id: targetId,
        typeName: elem.typeName,
        file: elem.file,
        metamodelUri: elem.metamodelUri,
        repositoryUrl: elem.repositoryURL,
        attributes: elem.attributes ?? null,
        references: elem.references ?? null
      });
    } catch (err) {
      console.error('Failed to resolve model element', err);
    }
  };

  function getReferenceValue(ref: ReferenceSlot | null): string {

    if (!ref) return 'N/A';

    if (typeof ref.id === 'number' || typeof ref.id === 'string') {
      return String(ref.id);
    }

    if (Array.isArray(ref.ids) && ref.ids.length > 0) {
      return ref.ids.map(String).join(', ');
    }

    if (Array.isArray(ref.mixed) && ref.mixed.length > 0) {
      const ids = ref.mixed.map((m) => m?.id).filter((v): v is string => Boolean(v));
      if (ids.length > 0) return ids.join(', ');
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
      <div ref={reactFlowWrapper} style={{ width: '100%', maxWidth: '100vw', height: graphHeight, border: '1px solid #ccc', backgroundColor: appTheme === 'dark' ? '#333' : '#fff' }}>
        <ReactFlow
          colorMode={appTheme === 'dark' ? 'dark' : 'light'}
          nodes={nodes}
          edges={edges}
          onNodeClick={displayNodeInfo}
          onNodesChange={onNodesChange}
          fitView
        >
          <Panel position="top-right">
            <button onClick={() => toggleFullScreen()} name="Toggle Fullscreen" title="Toggle Fullscreen" className={styles.fullScreenButton} aria-label="Toggle fullscreen">
              <FontAwesomeIcon color={appTheme === 'dark' ? '#fff' : '#000'} icon={isFullScreen ? faMinimize : faMaximize} />
            </button>
          </Panel>
          <Background color="#aaa" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
      {hasNodeInfo && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <div className={styles.nodeInfoHeader}>
            <h3 className={styles.nodeInfoTitle}>Selected Node Info</h3>
            <button className={styles.closeButton} aria-label="Close node info" onClick={() => setNodeInfo(null)}>
              <FontAwesomeIcon color={appTheme === 'dark' ? '#fff' : '#000'} icon={faXmark} />
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
                          if (nodeInfo?.id){
                            getModelElement(id.trim(), nodeInfo.id, name);
                          }
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
