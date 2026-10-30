import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { mockPostsAPI, INITIAL_MOCK_POSTS } from './postsAPI';

// ---------------------------------------------------------------------------
// Module 1: createEntityAdapter for Normalized State Management
// State structure: { ids: [...], entities: { [id]: post } }
// Sort order: Posts sorted by scheduledAt/createdAt descending (newest first)
// ---------------------------------------------------------------------------
export const postsAdapter = createEntityAdapter({
  selectId: (post) => post.id,
  sortComparer: (a, b) => new Date(b.scheduledAt || b.createdAt) - new Date(a.scheduledAt || a.createdAt)
});

// Initial normalized state pre-populated with baseline entities
const emptyState = postsAdapter.getInitialState({
  loading: false,
  error: null,
  lastUpdated: new Date().toISOString(),
  mutationLoading: false
});

const initialState = postsAdapter.setAll(emptyState, INITIAL_MOCK_POSTS);

// ---------------------------------------------------------------------------
// Module 2: Asynchronous Workflow with createAsyncThunk
// Finite State Machine: pending -> fulfilled / rejected
// ---------------------------------------------------------------------------

// 1. Fetch Posts Thunk
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await mockPostsAPI.fetchPosts(700);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch posts');
    }
  }
);

// 2. Add New Post Thunk
export const addPostAsync = createAsyncThunk(
  'posts/addPostAsync',
  async (newPost, { rejectWithValue }) => {
    try {
      const created = await mockPostsAPI.createPost(newPost);
      return created;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create post');
    }
  }
);

// 3. Update Post Thunk
export const updatePostAsync = createAsyncThunk(
  'posts/updatePostAsync',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const updated = await mockPostsAPI.updatePost(id, changes);
      return { id, changes: updated };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update post');
    }
  }
);

// 4. Delete Post Thunk
export const deletePostAsync = createAsyncThunk(
  'posts/deletePostAsync',
  async (id, { rejectWithValue }) => {
    try {
      await mockPostsAPI.deletePost(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete post');
    }
  }
);

// ---------------------------------------------------------------------------
// Posts Slice Definition
// Synchronous CRUD Reducers (using adapter methods) + extraReducers for Async Thunks
// ---------------------------------------------------------------------------
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Adapter CRUD Methods (Synchronous actions)
    postAdded: postsAdapter.addOne,
    postUpdated: postsAdapter.updateOne,
    postRemoved: postsAdapter.removeOne,
    postsCleared: postsAdapter.removeAll,
    postsReset: (state, action) => {
      postsAdapter.setAll(state, action.payload);
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    // Boost engagement helper reducer
    engagementBoosted: (state, action) => {
      const { id, type } = action.payload; // type: 'likes' | 'shares' | 'comments' | 'clicks'
      const existingPost = state.entities[id];
      if (existingPost && existingPost.engagement) {
        existingPost.engagement[type] = (existingPost.engagement[type] || 0) + 1;
      }
    },
    // Toggle post status (draft <-> scheduled <-> published)
    statusChanged: (state, action) => {
      const { id, status } = action.payload;
      postsAdapter.updateOne(state, {
        id,
        changes: { status }
      });
    },
    // Clear error
    clearPostError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // ----------------- fetchPosts lifecycle -----------------
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
        // Populate normalized entities with adapter method
        postsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'An error occurred while fetching posts';
      })

      // ----------------- addPostAsync lifecycle -----------------
      .addCase(addPostAsync.pending, (state) => {
        state.mutationLoading = true;
      })
      .addCase(addPostAsync.fulfilled, (state, action) => {
        state.mutationLoading = false;
        postsAdapter.addOne(state, action.payload);
      })
      .addCase(addPostAsync.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.payload || action.error.message;
      })

      // ----------------- updatePostAsync lifecycle -----------------
      .addCase(updatePostAsync.fulfilled, (state, action) => {
        postsAdapter.updateOne(state, action.payload);
      })

      // ----------------- deletePostAsync lifecycle -----------------
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        postsAdapter.removeOne(state, action.payload);
      });
  }
});

export const {
  postAdded,
  postUpdated,
  postRemoved,
  postsCleared,
  postsReset,
  engagementBoosted,
  statusChanged,
  clearPostError
} = postsSlice.actions;

export default postsSlice.reducer;
