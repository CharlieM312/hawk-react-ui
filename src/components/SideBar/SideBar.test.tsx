import { fireEvent, render } from '@testing-library/react';
import SideBar from './SideBar';
import {  describe, test, expect, vi } from 'vitest';

describe('Sidebar component', () => {
  test('Renders Hawk logo', () => {
    const { container } = render(<SideBar />);

    const logo = container.querySelector('img');
    expect(logo).toHaveAttribute('alt', 'logo');
  });

  test('Renders theme toggle svg', () => {
    const { container } = render(<SideBar />);

    const toggle = container.querySelector('svg#darkMode');
    expect(toggle).toBeInTheDocument();
  });

  test('Changes theme when theme toggle is clicked', () => {
    const spyLoStoGet = vi.spyOn(localStorage, 'getItem');
    const spyLoStoSet = vi.spyOn(localStorage, 'setItem');

    const { container } = render(<SideBar />);

    expect(spyLoStoGet).toHaveBeenCalled();
    expect(localStorage.getItem('theme')).toBe('light');

    const toggle = container.querySelector('svg#darkMode');
    toggle && fireEvent.click(toggle);

    expect(spyLoStoSet).toHaveBeenCalled();
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
