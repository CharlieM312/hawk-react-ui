import CytoscapeComponent from 'react-cytoscapejs';

type GraphProps = {
  data: QueryReport | null;
}

export default function Graph({ data }: GraphProps) {
  if (data === null) {
    return (<></>);
  }

  const vList = data.result?.vList;
  const vMap = data.result?.vMap;
  if (!vList || !Array.isArray(vList) || vList.length === 0) {
    console.warn('Graph: no vList or vList is not an array — skipping graph render', data);
    return (<></>);
  }

  const elements: { data: { id: any; label: any; }; }[] = [];
  for (const item of vList) {
    const modelElem = item?.vModelElement;
    if (modelElem && modelElem.id != null) {
      const id = String(modelElem.id);
      const label = modelElem.name || id;
      elements.push({ data: { id, label } });
    }
  }

  if (elements.length === 0) {
    console.warn('Graph: no valid elements found in vList — skipping graph render', data);
    return (<></>);
  }

  return (
    <CytoscapeComponent
      elements={elements}
      style={{width: '100%', height: '600px'}}
      pan={ { x: 250, y: 100 } }
      zoom={2}
    />
  );
}
