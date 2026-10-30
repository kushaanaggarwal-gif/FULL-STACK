import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAllPlatforms } from '../features/platforms/platformsSlice';
import { selectAllPosts, selectShortPosts } from '../features/posts/postsSelectors';
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

export const FilterBar = () => {
  const dispatch = useAppDispatch();
  const platforms = useAppSelector(selectAllPlatforms);
  const allPosts = useAppSelector(selectAllPosts);
  const shortPosts = useAppSelector(selectShortPosts);

  const activePlatform = useAppSelector(selectActivePlatformFilter);
  const showShortOnly = useAppSelector(selectShowShortPostsOnly);
  const statusFilter = useAppSelector(selectStatusFilter);
  const searchQuery = useAppSelector(selectSearchQuery);

  const hasFilters =
    activePlatform !== 'all' || showShortOnly || statusFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="filters-container">
      {/* Top Search & Filter Controls */}
      <div className="filters-top">
        <input
          type="text"
          className="search-field"
          placeholder="Search posts or #tags..."
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        />

        {/* Short Posts Toggle Button */}
        <button
          onClick={() => dispatch(toggleShowShortPostsOnly())}
          className={`btn ${showShortOnly ? 'btn-active' : ''}`}
          title="Filter posts < 100 characters via selectShortPosts"
        >
          Short Posts (&lt;100ch) ({shortPosts.length})
        </button>

        {/* Status Dropdown */}
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => dispatch(setStatusFilter(e.target.value))}
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Drafts</option>
        </select>

        {hasFilters && (
          <button onClick={() => dispatch(resetFilters())} className="btn">
            Clear Filters
          </button>
        )}
      </div>

      {/* Platform Filter Tabs */}
      <div className="platform-tabs">
        <button
          onClick={() => dispatch(setActivePlatformFilter('all'))}
          className={`platform-tab ${activePlatform === 'all' ? 'active' : ''}`}
        >
          All ({allPosts.length})
        </button>

        {platforms.map((p) => {
          const count = allPosts.filter(
            (item) => item.platformId.toLowerCase() === p.id.toLowerCase()
          ).length;

          return (
            <button
              key={p.id}
              onClick={() => dispatch(setActivePlatformFilter(p.id))}
              className={`platform-tab ${activePlatform.toLowerCase() === p.id.toLowerCase() ? 'active' : ''}`}
            >
              {p.name} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
};
