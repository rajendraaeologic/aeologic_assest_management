import { createSlice } from "@reduxjs/toolkit";

const dateWishReportSlice = createSlice({
  name: "dateWishReportUser",
  initialState: {
    DateWishReportUsers: [],
    selectedUsers: [],
    currentPage: 0,
    rowsPerPage: 5,
  },
  reducers: {
    setUsers(state, action) {
      state.DateWishReportUsers = action.payload;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    setRowsPerPage(state, action) {
      state.rowsPerPage = action.payload;
    },
  },
});

export const { setUsers, setCurrentPage, setRowsPerPage } =
  dateWishReportSlice.actions;
export default dateWishReportSlice.reducer;
