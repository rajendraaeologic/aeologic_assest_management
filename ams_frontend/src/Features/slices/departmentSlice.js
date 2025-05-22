import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createDepartmentService,
  getAllDepartmentsService,
  updateDepartmentService,
  deleteDepartmentService,
} from "../services/departmentService";

// Create Department
export const createDepartment = createAsyncThunk(
  "department/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createDepartmentService(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Get All Departments
export const getAllDepartments = createAsyncThunk(
  "department/getAll",
  async ({ limit = 5, page = 1, searchTerm = "" }, { rejectWithValue }) => {
    try {
      const response = await getAllDepartmentsService({
        limit,
        page,
        searchTerm,
      });
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch departments"
      );
    }
  }
);

// Update Department
export const updateDepartment = createAsyncThunk(
  "department/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await updateDepartmentService(data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating department"
      );
    }
  }
);

// Delete Department (single or bulk)
export const deleteDepartment = createAsyncThunk(
  "department/delete",
  async (departmentIds, { rejectWithValue }) => {
    try {
      const ids = Array.isArray(departmentIds)
        ? departmentIds
        : [departmentIds];
      const response = await deleteDepartmentService(ids);
      return {
        deletedDepartmentIds: ids,
        ...response,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete department(s)");
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
    currentPage: 1,
    rowsPerPage: 5,
    totalDepartments: 0,
    totalPages: 0,
    searchTerm: "",
  },
  reducers: {
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
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
    toggleSelectDepartment: (state, action) => {
      const id = action.payload;
      if (state.selectedDepartments.includes(id)) {
        state.selectedDepartments = state.selectedDepartments.filter(
          (departmentId) => departmentId !== id
        );
      } else {
        state.selectedDepartments.push(id);
      }
    },
    selectAllDepartments: (state) => {
      if (state.departments && state.departments.length > 0) {
        state.selectedDepartments = state.departments.map(
          (department) => department.id
        );
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
        state.departments.unshift(action.payload);
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
        state.departments = action.payload.departments;
        state.totalDepartments = action.payload.pagination.totalData;
        state.totalPages = action.payload.pagination.totalPages;
        state.currentPage = action.payload.pagination.page;
        state.rowsPerPage = action.payload.pagination.limit;
      })
      .addCase(getAllDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = state.departments.map((department) =>
          department.id === action.payload.id ? action.payload : department
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
          (department) => !deletedDepartmentIds.includes(department.id)
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
  setSearchTerm,
} = departmentSlice.actions;

export default departmentSlice.reducer;
