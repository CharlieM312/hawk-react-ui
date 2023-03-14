import { render, screen } from '@testing-library/react';
import Get from '../../js/instances/Get';
import Instance from './Instance';
import Use from './Use';
import Create from '../../js/client/Create';
import Languages from '../../js/instances/query/Languages';

jest.mock('../../js/client/Create');
jest.mock('../../js/instances/query/Languages');
jest.mock('../../js/instances/Get');
jest.mock('./Use');

describe('Instance component', () => {
  test('Renders instance name as title', () => {
    const mockGet = Get as jest.MockedFunction<
      typeof Get
    >;
    // @ts-ignore
    mockGet.mockImplementation(() => ({name: 'instance name', state: 'state', message: 'message'}));

    const mockUse = Use as jest.MockedFunction<
      typeof Use
    >;
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    Create as jest.MockedFunction<
      typeof Create
    >;

    const mockLanguages = Languages as jest.MockedFunction<
      typeof Languages
    >;
    mockLanguages.mockReturnValue(['EOL', 'EPL', 'EOL', 'EPL', 'EPL']);

    const mockInstance = {
      name: 'instance name',
      status: 'status',
      info: 'message'
    };

    render(<Instance isOpen={isOpen} toggle={toggle} instance={mockInstance} url='http:avalidurl:3000' />);

    const title = screen.getByText('instance name');
    expect(title).toBeInTheDocument();
  });
});
