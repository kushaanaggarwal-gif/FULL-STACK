import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  platforms: [
    {
      id: 'twitter',
      name: 'Twitter / X',
      badge: 'X',
      iconName: 'Twitter',
      color: '#0284c7',
      bgLight: '#e0f2fe',
      maxChars: 280,
      enabled: true,
      handle: '@team_socialflow'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      badge: 'in',
      iconName: 'Linkedin',
      color: '#0a66c2',
      bgLight: '#e0e7ff',
      maxChars: 3000,
      enabled: true,
      handle: 'socialflow-company'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      badge: 'IG',
      iconName: 'Instagram',
      color: '#e1306c',
      bgLight: '#fce7f3',
      maxChars: 2200,
      enabled: true,
      handle: '@socialflow.hq'
    },
    {
      id: 'threads',
      name: 'Threads',
      badge: '@',
      iconName: 'AtSign',
      color: '#18181b',
      bgLight: '#f4f4f5',
      maxChars: 500,
      enabled: true,
      handle: '@socialflow.hq'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      badge: 'f',
      iconName: 'Facebook',
      color: '#1877f2',
      bgLight: '#eff6ff',
      maxChars: 63206,
      enabled: true,
      handle: 'SocialFlowOfficial'
    }
  ]
};

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    togglePlatformEnabled: (state, action) => {
      const platform = state.platforms.find(p => p.id === action.payload);
      if (platform) {
        platform.enabled = !platform.enabled;
      }
    }
  }
});

export const { togglePlatformEnabled } = platformsSlice.actions;

export const selectAllPlatforms = (state) => state.platforms.platforms;
export const selectPlatformById = (state, platformId) =>
  state.platforms.platforms.find(p => p.id.toLowerCase() === (platformId || '').toLowerCase());

export default platformsSlice.reducer;
