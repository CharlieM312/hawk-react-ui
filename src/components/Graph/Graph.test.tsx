import { fireEvent, render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Graph from './Graph';

vi.mock('reactflow', () => {
  return {
    __esModule: true,
    Background: () => <div data-testid="reactflow-background-mock" />,
    Controls: () => <div data-testid="reactflow-controls-mock" />,
    Edge: () => <div data-testid="reactflow-edge-mock" />,
    MiniMap: () => <div data-testid="reactflow-minimap-mock" />,
    default: (props: any) => (
      <div data-testid="reactflow-mock">
        <button
          data-testid="trigger-node-click"
          onClick={() =>
            props.onNodeClick?.(
              {} as any,
              {
                id: '1',
                data: {
                  id: 1,
                  typeName: 'Class',
                  file: 'model.xmi',
                  metamodelUri: 'mm://demo',
                  repositoryUrl: 'https://repo',
                  attributes: [{ name: 'firstName' }, { name: 'age' }],
                  references: [{ name: 'owner' }]
                }
              } as any
            )
          }
        >
          click-node
        </button>
      </div>
    )
  };
});

describe('Graph component', () => {
  test('Renders empty JSX element when data is null', () => {
    const data          = null;
    const { container } = render(<Graph data={data} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('Renders empty JSX element when vList is empty', () => {
    const data          = { isCancelled: false, wallMillis: 5, result: { vMap: {}, vList: [] } } as unknown as QueryReport;
    const { container } = render(<Graph data={data} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('Renders ReactFlow when valid data is provided', () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: { '1': { id: 1, name: 'Node 1' } },
        vList: [{ vModelElement: { id: 1, typeName: 'Node 1', file: 'myFile' } }]
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} />);
    expect(container.querySelector('[data-testid="reactflow-mock"]')).toBeInTheDocument(); // ReactFlow renders a div with test id
  });

  test('Displays node info when a node is clicked', () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: {  },
        vList: [{ vModelElement: { id: 1, typeName: 'Class', file: 'model.xmi', metamodelUri: 'mm://demo', repositoryUrl: 'https://repo', attributes: [{ name: 'firstName' }, { name: 'age' }], references: [{ name: 'owner' }] } }]
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} />);
    fireEvent.click(screen.getByTestId('trigger-node-click'));
    expect(screen.getByText('Selected Node Info')).toBeInTheDocument();
  });


  test('Checks for no valid data', () => {
    const warnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        myMap: ['1']
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} />);
    expect(warnMock).toHaveBeenCalledWith('Graph: no valid vList or vModelElement — skipping graph render', data);
  });
});
