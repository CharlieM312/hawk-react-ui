import { fireEvent, render, screen } from '@testing-library/react';

import Home from './Home';

describe('Home component', () => {
  test('Renders `Manages Instances` title', () => {
    render(<Home />);

    const title = screen.getByText('Manage Instances');
    expect(title).toBeInTheDocument();
  });

  test('Renders `+` button', () => {
    render(<Home />);

    const button = screen.getByText('+');
    expect(button).toBeInTheDocument();
  });

  test('Renders `+` button', () => {
    render(<Home />);

    const button = screen.getByText('+');
    expect(button).toBeInTheDocument();
  });

  test('Renders `Create new instance` modal when `+` button is clicked', () => {
    render(<Home />);

    const button = screen.getByText('+');
    fireEvent.click(button);

    const modalTitle = screen.getByText('Create new instance');
    expect(modalTitle).toBeInTheDocument();
  });

  test('Renders URL input box', () => {
    render(<Home />);

    const input = screen.getByPlaceholderText('Enter Hawk server URL');
    expect(input).toBeInTheDocument();
  });

  test('Renders `Submit` button', () => {
    render(<Home />);

    const button = screen.getByText('Submit');
    expect(button).toBeInTheDocument();
  });

  test('Renders instances table when `Submit` button is clicked', () => {
    render(<Home />);

    const button = screen.getByText('Submit');
    fireEvent.click(button);

    const tableTitle = screen.getByText('Showing results for');
    expect(tableTitle).toBeInTheDocument();
  });
});
