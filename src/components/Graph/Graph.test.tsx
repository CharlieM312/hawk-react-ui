import { render } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Graph from './Graph';

vi.mock('react-cytoscapejs', () => {
  return {
    __esModule: true,
    default: (props: any) => <div data-testid="cytoscape-mock" />
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

  test('Renders CytoscapeComponent when valid data is provided', () => {
    const data          = {
      isCancelled: false,
      wallMillis: 5,
      result: {
        vMap: { '1': { id: 1, name: 'Node 1' } },
        vList: [{ vModelElement: { id: 1, name: 'Node 1' } }]
      }
    } as unknown as QueryReport;
    const { container } = render(<Graph data={data} />);
    expect(container.querySelector('[data-testid="cytoscape-mock"]')).toBeInTheDocument(); // CytoscapeComponent renders a div with test id
  });
});
