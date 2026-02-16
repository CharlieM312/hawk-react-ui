import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import New from './New';
import Use from './Use';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { act } from 'react';

vi.mock('./Use');

vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => [{ name: 'hawk-set0', state: 0, message: 'Updating' }]),
    listBackends: vi.fn(() => ['backend1', 'backend2']),
    listPlugins: vi.fn(() => ['plugin1', 'org.eclipse.hawk.graph.updater.GraphModelUpdater']),
    createInstance: vi.fn(() => Promise.resolve())
  }))
}));

describe('New component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test('Renders modal title', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    act (() => {
      render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);
    });

    const modalTitle = await screen.findByText('Create new instance');
    expect(modalTitle).toBeInTheDocument();
  });

  test('Renders backend options', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

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

  test('Check what happens when user tries to create an instance with the same name as one that already exists', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    act(() => {
      render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const instanceNameInput = await screen.findByPlaceholderText('Instance name');
    act(() => {
      fireEvent.change(instanceNameInput, { target: { value: 'hawk-set0' } });
    });
    const submitButton = await screen.findByRole('button', { name: 'Create' });
    act(() => {      
      submitButton.click();
    });
    expect(alertMock).toHaveBeenCalledWith('An instance with this name already exists. Please choose a different name.');
  });

  test('Check what happens when user tries to create an instance with not all mandatory fields filled', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

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

  test('Check what happens when user tries to create an instance with a greater minimum delay than maximum delay', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

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
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    act(() => {
      render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);
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
    expect(alertMock).toHaveBeenCalledWith('Instance \"MyInstance\" created successfully!');
  });
});
