import { describe, test, expect, vi, afterEach } from 'vitest';
import Use from './Use';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AddIndexedLocation from './AddIndexedLocation';
import Create from '../../js/client/Create';

vi.mock('./Use');

vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => [{ name: 'hawk-set0', state: 0, message: 'Updating' }]),
    listRepositoryTypes: vi.fn(() => ['mockType']),
    setFrozen: vi.fn(() => Promise.resolve()),
    addRepository: vi.fn(() => Promise.resolve())
  }))
}));

describe('Add indexed location', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Renders modal title', async () => {
      const mockUse = vi.mocked(Use);
      mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
      const { isOpen, toggle } = mockUse();

      const mockFunction = vi.fn(() => []);

      act (() => {
        render(<AddIndexedLocation isOpen={isOpen} toggle={toggle} title={'Edit Repository'} name='hawk-set-0'  onCreated={mockFunction} />);
      });

      const modalTitle = await screen.findByText('Add Repository');
      expect(modalTitle).toBeInTheDocument();
  });

  test('Renders options', async () => {
      const mockUse = vi.mocked(Use);
      mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
      const { isOpen, toggle } = mockUse();

      const mockFunction = vi.fn(() => []);

      act (() => {
        render(<AddIndexedLocation isOpen={isOpen} toggle={toggle} title={'Edit Repository'} name='hawk-set-0'  onCreated={mockFunction} />);
      });

      const modalTitle = await screen.findByText('Add Repository');
      expect(modalTitle).toBeInTheDocument();

      const typeName = await screen.findByText('Type');
      expect(typeName).toBeInTheDocument();

      const frozenName = await screen.findByText('Freeze repo?');
      expect(frozenName).toBeInTheDocument();
  });

  test('creates a new repository', async () => {
        const mockUse = vi.mocked(Use);
        mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
        const { isOpen, toggle } = mockUse();
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockFunction = vi.fn(() => []);

        act (() => {
            render(<AddIndexedLocation isOpen={isOpen} toggle={toggle} title={'Edit Repository'} name='hawk-set-0'  onCreated={mockFunction} />);
        });

        const modalTitle = await screen.findByText('Add Repository');
        expect(modalTitle).toBeInTheDocument();

        const uriInput = await screen.findByPlaceholderText('uri');
        act(() => {
          fireEvent.change(uriInput, { target: { value: 'file://example-type' } });
        });

        const submitButton = await screen.findByRole('button', { name: 'Submit' });
        act(() => {
          submitButton.click();
        });
        const mockCreate = vi.mocked(Create);
        const createdInstance = mockCreate.mock.results[0]?.value;
        expect(createdInstance).toBeDefined();
        expect(createdInstance.addRepository).toHaveBeenCalledWith('hawk-set-0', {
            isFrozen: false,
            type: 'mockType',
            uri: 'file://example-type'
        });
    });

    test('creates a new repository with credentials', async () => {
        const mockUse = vi.mocked(Use);
        mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
        const { isOpen, toggle } = mockUse();
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const mockFunction = vi.fn(() => []);

        act (() => {
            render(<AddIndexedLocation isOpen={isOpen} toggle={toggle} title={'Edit Repository'} name='hawk-set-0'  onCreated={mockFunction} />);
        });

        const modalTitle = await screen.findByText('Add Repository');
        expect(modalTitle).toBeInTheDocument();

        const uriInput = await screen.findByPlaceholderText('uri');
        act(() => {
          fireEvent.change(uriInput, { target: { value: 'file://example-type' } });
        });

        const usernameInput = await screen.findByPlaceholderText('Username');
        act(() => {
            fireEvent.change(usernameInput, { target: { value: 'username'}})
        })

        const passwordInput = await screen.findByPlaceholderText('Password');
        act(() => {
            fireEvent.change(passwordInput, { target: { value: 'examplepassword'}})
        })

        const submitButton = await screen.findByRole('button', { name: 'Submit' });
        act(() => {
          submitButton.click();
        });
        const mockCreate = vi.mocked(Create);
        const createdInstance = mockCreate.mock.results[0]?.value;
        expect(createdInstance).toBeDefined();
        expect(createdInstance.addRepository).toHaveBeenCalledWith('hawk-set-0', {
            isFrozen: false,
            type: 'mockType',
            uri: 'file://example-type'
        },
        {
            password: 'examplepassword',
            username: 'username',
        }
        );
    });



});