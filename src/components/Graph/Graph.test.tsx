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
                  attributes: [{ name: 'firstName', value: { vString: 'John' } }, { name: 'age', value: { vInteger: 30 } }],
                  references: [{ name: 'myReference', id: 21 }]
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

vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => ['org.eclipse.hawk.epsilon.emc.EOLQueryEngine', 'org.eclipse.hawk.timeaware.queries.TimeAwareEOLQueryEngine']),
    listInstances: vi.fn(() => [])
  }))
}));

describe('Graph component', () => {

  test('Renders ReactFlow when valid data is provided', () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: { '1': { id: 1, name: 'Node 1' } },
        vList: [{ vModelElement: { id: 1, typeName: 'Node 1', file: 'myFile' } }]
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} url={'hawk'} name={'test'} />);
    expect(container.querySelector('[data-testid="reactflow-mock"]')).toBeInTheDocument(); // ReactFlow renders a div with test id
  });

  test('Displays node info when a node is clicked', () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: {  },
        vList: [{ vModelElement: { id: 1, typeName: 'Class', file: 'model.xmi', metamodelUri: 'file://mymetamodel', repositoryUrl: 'https://repo.com', attributes: [{ name: 'firstName' }, { name: 'age' }], references: [{ name: 'owner' }] } }]
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} url={'hawk'} name={'test'} />);
    fireEvent.click(screen.getByTestId('trigger-node-click'));
    expect(screen.getByText('Selected Node Info')).toBeInTheDocument();
  });

  test('Displays node info, then closes it', () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: {  },
        vList: [{ vModelElement: { id: 1, typeName: 'Class', file: 'model.xmi', metamodelUri: 'file://mymetamodel', repositoryUrl: 'https://repo.com', attributes: [{ name: 'firstName' }, { name: 'age' }], references: [{ name: 'owner' }] } }]
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} url={'hawk'} name={'test'} />);
    fireEvent.click(screen.getByTestId('trigger-node-click'));
    expect(screen.getByText('Selected Node Info')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Close node info/i }))
    expect(screen.queryByText('Selected Node Info')).not.toBeInTheDocument();
  });

  test('Displays no attributes when none are available', () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: {  },
        vList: [{ vModelElement: { id: 1, typeName: 'Class', file: 'model.xmi', metamodelUri: 'file://mymetamodel', repositoryUrl: 'https://repo.com', attributes: null } }]
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} url={'hawk'} name={'test'} />);
    fireEvent.click(screen.getByTestId('trigger-node-click'));
    expect(screen.getByText('Selected Node Info')).toBeInTheDocument();
  });
});
