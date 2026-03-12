import { useLayoutEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

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
  const elements: { data: { id: any; label: any; typeName: any; file: any; }; }[] = [];
  for (const item of itemsToRender) {
    const modelElem = item?.vModelElement;
    if (modelElem && modelElem.id != null) {
      const id = String(modelElem.id);
      const label = modelElem.typeName ? `${modelElem.typeName} (#${modelElem.id})` : id;
      elements.push({ data: { id, label, typeName: modelElem.typeName, file: modelElem.file } });
    }
  }

  if (elements.length === 0) {
    console.warn('Graph: no valid elements found in vList — skipping graph render', data);
    return (<></>);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', overflow: 'hidden' }}>
      <CytoscapeComponent
        elements={elements}
        layout={{ name: 'grid', fit: true, padding: 60 }}
        cy={(cy) => {
          cyRef.current = cy;
        }}
        stylesheet={[{
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'font-size': '12px',
            'text-wrap': 'wrap',
            'text-max-width': '120px',
          }
        }]}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
