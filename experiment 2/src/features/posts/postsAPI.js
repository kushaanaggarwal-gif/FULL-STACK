// Mock API Service simulating backend /mock-api/posts endpoints
// Provides network latency, in-memory persistence, and failure simulation

export const INITIAL_MOCK_POSTS = [
  {
    id: 'post-1',
    content: '🚀 Excited to launch our new AI-powered analytics engine today! Check it out.',
    platformId: 'twitter',
    status: 'published',
    scheduledAt: '2026-08-12T09:00:00.000Z',
    createdAt: '2026-08-12T08:30:00.000Z',
    tags: ['ai', 'launch', 'tech'],
    engagement: { likes: 142, comments: 18, shares: 35, clicks: 210 }
  },
  {
    id: 'post-2',
    content: 'Data normalization in Redux Toolkit completely transforms frontend performance. By storing state as { ids: [], entities: {} }, lookups become O(1) and updates are surgical. Here is a comprehensive breakdown of createEntityAdapter in enterprise systems.',
    platformId: 'linkedin',
    status: 'published',
    scheduledAt: '2026-08-12T10:15:00.000Z',
    createdAt: '2026-08-12T09:45:00.000Z',
    tags: ['redux', 'webdev', 'frontend', 'architecture'],
    engagement: { likes: 389, comments: 54, shares: 82, clicks: 512 }
  },
  {
    id: 'post-3',
    content: 'Behind the scenes at our design studio! ✨ Working on our next UI refresh. Drop a 🎨 if you love dark mode aesthetics.',
    platformId: 'instagram',
    status: 'scheduled',
    scheduledAt: '2026-08-13T14:00:00.000Z',
    createdAt: '2026-08-12T11:00:00.000Z',
    tags: ['design', 'ui', 'behindthescenes'],
    engagement: { likes: 620, comments: 45, shares: 19, clicks: 140 }
  },
  {
    id: 'post-4',
    content: 'Quick tip: Always memoize derived state selectors with createSelector to avoid unnecessary recomputations!',
    platformId: 'twitter',
    status: 'scheduled',
    scheduledAt: '2026-08-14T16:30:00.000Z',
    createdAt: '2026-08-12T11:30:00.000Z',
    tags: ['react', 'tips'],
    engagement: { likes: 95, comments: 12, shares: 24, clicks: 88 }
  },
  {
    id: 'post-5',
    content: 'Join our weekly engineering AMA this Thursday at 4 PM EST. We will be answering all questions regarding state management, caching, and SSR.',
    platformId: 'linkedin',
    status: 'scheduled',
    scheduledAt: '2026-08-15T20:00:00.000Z',
    createdAt: '2026-08-12T12:00:00.000Z',
    tags: ['engineering', 'ama', 'community'],
    engagement: { likes: 215, comments: 38, shares: 41, clicks: 330 }
  },
  {
    id: 'post-6',
    content: 'Good morning builders! What is on your sprint board today?',
    platformId: 'threads',
    status: 'draft',
    scheduledAt: '2026-08-16T08:00:00.000Z',
    createdAt: '2026-08-12T12:15:00.000Z',
    tags: ['builders', 'morning'],
    engagement: { likes: 48, comments: 9, shares: 5, clicks: 32 }
  }
];

let inMemoryStore = JSON.parse(JSON.stringify(INITIAL_MOCK_POSTS));
let shouldSimulateError = false;

export const mockPostsAPI = {
  // Toggle error simulation for testing rejection lifecycle
  setErrorSimulation(enable) {
    shouldSimulateError = Boolean(enable);
  },

  getErrorSimulation() {
    return shouldSimulateError;
  },

  // Reset database back to default initial mock posts
  resetData() {
    inMemoryStore = JSON.parse(JSON.stringify(INITIAL_MOCK_POSTS));
    return inMemoryStore;
  },

  // GET /mock-api/posts
  fetchPosts(delayMs = 600) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldSimulateError) {
          reject(new Error('500 Internal Server Error: Failed to fetch posts from mock service.'));
        } else {
          resolve([...inMemoryStore]);
        }
      }, delayMs);
    });
  },

  // POST /mock-api/posts
  createPost(newPostData, delayMs = 400) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldSimulateError) {
          reject(new Error('Failed to create post. Mock API simulation error.'));
          return;
        }
        const post = {
          id: `post-${Date.now()}`,
          createdAt: new Date().toISOString(),
          engagement: { likes: 0, comments: 0, shares: 0, clicks: 0 },
          ...newPostData
        };
        inMemoryStore.unshift(post);
        resolve(post);
      }, delayMs);
    });
  },

  // PUT /mock-api/posts/:id
  updatePost(id, updates, delayMs = 350) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldSimulateError) {
          reject(new Error(`Failed to update post with ID ${id}.`));
          return;
        }
        const index = inMemoryStore.findIndex(p => p.id === id);
        if (index === -1) {
          reject(new Error(`Post ${id} not found.`));
          return;
        }
        inMemoryStore[index] = { ...inMemoryStore[index], ...updates };
        resolve(inMemoryStore[index]);
      }, delayMs);
    });
  },

  // DELETE /mock-api/posts/:id
  deletePost(id, delayMs = 300) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldSimulateError) {
          reject(new Error(`Failed to delete post with ID ${id}.`));
          return;
        }
        inMemoryStore = inMemoryStore.filter(p => p.id !== id);
        resolve({ success: true, id });
      }, delayMs);
    });
  }
};
