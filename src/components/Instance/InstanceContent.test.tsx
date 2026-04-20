import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { describe, test, expect, afterEach } from 'vitest';
import InstanceContent from './InstanceContent';

// Mock the Thrift client to prevent initialization errors
vi.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    listQueryLanguages: vi.fn(() => ['myLanguageOne', 'myLanguageTwo']),
    listInstances: vi.fn(() => []),
    asyncQuery: vi.fn(() => []),
    fetchAsyncQueryResults: vi.fn(() => [{
        "result": {
          "vBoolean": null,
          "vByte": null,
          "vShort": null,
          "vInteger": null,
          "vLong": null,
          "vDouble": null,
          "vString": "null",
          "vModelElement": null,
          "vModelElementType": null,
          "vMap": null,
          "vList": null
        },
        "wallMillis": 745,
        "isCancelled": false
      }])
  }))
}));

vi.mock('../../js/instances/query/FetchResults', () => ({
      __esModule: true,
      default: vi.fn(() => Promise.resolve({
        formattedResult: 'OK',
        raw: 'raw',
        result: null,
        isGraph: false,
        queryTime: 10
      }))
}));

describe('InstanceContent', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders language options when instance is running and tests select box', async () => {
    const user = userEvent.setup();
    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const languageOptions = await screen.findByText(/myLanguageOne/i);
    expect(languageOptions).toBeInTheDocument();
    await user.click(languageOptions);

    const newOption = await screen.findByText(/myLanguageTwo/i);
    await user.click(newOption);
    expect(screen.getByText(/myLanguageTwo/i)).toBeInTheDocument();
    
  });

  test('navigation to settings page works correctly via link', () => {

    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const settingsLink = screen.getByRole('link', { name: /Settings/i });
    expect(settingsLink).toBeInTheDocument();
    fireEvent.click(settingsLink);
    expect(settingsLink.getAttribute('href')).toBe('/instance/hawk-set0/settings');
  });

  test('navigation to home page works correctly via link', () => {

    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toBeInTheDocument();
    fireEvent.click(homeLink);
    expect(homeLink.getAttribute('href')).toBe('/');
  });


  test('Check what is displayed if no instance name can be found', () => {
    const instance = { status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const title = screen.getByRole('link', { name: /Home/i });
    expect(title).toBeInTheDocument();
  });

  test('run empty query on instance', () => {

    const instance = { status: 'RUNNING', info: 'i' };
    vi.useFakeTimers();
    const { container } =
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );

    const submissionButton = container.querySelector('[name="Submit Query"]') as Element;
    act(() => {
      fireEvent.click(submissionButton);
    });

    const rawQueryButton = container.querySelector('[name="RawText"]') as Element;
    act(() => {
      fireEvent.click(rawQueryButton);
      vi.advanceTimersByTime(1000);
    });

    expect(submissionButton).toHaveTextContent('Cancel');
    vi.useRealTimers();

  });

});