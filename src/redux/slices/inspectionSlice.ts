import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Inspection } from '@/types/inspection';

interface InspectionState {
  selectedInspection: Inspection | null;
}

const initialState: InspectionState = {
  selectedInspection: null,
};

const inspectionSlice = createSlice({
  name: 'inspection',
  initialState,
  reducers: {
    setSelectedInspection: (state, action: PayloadAction<Inspection | null>) => {
      state.selectedInspection = action.payload;
    },
  },
});

export const { setSelectedInspection } = inspectionSlice.actions;
export default inspectionSlice.reducer;
