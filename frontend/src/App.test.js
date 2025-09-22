import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders Sematic application', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const sematicElement = screen.getByText(/sematic/i);
  expect(sematicElement).toBeInTheDocument();
});
