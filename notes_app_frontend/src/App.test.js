import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Personal Notes/i);
  expect(titleElement).toBeInTheDocument();
});
