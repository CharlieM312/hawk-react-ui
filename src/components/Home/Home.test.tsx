import { fireEvent, render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Home from './Home';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { act } from 'react';

vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => []),
    listBackends: vi.fn(() => ['backend1', 'backend2']),
    listPlugins: vi.fn(() => ['plugin1', 'plugin2'])
  }))
}));

describe('Home component', () => {
  test('Renders `Manages Instances` title', () => {

    act(() => {
      render(<MemoryRouter><Home /></MemoryRouter>);
    });

    const title = screen.getByText('Manage Instances');
    expect(title).toBeInTheDocument();
  });

  test('Renders `+` button', () => {
    act(() => {
      render(<MemoryRouter><Home /></MemoryRouter>);
    });

    const button = screen.getByText('+');
    expect(button).toBeInTheDocument();
  });

  test('Renders `Create new instance` modal when `+` button is clicked', () => {
    act (() => {
      render(<MemoryRouter><Home /></MemoryRouter>);
    });

    const button = screen.getByText('+');
    act (() => {
      fireEvent.click(button);
    });

    const modalTitle = screen.getByText('Create new instance');
    expect(modalTitle).toBeInTheDocument();
  });

  test('Renders URL input box', async() => {
    act(() => {
      render(<MemoryRouter><Home /></MemoryRouter>);
    });

    const input = screen.getByPlaceholderText('Enter Hawk server URL');
    expect(input).toBeInTheDocument();
    act(() => {
      fireEvent.change(input, {target: {value: 'http://localhost:8081/thrift/hawk/json'}})
    })
    const submitButton = await screen.findByRole('button', { name: 'Submit' });
    act(() => {
      submitButton.click();
    });
  });

  test('Renders instance display table when a URL is submitted', () => {
    act(() => {
      render(<MemoryRouter><Home /></MemoryRouter>);
    });
    const input = screen.getByPlaceholderText('Enter Hawk server URL');
    const submitButton = screen.getByText('Submit');
    act(() => {
      fireEvent.change(input, { target: { value: 'http://validurl:8080' } });
      fireEvent.click(submitButton);
    });
    const tableTitle = screen.getByText('Showing results for');
    expect(tableTitle).toBeInTheDocument();
  });

  test('Hides instance display table when an empty URL is submitted', () => {
    act(() => {
      render(<MemoryRouter><Home /></MemoryRouter>);
    });
    const input = screen.getByPlaceholderText('Enter Hawk server URL');
    const submitButton = screen.getByText('Submit');
    act(() => {
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(submitButton);
    });
    const tableTitle = screen.queryByText('Showing results for');
    expect(tableTitle).not.toBeInTheDocument();
  });

  test('Renders `Submit` button', () => {
    act (() => {
      render(<MemoryRouter><Home /></MemoryRouter>);
    });

    const button = screen.getByText('Submit');
    expect(button).toBeInTheDocument();
  });
});
