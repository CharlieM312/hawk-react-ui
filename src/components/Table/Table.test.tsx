import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Table from './Table';
import Create from '../../js/client/Create';
import Get from '../../js/instances/Get';
import Instance from '../Modal/Instance';

jest.mock('../../js/client/Create');
jest.mock('../../js/instances/Get');
jest.mock('../Modal/Instance');

describe('Table component', () => {
  test('Renders error message with invalid url', () => {
    const mockCreate = Create as jest.MockedFunction<
      typeof Create
    >;
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
    const mockGet = Get as jest.MockedFunction<
      typeof Get
    >;
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instance name', state: 'state', message: 'message'}]));

    Instance as jest.MockedFunction<
      typeof Instance
    >;

    const { container } = render(<><MemoryRouter><Table url='http://avalidurl:3000' /></MemoryRouter></>);

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });
});
