import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getAllAssetHistoriesService,
    getAssetHistoryByIdService,
    getAssetHistoriesByAssetIdService,
} from "../services/assetHistoryService";

export const getAllAssetHistories = createAsyncThunk(
"assetHistory/getAll",
async (
    {
        limit,
        page,
        searchTerm,
    },
    { rejectWithValue }
) => {
    try {
        const response = await getAllAssetHistoriesService({
            limit,
            page,
            searchTerm,
        });
        return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch asset histories"
            );
        }
    }
);

export const getAssetHistoryById = createAsyncThunk(
    "assetHistory/getById",
    async (historyId, { rejectWithValue }) => {
        try {
            const response = await getAssetHistoryByIdService(historyId);
            return response.data.history;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch asset history by ID"
            );
        }
    }
);

export const getAssetHistoriesByAssetId = createAsyncThunk(
"assetHistory/getByAssetId",
async (
    {
        assetId,
        limit,
        page,
        searchTerm,
        userId,
        action,
        timestampFrom,
        timestampTo,
        sortBy,
        sortType,
    },
    { rejectWithValue }
) => {
    try {
        const response = await getAssetHistoriesByAssetIdService({
            assetId,
            limit,
            page,
            searchTerm,
            userId,
            action,
            timestampFrom,
            timestampTo,
            sortBy,
            sortType,
        });
        return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch asset histories for this asset"
            );
        }
    }
);

const initialState = {
    histories: [],
    selectedHistory: null,
    loading: false,
    error: null,
    currentPage: 1,
    rowsPerPage: 5,
    totalHistories: 0,
    totalPages: 0,
    searchTerm: "",
    mode: "pagination",
};

const assetHistorySlice = createSlice({
    name: "assetHistory",
    initialState,
    reducers: {
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setRowsPerPage: (state, action) => {
            state.rowsPerPage = action.payload;
            state.currentPage = 1;
        },
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
            state.currentPage = 1;
        },
        resetAssetHistoryTableState: (state) => {
            state.currentPage = 1;
            state.rowsPerPage = 5;
            state.searchTerm = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllAssetHistories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllAssetHistories.fulfilled, (state, action) => {
                state.loading = false;
                state.histories = action.payload.histories;
                state.totalHistories = action.payload.pagination.total;
                state.totalPages = action.payload.pagination.totalPages;
                state.currentPage = action.payload.pagination.page;
                state.rowsPerPage = action.payload.pagination.limit;
                state.mode = action.payload.pagination.mode;
            })
            .addCase(getAllAssetHistories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.histories = [];
                state.totalHistories = 0;
                state.totalPages = 0;
            })
            .addCase(getAssetHistoryById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedHistory = null;
            })
            .addCase(getAssetHistoryById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedHistory = action.payload;
            })
            .addCase(getAssetHistoryById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.selectedHistory = null;
            })
            .addCase(getAssetHistoriesByAssetId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAssetHistoriesByAssetId.fulfilled, (state, action) => {
                state.loading = false;
                state.histories = action.payload.histories;
                state.totalHistories = action.payload.pagination.total;
                state.totalPages = action.payload.pagination.totalPages;
                state.currentPage = action.payload.pagination.page;
                state.rowsPerPage = action.payload.pagination.limit;
                state.mode = action.payload.pagination.mode;
            })
            .addCase(getAssetHistoriesByAssetId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.histories = [];
                state.totalHistories = 0;
                state.totalPages = 0;
            });
    },
});

export const {
    setCurrentPage,
    setRowsPerPage,
    setSearchTerm,
    resetAssetHistoryTableState
} = assetHistorySlice.actions;

export default assetHistorySlice.reducer;