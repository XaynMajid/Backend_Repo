import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  residentialAddress: string;
  token: string;
}

const initialState: UserData = {
  fullName: '',
  email: '',
  password: '',
  phoneNumber: '',
  residentialAddress: '',
  token: '',
};

const userDataSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData>) => {
      return { ...action.payload };
    },
    clearUserData: () => initialState,
  },
});

export const { setUserData, clearUserData } = userDataSlice.actions;
export default userDataSlice.reducer;
