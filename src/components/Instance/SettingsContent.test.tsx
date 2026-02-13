import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { describe, test, expect, afterEach } from 'vitest';

// Mock the Thrift client to prevent initialization errors
vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => [])
  }))
}));

describe('SettingsContent', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders instance name as the title of the content', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');

    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter>
        <SettingsContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const title = screen.getByRole('heading', { name: 'Settings for hawk-set0' });
    expect(title).toBeInTheDocument();
  });

});