import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MechanicData {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  cnic: string;
  experience: string;
  hourlyRate: string;
  availability: string;
  vehicleTypes: string[];
  serviceRadius: string;
  serviceAreas: string;
  isLive: boolean;
  rating?: number;
  token?: string;
}

const initialState: MechanicData = {
  _id: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  address: '',
  cnic: '',
  experience: '',
  hourlyRate: '',
  availability: 'full-time',
  vehicleTypes: [],
  serviceRadius: '',
  serviceAreas: '',
  isLive: false,
  rating: 0,
  token: ''
};

const mechanicDataSlice = createSlice({
  name: 'mechanicData',
  initialState,
  reducers: {
    setMechanicData: (state, action: PayloadAction<MechanicData>) => {
      return { ...action.payload };
    },
    clearMechanicData: () => initialState,
  },
});

export const { setMechanicData, clearMechanicData } = mechanicDataSlice.actions;
export default mechanicDataSlice.reducer;
