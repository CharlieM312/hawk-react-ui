
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
    listTypeNames: vi.fn(() => ['isSingleton']),
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

});