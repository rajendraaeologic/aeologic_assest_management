import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
export const createRegistrationUser = createAsyncThunk(
  "createRegistrationUser",
  async (data, { rejectWithValue }) => {
    const response = await fetch("http://localhost:8010/api/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    try {
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getAllUser = createAsyncThunk(
  "getAllUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:8010/api/getall");

      if (response.status === 404) {
        return rejectWithValue("No user data found.");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "updateUser",
  async (data, { rejectWithValue }) => {
    console.log(data);
    const response = await fetch(
      `http://localhost:8010/api/update/${data._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    try {
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Bulk delete users
export const deleteUsersFromDB = createAsyncThunk(
  "users/deleteUsersFromDB",
  async (selectedUserIds, { rejectWithValue }) => {
    try {
      const userIds = Array.isArray(selectedUserIds.payload)
        ? selectedUserIds.payload
        : selectedUserIds;

      console.log("Payload to API (userIds):", userIds);

      const response = await axios.post(
        "http://localhost:8010/api/delete-bulk",
        { userIds }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error during API call:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data || "Failed to delete users.");
    }
  }
);

const userRegistration = createSlice({
  name: "userRegistration",
  initialState: {
    users: [],
    loading: false,
    error: null,
    selectedUser: null,
    selectedUsers: [],
    currentPage: 0,
    rowsPerPage: 5,
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
    },
    toggleSelectUser: (state, action) => {
      const _id = action.payload;
      if (state.selectedUsers.includes(_id)) {
        state.selectedUsers = state.selectedUsers.filter(
          (userId) => userId !== _id
        );
      } else {
        state.selectedUsers.push(_id);
      }
    },
    selectAllUsers: (state) => {
      state.selectedUsers = state.users.map((user) => user._id);
    },
    deselectAllUsers: (state) => {
      state.selectedUsers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRegistrationUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRegistrationUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createRegistrationUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(getAllUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(getAllUser.fulfilled, (state, action) => {
        state.loading = false;

        state.users = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((userData) =>
          userData._id === action.payload._id ? action.payload : userData
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUsersFromDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUsersFromDB.fulfilled, (state, action) => {
        const deletedUserIds = action.payload.deletedUserIds;

        if (!Array.isArray(deletedUserIds)) {
          console.error(
            "Error: deletedUserIds is not an array",
            deletedUserIds
          );
          return;
        }

        state.users = state.users.filter(
          (user) => !deletedUserIds.includes(user._id)
        );
        state.selectedUsers = [];
        state.loading = false;
      })
      .addCase(deleteUsersFromDB.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete users.";
        state.loading = false;
      });
  },
});

export const {
  setCurrentPage,
  setRowsPerPage,
  deleteSelectedUsers,
  toggleSelectUser,
  setSelectedUser,
  selectAllUsers,
  deselectAllUsers,
} = userRegistration.actions;

export default userRegistration.reducer;
