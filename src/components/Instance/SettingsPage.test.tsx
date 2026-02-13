import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { describe, test, expect, afterEach, vi } from 'vitest';

vi.mock('./SettingsContent', () => ({
  default: () => <div data-testid="mock-instance" />
}));

describe('SettingsPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders Instance when navigation state contains instance', async () => {
    const { default: SettingsPage } = await import('./SettingsPage');

    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter initialEntries={[{ pathname: '/instance/hawk-set0', state: { instance, url: 'http://localhost:8080' } }]}>
        <Routes>
          <Route path="/instance/:name" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-instance')).toBeInTheDocument();
  });

  test('redirects to / when accessed directly (no state)', async () => {

    vi.resetModules();
    const reactrouter = await import('react-router');
    const mockNavigate = vi.fn();

    vi.spyOn(reactrouter, 'useNavigate').mockReturnValue(mockNavigate as any);
    vi.spyOn(reactrouter, 'useParams').mockReturnValue({ name: 'hawk-set0' } as any);
    vi.spyOn(reactrouter, 'useLocation').mockReturnValue({ pathname: '/instance/hawk-set0', state: undefined, search: '', hash: '', key: '' } as any);
    const { default: SettingsPage } = await import('./SettingsPage');

    render(
      <MemoryRouter initialEntries={['/instance/hawk-set0']}>
        <Routes>
          <Route path="/instance/:name" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});