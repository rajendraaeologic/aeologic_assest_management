import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createOrganizationService,
  getAllOrganizationsService,
  updateOrganizationService,
  deleteOrganizationService,
} from "../services/organizationService";

// Create Organization
export const createOrganization = createAsyncThunk(
  "organization/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createOrganizationService(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Get All Organizations
export const getAllOrganizations = createAsyncThunk(
  "organization/getAll",
  async ({ limit = 5, page = 1, searchTerm = "" }, { rejectWithValue }) => {
    try {
      const response = await getAllOrganizationsService({
        limit,
        page,
        searchTerm,
      });
      return response.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch organizations"
      );
    }
  }
);

// Update Organization
export const updateOrganization = createAsyncThunk(
  "organization/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await updateOrganizationService(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating organization"
      );
    }
  }
);

// Delete Organization (single or bulk)
export const deleteOrganization = createAsyncThunk(
  "organization/delete",
  async (organizationIds, { rejectWithValue }) => {
    try {
      const ids = Array.isArray(organizationIds)
        ? organizationIds
        : [organizationIds];
      const response = await deleteOrganizationService(ids);
      return {
        deletedOrganizationIds: ids,
        ...response,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to delete organization(s)"
      );
    }
  }
);

const organizationSlice = createSlice({
  name: "organization",
  initialState: {
    organizations: [],
    loading: false,
    error: null,
    selectedOrganization: null,
    selectedOrganizations: [],
    currentPage: 1,
    rowsPerPage: 5,
    totalOrganizations: 0,
    totalPages: 0,
    searchTerm: "",
  },

  reducers: {
    setSelectedOrganization: (state, action) => {
      state.selectedOrganization = action.payload;
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
    toggleSelectOrganization: (state, action) => {
      const id = action.payload;
      if (state.selectedOrganizations.includes(id)) {
        state.selectedOrganizations = state.selectedOrganizations.filter(
          (orgId) => orgId !== id
        );
      } else {
        state.selectedOrganizations.push(id);
      }
    },
    selectAllOrganizations: (state) => {
      if (state.organizations && state.organizations.length > 0) {
        state.selectedOrganizations = state.organizations.map((org) => org.id);
      }
    },
    deselectAllOrganizations: (state) => {
      state.selectedOrganizations = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations.unshift(action.payload);
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload.data;
        state.totalOrganizations = action.payload.totalData;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
        state.rowsPerPage = action.payload.limit;
      })

      .addCase(getAllOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = state.organizations.map((org) =>
          org.id === action.payload.id ? action.payload : org
        );
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        const { deletedOrganizationIds } = action.payload;
        state.organizations = state.organizations.filter(
          (org) => !deletedOrganizationIds.includes(org.id)
        );
        state.selectedOrganizations = state.selectedOrganizations.filter(
          (id) => !deletedOrganizationIds.includes(id)
        );
        state.loading = false;
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete organization(s)";
        state.loading = false;
      });
  },
});

export const {
  setSelectedOrganization,
  setCurrentPage,
  setRowsPerPage,
  toggleSelectOrganization,
  selectAllOrganizations,
  deselectAllOrganizations,
  setSearchTerm,
} = organizationSlice.actions;

export default organizationSlice.reducer;
