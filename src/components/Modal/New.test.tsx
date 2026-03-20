import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Use from './Use';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { act } from 'react';

const loadNew = async () => {
  const { default: New } = await import('./New');
  return New;
};

vi.mock('./Use');

vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => [{ name: 'hawk-set0', state: 0, message: 'Updating' }]),
    listBackends: vi.fn(() => ['backend1', 'backend2']),
    listPlugins: vi.fn(() => ['plugin1', 'org.eclipse.hawk.graph.updater.GraphModelUpdater','org.eclipse.hawk.emf.metamodel.EMFMetaModelResourceFactory']),
    listMetamodels: vi.fn(() => ['mymetamodel']),
    listRepositoryTypes: vi.fn(() => ['mockType'])
  }))
}));

describe('New component', () => {
  afterEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });
  test('Renders modal title', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    const New = await loadNew();
    act(() => {
      render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);
    });

    const modalTitle = await screen.findByText('Create new instance');
    expect(modalTitle).toBeInTheDocument();
  });

  test('Renders backend options', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    const New = await loadNew();
    act(() => {
      render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);
    });

    const backendsLabel = await screen.findByText('Backends');
    expect(backendsLabel).toBeInTheDocument();

    const pluginsLabel = await screen.findByText('Plugins');
    expect(pluginsLabel).toBeInTheDocument();

  });

  test('Checks instance creation options render correctly', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    const New = await loadNew();
    act(() => {
      render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);
    });

    const instanceNameInput = await screen.findByPlaceholderText('Instance name');
    const minDelayInput = await screen.findByPlaceholderText('Minimum Delay Period (ms)');
    const maxDelayInput = await screen.findByPlaceholderText('Maximum Delay Period (ms)');
    const submitButton = await screen.findByRole('button', { name: 'Create' });

    expect(instanceNameInput).toBeInTheDocument();
    expect(minDelayInput).toBeInTheDocument();
    expect(maxDelayInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  test('Check what happens when a form is submitted with missing instance name', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    const New = await loadNew();
    act(() => {
      render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const submitButton = await screen.findByRole('button', { name: 'Create' });
    act(() => {
      submitButton.click();
    });
    expect(alertMock).toHaveBeenCalledWith('Instance name cannot be empty.');
  });

  test('Check what happens when the user tries to create an instance with the same name as one that already exists', async () => {
    vi.resetModules();
    vi.doMock('../../js/client/Create', () => ({
      __esModule: true,
      default: vi.fn(() => ({
        listQueryLanguages: vi.fn(() => []),
        listInstances: vi.fn(() => [{ name: 'hawk-set0', state: 0, message: 'Updating' }]),
        listBackends: vi.fn(() => ['backend1', 'backend2']),
        listPlugins: vi.fn(() => ['plugin1', 'org.eclipse.hawk.graph.updater.GraphModelUpdater']),
        createInstance: vi.fn(() => Promise.resolve())
      }))
    }));

    const { default: Use } = await import('./Use');
    vi.mocked(Use).mockReturnValue({ isOpen: true, toggle: () => {} });
    const { isOpen, toggle } = Use();

    const New = await loadNew();

    act(() => {
      render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const instanceNameInput = await screen.findByPlaceholderText('Instance name');
    act(() => {
      fireEvent.change(instanceNameInput, { target: { value: 'hawk-set0' } });
    });
    const minDelayInput = await screen.findByPlaceholderText('Minimum Delay Period (ms)');
    act(() => {
      fireEvent.change(minDelayInput, { target: { value: '500' } });
    });
    const maxDelayInput = await screen.findByPlaceholderText('Maximum Delay Period (ms)');
    act(() => {
      fireEvent.change(maxDelayInput, { target: { value: '1000' } });
    });
    const submitButton = await screen.findByRole('button', { name: 'Create' });
    act(() => {
      submitButton.click();
    });
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('An instance with this name already exists. Please choose a different name.');
    });
  });

  test('Check what happens when the user can\'t get instances', async () => {
    vi.resetModules();
    vi.doMock('../../js/client/Create', () => ({
      __esModule: true,
      default: vi.fn(() => ({
        listQueryLanguages: vi.fn(() => []),
        listInstances: vi.fn(() => Promise.reject(new Error('network'))),
        listBackends: vi.fn(() => ['backend1', 'backend2']),
        listPlugins: vi.fn(() => ['plugin1', 'org.eclipse.hawk.graph.updater.GraphModelUpdater']),
        createInstance: vi.fn(() => Promise.resolve())
      }))
    }));

    const { default: Use } = await import('./Use');
    vi.mocked(Use).mockReturnValue({ isOpen: true, toggle: () => {} });

    const New = await loadNew();

    act(() => {
      render(<New isOpen={true} toggle={() => {}} title={'Create a New Instance'} />);
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const instanceNameInput = await screen.findByPlaceholderText('Instance name');
    act(() => {
      fireEvent.change(instanceNameInput, { target: { value: 'hawk-set1' } });
    });

    const minDelayInput = await screen.findByPlaceholderText('Minimum Delay Period (ms)');
    act(() => {
      fireEvent.change(minDelayInput, { target: { value: '500' } });
    });
    const maxDelayInput = await screen.findByPlaceholderText('Maximum Delay Period (ms)');
    act(() => {
      fireEvent.change(maxDelayInput, { target: { value: '1000' } });
    });
    const submitButton = await screen.findByRole('button', { name: 'Create' });
    act(() => {
      submitButton.click();
    });
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to validate instance name uniqueness. See console for details.');
    });
  });

  test('Check what happens when user tries to create an instance with not all mandatory fields filled', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    const New = await loadNew();
    act(() => {
      render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const instanceNameInput = await screen.findByPlaceholderText('Instance name');
    act(() => {
      fireEvent.change(instanceNameInput, { target: { value: 'MyInstance' } });
    });
    const submitButton = await screen.findByRole('button', { name: 'Create' });
    act(() => {
      submitButton.click();
    });
    expect(alertMock).toHaveBeenCalledWith('Please provide both minimum and maximum delay periods.');
  });

  test('Check what happens when the user tries to create an instance with a greater minimum delay than maximum delay', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    const New = await loadNew();
    act(() => {
      render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const instanceNameInput = await screen.findByPlaceholderText('Instance name');
    act(() => {
      fireEvent.change(instanceNameInput, { target: { value: 'MyInstance' } });
    });
    const minDelayInput = await screen.findByPlaceholderText('Minimum Delay Period (ms)');
    act(() => {
      fireEvent.change(minDelayInput, { target: { value: '1000' } });
    });
    const maxDelayInput = await screen.findByPlaceholderText('Maximum Delay Period (ms)');
    act(() => {
      fireEvent.change(maxDelayInput, { target: { value: '500' } });
    });
    const submitButton = await screen.findByRole('button', { name: 'Create' });
    act(() => {
      submitButton.click();
    });
    expect(alertMock).toHaveBeenCalledWith('Minimum delay period cannot be greater than maximum delay period.');
  });


  test('Creation of new valid instance', async () => {
    vi.resetModules();
    vi.doMock('../../js/client/Create', () => ({
      __esModule: true,
      default: vi.fn(() => ({
        listQueryLanguages: vi.fn(() => []),
        listInstances: vi.fn(() => [{ name: 'hawk-set0', state: 0, message: 'Updating' }]),
        listBackends: vi.fn(() => ['backend1', 'backend2']),
        listPlugins: vi.fn(() => ['plugin1', 'org.eclipse.hawk.graph.updater.GraphModelUpdater', 'org.eclipse.hawk.emf.metamodel.EMFModelParser', 'org.eclipse.hawk.emf.metamodel.EMFMetaModelResourceFactory', 'org.eclipse.hawk.epsilon.emc.EOLQueryEngine']),
        createInstance: vi.fn(() => Promise.resolve())
      }))
    }));

    const { default: Use } = await import('./Use');
    vi.mocked(Use).mockReturnValue({ isOpen: true, toggle: () => {} });

    const New = await loadNew();

    act(() => {
      render(<New isOpen={true} toggle={() => {}} title={'Create a New Instance'} />);
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const instanceNameInput = await screen.findByPlaceholderText('Instance name');
    act(() => {
      fireEvent.change(instanceNameInput, { target: { value: 'MyInstance' } });
    });
    const updaterInput = await screen.findByLabelText('Updater');
    act(() => {
      fireEvent.change(updaterInput, { target: { value: 'org.eclipse.hawk.graph.updater.GraphModelUpdater' } });
    });

    const metamodelInput = await screen.findByLabelText('Metamodel Parsers');
    act(() => {
      fireEvent.change(metamodelInput, { target: { value: 'org.eclipse.hawk.emf.metamodel.EMFMetaModelResourceFactory' } });
    });

    const modelInput = await screen.findByLabelText('Model Parsers');
    act(() => {
      fireEvent.change(modelInput, { target: { value: 'org.eclipse.hawk.emf.metamodel.EMFModelParser' } });
    });

    const queryEngine = await screen.findByLabelText('Query Engines');
    act(() => {
      fireEvent.change(queryEngine, { target: { value: 'org.eclipse.hawk.epsilon.emc.EOLQueryEngine' } });
    });
    const minDelayInput = await screen.findByPlaceholderText('Minimum Delay Period (ms)');
    act(() => {
      fireEvent.change(minDelayInput, { target: { value: '500' } });
    });
    const maxDelayInput = await screen.findByPlaceholderText('Maximum Delay Period (ms)');
    act(() => {
      fireEvent.change(maxDelayInput, { target: { value: '1000' } });
    });
    const indexFactoryInput = await screen.findByPlaceholderText('Index Factory');
    act(() => {
      fireEvent.change(indexFactoryInput, { target: { value: 'org.eclipse.hawk.graph.index.DefaultIndexFactory' } });
    });
    const submitButton = await screen.findByRole('button', { name: 'Create' });
    act(() => {
      submitButton.click();
    });
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Instance "MyInstance" created successfully!');
    });
  });

  test('Error creating a valid instance', async () => {
    vi.resetModules();
    vi.doMock('../../js/client/Create', () => ({
      __esModule: true,
      default: vi.fn(() => ({
        listQueryLanguages: vi.fn(() => []),
        listInstances: vi.fn(() => [{ name: 'hawk-set0', state: 0, message: 'Updating' }]),
        listBackends: vi.fn(() => ['backend1', 'backend2']),
        listPlugins: vi.fn(() => ['plugin1', 'org.eclipse.hawk.graph.updater.GraphModelUpdater', 'org.eclipse.hawk.emf.metamodel.EMFModelParser', 'org.eclipse.hawk.emf.metamodel.EMFMetaModelResourceFactory', 'org.eclipse.hawk.epsilon.emc.EOLQueryEngine']),
        createInstance: vi.fn(() => Promise.reject(new Error('Failed to create instance')))
      }))
    }));

    const { default: Use } = await import('./Use');
    vi.mocked(Use).mockReturnValue({ isOpen: true, toggle: () => {} });

    const New = await loadNew();

    act(() => {
      render(<New isOpen={true} toggle={() => {}} title={'Create a New Instance'} />);
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const instanceNameInput = await screen.findByPlaceholderText('Instance name');
    act(() => {
      fireEvent.change(instanceNameInput, { target: { value: 'MyInstance' } });
    });
    const updaterInput = await screen.findByLabelText('Updater');
    act(() => {
      fireEvent.change(updaterInput, { target: { value: 'org.eclipse.hawk.graph.updater.GraphModelUpdater' } });
    });

    const metamodelInput = await screen.findByLabelText('Metamodel Parsers');
    act(() => {
      fireEvent.change(metamodelInput, { target: { value: 'org.eclipse.hawk.emf.metamodel.EMFMetaModelResourceFactory' } });
    });

    const modelInput = await screen.findByLabelText('Model Parsers');
    act(() => {
      fireEvent.change(modelInput, { target: { value: 'org.eclipse.hawk.emf.metamodel.EMFModelParser' } });
    });

    const queryEngine = await screen.findByLabelText('Query Engines');
    act(() => {
      fireEvent.change(queryEngine, { target: { value: 'org.eclipse.hawk.epsilon.emc.EOLQueryEngine' } });
    });
    const minDelayInput = await screen.findByPlaceholderText('Minimum Delay Period (ms)');
    act(() => {
      fireEvent.change(minDelayInput, { target: { value: '500' } });
    });
    const maxDelayInput = await screen.findByPlaceholderText('Maximum Delay Period (ms)');
    act(() => {
      fireEvent.change(maxDelayInput, { target: { value: '1000' } });
    });
    const indexFactoryInput = await screen.findByPlaceholderText('Index Factory');
    act(() => {
      fireEvent.change(indexFactoryInput, { target: { value: 'org.eclipse.hawk.graph.index.DefaultIndexFactory' } });
    });
    const submitButton = await screen.findByRole('button', { name: 'Create' });
    act(() => {
      submitButton.click();
    });
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to create instance. See console and server logs.');
    });
  });

  test('warning with invalid plugins', async () => {
    vi.resetModules();
    vi.doMock('../../js/client/Create', () => ({
      __esModule: true,
      default: vi.fn(() => ({
        listQueryLanguages: vi.fn(() => []),
        listInstances: vi.fn(() => [{ name: 'hawk-set0', state: 0, message: 'Updating' }]),
        listBackends: vi.fn(() => ['backend1', 'backend2']),
        listPlugins: vi.fn(() => ['plugin1', 'plugin2']),
        createInstance: vi.fn(() => Promise.reject(new Error('Failed to create instance')))
      }))
    }));

    const { default: Use } = await import('./Use');
    vi.mocked(Use).mockReturnValue({ isOpen: true, toggle: () => {} });
    const warnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const New = await loadNew();

    act(() => {
      render(<New isOpen={true} toggle={() => {}} title={'Create a New Instance'} />);
    });

    const instanceNameInput = await screen.findByPlaceholderText('Instance name');
    act(() => {
      fireEvent.change(instanceNameInput, { target: { value: 'MyInstance' } });
    });
    const updaterInput = await screen.findByLabelText('Updater');
    act(() => {
      fireEvent.change(updaterInput, { target: { value: 'plugin2' } });
    });
    const minDelayInput = await screen.findByPlaceholderText('Minimum Delay Period (ms)');
    act(() => {
      fireEvent.change(minDelayInput, { target: { value: '500' } });
    });
    const maxDelayInput = await screen.findByPlaceholderText('Maximum Delay Period (ms)');
    act(() => {
      fireEvent.change(maxDelayInput, { target: { value: '1000' } });
    });
    const indexFactoryInput = await screen.findByPlaceholderText('Index Factory');
    act(() => {
      fireEvent.change(indexFactoryInput, { target: { value: 'org.eclipse.hawk.graph.index.DefaultIndexFactory' } });
    });
    const submitButton = await screen.findByRole('button', { name: 'Create' });
    act(() => {
      submitButton.click();
    });
    await waitFor(() => {
      expect(warnMock).toHaveBeenCalledWith('No valid updaters found in plugins list:', ['plugin1', 'plugin2']);
    });
  });
});
