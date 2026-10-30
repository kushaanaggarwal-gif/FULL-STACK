import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  selectFilteredPosts,
  selectPostsLoading,
  selectPostsError,
  selectAllPosts,
  selectShortPosts
} from '../features/posts/postsSelectors';
import {
  selectActivePlatformFilter,
  selectShowShortPostsOnly,
  selectStatusFilter,
  selectSearchQuery,
  setActivePlatformFilter,
  toggleShowShortPostsOnly,
  setStatusFilter,
  setSearchQuery,
  resetFilters
} from '../features/ui/uiSlice';
import { fetchPosts } from '../features/posts/postsSlice';
import { selectAllPlatforms } from '../features/platforms/platformsSlice';
import { PostItem } from './PostItem';

export const PostList = () => {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(selectFilteredPosts);
  const allPosts = useAppSelector(selectAllPosts);
  const shortPosts = useAppSelector(selectShortPosts);
  const platforms = useAppSelector(selectAllPlatforms);
  const loading = useAppSelector(selectPostsLoading);
  const error = useAppSelector(selectPostsError);

  const activePlatform = useAppSelector(selectActivePlatformFilter);
  const showShortOnly = useAppSelector(selectShowShortPostsOnly);
  const statusFilter = useAppSelector(selectStatusFilter);
  const searchQuery = useAppSelector(selectSearchQuery);

  if (loading && allPosts.length === 0) {
    return (
      <div className="empty-state">
        <p>Loading normalized posts from mock API...</p>
      </div>
    );
  }

  if (error && allPosts.length === 0) {
    return (
      <div className="empty-state" style={{ borderColor: 'var(--danger)' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{error}</p>
        <button onClick={() => dispatch(fetchPosts())} className="btn btn-primary">
          Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <section className="board-section">
      <div className="board-header">
        {/* Status & View Mode Tabs */}
        <div className="board-filters">
          <button
            onClick={() => {
              dispatch(setStatusFilter('all'));
              if (showShortOnly) dispatch(toggleShowShortPostsOnly());
            }}
            className={`btn-tab ${statusFilter === 'all' && !showShortOnly ? 'active' : ''}`}
          >
            All Content ({allPosts.length})
          </button>

          <button
            onClick={() => {
              if (showShortOnly) dispatch(toggleShowShortPostsOnly());
              dispatch(setStatusFilter('draft'));
            }}
            className={`btn-tab ${statusFilter === 'draft' && !showShortOnly ? 'active' : ''}`}
          >
            Drafts ({allPosts.filter(p => p.status === 'draft').length})
          </button>

          <button
            onClick={() => {
              if (showShortOnly) dispatch(toggleShowShortPostsOnly());
              dispatch(setStatusFilter('published'));
            }}
            className={`btn-tab ${statusFilter === 'published' && !showShortOnly ? 'active' : ''}`}
          >
            Published ({allPosts.filter(p => p.status === 'published').length})
          </button>

          <button
            onClick={() => {
              dispatch(setStatusFilter('all'));
              dispatch(toggleShowShortPostsOnly());
            }}
            className={`btn-tab ${showShortOnly ? 'active' : ''}`}
            title="Filter by selectShortPosts (<100ch)"
          >
            Short Posts ({shortPosts.length})
          </button>

          {/* Platform Filter Dropdown */}
          <select
            className="composer-select"
            value={activePlatform}
            onChange={(e) => dispatch(setActivePlatformFilter(e.target.value))}
            title="Filter by Social Platform"
          >
            <option value="all">All Platforms</option>
            {platforms.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Live Search */}
        <input
          type="text"
          className="search-mini"
          placeholder="Filter content / tags..."
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        />
      </div>

      {/* Grid of Post Items */}
      <div className="posts-grid">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>No content matches your active filter selection.</p>
          </div>
        ) : (
          posts.map((post) => <PostItem key={post.id} post={post} />)
        )}
      </div>
    </section>
  );
};
