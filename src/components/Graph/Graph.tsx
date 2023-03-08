import CytoscapeComponent from 'react-cytoscapejs';
import { Popover } from 'antd';

type GraphProps = {
  data: QueryReport | null;
}

export default function Graph({ data }: GraphProps) {
  if (data === null) {
    return (<></>);
  }

  const elements: { data: { id: any; label: any; }; }[] = [];

  if (data.result?.vList) {
    Object.entries(data.result.vList).forEach(([key, value], index) => {
      elements.push({
        data: { id: value.vModelElement.id, label: value.vModelElement.id, }
      });
    });
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
