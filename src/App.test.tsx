import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';
import Get from './js/instances/Get';
import { describe, test, expect, vi } from 'vitest';

vi.mock('./js/instances/Get');

describe('App component', () => {
  test('Renders home page', () => {
    const mockGet = vi.mocked(Get);
  
    // @ts-ignore
    mockGet.mockImplementation(() => ([{name: 'instance name', state: 'state', message: 'message'}]));
    
    render(<MemoryRouter><App /></MemoryRouter>);
    
    const title = screen.getByText('Hawk Docker');
    expect(title).toBeInTheDocument();
    const instancesTitle = screen.getByText('Manage Instances');
    expect(instancesTitle).toBeInTheDocument();
  });
});
