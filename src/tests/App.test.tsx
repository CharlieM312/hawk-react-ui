import { render, screen } from '@testing-library/react';
import App from '../App';
import Get from '../js/instances/Get';

jest.mock('../js/instances/Get');

test('renders home page', () => {
  const mockGet = Get as jest.MockedFunction<
    typeof Get
  >;

  // @ts-ignore
  // Ignore typescript error due to hawk files being public
  mockGet.mockImplementation(() => ({name: 'name', state: 'state', message: 'message'}));
  
  render(
    <App />
  );
  
  const linkElement = screen.getByText(/Hawk Docker/i);
  expect(linkElement).toBeInTheDocument();
});
