import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createUserService,
  getAllUsersService,
  updateUserService,
  deleteUserService,
  uploadExcelService,
} from "../services/userService";

// Create User
export const createUser = createAsyncThunk(
  "user/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createUserService(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Get All Users

export const getAllUsers = createAsyncThunk(
  "user/getAll",
  async ({ limit = 5, page = 1, searchTerm = "" }, { rejectWithValue }) => {
    try {
      const response = await getAllUsersService({ limit, page, searchTerm });
     console.log(response);
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// Update User
export const updateUser = createAsyncThunk(
  "user/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await updateUserService(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error updating user");
    }
  }
);

// Delete User (single or bulk)
export const deleteUser = createAsyncThunk(
  "user/delete",
  async (userIds, { rejectWithValue }) => {
    try {
      const ids = Array.isArray(userIds) ? userIds : [userIds];
      const response = await deleteUserService(ids);
      return {
        deletedUserIds: ids,
        ...response,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete user(s)");
    }
  }
);

export const uploadExcel = createAsyncThunk(
  "user/uploadExcel",
  async (file, { rejectWithValue }) => {
    try {
      const response = await uploadExcelService(file);

      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error uploading file");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
    selectedUser: null,
    selectedUsers: [],
    currentPage: 1,
    rowsPerPage: 5,
    totalUsers: 0,
    totalPages: 0,
    searchTerm: "",
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    resetUserTableState: (state) => {
      state.currentPage = 1;
      state.rowsPerPage = 5;
      state.searchTerm = "";
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
      state.currentPage = 1;
    },
    toggleSelectUser: (state, action) => {
      const id = action.payload;
      if (state.selectedUsers.includes(id)) {
        state.selectedUsers = state.selectedUsers.filter(
          (userId) => userId !== id
        );
      } else {
        state.selectedUsers.push(id);
      }
    },
    selectAllUsers: (state) => {
      if (state.users && state.users.length > 0) {
        state.selectedUsers = state.users.map((user) => user.id);
      }
    },
    deselectAllUsers: (state) => {
      state.selectedUsers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        if (Array.isArray(action.payload.createdUsers)) {
          state.users = [...state.users, ...action.payload.createdUsers];
        }
      })
      .addCase(uploadExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Excel upload failed.";
      })

      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.pagination.totalData;
        state.totalPages = action.payload.pagination.totalPages;
        state.currentPage = action.payload.pagination.page;
        state.rowsPerPage = action.payload.pagination.limit;
      })

      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const { deletedUserIds } = action.payload;
        state.users = state.users.filter(
          (user) => !deletedUserIds.includes(user.id)
        );
        state.selectedUsers = state.selectedUsers.filter(
          (id) => !deletedUserIds.includes(id)
        );
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete user(s)";
        state.loading = false;
      });
  },
});

export const {
  setSelectedUser,
  setCurrentPage,
  setRowsPerPage,
  resetUserTableState,
  toggleSelectUser,
  selectAllUsers,
  deselectAllUsers,
  setSearchTerm,
} = userSlice.actions;

export default userSlice.reducer;
