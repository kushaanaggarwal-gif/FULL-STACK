import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectPostById } from '../features/posts/postsSelectors';
import { updatePostAsync } from '../features/posts/postsSlice';
import { selectAllPlatforms } from '../features/platforms/platformsSlice';
import {
  selectEditingPostId,
  setEditingPostId,
  showNotification
} from '../features/ui/uiSlice';

export const EditPostModal = () => {
  const dispatch = useAppDispatch();
  const editingId = useAppSelector(selectEditingPostId);
  const post = useAppSelector((state) => (editingId ? selectPostById(state, editingId) : null));
  const platforms = useAppSelector(selectAllPlatforms);

  const [content, setContent] = useState('');
  const [platformId, setPlatformId] = useState('twitter');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      setPlatformId(post.platformId || 'twitter');
      setStatus(post.status || 'draft');
    }
  }, [post]);

  if (!editingId || !post) return null;

  const handleClose = () => dispatch(setEditingPostId(null));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    await dispatch(
      updatePostAsync({
        id: post.id,
        changes: { content: content.trim(), platformId, status }
      })
    );
    dispatch(showNotification({ message: 'Post updated via postsAdapter.updateOne.', type: 'success' }));
    handleClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Edit Post</h3>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Platform</label>
            <select
              className="form-select"
              value={platformId}
              onChange={(e) => setPlatformId(e.target.value)}
            >
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Content</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={handleClose} className="btn btn-sm-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
