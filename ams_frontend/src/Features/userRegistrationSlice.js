import { createSlice } from "@reduxjs/toolkit";
import {createRegistrationUser, deleteUsersFromDB, getAllUser, updateUser} from "./services/userService.js";


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
        state.selectedUsers = state.selectedUsers.filter((userId) => userId !== _id);
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
        // Create User
        .addCase(createRegistrationUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(createRegistrationUser.fulfilled, (state, action) => {
          state.loading = false;
          state.users.push(action.payload);
        })
        .addCase(createRegistrationUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Error creating user";
        })

        // Get All Users
        .addCase(getAllUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getAllUser.fulfilled, (state, action) => {
          state.loading = false;
          state.users = Array.isArray(action.payload.data) ? action.payload.data : [];
        })
        .addCase(getAllUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Error fetching users";
        })

        // Update User
        .addCase(updateUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateUser.fulfilled, (state, action) => {
          state.loading = false;
          state.users = state.users.map((user) =>
              user._id === action.payload._id ? action.payload : user
          );
        })
        .addCase(updateUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Error updating user";
        })

        // Delete Users
        .addCase(deleteUsersFromDB.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteUsersFromDB.fulfilled, (state, action) => {
          const deletedUserIds = action.payload.deletedUserIds;

          if (Array.isArray(deletedUserIds)) {
            state.users = state.users.filter((user) => !deletedUserIds.includes(user._id));
            state.selectedUsers = [];
          } else {
            console.error("Error: deletedUserIds is not an array", deletedUserIds);
          }

          state.loading = false;
        })
        .addCase(deleteUsersFromDB.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Failed to delete users";
        });
  },
});

export const {
  setCurrentPage,
  setRowsPerPage,
  toggleSelectUser,
  setSelectedUser,
  selectAllUsers,
  deselectAllUsers,
} = userRegistration.actions;

export default userRegistration.reducer;
