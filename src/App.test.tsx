import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';
import Get from './js/instances/Get';
import { describe, test, expect, vi } from 'vitest';
import { act } from 'react';

vi.mock('./js/instances/Get');

vi.mock('./js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => []),
    listBackends: vi.fn(() => ['backend1', 'backend2']),
    listPlugins: vi.fn(() => ['plugin1', 'plugin2'])
  }))
}));


describe('App component', () => {
  test('Renders home page', () => {
    const mockGet = vi.mocked(Get);

    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instance name', state: 'state', message: 'message'}]));


    act(() => {
      render(<MemoryRouter><App /></MemoryRouter>);
    });

    const title = screen.getByText('Hawk Docker');
    expect(title).toBeInTheDocument();
    const instancesTitle = screen.getByText('Manage Instances');
    expect(instancesTitle).toBeInTheDocument();
  });
});
