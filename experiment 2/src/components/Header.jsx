import React from 'react';
import { useAppSelector } from '../app/hooks';
import {
  selectPostsLoading,
  selectPostsError,
  selectTotalPostsCount
} from '../features/posts/postsSelectors';

export const Header = () => {
  const loading = useAppSelector(selectPostsLoading);
  const error = useAppSelector(selectPostsError);
  const totalCount = useAppSelector(selectTotalPostsCount);

  return (
    <header className="hub-header">
      <div className="hub-brand">
        <h1>SocialFlow Content Hub</h1>
        <p>Redux Toolkit State Normalization &amp; Memoized Selectors (Experiment 2)</p>
      </div>

      <div className="hub-header-actions">
        <div className="entity-count-pill" title="createEntityAdapter Normalized IDs count">
          <span className={`pulse-dot ${loading ? 'loading' : error ? 'error' : ''}`}></span>
          <span>{loading ? 'Fetching...' : `${totalCount} Entities in Store`}</span>
        </div>
      </div>
    </header>
  );
};
