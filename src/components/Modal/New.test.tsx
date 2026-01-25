import { render, screen } from '@testing-library/react';
import New from './New';
import Use from './Use';
import { describe, test, expect, vi } from 'vitest';

vi.mock('./Use');

describe('New component', () => {
  test('Renders modal title', () => {
    const mockUse = vi.mocked(Use);
    mockUse.mockReturnValue({isOpen: true, toggle: () => {}});
    const { isOpen, toggle } = mockUse();

    render(<New isOpen={isOpen} toggle={toggle} title={'Create a New Instance'} />);

    const modalTitle = screen.getByText('Create new instance');
    expect(modalTitle).toBeInTheDocument();
  });
});
