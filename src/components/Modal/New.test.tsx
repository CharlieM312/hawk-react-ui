import { render, screen } from '@testing-library/react';
import New from './New';
import Use from './Use';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { act } from 'react';

vi.mock('./Use');

vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => []),
    listBackends: vi.fn(() => ['backend1', 'backend2']),
    listPlugins: vi.fn(() => ['plugin1', 'plugin2'])
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
});
