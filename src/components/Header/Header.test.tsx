import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header component', () => {
  test('Renders the title and line', () => {
    const { container } = render(<Header />);

    const title = screen.getByText('Hawk Docker');
    expect(title).toBeInTheDocument();

    expect(container.querySelector('hr')).toHaveClass('line');
  });
});
