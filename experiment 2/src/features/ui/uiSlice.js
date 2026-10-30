import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activePlatformFilter: 'all',
  showShortPostsOnly: false,
  statusFilter: 'all',
  searchQuery: '',
  viewMode: 'list', // 'list' | 'calendar'
  editingPostId: null,
  isCreateModalOpen: false,
  errorSimulationActive: false,
  performanceInspectorOpen: false,
  notification: null // { id, message, type: 'success' | 'error' | 'info' }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActivePlatformFilter: (state, action) => {
      state.activePlatformFilter = action.payload;
    },
    setShowShortPostsOnly: (state, action) => {
      state.showShortPostsOnly = action.payload;
    },
    toggleShowShortPostsOnly: (state) => {
      state.showShortPostsOnly = !state.showShortPostsOnly;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setEditingPostId: (state, action) => {
      state.editingPostId = action.payload;
    },
    setIsCreateModalOpen: (state, action) => {
      state.isCreateModalOpen = action.payload;
    },
    toggleErrorSimulation: (state) => {
      state.errorSimulationActive = !state.errorSimulationActive;
    },
    togglePerformanceInspector: (state) => {
      state.performanceInspectorOpen = !state.performanceInspectorOpen;
    },
    showNotification: (state, action) => {
      state.notification = {
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'info'
      };
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    resetFilters: (state) => {
      state.activePlatformFilter = 'all';
      state.showShortPostsOnly = false;
      state.statusFilter = 'all';
      state.searchQuery = '';
    }
  }
});

export const {
  setActivePlatformFilter,
  setShowShortPostsOnly,
  toggleShowShortPostsOnly,
  setStatusFilter,
  setSearchQuery,
  setViewMode,
  setEditingPostId,
  setIsCreateModalOpen,
  toggleErrorSimulation,
  togglePerformanceInspector,
  showNotification,
  clearNotification,
  resetFilters
} = uiSlice.actions;

// UI Selectors
export const selectActivePlatformFilter = (state) => state.ui.activePlatformFilter;
export const selectShowShortPostsOnly = (state) => state.ui.showShortPostsOnly;
export const selectStatusFilter = (state) => state.ui.statusFilter;
export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectViewMode = (state) => state.ui.viewMode;
export const selectEditingPostId = (state) => state.ui.editingPostId;
export const selectIsCreateModalOpen = (state) => state.ui.isCreateModalOpen;
export const selectErrorSimulationActive = (state) => state.ui.errorSimulationActive;
export const selectPerformanceInspectorOpen = (state) => state.ui.performanceInspectorOpen;
export const selectNotification = (state) => state.ui.notification;

export default uiSlice.reducer;
