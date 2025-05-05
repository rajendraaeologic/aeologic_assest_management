import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  deliveryUsers: [],
  currentPage: 0,
  rowsPerPage: 5,
};

const outForDeliveryUserSlice = createSlice({
  name: "dliveryUser",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.deliveryUsers = action.payload;
    },

    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
    },
  },
});

export const {
  setUsers,

  setCurrentPage,
  setRowsPerPage,
} = outForDeliveryUserSlice.actions;

export default outForDeliveryUserSlice.reducer;
