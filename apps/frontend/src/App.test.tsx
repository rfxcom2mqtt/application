import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock react-router-dom but keep MemoryRouter for testing
vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as any;
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <actual.MemoryRouter>{children}</actual.MemoryRouter>
    ),
  };
});

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

// Mock the lazy-loaded components
vi.mock('./pages/controller/ControllerInfo', () => ({
  default: () => <div>Controller Info Page</div>,
}));

test('renders app without crashing', () => {
  act(() => {
    render(<App />);
  });
  // Check if the app renders without throwing an error
  expect(document.body).toBeInTheDocument();
});
