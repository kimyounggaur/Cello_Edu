import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import App from './App';

describe('mobile app shell', () => {
  test('renders the core mobile navigation and first-tap prompt', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /지판온/ })).toBeInTheDocument();
    expect(screen.getByText(/먼저 A현 개방현/)).toBeInTheDocument();
    for (const tab of ['지판', '찾기', '연습', '음계', '더보기']) {
      expect(screen.getByRole('button', { name: new RegExp(tab) })).toBeInTheDocument();
    }
  });
});
