import { render, screen } from '@testing-library/react';

import App from './App';
import Get from './js/instances/Get';

jest.mock('./js/instances/Get');

describe('App component', () => {
  test('Renders home page', () => {
    const mockGet = Get as jest.MockedFunction<
      typeof Get
    >;
  
    // @ts-ignore
    mockGet.mockImplementation(() => ({name: 'name', state: 'state', message: 'message'}));
    
    render(<App />);
    
    const title = screen.getByText('Hawk Docker');
    expect(title).toBeInTheDocument();
    const instancesTitle = screen.getByText('Manage Instances');
    expect(instancesTitle).toBeInTheDocument();
  });
});
