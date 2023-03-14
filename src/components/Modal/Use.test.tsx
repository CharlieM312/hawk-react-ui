import React from 'react';
import Use from './Use';

describe('Use component', () => {
  test('Returns `isOpen` and `toggle`', () => {
    const initialState = false;
    React.useState     = jest.fn().mockReturnValue([initialState, {}]);

    const { isOpen, toggle } = Use();
    expect(isOpen).toBe(false);
    expect(typeof toggle).toBe('function');
  });
});
