import React from 'react';
import Use from './Use';
import { vi, describe, test, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

describe('Use component', () => {
  test('Returns `isOpen` and `toggle`', () => {
    const { result } = renderHook(() => Use());

    // Initial state should be false
    expect(result.current.isOpen).toBe(false);

    // Toggle to open
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    // Toggle to close
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });
});