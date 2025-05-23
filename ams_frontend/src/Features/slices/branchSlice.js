import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createBranchService,
  getAllBranchesService,
  updateBranchService,
  deleteBranchService,
} from "../services/branchService";

// Create Branch
export const createBranch = createAsyncThunk(
  "branch/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createBranchService(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Get All Branches
export const getAllBranches = createAsyncThunk(
  "branch/getAll",
  async ({ limit = 5, page = 1, searchTerm = "" }, { rejectWithValue }) => {
    try {
      const response = await getAllBranchesService({
        limit,
        page,
        searchTerm,
      });
      console.log(response);
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch branches"
      );
    }
  }
);

// Update Branch
export const updateBranch = createAsyncThunk(
  "branch/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await updateBranchService(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error updating branch");
    }
  }
);

// Delete Branch (single or bulk)
export const deleteBranch = createAsyncThunk(
  "branch/delete",
  async (branchIds, { rejectWithValue }) => {
    try {
      const ids = Array.isArray(branchIds) ? branchIds : [branchIds];
      const response = await deleteBranchService(ids);
      return {
        deletedBranchIds: ids,
        ...response,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete branch(s)");
    }
  }
);

const branchSlice = createSlice({
  name: "branch",
  initialState: {
    branches: [],
    loading: false,
    error: null,
    selectedBranch: null,
    selectedBranches: [],
    currentPage: 1,
    rowsPerPage: 5,
    totalBranches: 0,
    totalPages: 0,
    searchTerm: "",
  },
  reducers: {
    setSelectedBranch: (state, action) => {
      state.selectedBranch = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },

    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
      state.currentPage = 1;
    },
    resetBranchTableState: (state) => {
      state.currentPage = 1;
      state.rowsPerPage = 5;
      state.searchTerm = "";
    },
    toggleSelectBranch: (state, action) => {
      const id = action.payload;
      if (state.selectedBranches.includes(id)) {
        state.selectedBranches = state.selectedBranches.filter(
          (branchId) => branchId !== id
        );
      } else {
        state.selectedBranches.push(id);
      }
    },
    selectAllBranches: (state) => {
      if (state.branches && state.branches.length > 0) {
        state.selectedBranches = state.branches.map((branch) => branch.id);
      }
    },
    deselectAllBranches: (state) => {
      state.selectedBranches = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.unshift(action.payload);
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.branches;
        state.totalBranches = action.payload.pagination.totalData;
        state.totalPages = action.payload.pagination.totalPages;
        state.currentPage = action.payload.pagination.page;
        state.rowsPerPage = action.payload.pagination.limit;
      })

      .addCase(getAllBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.map((branch) =>
          branch.id === action.payload.id ? action.payload : branch
        );
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        const { deletedBranchIds } = action.payload;
        state.branches = state.branches.filter(
          (branch) => !deletedBranchIds.includes(branch.id)
        );
        state.selectedBranches = state.selectedBranches.filter(
          (id) => !deletedBranchIds.includes(id)
        );
        state.loading = false;
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete branch(s)";
        state.loading = false;
      });
  },
});

export const {
  setSelectedBranch,
  setCurrentPage,
  setRowsPerPage,
  resetBranchTableState,
  toggleSelectBranch,
  selectAllBranches,
  deselectAllBranches,
  setSearchTerm,
} = branchSlice.actions;

export default branchSlice.reducer;
