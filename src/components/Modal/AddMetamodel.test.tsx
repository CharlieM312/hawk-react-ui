import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Use from './Use';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import AddMetamodel from './AddMetamodel';
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
    listRepositoryTypes: vi.fn(() => ['mockType']),
    registerMetamodels: vi.fn(() => Promise.resolve())
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

    const modalTitle = await screen.findByText('Register Metamodel');
    expect(modalTitle).toBeInTheDocument();
  });

  test('Submit a metamodel', async () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();
    const mockFunction = vi.fn(() => []);

    act(() => {
      render(<AddMetamodel title={"New Metamodel"} name="hawk-set-0" isOpen={isOpen} toggle={toggle} onCreated={mockFunction} />);
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const exampleFile = new File(['examplecontent'], 'examplecontent.json', {type: 'application/json'});

    const fileUpload = await screen.findByPlaceholderText('Upload Metamodel File');
    fireEvent.change(fileUpload, { target: { files: [exampleFile] } });
    const submitButton = await screen.findByRole('button', { name: 'Submit' });

    const form = submitButton.closest('form');
    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(vi.mocked(Create)).toHaveBeenCalledTimes(1);
    });

    expect((fileUpload as HTMLInputElement).files?.[0]).toEqual(exampleFile);

    const createdInstance = vi.mocked(Create).mock.results[0]?.value;
    expect(createdInstance).toBeDefined();

    await waitFor(() => {
      expect(createdInstance.registerMetamodels).toHaveBeenCalledWith('hawk-set-0', [exampleFile]);
      expect(alertMock).toHaveBeenCalledWith('Metamodel created successfully');
    });



  });



});