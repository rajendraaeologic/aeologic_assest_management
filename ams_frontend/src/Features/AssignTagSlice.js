import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  usersAssignTagData: [],
  selectedUsers: [],

  currentPage: 0,
  rowsPerPage: 5,
};

const userAssignTagSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.usersAssignTagData = action.payload;
    },

    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
    },
    deleteSelectedUsers: (state) => {
      state.usersAssignTagData = state.usersAssignTagData.filter(
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
      state.selectedUsers = state.usersAssignTagData.map((user) => user.id);
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
} = userAssignTagSlice.actions;

export default userAssignTagSlice.reducer;
