import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../App/api/axiosInstance";

//loginUser

export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue, dispatch }) => {
      try {
        const response = await API.post("/auth/login", credentials);
        console.log("Login API Response:", response);

        if (
            !response.data.data ||
            !response.data.data.tokens ||
            !response.data.data.tokens.access ||
            !response.data.data.tokens.refresh
        ) {
          return rejectWithValue("Invalid login response");
        }

        const { tokens, user } = response.data.data;

      dispatch(
        setCredentials({
          accessToken: tokens.access.token,
          refreshToken: tokens.refresh.token,
          user,
        })
      );

      return tokens.access.token;
    } catch (error) {
      console.error("Login Thunk Error:", error);
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);
//logoutUser
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (persistor, { rejectWithValue, dispatch, getState }) => {
    try {
      const { refreshToken } = getState().auth;

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      await API.post("/auth/logout", {
        refreshToken: refreshToken,
      });

      dispatch(logOut());

      await persistor.purge();

      delete API.defaults.headers.common["Authorization"];

      return true;
    } catch (error) {
      console.error("Logout error:", error);

      dispatch(logOut());
      await persistor.purge();
      delete API.defaults.headers.common["Authorization"];

      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
//refreshToken
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.get("/refresh");
      dispatch(setCredentials(response.data));
      return response.data.accessToken;
    } catch (error) {
      dispatch(logOut());
      return rejectWithValue(error.response?.data || "Failed to refresh token");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      console.log("user", state.user);
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    },
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
