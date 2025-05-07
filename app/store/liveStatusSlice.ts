import { createSlice } from '@reduxjs/toolkit';

const liveStatusSlice = createSlice({
  name: 'liveStatus',
  initialState: {
    isLive: false,
  },
  reducers: {
    setLiveStatus: (state, action) => {
      state.isLive = action.payload;
    },
    toggleLiveStatus: (state) => {
      state.isLive = !state.isLive;
    },
  },
});

export const { setLiveStatus, toggleLiveStatus } = liveStatusSlice.actions;
export default liveStatusSlice.reducer;