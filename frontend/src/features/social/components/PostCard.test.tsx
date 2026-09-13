import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PostCard } from './PostCard';
import type { FeedPost } from '../types';

const POST: FeedPost = {
  id: 'p1',
  author: { id: 'a1', name: 'Amara Okafor', title: 'Talent Partner at Nova Labs', verified: true },
  content: 'We opened graduate roles.',
  createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  job: { title: 'Graduate Software Engineer', company: 'Nova Labs', matchScore: 91 },
  likes: 84,
  comments: 12,
  shares: 19,
};

describe('PostCard', () => {
  it('renders author, title, time, content, and counts', () => {
    render(<PostCard post={POST} />);
    expect(screen.getByText('Amara Okafor')).toBeInTheDocument();
    expect(screen.getByText('Talent Partner at Nova Labs')).toBeInTheDocument();
    expect(screen.getByText('We opened graduate roles.')).toBeInTheDocument();
    expect(screen.getByText('30m')).toBeInTheDocument();
    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.getByText('12 comments')).toBeInTheDocument();
    expect(screen.getByText('19 shares')).toBeInTheDocument();
    expect(screen.getAllByText('Nova Labs').length).toBeGreaterThanOrEqual(1);
  });

  it('toggles like and calls onToggleLike', () => {
    const onToggleLike = vi.fn();
    const { rerender } = render(<PostCard post={POST} onToggleLike={onToggleLike} />);
    fireEvent.click(screen.getByRole('button', { name: /Like/ }));
    expect(onToggleLike).toHaveBeenCalledWith('p1');
    const liked = { ...POST, likedByMe: true, likes: 85 };
    rerender(<PostCard post={liked} onToggleLike={onToggleLike} />);
    expect(screen.getByRole('button', { name: /Liked/ })).toHaveClass('feed-action--active');
  });

  it('opens a comment input and adds a comment', () => {
    const onAddComment = vi.fn();
    render(<PostCard post={POST} onAddComment={onAddComment} />);
    fireEvent.click(screen.getByRole('button', { name: /Comment/ }));
    const input = screen.getByPlaceholderText(/Write a comment/);
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Congratulations!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(onAddComment).toHaveBeenCalledWith('p1');
  });
});