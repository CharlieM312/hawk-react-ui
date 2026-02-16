import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { describe, test, expect, afterEach } from 'vitest';

// Mock the Thrift client to prevent initialization errors
vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => ['org.eclipse.hawk.epsilon.emc.EOLQueryEngine', 'org.eclipse.hawk.timeaware.queries.TimeAwareEOLQueryEngine']),
    listInstances: vi.fn(() => []),
    listMetamodels: vi.fn(() => []),
    listDerivedAttributes: vi.fn(() => [{attributeName: 'derivedAttributeOne', metaModelUri: 'exampleURI', typeName: 'mytype'}]),
    listIndexedAttributes: vi.fn(() => [{attributeName: 'indexedAttributeOne', metaModelUri: 'exampleURI', typeName: 'mytype'}]),
    listRepositories: vi.fn(() => [{uri: 'file://path/to/indexed/location', type: 'file'}]),
    startInstance: vi.fn(),
    stopInstance: vi.fn(),
    syncInstance: vi.fn()
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
  }, 6000);

  test('fetches metamodels when the Metamodels section is expanded', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };

    render(
      <MemoryRouter>
        <SettingsContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const metaModelsButton = screen.getByRole('button', { name: /Metamodels/i });
    expect(metaModelsButton).toBeInTheDocument();
    act(() => {
      metaModelsButton.click();
    });
    // Wait for the listMetamodels function to be called
    await screen.findByText('No meta models found');
  });

  test('fetches derived attributes when the Derived Attributes section is expanded', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };

    render(
      <MemoryRouter>
        <SettingsContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const derivedAttributesButton = screen.getByRole('button', { name: /Derived Attributes/i });
    expect(derivedAttributesButton).toBeInTheDocument();
    act(() => {
      derivedAttributesButton.click();
    });
    // Wait for the listDerivedAttributes function to be called
    await screen.findByText('derivedAttributeOne');
  });

  test('fetches indexed attributes when the Indexed Attributes section is expanded', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };

    render(
      <MemoryRouter>
        <SettingsContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const indexedAttributesButton = screen.getByRole('button', { name: /Indexed Attributes/i });
    expect(indexedAttributesButton).toBeInTheDocument();
    act(() => {
      indexedAttributesButton.click();
    });
    // Wait for the listIndexedAttributes function to be called
    await screen.findByText('indexedAttributeOne');
  });

  test('fetches Indexed Locations when the Indexed Locations section is expanded', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };

    render(
      <MemoryRouter>
        <SettingsContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );

    const indexedLocationsButton = screen.getByRole('button', { name: /Indexed Locations/i });
    expect(indexedLocationsButton).toBeInTheDocument();
    act(() => {
      indexedLocationsButton.click();
    });
    // Wait for the listIndexedLocations function to be called
    await screen.findByText('file://path/to/indexed/location');
  });

  test('should start the instance when Start Instance button is clicked', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'STOPPED', info: 'i' };

    render(
      <MemoryRouter>
        <SettingsContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const startButton = screen.getByRole('button', { name: /Start Instance/i });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    expect(startButton).toBeInTheDocument();
    await act(async () => {      
      startButton.click();
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Instance hawk-set0 started successfully.');
    });
  });

  test('should stop the instance when Stop Instance button is clicked', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };

    render(
      <MemoryRouter>
        <SettingsContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const stopButton = screen.getByRole('button', { name: /Stop Instance/i });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    expect(stopButton).toBeInTheDocument();
    await act(async () => {      
      stopButton.click();
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Instance hawk-set0 stopped successfully.');
    });
  });

  test('should sync the instance when Sync Instance button is clicked', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };

    render(
      <MemoryRouter>
        <SettingsContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const syncButton = screen.getByRole('button', { name: /Sync Instance/i });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    expect(syncButton).toBeInTheDocument();
    await act(async () => {      
      syncButton.click();
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Instance hawk-set0 synced successfully.');
    });
  });
    

});