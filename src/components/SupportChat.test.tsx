import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { askSupportChat } = vi.hoisted(() => ({ askSupportChat: vi.fn() }));
vi.mock('../lib/api', () => ({
  api: { askSupportChat },
  ApiError: class ApiError extends Error { status = 503; detail = 'AI support is unavailable'; },
}));

import { SupportChat } from './SupportChat';

describe('SupportChat', () => {
  beforeEach(() => askSupportChat.mockReset());

  it('opens support, sends a question, and displays the reply', async () => {
    askSupportChat.mockResolvedValue({ answer: 'Open Signal Intelligence, then select a finding.', model_used: 'test' });
    render(<SupportChat />);
    fireEvent.click(screen.getByRole('button', { name: /open support chat/i }));
    fireEvent.change(screen.getByLabelText(/message support/i), { target: { value: 'How do I inspect a signal?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(screen.getByText(/Open Signal Intelligence, then select a finding/i)).toBeInTheDocument());
    expect(askSupportChat).toHaveBeenCalledWith('How do I inspect a signal?', []);
  });
});
