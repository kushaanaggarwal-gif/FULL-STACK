import React from 'react';
import { useAppSelector } from '../app/hooks';
import { selectAnalytics } from '../features/posts/postsSelectors';

export const AnalyticsDashboard = () => {
  // Consumes memoized selector created with createSelector (Module 3)
  const analytics = useAppSelector(selectAnalytics);

  const {
    totalPosts,
    shortPostsCount,
    totalEngagement,
    statusBreakdown
  } = analytics;

  return (
    <div className="analytics-ribbon">
      <div className="ribbon-stats-group">
        <div className="ribbon-stat-item">
          <span className="ribbon-stat-num">{totalPosts}</span>
          <span className="ribbon-stat-lbl">Total Posts</span>
        </div>

        <div className="ribbon-stat-item">
          <span className="ribbon-stat-num">{shortPostsCount}</span>
          <span className="ribbon-stat-lbl">Short Posts (&lt;100ch)</span>
        </div>

        <div className="ribbon-stat-item">
          <span className="ribbon-stat-num">{statusBreakdown.published || 0}</span>
          <span className="ribbon-stat-lbl">Published</span>
        </div>

        <div className="ribbon-stat-item">
          <span className="ribbon-stat-num">{statusBreakdown.draft || 0}</span>
          <span className="ribbon-stat-lbl">Drafts</span>
        </div>

        <div className="ribbon-stat-item">
          <span className="ribbon-stat-num">{totalEngagement}</span>
          <span className="ribbon-stat-lbl">Total Engagement</span>
        </div>
      </div>
    </div>
  );
};
