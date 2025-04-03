import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  usersDepartmentData: [],
  selectedUsers: [],

  currentPage: 0,
  rowsPerPage: 5,
};

const userDepartmentSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.usersDepartmentData = action.payload;
    },

    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
    },
    deleteSelectedUsers: (state) => {
      state.usersDepartmentData = state.usersDepartmentData.filter(
        (user) => !state.selectedUsers.includes(user.id)
      );
      state.selectedUsers = [];
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
      state.selectedUsers = state.usersDepartmentData.map((user) => user.id);
    },
    deselectAllUsers: (state) => {
      state.selectedUsers = [];
    },
  },
});

export const {
  setUsers,

  setCurrentPage,
  setRowsPerPage,
  deleteSelectedUsers,
  toggleSelectUser,
  selectAllUsers,
  deselectAllUsers,
} = userDepartmentSlice.actions;

export default userDepartmentSlice.reducer;
