import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CreatePostComposer } from './CreatePostComposer';

const AUTHOR = { id: 'me-1', name: 'Jireh Cruz', title: 'Graduate · Computer Science' };

describe('CreatePostComposer', () => {
  it('greets the user by first name', () => {
    render(<CreatePostComposer author={AUTHOR} onCreatePost={vi.fn()} />);
    expect(screen.getByPlaceholderText(/What's on your mind, Jireh/)).toBeInTheDocument();
    expect(screen.getByText('Share an update, ask a question, or post something related to your career.')).toBeInTheDocument();
  });

  it('disables Post until there is content', () => {
    render(<CreatePostComposer author={AUTHOR} onCreatePost={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText(/What's on your mind/), { target: { value: 'hello' } });
    expect(screen.getByRole('button', { name: 'Post' })).toBeEnabled();
  });

  it('submits content and clears the composer', () => {
    const onCreatePost = vi.fn();
    render(<CreatePostComposer author={AUTHOR} onCreatePost={onCreatePost} />);
    fireEvent.change(screen.getByPlaceholderText(/What's on your mind/), { target: { value: 'Looking for a mentor' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(onCreatePost).toHaveBeenCalledWith({ content: 'Looking for a mentor', image: undefined });
    expect(screen.getByPlaceholderText(/What's on your mind/)).toHaveValue('');
  });

  it('shows the attachment actions', () => {
    render(<CreatePostComposer author={AUTHOR} onCreatePost={vi.fn()} />);
    for (const label of ['Photo', 'Video', 'Document', 'Poll']) {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeInTheDocument();
    }
  });
});