import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock components to simplify App testing
vi.mock('./components/ChatAssistant', () => ({
  default: () => <div data-testid="chat-assistant">Mock Chat</div>
}));
vi.mock('./components/LearningJourney', () => ({
  default: () => <div data-testid="learning-journey">Mock Learning</div>
}));
vi.mock('./components/SimulationMode', () => ({
  default: () => <div data-testid="simulation-mode">Mock Simulation</div>
}));

describe('App Component', () => {
  it('renders the header and main sections', () => {
    render(<App />);
    expect(screen.getByText(/ElectionVerse/i)).toBeInTheDocument();
    expect(screen.getByTestId('chat-assistant')).toBeInTheDocument();
  });
  
  it('renders the role selector', () => {
    render(<App />);
    expect(screen.getByRole('combobox', { name: /Select User Role/i })).toBeInTheDocument();
  });
});
