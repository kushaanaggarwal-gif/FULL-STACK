import React, { useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  deletePostAsync,
  engagementBoosted,
  statusChanged
} from '../features/posts/postsSlice';
import { selectAllPlatforms } from '../features/platforms/platformsSlice';
import { setEditingPostId, showNotification } from '../features/ui/uiSlice';

/**
 * PostItem Component
 * Wrapped in React.memo (Module 4) to verify single-entity re-render isolation
 */
export const PostItem = React.memo(({ post }) => {
  const dispatch = useAppDispatch();
  const platforms = useAppSelector(selectAllPlatforms);

  // Render Counter to verify React.memo in UI and Console
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  useEffect(() => {
    console.log(`[React.memo Render] Post ${post.id} (Render #${renderCountRef.current})`);
  });

  const platform = platforms.find(
    (p) => p.id.toLowerCase() === (post.platformId || '').toLowerCase()
  ) || { name: post.platformId || 'Social' };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    return new Date(isoString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusCycle = () => {
    const next = post.status === 'draft' ? 'published' : 'draft';
    dispatch(statusChanged({ id: post.id, status: next }));
  };

  const handleDelete = () => {
    if (window.confirm('Delete this post from normalized store?')) {
      dispatch(deletePostAsync(post.id));
      dispatch(showNotification({ message: 'Post deleted.', type: 'info' }));
    }
  };

  const handleLike = () => {
    dispatch(engagementBoosted({ id: post.id, type: 'likes' }));
  };

  return (
    <article className="post-card">
      <div className="post-card-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="post-platform-tag">{platform.name}</span>
          <button
            onClick={handleStatusCycle}
            className={`post-status-badge ${post.status || 'draft'}`}
            title="Click to toggle Draft <-> Published"
            style={{ border: 'none', cursor: 'pointer' }}
          >
            {post.status || 'draft'}
          </button>
        </div>

        <span className="render-counter-pill" title="Verification render counter">
          Renders: {renderCountRef.current}
        </span>
      </div>

      <p className="post-card-content">{post.content}</p>

      <div className="post-card-footer">
        <span>{formatDate(post.createdAt || post.scheduledAt)} • {post.content.length}ch</span>

        <div className="post-card-actions">
          <button
            onClick={handleLike}
            className="btn-card-action"
            title="Click to boost likes (+1). Only this card will re-render!"
          >
            👍 {post.engagement?.likes || 0}
          </button>
          <button
            onClick={() => dispatch(setEditingPostId(post.id))}
            className="btn-card-action"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn-card-action delete"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
});

PostItem.displayName = 'PostItem';
