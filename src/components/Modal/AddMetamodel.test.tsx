import { render, screen } from '@testing-library/react';
import Use from './Use';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import AddMetamodel from './AddMetamodel';

vi.mock('./Use');

vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => [{ name: 'hawk-set0', state: 0, message: 'Updating' }]),
    listBackends: vi.fn(() => ['backend1', 'backend2']),
    listPlugins: vi.fn(() => ['plugin1', 'org.eclipse.hawk.graph.updater.GraphModelUpdater']),
    listMetamodels: vi.fn(() => ['mymetamodel']),
    listRepositoryTypes: vi.fn(() => ['mockType'])
  }))
}));

describe('Add metamodel', () => {
  afterEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });
  test('Renders modal title', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();
    const mockFunction = vi.fn(() => []);

    act(() => {
      render(<AddMetamodel title={"New Metamodel"} name="hawk-set-0" isOpen={isOpen} toggle={toggle} onCreated={mockFunction} />);
    });

    const modalTitle = await screen.findByText('Add Metamodel');
    expect(modalTitle).toBeInTheDocument();
  });



});