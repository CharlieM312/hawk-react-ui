
import { describe, test, expect, vi, afterEach } from 'vitest';
import NewDerivedAttribute from './NewDerivedAttribute';
import Use from './Use';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Create from '../../js/client/Create';

vi.mock('./Use');

vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => [{ name: 'hawk-set0', state: 0, message: 'Updating' }]),
    listBackends: vi.fn(() => ['backend1', 'backend2']),
    listPlugins: vi.fn(() => ['plugin1', 'org.eclipse.hawk.graph.updater.GraphModelUpdater']),
    listMetamodels: vi.fn(() => ['mymetamodel']),
    listTypeNames: vi.fn(() => ['isSingleton', 'isNewSingleton']),
    addDerivedAttribute: vi.fn(() => Promise.resolve())
  }))
}));

describe('New derived attribute', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Renders modal title', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    const mockFunction = vi.fn(() => []);

    act (() => {
      render(<NewDerivedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
    });

    const modalTitle = await screen.findByText('Create new derived attribute');
    expect(modalTitle).toBeInTheDocument();
  });

  test('Renders options', async () => {
      const mockUse = vi.mocked(Use);
      mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
      const { isOpen, toggle } = mockUse();
      const mockFunction = vi.fn(() => []);
      act(() => {
        render(<NewDerivedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
      });

      const metamodelLabel = await screen.findByText('Metamodel URI');
      expect(metamodelLabel).toBeInTheDocument();

      const typeName = await screen.findByText('Type Name');
      expect(typeName).toBeInTheDocument();

    });

    test('Check what happens when a form is submitted with missing attribute name', async () => {
        const mockUse = vi.mocked(Use);
        mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
        const { isOpen, toggle } = mockUse();
        const mockFunction = vi.fn(() => []);
        act(() => {
          render(<NewDerivedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
        });
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const submitButton = await screen.findByRole('button', { name: 'Submit' });
        act(() => {
          submitButton.click();
        });
        expect(alertMock).toHaveBeenCalledWith('Please enter an attribute name.');
    });

    test('updating of the type names', async () => {
        const mockUse = vi.mocked(Use);
        mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
        const { isOpen, toggle } = mockUse();
        const mockFunction = vi.fn(() => []);
        act(() => {
          render(<NewDerivedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
        });

        const dropdown = await screen.findAllByLabelText('Metamodel URI');

        act(() => {
          fireEvent.change(dropdown[0], { target: { value: 'mymetamodel' } });
        });
        const typeName = await screen.findByText('isSingleton');
        expect(typeName).toBeInTheDocument();
    });

    test('updating of the attribute names', async () => {
            const mockUse = vi.mocked(Use);
            mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
            const { isOpen, toggle } = mockUse();
            const mockFunction = vi.fn(() => []);
            act(() => {
              render(<NewDerivedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Indexed Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
            });

            const dropdown = await screen.findAllByLabelText('Metamodel URI');

            act(() => {
              fireEvent.change(dropdown[0], { target: { value: 'mymetamodel' } });
            });
            const typedropdown = await screen.findAllByLabelText('Type Name');
            act(() => {
              fireEvent.change(typedropdown[0], { target: { value: 'isNewSingleton'}});
            });

            const attributeName = await screen.findByText('String');
            expect(attributeName).toBeInTheDocument();
        });

    test('Creation of new valid derived attribute', async () => {
        const mockUse = vi.mocked(Use);
        mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
        const { isOpen, toggle } = mockUse();
        const mockFunction = vi.fn(() => []);
        act(() => {
          render(<NewDerivedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
        });
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

        const instanceNameInput = await screen.findByPlaceholderText('Name');
        act(() => {
          fireEvent.change(instanceNameInput, { target: { value: 'MyAttribute' } });
        });

        const submitButton = await screen.findByRole('button', { name: 'Submit' });
        act(() => {
          submitButton.click();
        });

        const mockCreate = vi.mocked(Create);
        const createdInstance = mockCreate.mock.results[0]?.value;
        expect(createdInstance).toBeDefined();
        expect(createdInstance.addDerivedAttribute).toHaveBeenCalledWith('hawk-set-0', {
          attributeName: 'MyAttribute',
          attributeType: "String",
          derivationLanguage: null,
          metamodelUri: 'mymetamodel',
          typeName: 'isSingleton'
        });
    });

    test('Creation of new valid derived attribute with derivationLogic', async () => {
        const mockUse = vi.mocked(Use);
        mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
        const { isOpen, toggle } = mockUse();
        const mockFunction = vi.fn(() => []);
        act(() => {
          render(<NewDerivedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
        });
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

        const instanceNameInput = await screen.findByPlaceholderText('Name');
        act(() => {
          fireEvent.change(instanceNameInput, { target: { value: 'MyAttribute' } });
        });

        const derivationLogicInput = await screen.findByPlaceholderText('Derivation Logic');
        act(() => {
          fireEvent.change(derivationLogicInput, { target: {value: 'my derivation logic;'}});
        });

        const submitButton = await screen.findByRole('button', { name: 'Submit' });
        act(() => {
          submitButton.click();
        });

        const mockCreate = vi.mocked(Create);
        const createdInstance = mockCreate.mock.results[0]?.value;
        expect(createdInstance).toBeDefined();
        expect(createdInstance.addDerivedAttribute).toHaveBeenCalledWith('hawk-set-0', {
          attributeName: 'MyAttribute',
          attributeType: "String",
          derivationLanguage: null,
          derivationLogic: 'my derivation logic;',
          metamodelUri: 'mymetamodel',
          typeName: 'isSingleton'
        });
    });

    test('Creation of new valid derived attribute with no derivation logic', async () => {
        const mockUse = vi.mocked(Use);
        mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
        const { isOpen, toggle } = mockUse();
        const mockFunction = vi.fn(() => []);
        act(() => {
          render(<NewDerivedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
        });
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

        const instanceNameInput = await screen.findByPlaceholderText('Name');
        act(() => {
          fireEvent.change(instanceNameInput, { target: { value: 'MyAttribute' } });
        });

        const submitButton = await screen.findByRole('button', { name: 'Submit' });
        act(() => {
          submitButton.click();
        });

        const mockCreate = vi.mocked(Create);
        const createdInstance = mockCreate.mock.results[0]?.value;
        expect(createdInstance).toBeDefined();
        expect(createdInstance.addDerivedAttribute).toHaveBeenCalledWith('hawk-set-0', {
          attributeName: 'MyAttribute',
          attributeType: "String",
          derivationLanguage: null,
          metamodelUri: 'mymetamodel',
          typeName: 'isSingleton'
        });
    });

    test('Creation of new valid derived attribute with invalid derivation logic', async () => {
        const mockUse = vi.mocked(Use);
        mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
        const { isOpen, toggle } = mockUse();
        const mockFunction = vi.fn(() => []);
        act(() => {
          render(<NewDerivedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
        });
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

        const instanceNameInput = await screen.findByPlaceholderText('Name');
        act(() => {
          fireEvent.change(instanceNameInput, { target: { value: 'MyAttribute' } });
        });

        const derivationLogicInput = await screen.findByPlaceholderText('Derivation Logic');
        act(() => {
          fireEvent.change(derivationLogicInput, { target: {value: ''}});
        });

        const submitButton = await screen.findByRole('button', { name: 'Submit' });
        act(() => {
          submitButton.click();
        });

        const mockCreate = vi.mocked(Create);
        const createdInstance = mockCreate.mock.results[0]?.value;
        expect(createdInstance).toBeDefined();
        expect(createdInstance.addDerivedAttribute).toHaveBeenCalledWith('hawk-set-0', {
          attributeName: 'MyAttribute',
          attributeType: "String",
          derivationLanguage: null,
          metamodelUri: 'mymetamodel',
          typeName: 'isSingleton'
        });
    });

    test('Creation of new valid derived attribute with isMany checked', async () => {
        const mockUse = vi.mocked(Use);
        mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
        const { isOpen, toggle } = mockUse();
        const mockFunction = vi.fn(() => []);
        act(() => {
          render(<NewDerivedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
        });
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

        const instanceNameInput = await screen.findByPlaceholderText('Name');
        act(() => {
          fireEvent.change(instanceNameInput, { target: { value: 'MyAttribute' } });
        });

        const isManyInput = await screen.findByLabelText('isMany');
        act(() => {
          isManyInput.click();
        });

        const submitButton = await screen.findByRole('button', { name: 'Submit' });
        act(() => {
          submitButton.click();
        });

        const mockCreate = vi.mocked(Create);
        const createdInstance = mockCreate.mock.results[0]?.value;
        expect(createdInstance).toBeDefined();
        expect(createdInstance.addDerivedAttribute).toHaveBeenCalledWith('hawk-set-0', {
          attributeName: 'MyAttribute',
          attributeType: "String",
          derivationLanguage: null,
          isMany: true,
          isOrdered: false,
          isUnique: false,
          metamodelUri: 'mymetamodel',
          typeName: 'isSingleton'
        });
    });

    test('Creation of a derived attribute with no name', async () => {
        const mockUse = vi.mocked(Use);
        mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
        const { isOpen, toggle } = mockUse();
        const mockFunction = vi.fn(() => []);
        act(() => {
          render(<NewDerivedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
        });
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

        const submitButton = await screen.findByRole('button', { name: 'Submit' });
        act(() => {
          submitButton.click();
        });

        const mockCreate = vi.mocked(Create);
        const createdInstance = mockCreate.mock.results[0]?.value;
        expect(createdInstance).toBeDefined();
        expect(alertMock).toHaveBeenCalledWith('Please enter an attribute name.');
    });

});