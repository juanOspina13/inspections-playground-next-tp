import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '@/types/auth';

interface UserState {
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  rolePermissions: string | null;
}

const initialState: UserState = {
  isLoggedIn: true, // Set to true for demo purposes
  userProfile: null,
  rolePermissions: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logIn: (state, action: PayloadAction<UserProfile>) => {
      state.isLoggedIn = true;
      state.userProfile = action.payload;
    },
    logOut: (state) => {
      state.isLoggedIn = false;
      state.userProfile = null;
      state.rolePermissions = null;
    },
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.userProfile = action.payload;
    },
    setRolePermissions: (state, action: PayloadAction<string>) => {
      state.rolePermissions = action.payload;
    },
  },
});

export const { logIn, logOut, setUserProfile, setRolePermissions } = userSlice.actions;
export default userSlice.reducer;
