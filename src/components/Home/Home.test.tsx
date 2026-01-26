import { fireEvent, render, screen } from '@testing-library/react';

import Home from './Home';
import { MemoryRouter } from 'react-router';

describe('Home component', () => {
  test('Renders `Manages Instances` title', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);

    const title = screen.getByText('Manage Instances');
    expect(title).toBeInTheDocument();
  });

  test('Renders `+` button', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);

    const button = screen.getByText('+');
    expect(button).toBeInTheDocument();
  });

  test('Renders `Create new instance` modal when `+` button is clicked', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);

    const button = screen.getByText('+');
    fireEvent.click(button);

    const modalTitle = screen.getByText('Create new instance');
    expect(modalTitle).toBeInTheDocument();
  });

  test('Renders URL input box', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);

    const input = screen.getByPlaceholderText('Enter Hawk server URL');
    expect(input).toBeInTheDocument();
  });

  test('Renders instance display table when a URL is submitted', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    const input = screen.getByPlaceholderText('Enter Hawk server URL');
    const submitButton = screen.getByText('Submit');
    fireEvent.change(input, { target: { value: 'http://validurl:8080' } });
    fireEvent.click(submitButton);
    const tableTitle = screen.getByText('Showing results for');
    expect(tableTitle).toBeInTheDocument();
  });

  test('Renders `Submit` button', () => {
    render(<MemoryRouter><Home /></MemoryRouter>);

    const button = screen.getByText('Submit');
    expect(button).toBeInTheDocument();
  });
});
