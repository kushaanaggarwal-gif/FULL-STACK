import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('Calendar App', () => {
  it('renders the main header', () => {
    render(<App />);
    expect(screen.getByText('Interactive Calendar')).toBeInTheDocument();
  });

  it('can open add event modal', () => {
    render(<App />);
    const addButton = screen.getByText('Add Event');
    fireEvent.click(addButton);
    expect(screen.getByText('Add New Event')).toBeInTheDocument();
  });
});
