import { useRef } from 'react';
import ReactFlow, { Background, Controls, Edge, MiniMap, Node } from 'reactflow';
import type { CSSProperties } from 'react';
import 'reactflow/dist/style.css';

type GraphProps = {
  data: QueryReport | null;
}

export default function Graph({ data }: GraphProps) {
  const cyRef = useRef<any>(null);

  if (data === null) {
    return (<></>);
  }

  const vList = data.result?.vList;
  const vMap = data.result?.vMap;
  const vModelElement = data.result?.vModelElement;

  // Use vList if available, otherwise use vModelElement as a single-item array
  const itemsToRender = (vList && Array.isArray(vList) && vList.length > 0) 
    ? vList 
    : (vModelElement ? [{ vModelElement }] : []);

  if (!itemsToRender || itemsToRender.length === 0) {
    console.warn('Graph: no vList or vModelElement — skipping graph render', data);
    return (<></>);
  }
  const elements: { data: {
    source: any; target: any; id: any; label: any; typeName: any; file: any; 
}; }[] = [];
  for (const item of itemsToRender) {
    const modelElem = item?.vModelElement;
    if (modelElem && modelElem.id != null) {
      const id = String(modelElem.id);
      const label = modelElem.typeName ? `${modelElem.typeName} (#${modelElem.id})` : id;
      elements.push({ data: { id, label, typeName: modelElem.typeName, file: modelElem.file, source: modelElem.source, target: modelElem.target } });
    }
  }

  if (elements.length === 0) {
    console.warn('Graph: no valid elements found in vList — skipping graph render', data);
    return (<></>);
  }

  const displayNodeInfo = (event: React.MouseEvent, node: Node) => {
    const nodeData = node.data;
    alert(`Node Info:\nID: ${nodeData.id}\nType: ${nodeData.typeName}\nFile: ${nodeData.file}`);
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
    <div style={{ width: '900px', height: '600px', border: '1px solid #ccc' }}>
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
  );
}
