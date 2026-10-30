import React, { useEffect } from 'react';
import { useAppDispatch } from './app/hooks';
import { fetchPosts } from './features/posts/postsSlice';
import { Header } from './components/Header';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PostForm } from './components/PostForm';
import { PostList } from './components/PostList';
import { EditPostModal } from './components/EditPostModal';
import { Toast } from './components/Toast';

export function App() {
  const dispatch = useAppDispatch();

  // Fetch initial normalized data from mock API on startup (Module 2 createAsyncThunk)
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div className="hub-container">
      {/* 1. Header with Store Entity Status & Sync Actions */}
      <Header />

      {/* 2. Top Analytics & Memoization Ribbon (Module 3 createSelector) */}
      <AnalyticsDashboard />

      {/* 3. Post Composer & Draft Manager (Module 1 postsAdapter.addOne) */}
      <PostForm />

      {/* 4. Multi-Stream Content & Drafts Board (Module 4 React.memo & Filters) */}
      <PostList />

      {/* Modals & Notifications */}
      <EditPostModal />
      <Toast />
    </div>
  );
}

export default App;
