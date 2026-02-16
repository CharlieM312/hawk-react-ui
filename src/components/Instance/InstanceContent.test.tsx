import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { describe, test, expect, afterEach } from 'vitest';

// Mock the Thrift client to prevent initialization errors
vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => []),
    asyncQuery: vi.fn(() => []),
    fetchAsyncQueryResults: vi.fn(() => [{
        "result": {
          "vBoolean": null,
          "vByte": null,
          "vShort": null,
          "vInteger": null,
          "vLong": null,
          "vDouble": null,
          "vString": "null",
          "vModelElement": null,
          "vModelElementType": null,
          "vMap": null,
          "vList": null
        },
        "wallMillis": 745,
        "isCancelled": false
      }])
  }))
}));

describe('InstanceContent', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders instance name as the title of the content', async () => {
    const { default: InstanceContent } = await import('./InstanceContent');

    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const title = screen.getByRole('heading', { name: 'hawk-set0' });
    expect(title).toBeInTheDocument();
  });

  test('renders language options when instance is running', async () => {
    const { default: InstanceContent } = await import('./InstanceContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const languageOptions = await screen.findByText(/Query Language/i);
    expect(languageOptions).toBeInTheDocument();
  });

  test('navigation to settings page works correctly', async () => {
  
    const mockNavigate = vi.fn();
    const reactrouter = await import('react-router');
    vi.spyOn(reactrouter, 'useNavigate').mockReturnValue(mockNavigate as any);
    const { default: InstanceContent } = await import('./InstanceContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    expect(settingsButton).toBeInTheDocument();

    // Simulate click and check if navigation occurs
    settingsButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/instance/hawk-set0/settings', { state: { instance, url: 'http://localhost:8080' } });
  });

  test('navigation to homepage works correctly', async () => {
  
    const mockNavigate = vi.fn();
    const reactrouter = await import('react-router');
    vi.spyOn(reactrouter, 'useNavigate').mockReturnValue(mockNavigate as any);
    const { default: InstanceContent } = await import('./InstanceContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const backButton = screen.getByRole('button', { name: /Go back to instance list/i });
    expect(backButton).toBeInTheDocument();

    // Simulate click and check if navigation occurs
    backButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('Check what is displayed if no instance name can be found', async () => {
    const { default: InstanceContent } = await import('./InstanceContent');
    const instance = { status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const title = screen.getByRole('heading', { name: '' });
    expect(title).toBeInTheDocument();
  });

  test('run empty query on instance', async () => {

    const { default: InstanceContent } = await import('./InstanceContent');
    const instance = { status: 'RUNNING', info: 'i' };
    const { container } = 
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );

    const submissionButton = container.querySelector('[name="Submit Query"]') as Element;
    act(() => {
      fireEvent.click(submissionButton);
    });

    const rawQueryButton = container.querySelector('[name="RawText"]') as Element;
    act(() => {
      fireEvent.click(rawQueryButton);
    });

  });

});