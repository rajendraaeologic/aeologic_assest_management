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
      return await createBranchService(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Get All Branches
export const getAllBranches = createAsyncThunk(
  "branch/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllBranchesService();

      if (!response.data || response.data.length === 0) {
        return rejectWithValue(response.message);
      }

      return response.data;
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

      if (!response) {
        return rejectWithValue("Failed to update branch.");
      }

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
      return { deletedBranchIds: ids };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete branch(s)"
      );
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
    currentPage: 0,
    rowsPerPage: 5,
  },
  reducers: {
    setSelectedBranch: (state, action) => {
      state.selectedBranch = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
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
        state.branches = action.payload;
      })
      .addCase(getAllBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
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
  toggleSelectBranch,
  selectAllBranches,
  deselectAllBranches,
} = branchSlice.actions;

export default branchSlice.reducer;
