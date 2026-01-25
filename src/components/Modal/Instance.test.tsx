import { render, screen } from '@testing-library/react';
import Get from '../../js/instances/Get';
import Instance from './Instance';
import Use from './Use';
import Create from '../../js/client/Create';
import Languages from '../../js/instances/query/Languages';
import { describe, test, expect, vi } from 'vitest';

vi.mock('../../js/client/Create');
vi.mock('../../js/instances/query/Languages');
vi.mock('../../js/instances/Get');
vi.mock('./Use');

describe('Instance component', () => {
  test('Renders instance name as title', () => {
    const mockGet = vi.mocked(Get);
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instance name', state: 'state', message: 'message'}]));

    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    const mockCreate = vi.mocked(Create);

    const mockLanguages = vi.mocked(Languages);
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
