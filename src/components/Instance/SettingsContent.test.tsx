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
    listMetamodels: vi.fn(() => ['myMetamodel']),
    listDerivedAttributes: vi.fn(() => [{attributeName: 'derivedAttributeOne', metaModelUri: 'exampleURI', typeName: 'mytype'}]),
    listIndexedAttributes: vi.fn(() => [{attributeName: 'indexedAttributeOne', metaModelUri: 'exampleURI', typeName: 'mytype'}]),
    listRepositories: vi.fn(() => [{uri: 'file://path/to/indexed/location', type: 'file'}]),
    startInstance: vi.fn(),
    stopInstance: vi.fn(),
    syncInstance: vi.fn(),
    removeRepository: vi.fn(() => []),
    removeIndexedAttribute: vi.fn(() => []),
    removeDerivedAttribute: vi.fn(() => []),
    unregisterMetamodels: vi.fn(() => []),
    listTypeNames: vi.fn(() => ['mytype']),
    listAttributeNames: vi.fn(() => ['MyAttribute', 'OtherAttribute']),
    listRepositoryTypes: vi.fn(() => [])
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
    await screen.findByText('myMetamodel');
  });

  test('deletes metamodels from the instance', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <SettingsContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );

    const metamodelsButton = screen.getByRole('button', { name: /Metamodels/i });
    expect(metamodelsButton).toBeInTheDocument();
    act(() => {
      metamodelsButton.click();
    });

    await screen.findByText('myMetamodel');
    const deleteMetamodelsButton = screen.getByRole('button', { name: /Unregister Metamodel myMetamodel/i });
    expect(deleteMetamodelsButton).toBeInTheDocument();
    act(() => {
      deleteMetamodelsButton.click();
    });
    expect(alertSpy).toHaveBeenCalledWith('Metamodel \"myMetamodel\" unregistered successfully.');
    await screen.findByText('No Metamodels found');

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
    const addAttributeButton = screen.getByRole('button', { name: /Add Derived Attribute/i });
    expect(addAttributeButton).toBeInTheDocument();

  });

  test('opens add derived attribute modal', async () => {
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
    const addAttributeButton = screen.getByRole('button', { name: /Add Derived Attribute/i });
    expect(addAttributeButton).toBeInTheDocument();

    act(() => {
      addAttributeButton.click();
    });

    expect(await screen.findByRole('heading', { name: /Create new derived attribute/i })).toBeInTheDocument();

  });

  test('deletes derived attribute from the instance', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <SettingsContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );

    const derivedAttributeButton = screen.getByRole('button', { name: /Derived Attributes/i });
    expect(derivedAttributeButton).toBeInTheDocument();
    act(() => {
      derivedAttributeButton.click();
    });
    await screen.findByText('derivedAttributeOne');
    const deleteAttributeButton = screen.getByRole('button', { name: /Delete Derived Attribute/i });
    expect(deleteAttributeButton).toBeInTheDocument();
    act(() => {
      deleteAttributeButton.click();
    });
    await screen.findByText('No derived attributes found');

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
    const addAttributeButton = screen.getByRole('button', { name: /Add Indexed Attribute/i });
    expect(addAttributeButton).toBeInTheDocument();
  });

  test('opens the add indexed attribute modal', async () => {
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
    const addAttributeButton = screen.getByRole('button', { name: /Add Indexed Attribute/i });
    expect(addAttributeButton).toBeInTheDocument();

    act(() => {
      addAttributeButton.click();
    })

    expect(await screen.findByRole('heading', { name: /Create new indexed attribute/i })).toBeInTheDocument();
  });

  test('deletes indexed attribute from the instance', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <SettingsContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );

    const indexedAttributeButton = screen.getByRole('button', { name: /Indexed Attributes/i });
    expect(indexedAttributeButton).toBeInTheDocument();
    act(() => {
      indexedAttributeButton.click();
    });
    await screen.findByText('indexedAttributeOne');
    const deleteAttributeButton = screen.getByRole('button', { name: /Delete Indexed Attribute/i });
    expect(deleteAttributeButton).toBeInTheDocument();
    act(() => {
      deleteAttributeButton.click();
    });
    await screen.findByText('No indexed attributes found.');

  });

  test('fetches Indexed Locations when the Indexed Locations section is expanded', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

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
    const addLocationButton = screen.getByRole('button', { name: /Add Indexed Location/i });
    expect(addLocationButton).toBeInTheDocument();

  });

  test('opens add indexed location modal', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

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
    const addLocationButton = screen.getByRole('button', { name: /Add Indexed Location/i });
    expect(addLocationButton).toBeInTheDocument();

    act(() => {
      addLocationButton.click();
    });

    expect(await screen.findByRole('heading', { name: /Add Repository/i })).toBeInTheDocument();

  });

  test('deletes indexed location from the instance', async () => {
    const { default: SettingsContent } = await import('./SettingsContent');
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

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
    await screen.findByText('file://path/to/indexed/location');
    const deleteLocationButton = screen.getByRole('button', { name: /Delete Indexed Location/i });
    expect(deleteLocationButton).toBeInTheDocument();
    act(() => {
      deleteLocationButton.click();
    });
    expect(alertSpy).toHaveBeenCalledWith('Indexed location \"file://path/to/indexed/location\" deleted successfully.');
    await screen.findByText('No indexed locations found');

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
    const mockNavigate = vi.fn();
    const reactrouter = await import('react-router');
    vi.spyOn(reactrouter, 'useNavigate').mockReturnValue(mockNavigate as any);

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

    expect(mockNavigate).toHaveBeenCalledWith('/');


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
