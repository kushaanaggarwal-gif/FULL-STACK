# Experiment 2: Redux-Based Content State Management
## Social Media Management Dashboard

A production-grade, minimalistic Social Media Management Dashboard built with **React**, **Redux Toolkit (RTK)**, **React-Redux**, and **Reselect** demonstrating enterprise state normalization, finite state machine async workflows, derived memoized selectors, and `React.memo` rendering performance optimizations.

---

## 🏗️ Architecture & Modules Overview

### 📦 Module 1: Redux Store Setup & State Normalization (`createEntityAdapter`)
- **Normalized Posts State**:
  - Implemented using `createEntityAdapter` to format posts as `{ ids: string[], entities: Record<string, Post> }`.
  - Configured with `selectId` and `sortComparer` (sorts posts by scheduled/created timestamp descending).
  - Eliminates $O(N)$ full-array scans with surgical $O(1)$ hash map lookups.
- **CRUD Reducers**:
  - `postAdded`: `postsAdapter.addOne`
  - `postUpdated`: `postsAdapter.updateOne`
  - `postRemoved`: `postsAdapter.removeOne`
  - `postsReset`: `postsAdapter.setAll`
- **Separate Platforms Slice**:
  - Manages social media platform entities (Twitter/X, LinkedIn, Instagram, Threads, Facebook) with character limits, color schemes, and handles.
- **Strict UI State Separation**:
  - UI state (`activePlatformFilter`, `showShortPostsOnly`, `statusFilter`, `searchQuery`, `viewMode`, `editingPostId`, `errorSimulationActive`) is strictly separated in `uiSlice` to prevent polluting entity data.

---

### ⚡ Module 2: Asynchronous Workflow (`createAsyncThunk`)
- **`fetchPosts`**: Simulates fetching post data from `/mock-api/posts` with realistic latency and error simulation.
- **Finite State Machine Handling** in `extraReducers`:
  - `fetchPosts.pending`: Sets `loading = true`, resets error state.
  - `fetchPosts.fulfilled`: Uses `postsAdapter.setAll(state, action.payload)` to populate normalized state and sets `loading = false`.
  - `fetchPosts.rejected`: Captures error payload and sets `loading = false`.
- **Additional Async Thunks**: `addPostAsync`, `updatePostAsync`, `deletePostAsync`.

---

### 🧠 Module 3: Derived State & Memoized Selectors (`createSelector`)
- **Adapter Selectors**:
  - `selectAllPosts`, `selectPostById`, `selectPostIds`, `selectPostEntities`, `selectTotalPostsCount`.
- **Derived Memoized Selectors**:
  - `selectShortPosts`: Filters posts where `content.length < 100` characters.
  - `selectPostsByPlatform`: Filters posts based on a selected platform ID.
  - `selectAnalytics`: Computes aggregate statistics dynamically:
    - Total posts count
    - Total engagement (likes, comments, shares, clicks)
    - Average engagement per post
    - Platform distribution & engagement share percentages
    - Status breakdown (Draft, Scheduled, Published)
    - Content length statistics
  - `selectFilteredPosts`: Composite memoized selector joining platform filter, short-post toggle, status filter, and real-time search query.

---

### 🎯 Module 4: UI Components & Performance Optimization
- **`PostItem` Component**:
  - Wrapped in `React.memo` to prevent redundant re-renders when other items change.
  - **Visual Render Counter Verification Badge**: Displays `Render #X` and logs `[PostItem Memo Render #X]` to console.
  - Interactive engagement boosters (+1 Likes, Comments, Shares, Clicks) that verify only the clicked post item re-renders while all other items remain untouched.
- **`PostList` & `PostCalendarView`**:
  - Toggle between responsive list view and chronological timeline view.
- **`AnalyticsDashboard`**:
  - Consumes `selectAnalytics` to present real-time KPIs and progress bars.
- **`PerformanceExplainer`**:
  - Interactive sliding drawer showing the live normalized store `{ ids, entities }` and explaining architectural guarantees.

---

## 🚀 Running the Project

### Install dependencies
```bash
npm install
```

### Start development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

---

## 📂 Project Structure

```
experiment 2/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── src/
│   ├── app/
│   │   ├── store.js             # Root Redux store configuration
│   │   └── hooks.js             # Typed / wrapper Redux hooks
│   ├── features/
│   │   ├── posts/
│   │   │   ├── postsSlice.js     # Normalized slice (createEntityAdapter & createAsyncThunk)
│   │   │   ├── postsSelectors.js # Memoized selectors (createSelector)
│   │   │   └── postsAPI.js       # Mock API service with network simulation
│   │   ├── platforms/
│   │   │   └── platformsSlice.js # Platforms slice
│   │   └── ui/
│   │       └── uiSlice.js        # Strict UI state isolation
│   ├── components/
│   │   ├── Header.jsx            # Top navbar & sync controls
│   │   ├── AnalyticsDashboard.jsx# Dynamic KPI metrics & platform distribution
│   │   ├── FilterBar.jsx         # Platform tabs, search, short posts toggle
│   │   ├── PostForm.jsx          # Create/schedule post form
│   │   ├── PostList.jsx          # Normalized feed container
│   │   ├── PostItem.jsx          # React.memo item with Visual Render Counter
│   │   ├── PostCalendarView.jsx  # Chronological timeline view
│   │   ├── EditPostModal.jsx     # Edit post via postsAdapter.updateOne
│   │   ├── PerformanceExplainer.jsx # Live normalized store inspector
│   │   └── Toast.jsx             # Toast notification system
│   ├── styles/
│   │   └── index.css             # Minimalist design system
│   ├── App.jsx                   # Main layout container
│   └── main.jsx                  # Entry point with Provider
```
