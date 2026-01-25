import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

// Mock the Thrift client to prevent initialization errors
jest.mock('../../js/client/Create', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    listQueryLanguages: jest.fn(() => [])
  }))
}));

describe('InstanceContent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders instance name as the title of the content', async () => {
    const { default: InstanceContent } = await import('./InstanceContent');

    const instance = { name: 'hawk-set0', status: 'RUNNING', info: 'i' };
    render(
      <MemoryRouter>
        <InstanceContent instance={instance} url="http://localhost:8080" />
      </MemoryRouter>
    );
    const title = screen.getByText('hawk-set0');
    expect(title).toBeInTheDocument();
  });

});