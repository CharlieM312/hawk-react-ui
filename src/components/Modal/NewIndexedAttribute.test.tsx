
import { describe, test, expect, vi, afterEach } from 'vitest';
import Use from './Use';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Create from '../../js/client/Create';
import NewIndexedAttribute from './NewIndexedAttribute';

vi.mock('./Use');

vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => []),
    listInstances: vi.fn(() => [{ name: 'hawk-set0', state: 0, message: 'Updating' }]),
    listBackends: vi.fn(() => ['backend1', 'backend2']),
    listPlugins: vi.fn(() => ['plugin1', 'org.eclipse.hawk.graph.updater.GraphModelUpdater']),
    listMetamodels: vi.fn(() => ['mymetamodel']),
    listTypeNames: vi.fn(() => ['myType']),
    listAttributeNames: vi.fn(() => ['MyAttribute']),
    addIndexedAttribute: vi.fn(() => Promise.resolve())
  }))
}));

describe('New indexed attribute', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Renders modal title', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    const mockFunction = vi.fn(() => []);

    act (() => {
      render(<NewIndexedAttribute isOpen={isOpen} toggle={toggle} title={'Create new indexed Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
    });

    const modalTitle = await screen.findByText('Create new indexed attribute');
    expect(modalTitle).toBeInTheDocument();
  });

  test('Renders options', async () => {
      const mockUse = vi.mocked(Use);
      mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
      const { isOpen, toggle } = mockUse();
      const mockFunction = vi.fn(() => []);
      act(() => {
        render(<NewIndexedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Indexed Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
      });
  
      const metamodelLabel = await screen.findByText('Metamodel URI');
      expect(metamodelLabel).toBeInTheDocument();
  
      const typeName = await screen.findByText('Type Name');
      expect(typeName).toBeInTheDocument();

      const attributeName = await screen.findByText('Attribute Name');
      expect(attributeName).toBeInTheDocument();
  
    });

    test('Creation of new valid indexed attribute', async () => {
        const mockUse = vi.mocked(Use);
        mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
        const { isOpen, toggle } = mockUse();
        const mockFunction = vi.fn(() => []);
        act(() => {
          render(<NewIndexedAttribute isOpen={isOpen} toggle={toggle} title={'Create new Derived Attribute'} name="hawk-set-0" onCreated={mockFunction} />);
        });
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
        const attributeNameInput = await screen.findByLabelText('Attribute Name');
        act(() => {
          fireEvent.change(attributeNameInput, { target: { value: 'MyAttribute' } });
        });
        
        const submitButton = await screen.findByRole('button', { name: 'Submit' });
        act(() => {      
          submitButton.click();
        });

        const mockCreate = vi.mocked(Create);
        const createdInstance = mockCreate.mock.results[0]?.value;
        expect(createdInstance).toBeDefined();
        expect(createdInstance.addIndexedAttribute).toHaveBeenCalledWith('hawk-set-0', {
          attributeName: 'MyAttribute',
          metamodelUri: 'mymetamodel',
          typeName: 'myType'
        });
    });

});