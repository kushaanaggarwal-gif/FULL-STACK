import { createSelector } from '@reduxjs/toolkit';
import { postsAdapter } from './postsSlice';

// ---------------------------------------------------------------------------
// Module 3: Derived State & Memoized Selectors (createSelector)
// ---------------------------------------------------------------------------

// 1. Adapter Selectors (Normalized getters)
// Note: postsAdapter.getSelectors requires passing the slice sub-state
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
  selectEntities: selectPostEntities,
  selectTotal: selectTotalPostsCount
} = postsAdapter.getSelectors((state) => state.posts);

// Base Slice State Selectors
export const selectPostsLoading = (state) => state.posts.loading;
export const selectPostsError = (state) => state.posts.error;
export const selectPostsMutationLoading = (state) => state.posts.mutationLoading;
export const selectPostsLastUpdated = (state) => state.posts.lastUpdated;

// 2. Memoized Selector: selectShortPosts (< 100 characters)
// Demonstrates filtering derived state with zero recomputation unless allPosts changes
export const selectShortPosts = createSelector(
  [selectAllPosts],
  (posts) => {
    return posts.filter((post) => (post.content || '').length < 100);
  }
);

// 3. Memoized Selector Factory / Parameterized: selectPostsByPlatform
// Filters posts based on a specific platformId
export const selectPostsByPlatform = createSelector(
  [selectAllPosts, (_, platformId) => platformId],
  (posts, platformId) => {
    if (!platformId || platformId === 'all') return posts;
    return posts.filter((post) => post.platformId.toLowerCase() === platformId.toLowerCase());
  }
);

// 4. Memoized Selector: selectAnalytics
// Computes aggregate metrics dynamically: total posts, total engagement, platform distribution, status breakdown
export const selectAnalytics = createSelector(
  [selectAllPosts],
  (posts) => {
    const totalPosts = posts.length;

    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalClicks = 0;

    const platformBreakdown = {};
    const statusBreakdown = {
      draft: 0,
      scheduled: 0,
      published: 0
    };

    let totalCharacterCount = 0;
    let shortPostsCount = 0;

    posts.forEach((post) => {
      // Engagement
      const eng = post.engagement || {};
      const likes = eng.likes || 0;
      const comments = eng.comments || 0;
      const shares = eng.shares || 0;
      const clicks = eng.clicks || 0;

      totalLikes += likes;
      totalComments += comments;
      totalShares += shares;
      totalClicks += clicks;

      // Platform distribution
      const pId = post.platformId || 'unassigned';
      if (!platformBreakdown[pId]) {
        platformBreakdown[pId] = {
          count: 0,
          totalEngagement: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          clicks: 0
        };
      }
      platformBreakdown[pId].count += 1;
      platformBreakdown[pId].likes += likes;
      platformBreakdown[pId].comments += comments;
      platformBreakdown[pId].shares += shares;
      platformBreakdown[pId].clicks += clicks;
      platformBreakdown[pId].totalEngagement += (likes + comments + shares + clicks);

      // Status distribution
      const status = post.status || 'draft';
      if (statusBreakdown[status] !== undefined) {
        statusBreakdown[status] += 1;
      }

      // Content length statistics
      const len = (post.content || '').length;
      totalCharacterCount += len;
      if (len < 100) {
        shortPostsCount += 1;
      }
    });

    const totalEngagement = totalLikes + totalComments + totalShares + totalClicks;
    const averageLength = totalPosts > 0 ? Math.round(totalCharacterCount / totalPosts) : 0;
    const avgEngagementPerPost = totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0;

    return {
      totalPosts,
      totalEngagement,
      totalLikes,
      totalComments,
      totalShares,
      totalClicks,
      avgEngagementPerPost,
      averageLength,
      shortPostsCount,
      platformBreakdown,
      statusBreakdown
    };
  }
);

// 5. Composite Memoized Selector: selectFilteredPosts
// Combines active filters from UI state (platform, short posts toggle, search query)
export const selectFilteredPosts = createSelector(
  [
    selectAllPosts,
    (state) => state.ui.activePlatformFilter,
    (state) => state.ui.showShortPostsOnly,
    (state) => state.ui.searchQuery,
    (state) => state.ui.statusFilter
  ],
  (posts, activePlatform, showShortOnly, searchQuery, statusFilter) => {
    let result = posts;

    // Filter by platform
    if (activePlatform && activePlatform !== 'all') {
      result = result.filter((p) => p.platformId.toLowerCase() === activePlatform.toLowerCase());
    }

    // Filter by short posts (<100 chars)
    if (showShortOnly) {
      result = result.filter((p) => (p.content || '').length < 100);
    }

    // Filter by status (all, draft, scheduled, published)
    if (statusFilter && statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const matchesContent = (p.content || '').toLowerCase().includes(q);
        const matchesTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchesPlatform = (p.platformId || '').toLowerCase().includes(q);
        return matchesContent || matchesTags || matchesPlatform;
      });
    }

    return result;
  }
);
