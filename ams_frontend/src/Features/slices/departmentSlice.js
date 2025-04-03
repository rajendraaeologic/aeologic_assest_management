import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createDepartmentService,
  getAllDepartmentsService,
  updateDepartmentService,
  deleteDepartmentService,
} from "../services/departmentService";

// Create Organization
export const createDepartment = createAsyncThunk(
  "department/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createDepartmentService(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Get All Organizations
export const getAllDepartments = createAsyncThunk(
  "department/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllDepartmentsService();

      if (!response.data || response.data.length === 0) {
        return rejectWithValue(response.message);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch departments"
      );
    }
  }
);

// Update Organization
export const updateDepartment = createAsyncThunk(
  "department/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await updateDepartmentService(data);

      if (!response) {
        return rejectWithValue("Failed to update department.");
      }

      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating department"
      );
    }
  }
);

// Delete Organization (single or bulk)
export const deleteDepartment = createAsyncThunk(
  "department/delete",
  async (departmentIds, { rejectWithValue }) => {
    try {
      const ids = Array.isArray(departmentIds)
        ? departmentIds
        : [departmentIds];
      const response = await deleteDepartmentService(ids);
      return { deletedDepartmentIds: ids };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete department(s)"
      );
    }
  }
);

const departmentSlice = createSlice({
  name: "department",
  initialState: {
    departments: [],
    loading: false,
    error: null,
    selectedDepartment: null,
    selectedDepartments: [],
    currentPage: 0,
    rowsPerPage: 5,
  },
  reducers: {
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
    },
    toggleSelectDepartment: (state, action) => {
      const id = action.payload;
      if (state.selectedDepartments.includes(id)) {
        state.selectedDepartments = state.selectedDepartments.filter(
          (depId) => depId !== id
        );
      } else {
        state.selectedDepartments.push(id);
      }
    },
    selectAllDepartments: (state) => {
      if (state.departments && state.departments.length > 0) {
        state.selectedDepartments = state.departments.map((dep) => dep.id);
      }
    },
    deselectAllDepartments: (state) => {
      state.selectedDepartments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.departments.push(action.payload);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(getAllDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDepartment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = state.departments.map((dep) =>
          dep.id === action.payload.id ? action.payload : dep
        );
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        const { deletedDepartmentIds } = action.payload;
        state.departments = state.departments.filter(
          (dep) => !deletedDepartmentIds.includes(dep.id)
        );
        state.selectedDepartments = state.selectedDepartments.filter(
          (id) => !deletedDepartmentIds.includes(id)
        );
        state.loading = false;
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete department(s)";
        state.loading = false;
      });
  },
});

export const {
  setSelectedDepartment,
  setCurrentPage,
  setRowsPerPage,
  toggleSelectDepartment,
  selectAllDepartments,
  deselectAllDepartments,
} = departmentSlice.actions;

export default departmentSlice.reducer;
