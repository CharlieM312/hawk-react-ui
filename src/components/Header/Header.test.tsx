import { render, screen } from '@testing-library/react';
import Header from './Header';
import { describe, test, expect } from 'vitest';

describe('Header component', () => {
  test('Renders the title and line', () => {
    const { container } = render(<Header />);

    const title = screen.getByText('Hawk Docker');
    expect(title).toBeInTheDocument();

    const line = container.querySelector('hr');
    expect(line).toBeInTheDocument();
  });
});
