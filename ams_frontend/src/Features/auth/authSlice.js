import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../App/api/axiosInstance";


// Login User
export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue, dispatch }) => {
      try {
        const response = await API.post("/auth/login", credentials);

        if (!response.data?.data?.tokens?.access) {
          return rejectWithValue("Invalid login response");
        }

        const { tokens, user } = response.data.data;
        const { access } = tokens;

        localStorage.setItem('accessToken', access.token);
        dispatch(setCredentials({
          accessToken: access.token,
          user
        }));

        return access.token;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Login failed");
      }
    }
);


// Logout User
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue, dispatch }) => {
      try {
        await API.post("/auth/logout");

        localStorage.removeItem('accessToken');
        dispatch(logOut());

        return true;
      } catch (error) {
        localStorage.removeItem('accessToken');
        dispatch(logOut());
        return rejectWithValue(error.message);
      }
    }
);


//refreshToken
export const refreshToken = createAsyncThunk(
  "auth/refresh-tokens",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.get("/refresh-tokens");
      dispatch(setCredentials(response.data));
      return response.data.accessToken;
    } catch (error) {
      dispatch(logOut());
      return rejectWithValue(error.response?.data || "Failed to refresh token");
    }
  }
);


// Initialize auth state from localStorage
const initializeState = () => {
  const accessToken = localStorage.getItem('accessToken');
  return {
    user: null,
    token: accessToken,
    loading: false,
    error: null
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: initializeState(),
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload;
      });
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
