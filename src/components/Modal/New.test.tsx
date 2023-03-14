import { render, screen } from '@testing-library/react';
import New from './New';
import Use from './Use';

jest.mock('./Use');

describe('New component', () => {
  test('Renders modal title', () => {
    const mockUse = Use as jest.MockedFunction<
      typeof Use
    >;
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);

    const modalTitle = screen.getByText('Create new instance');
    expect(modalTitle).toBeInTheDocument();
  });
});
