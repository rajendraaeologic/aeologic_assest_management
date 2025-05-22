import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAssignAssetService,
  getAllAssignAssetsService,
  updateAssignAssetService,
  deleteAssignAssetService,
} from "../services/asssignAssetService";

// Create AssignAsset
export const createAssignAsset = createAsyncThunk(
  "assignAsset/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createAssignAssetService(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Get All AssignAssets
export const getAllAssignAssets = createAsyncThunk(
  "assignAsset/getAll",
  async (
    { limit = 5, page = 1, searchTerm = "", status = "IN_USE" } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await getAllAssignAssetsService({
        limit,
        page,
        searchTerm,
        status,
      });
      console.log(response);
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assign assets"
      );
    }
  }
);

// Update AssignAsset
export const updateAssignAsset = createAsyncThunk(
  "assignAsset/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await updateAssignAssetService(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating assign asset"
      );
    }
  }
);

// Delete AssignAsset (single or bulk)
export const deleteAssignAsset = createAsyncThunk(
  "assignAsset/delete",
  async (assignAssetIds, { rejectWithValue }) => {
    try {
      const ids = Array.isArray(assignAssetIds)
        ? assignAssetIds
        : [assignAssetIds];
      const response = await deleteAssignAssetService(ids);
      return {
        deletedAssignAssetIds: ids,
        ...response,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to delete assign asset(s)"
      );
    }
  }
);

const assignAssetSlice = createSlice({
  name: "assignAsset",
  initialState: {
    assignAssets: [],
    loading: false,
    error: null,
    selectedAssignAsset: null,
    selectedAssignAssets: [],
    currentPage: 1,
    rowsPerPage: 5,
    totalAssignAssets: 0,
    totalAssignPages: 0,
    searchTerm: "",
  },
  reducers: {
    setSelectedAssignAsset: (state, action) => {
      state.selectedAssignAsset = action.payload;
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
    toggleSelectAssignAsset: (state, action) => {
      const id = action.payload;
      if (state.selectedAssignAssets.includes(id)) {
        state.selectedAssignAssets = state.selectedAssignAssets.filter(
          (assetId) => assetId !== id
        );
      } else {
        state.selectedAssignAssets.push(id);
      }
    },
    selectAllAssignAssets: (state) => {
      if (state.assignAssets && state.assignAssets.length > 0) {
        state.selectedAssignAssets = state.assignAssets.map(
          (asset) => asset.id
        );
      }
    },
    deselectAllAssignAssets: (state) => {
      state.selectedAssignAssets = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAssignAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assignAssets.unshift(action.payload);
      })
      .addCase(createAssignAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllAssignAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllAssignAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assignAssets = action.payload.assignments;
        state.totalAssignAssets = action.payload.pagination.totalData;
        state.totalAssignPages = action.payload.pagination.totalPages;
        state.currentAssignPage = action.payload.pagination.page;
        state.assignRowsPerPage = action.payload.pagination.limit;
      })

      .addCase(getAllAssignAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAssignAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssignAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assignAssets = state.assignAssets.map((asset) =>
          asset.id === action.payload.id ? action.payload : asset
        );
      })
      .addCase(updateAssignAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAssignAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssignAsset.fulfilled, (state, action) => {
        const { deletedAssignAssetIds } = action.payload;
        state.assignAssets = state.assignAssets.filter(
          (asset) => !deletedAssignAssetIds.includes(asset.id)
        );
        state.selectedAssignAssets = state.selectedAssignAssets.filter(
          (id) => !deletedAssignAssetIds.includes(id)
        );
        state.loading = false;
      })
      .addCase(deleteAssignAsset.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete assign asset(s)";
        state.loading = false;
      });
  },
});

export const {
  setSelectedAssignAsset,
  setCurrentPage,
  setRowsPerPage,
  toggleSelectAssignAsset,
  selectAllAssignAssets,
  deselectAllAssignAssets,
  setSearchTerm,
} = assignAssetSlice.actions;

export default assignAssetSlice.reducer;
