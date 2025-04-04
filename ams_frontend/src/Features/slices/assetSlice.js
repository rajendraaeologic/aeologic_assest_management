
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAssetService,
  getAllAssetsService,
  updateAssetService,
  deleteAssetService,
} from "../services/assetService";

// Create Asset
export const createAsset = createAsyncThunk(
  "asset/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createAssetService(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Get All Assets
export const getAllAssets = createAsyncThunk(
  "asset/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllAssetsService();

      if (!response.data || response.data.length === 0) {
        return rejectWithValue(response.message);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assets"
      );
    }
  }
);

// Update Asset
export const updateAsset = createAsyncThunk(
  "asset/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await updateAssetService(data);

      if (!response) {
        return rejectWithValue("Failed to update asset.");
      }

      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error updating asset");
    }
  }
);

// Delete Asset (single or bulk)
export const deleteAsset = createAsyncThunk(
  "asset/delete",
  async (assetIds, { rejectWithValue }) => {
    try {
      const ids = Array.isArray(assetIds) ? assetIds : [assetIds];
      const response = await deleteAssetService(ids);
      return { deletedAssetIds: ids };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete asset(s)"
      );
    }
  }
);

const assetSlice = createSlice({
  name: "asset",
  initialState: {
    assets: [],
    loading: false,
    error: null,
    selectedAsset: null,
    selectedAssets: [],
    currentPage: 0,
    rowsPerPage: 5,
  },
  reducers: {
    setSelectedAsset: (state, action) => {
      state.selectedAsset = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
    },
    toggleSelectAsset: (state, action) => {
      const id = action.payload;
      if (state.selectedAssets.includes(id)) {
        state.selectedAssets = state.selectedAssets.filter(
          (assetId) => assetId !== id
        );
      } else {
        state.selectedAssets.push(id);
      }
    },
    selectAllAssets: (state) => {
      if (state.assets && state.assets.length > 0) {
        state.selectedAssets = state.assets.map((asset) => asset.id);
      }
    },
    deselectAllAssets: (state) => {
      state.selectedAssets = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assets.push(action.payload);
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload;
      })
      .addCase(getAllAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAsset.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = state.assets.map((asset) =>
          asset.id === action.payload.id ? action.payload : asset
        );
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        const { deletedAssetIds } = action.payload;
        state.assets = state.assets.filter(
          (asset) => !deletedAssetIds.includes(asset.id)
        );
        state.selectedAssets = state.selectedAssets.filter(
          (id) => !deletedAssetIds.includes(id)
        );
        state.loading = false;
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete asset(s)";
        state.loading = false;
      });
  },
});

export const {
  setSelectedAsset,
  setCurrentPage,
  setRowsPerPage,
  toggleSelectAsset,
  selectAllAssets,
  deselectAllAssets,
} = assetSlice.actions;

export default assetSlice.reducer;
