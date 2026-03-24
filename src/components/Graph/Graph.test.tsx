import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Graph from './Graph';

vi.mock('@xyflow/react', async(importOriginal) => {
  const actual = await importOriginal<typeof import('@xyflow/react')>();
  const ReactFlowMock = ({children, onNodeClick}: any) => (
    <div data-testid="reactflow-mock">
      <button
        data-testid="trigger-node-click"
        onClick={() =>
          onNodeClick?.(
            {} as any,
            {
              id: '1',
              data: {
                id: 1,
                typeName: 'Class',
                file: 'model.xmi',
                metamodelUri: 'mm://demo',
                repositoryUrl: 'https://repo',
                attributes: [{ name: 'firstName', value: { vString: 'John' } }, { name: 'age', value: { vInteger: 30 }}, {name: 'otherAges', value: {vIntegers: [30,31,32]}} ],
                references: [{ name: 'myReference', ids: [21, 22, 23] }]
              }
            } as any
          )
        }
      >
        click-node
      </button>
      {children}
    </div>
  );

  return {
    ...actual,
    __esModule: true,
    MarkerType: {
      ArrowClosed: 'arrowclosed',
    },
    ReactFlow: ReactFlowMock,
    Background: () => <div data-testid="reactflow-background-mock" />,
    Controls: () => <div data-testid="reactflow-controls-mock" />,
    Edge: () => <div data-testid="reactflow-edge-mock" />,
    MiniMap: () => <div data-testid="reactflow-minimap-mock" />,
    default: ReactFlowMock
  };
});

vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => ['org.eclipse.hawk.epsilon.emc.EOLQueryEngine', 'org.eclipse.hawk.timeaware.queries.TimeAwareEOLQueryEngine']),
    listInstances: vi.fn(() => []),
    resolveProxies: vi.fn(() => [{id: '59', typeName: 'myClass', file: 'model.xmi', metamodelUri: 'file://mymetamodel', repositoryUrl: 'https://repo.com', attributes: [{ name: 'firstName', value: { vString: 'John' } }, { name: 'age', value: { vInteger: 30 } }], references: [{ name: 'myReference', id: 21 }]}])
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
    expect(container.querySelector('[data-testid="reactflow-mock"]')).toBeInTheDocument();
  });

  test('Displays node info when a node is clicked', async () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: {  },
        vList: [{ vModelElement: { id: 1, typeName: 'Class', file: 'model.xmi', metamodelUri: 'file://mymetamodel', repositoryUrl: 'https://repo.com', attributes: [{ name: 'firstName' }, { name: 'age' }], references: [{ name: 'owner' }] } }]
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} url={'hawk'} name={'test'} />);
    act(() => {
      fireEvent.click(screen.getByTestId('trigger-node-click'));
    });
    await waitFor(() => expect(screen.getByText('Selected Node Info')).toBeInTheDocument());
  });

  test('Triggers fullscreen', async () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: {  },
        vList: [{ vModelElement: { id: 1, typeName: 'Class', file: 'model.xmi', metamodelUri: 'file://mymetamodel', repositoryUrl: 'https://repo.com', attributes: [{ name: 'firstName' }, { name: 'age' }], references: [{ name: 'owner' }] } }]
      }
    } as unknown as QueryReport;
    const {container} = render(<Graph data={data} url={'hawk'} name={'test'} />);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Toggle fullscreen/i }))
    });


  });

  test('Displays node info, then closes it', async () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: {  },
        vList: [{ vModelElement: { id: 1, typeName: 'Class', file: 'model.xmi', metamodelUri: 'file://mymetamodel', repositoryUrl: 'https://repo.com', attributes: [{ name: 'firstName' }, { name: 'age' }], references: [{ name: 'owner' }] } }]
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} url={'hawk'} name={'test'} />);
    act(() => {
      fireEvent.click(screen.getByTestId('trigger-node-click'));
    });
    await waitFor(() => expect(screen.getByText('Selected Node Info')).toBeInTheDocument());
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Close node info/i }))
    });
    expect(screen.queryByText('Selected Node Info')).not.toBeInTheDocument();
  });

  test('Displays node info, clicks on a reference and updates the node info', async () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: {  },
        vList: [{ vModelElement: { id: 1, typeName: 'Class', file: 'model.xmi', metamodelUri: 'file://mymetamodel', repositoryUrl: 'https://repo.com', attributes: [{ name: 'firstName' }, { name: 'age' }], references: [{ name: 'owner' }] } }]
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} url={'hawk'} name={'test'} />);
    act(() => {
      fireEvent.click(screen.getByTestId('trigger-node-click'));
    });
    await waitFor(() => expect(screen.getByText('Selected Node Info')).toBeInTheDocument());
    act(() => {
      fireEvent.click(screen.getByRole('link', { name: '21' }));
    });
    await waitFor(() => expect(screen.getByText('myClass')).toBeInTheDocument());
  });

  test('Displays no attributes when none are available', async () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: {  },
        vList: [{ vModelElement: { id: 1, typeName: 'Class', file: 'model.xmi', metamodelUri: 'file://mymetamodel', repositoryUrl: 'https://repo.com', attributes: null } }]
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} url={'hawk'} name={'test'} />);
    act(() => {
      fireEvent.click(screen.getByTestId('trigger-node-click'));
    });
    await waitFor(() => expect(screen.getByText('Selected Node Info')).toBeInTheDocument());
    expect(screen.getByText('Selected Node Info')).toBeInTheDocument();
  });
});
