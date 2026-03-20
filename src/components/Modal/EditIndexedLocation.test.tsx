
import { describe, test, expect, vi, afterEach } from 'vitest';
import Use from './Use';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import EditIndexedLocation from './EditIndexedLocation';
import Create from '../../js/client/Create';

vi.mock('./Use');

vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => [{ name: 'hawk-set0', state: 0, message: 'Updating' }]),
    listRepositories: vi.fn(() => [{ uri: 'mockRepo', type: "mockType", isFrozen: true }]),
    listRepositoryTypes: vi.fn(() => ['mockType']),
    setFrozen: vi.fn(() => Promise.resolve())
  }))
}));

describe('Edit indexed location', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Renders modal title', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    const mockFunction = vi.fn(() => []);

    act (() => {
      render(<EditIndexedLocation isOpen={isOpen} toggle={toggle} title={'Edit Repository'} name='hawk-set-0' repoName='mockRepo' onCreated={mockFunction} />);
    });

    const modalTitle = await screen.findByText('Edit Repository');
    expect(modalTitle).toBeInTheDocument();
  });

  test('Renders options', async () => {
      const mockUse = vi.mocked(Use);
      mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
      const { isOpen, toggle } = mockUse();
      const mockFunction = vi.fn(() => []);
      act(() => {
        render(<EditIndexedLocation isOpen={isOpen} toggle={toggle} title={'Edit repository'} name="hawk-set-0" repoName="mockRepo" onCreated={mockFunction} />);
      });

      const typeName = await screen.findByText('Type');
      expect(typeName).toBeInTheDocument();

      const frozenName = await screen.findByText('Freeze repo');
      expect(frozenName).toBeInTheDocument();

    });

    test('Freezing a repository', async () => {
      const mockUse = vi.mocked(Use);
      mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
      const { isOpen, toggle } = mockUse();
      const mockFunction = vi.fn(() => []);
      act(() => {
        render(<EditIndexedLocation isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" repoName="mockRepo" onCreated={mockFunction} />);
      });
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      const submitButton = await screen.findByRole('button', { name: 'Submit' });
      act(() => {
        submitButton.click();
      });

      const mockCreate = vi.mocked(Create);
      const createdInstance = mockCreate.mock.results[0]?.value;
      expect(createdInstance).toBeDefined();
      expect(createdInstance.setFrozen).toHaveBeenCalledWith('hawk-set-0', 'mockRepo', true);
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Repository status changed');
      });

    });

});