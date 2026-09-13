import { useState } from 'react';
import { Avatar } from '../../../components/Avatar';
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import type { FeedPost } from '../types';
import { timeAgo } from '../lib/format';

interface PostCardProps {
  post: FeedPost;
  onToggleLike?: (postId: string) => void;
  onAddComment?: (postId: string) => void;
}

export const PostCard = ({ post, onToggleLike, onAddComment }: PostCardProps) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState('');

  const submitComment = () => {
    if (!comment.trim()) return;
    onAddComment?.(post.id);
    setComment('');
    setCommentOpen(false);
  };

  return (
    <article className="feed-card feed-post">
      <div className="feed-post__header">
        <Avatar src={post.author.avatar} name={post.author.name} size="md" />
        <div className="feed-post__author">
          <span className="feed-post__name">
            {post.author.name}
            {post.author.verified && (
              <PhosphorIcon name="SealCheck" size={15} weight="fill" className="feed-post__verify" aria-label="Verified" />
            )}
          </span>
          <span className="feed-post__title">{post.author.title}</span>
          <span className="feed-post__time">{timeAgo(post.createdAt)}</span>
        </div>
        <button type="button" className="feed-post__more" aria-label="More actions">
          <PhosphorIcon name="DotsThree" size={20} />
        </button>
      </div>

      <div className="feed-post__body">
        <p className="feed-post__text">{post.content}</p>
        {post.image && <img className="feed-post__media" src={post.image} alt="Post attachment" />}
        {post.job && (
          <div className="feed-post__job">
            <div className="feed-post__job-info">
              <span className="feed-post__job-title">{post.job.title}</span>
              <span className="feed-post__job-company">
                {post.job.company}
                {post.job.location ? ` · ${post.job.location}` : ''}
              </span>
            </div>
            {post.job.matchScore != null && <span className="feed-post__job-match">{post.job.matchScore}% match</span>}
          </div>
        )}
      </div>

      <div className="feed-post__footer">
        <div className="feed-post__counts">
          {post.likes > 0 && (
            <span><PhosphorIcon name="ThumbsUp" size={13} weight="fill" /> {post.likes}</span>
          )}
          {post.comments > 0 && <span>{post.comments} comments</span>}
          {post.shares > 0 && <span>{post.shares} shares</span>}
        </div>
        <div className="feed-post__actions">
          <button
            type="button"
            className={`feed-action ${post.likedByMe ? 'feed-action--active' : ''}`}
            onClick={() => onToggleLike?.(post.id)}
          >
            <PhosphorIcon name="ThumbsUp" size={18} weight={post.likedByMe ? 'fill' : 'regular'} />
            {post.likedByMe ? 'Liked' : 'Like'}
          </button>
          <button type="button" className="feed-action" onClick={() => setCommentOpen((v) => !v)}>
            <PhosphorIcon name="ChatCircle" size={18} />
            Comment
          </button>
          <button type="button" className="feed-action">
            <PhosphorIcon name="Share" size={18} />
            Share
          </button>
          <button type="button" className="feed-action feed-action--icon">
            <PhosphorIcon name="DotsThree" size={18} />
          </button>
        </div>
        {commentOpen && (
          <div className="feed-post__commentbox">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              placeholder="Write a comment…"
            />
            <button type="button" className="feed-commentbox__post" onClick={submitComment} disabled={!comment.trim()}>
              Post
            </button>
          </div>
        )}
      </div>
    </article>
  );
};