import { fireEvent, render } from '@testing-library/react';
import SideBar from './SideBar';

describe('Sidebar component', () => {
  test('Renders Hawk logo', () => {
    const { container } = render(<SideBar />);

    const logo = container.querySelector('img');
    expect(logo).toHaveClass('logo');
  });

  test('Renders theme toggle svg', () => {
    const { container } = render(<SideBar />);

    const toggle = container.querySelector('svg');
    expect(toggle).toHaveClass('toggle');
  });

  test('Changes theme when theme toggle is clicked', () => {
    const spyLoStoGet = jest.spyOn(localStorage, 'getItem');
    const spyLoStoSet = jest.spyOn(localStorage, 'setItem');

    const { container } = render(<SideBar />);

    expect(spyLoStoGet).toHaveBeenCalled();
    expect(localStorage.getItem('theme')).toBe('light');

    const toggle = container.querySelector('svg');
    toggle && fireEvent.click(toggle);

    expect(spyLoStoSet).toHaveBeenCalled();
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
