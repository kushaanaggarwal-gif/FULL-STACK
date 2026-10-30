import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addPostAsync } from '../features/posts/postsSlice';
import { selectAllPlatforms } from '../features/platforms/platformsSlice';
import { showNotification } from '../features/ui/uiSlice';
import { selectPostsMutationLoading } from '../features/posts/postsSelectors';

export const PostForm = () => {
  const dispatch = useAppDispatch();
  const platforms = useAppSelector(selectAllPlatforms);
  const mutationLoading = useAppSelector(selectPostsMutationLoading);

  const [content, setContent] = useState('');
  const [platformId, setPlatformId] = useState('twitter');
  const [status, setStatus] = useState('draft');

  const selectedPlatform = platforms.find((p) => p.id === platformId) || platforms[0];
  const charCount = content.length;
  const maxChars = selectedPlatform?.maxChars || 280;
  const isShort = charCount > 0 && charCount < 100;
  const isOver = charCount > maxChars;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isOver) return;

    const newPost = {
      content: content.trim(),
      platformId,
      status,
      scheduledAt: new Date().toISOString(),
      tags: []
    };

    const action = await dispatch(addPostAsync(newPost));
    if (addPostAsync.fulfilled.match(action)) {
      dispatch(showNotification({ message: 'Post added to normalized state.', type: 'success' }));
      setContent('');
    }
  };

  return (
    <div className="composer-bar">
      <div className="composer-title-row">
        <span className="composer-title">Content Composer &amp; Draft Manager</span>
        <span className={`composer-char-limit ${isShort ? 'short-highlight' : ''}`}>
          {isShort && '✦ Short Post (<100ch) • '}
          {charCount} / {maxChars} chars
        </span>
      </div>

      <form onSubmit={handleSubmit} className="composer-input-row">
        <textarea
          className="composer-textarea"
          rows={2}
          placeholder="Draft your post or announcement..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <div className="composer-controls">
          <select
            className="composer-select"
            value={platformId}
            onChange={(e) => setPlatformId(e.target.value)}
            title="Social Platform"
          >
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            className="composer-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            title="Publish Status"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>

          <button
            type="submit"
            disabled={mutationLoading || !content.trim() || isOver}
            className="btn btn-primary"
          >
            {mutationLoading ? 'Saving...' : 'Add Post'}
          </button>
        </div>
      </form>
    </div>
  );
};
