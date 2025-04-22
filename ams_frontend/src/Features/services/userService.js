import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../App/api/axiosInstance.js";

export const bulkUploadUsers = createAsyncThunk(
    "userRegistration/bulkUploadUsers",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await API.post("/users/bulk-upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error uploading users");
        }
    }
);



export const createRegistrationUser = createAsyncThunk(
    "userRegistration/createRegistrationUser",
    async (data, { rejectWithValue }) => {
        try {
            const response = await API.post("/users/createUser", data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error creating user");
        }
    }
);

export const getAllUser = createAsyncThunk(
    "userRegistration/getAllUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get("/users/getAllUsers");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error fetching users");
        }
    }
);

export const updateUser = createAsyncThunk(
    "userRegistration/updateUser",
    async (data, { rejectWithValue }) => {
        try {
            const response = await API.patch(`/users/${data._id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error updating user");
        }
    }
);

export const deleteUsersFromDB = createAsyncThunk(
    "userRegistration/deleteUsersFromDB",
    async (userIds, { rejectWithValue }) => {
        try {
            const idsArray = Array.isArray(userIds) ? userIds : [userIds];
            const response = await API.post("/delete-bulk", { userIds: idsArray });

            return {
                ...response.data,
                deletedUserIds: idsArray,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to delete users");
        }
    }
);

