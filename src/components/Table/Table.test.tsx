import { fireEvent, getByLabelText, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import * as RR from 'react-router';
import Table from './Table';
import Create from '../../js/client/Create';
import Get from '../../js/instances/Get';
import { describe, test, expect, vi  } from 'vitest';

vi.mock('../../js/client/Create');
vi.mock('../../js/instances/Get');
vi.mock('../Modal/Instance');

describe('Table component', () => {
  test('Renders error message with invalid url', () => {
    const mockCreate = vi.mocked(Create);
    mockCreate.mockImplementation(() => {
      throw new Error();
    });

    const { container } = render(
      <MemoryRouter>
        <Table url='' />
      </MemoryRouter>
    );

    const errorMessage = container.querySelector('h2');
    expect(errorMessage).toHaveTextContent('Failed to load instances');
  });

  test('Renders table with valid url', () => {
    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);

    mockCreate.mockImplementation(() => ({} as any));
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instance name', state: 'state', message: 'message'}]));

    const { container } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  test('Renders table with mock instances', () => {
    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);

    mockCreate.mockImplementation(() => ({} as any));
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instance name', state: 'state', message: 'message'}]));

    const { container } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const instanceName = container.querySelector('td');
    expect(instanceName).toHaveTextContent('instance name');
  });

  test('Navigates to instance details page on row click if instance is started', () => {
    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockNavigate = vi.fn();

    mockCreate.mockImplementation(() => ({} as any));
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '0', message: 'message'}]));
    vi.spyOn(RR, 'useNavigate').mockReturnValue(mockNavigate);
    vi.spyOn(RR, 'useLocation').mockReturnValue({ pathname: '/instance' } as any);
    const { container } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);

    const row = container.querySelector('tbody tr');
    if (row) {
      (row as HTMLElement).click();
    }

    expect(mockNavigate).toHaveBeenCalledWith("/instance/instancename", { state: { instance: { name: 'instancename', status: 'RUNNING', info: 'message' }, url: 'http://avalidurl:3000' } });
  });

  test('Navigates to instance details page on row click if instance is updating', () => {

    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockNavigate = vi.fn();

    mockCreate.mockImplementation(() => ({} as any));
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '2', message: 'message'}]));
    vi.spyOn(RR, 'useNavigate').mockReturnValue(mockNavigate);
    vi.spyOn(RR, 'useLocation').mockReturnValue({ pathname: '/instance' } as any);
    const { container } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);

    const row = container.querySelector('tbody tr');
    if (row) {
      (row as HTMLElement).click();
    }
    expect(mockNavigate).toHaveBeenCalledWith("/instance/instancename", { state: { instance: { name: 'instancename', status: 'UPDATING', info: 'message' }, url: 'http://avalidurl:3000' } });

  });

  test('Does not navigate to instance details page on row click if instance is stopped', () => {

    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockNavigate = vi.fn();

    mockCreate.mockImplementation(() => ({} as any));
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '1', message: 'message'}]));
    vi.spyOn(RR, 'useNavigate').mockReturnValue(mockNavigate);
    vi.spyOn(RR, 'useLocation').mockReturnValue({ pathname: '/instance' } as any);
    const { container } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);

    const row = container.querySelector('tbody tr');
    if (row) {
      (row as HTMLElement).click();
    }
    expect(mockNavigate).not.toHaveBeenCalled();

  });

  test('Renders no instances message when there are no instances', () => {
    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockNavigate = vi.fn();

    mockCreate.mockImplementation(() => ({} as any));
    // @ts-ignore
    mockGet.mockImplementation(() => ([]));

    const row = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const noInstancesMessage = row.container.querySelector('h2');
    expect(noInstancesMessage).toHaveTextContent('No instances are currently running');

  });

  test('Opens settings when the cog icon is clicked', async () => {

    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockNavigate = vi.fn();

    mockCreate.mockImplementation(() => ({} as any));
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '0', message: 'message'}]));
    vi.spyOn(RR, 'useNavigate').mockReturnValue(mockNavigate);
    vi.spyOn(RR, 'useLocation').mockReturnValue({ pathname: '/instance' } as any);

    const { getByLabelText } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const cogIcon = getByLabelText('Settings for instancename');
    fireEvent.click(cogIcon);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/instance/instancename/settings", { state: { instance: { name: 'instancename', status: 'RUNNING', info: 'message' }, url: 'http://avalidurl:3000' } });
    });
  });

  test('Opens settings when the cog icon is clicked and it is updating', async () => {

    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockNavigate = vi.fn();

    mockCreate.mockImplementation(() => ({} as any));
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '2', message: 'message'}]));
    vi.spyOn(RR, 'useNavigate').mockReturnValue(mockNavigate);
    vi.spyOn(RR, 'useLocation').mockReturnValue({ pathname: '/instance' } as any);

    const { getByLabelText } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const cogIcon = getByLabelText('Settings for instancename');
    fireEvent.click(cogIcon);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/instance/instancename/settings", { state: { instance: { name: 'instancename', status: 'UPDATING', info: 'message' }, url: 'http://avalidurl:3000' } });
    });
  });

  test('Syncs selected instance when the sync icon is clicked', async () => {
    
    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockHawkClient = { syncInstance: vi.fn(() => Promise.resolve()) };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockCreate.mockImplementation(() => mockHawkClient as any);
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '0', message: 'message'}]));
    const { getByLabelText } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const syncIcon = getByLabelText('Sync instancename');
    fireEvent.click(syncIcon);

    await waitFor(() => {
      expect(mockHawkClient.syncInstance).toHaveBeenCalledWith('instancename', { blockUntilDone: true });
    });

  });

  test('Starts selected instance when the start icon is clicked', async () => {
    
    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockHawkClient = { startInstance: vi.fn(() => Promise.resolve()) };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockCreate.mockImplementation(() => mockHawkClient as any);
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '1', message: 'message'}]));
    const { getByLabelText } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const startIcon = getByLabelText('Start instancename');
    fireEvent.click(startIcon);

    await waitFor(() => {
      expect(mockHawkClient.startInstance).toHaveBeenCalledWith('instancename');
    });

  });

  test('Starting an instance that is already running shows an alert', async () => {
    
    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockHawkClient = { startInstance: vi.fn(() => Promise.resolve()) };

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockCreate.mockImplementation(() => mockHawkClient as any);

    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '0', message: 'message'}]));
    const { getByLabelText } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const startIcon = getByLabelText('Start instancename');
    fireEvent.click(startIcon);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Instance \"instancename"\ is already running.');
    });

  });

  test('Starting an instance that is already updating shows an alert', async () => {
    
    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockHawkClient = { startInstance: vi.fn(() => Promise.resolve()) };

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockCreate.mockImplementation(() => mockHawkClient as any);

    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '2', message: 'message'}]));
    const { getByLabelText } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const startIcon = getByLabelText('Start instancename');
    fireEvent.click(startIcon);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Instance \"instancename"\ is already running.');
    });

  });

  test('Stops selected instance when the stop icon is clicked', async () => {
    
    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockHawkClient = { stopInstance: vi.fn(() => Promise.resolve()) };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockCreate.mockImplementation(() => mockHawkClient as any);
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '0', message: 'message'}]));
    const { getByLabelText } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const stopIcon = getByLabelText('Stop instancename');
    fireEvent.click(stopIcon);

    await waitFor(() => {
      expect(mockHawkClient.stopInstance).toHaveBeenCalledWith('instancename');
    });

  });

  test('Stopping an instance that is already stopped shows an alert', async () => {
    
    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockHawkClient = { startInstance: vi.fn(() => Promise.resolve()) };

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockCreate.mockImplementation(() => mockHawkClient as any);

    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '1', message: 'message'}]));
    const { getByLabelText } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const stopIcon = getByLabelText('Stop instancename');
    fireEvent.click(stopIcon);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Instance \"instancename"\ is already stopped.');
    });

  });

  test('Deletes selected instance when the delete icon is clicked', async () => {
    
    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockHawkClient = { removeInstance: vi.fn(() => Promise.resolve()) };
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockCreate.mockImplementation(() => mockHawkClient as any);
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '1', message: 'message'}]));
    const { getByLabelText } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const deleteIcon = getByLabelText('Delete instancename');
    fireEvent.click(deleteIcon);

    await waitFor(() => {
      expect(mockHawkClient.removeInstance).toHaveBeenCalledWith('instancename');
    });

  });

  test('Deleting an instance that is running shows an alert', async () => {

    const mockGet = vi.mocked(Get);
    const mockCreate = vi.mocked(Create);
    const mockHawkClient = { startInstance: vi.fn(() => Promise.resolve()) };

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockCreate.mockImplementation(() => mockHawkClient as any);

    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instancename', state: '0', message: 'message'}]));
    const { getByLabelText } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);
    const deleteIcon = getByLabelText('Delete instancename');
    fireEvent.click(deleteIcon);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Instance \"instancename"\ is running, and can\'t be deleted.');
    });

  });

});

