import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Graph from './Graph';

describe('Graph component', () => {
  test('Renders empty JSX element when data is null', () => {
    const data          = null;
    const { container } = render(<Graph data={data} />);
    expect(container).toBeEmptyDOMElement();
  });
});
