import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';

jest.mock('./InstanceContent', () => () => <div data-testid="mock-instance" />);

describe('InstancePage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Instance when navigation state contains instance', async () => {
    const { default: InstancePage } = await import('./InstancePage');

    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter initialEntries={[{ pathname: '/instance/hawk-set0', state: { instance, url: 'http://localhost:8080' } }]}>
        <Routes>
          <Route path="/instance/:name" element={<InstancePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-instance')).toBeInTheDocument();
  });

  test('redirects to / when accessed directly (no state)', async () => {

    jest.resetModules
    const reactrouter = await import('react-router');
    const mockNavigate = jest.fn();

    jest.spyOn(reactrouter, 'useNavigate').mockReturnValue(mockNavigate as any);
    jest.spyOn(reactrouter, 'useParams').mockReturnValue({ name: 'hawk-set0' } as any);
    jest.spyOn(reactrouter, 'useLocation').mockReturnValue({ pathname: '/instance/hawk-set0', state: undefined, search: '', hash: '', key: '' } as any);

    const { default: InstancePage } = await import('./InstancePage');

    render(
      <MemoryRouter initialEntries={['/instance/hawk-set0']}>
        <Routes>
          <Route path="/instance/:name" element={<InstancePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});

