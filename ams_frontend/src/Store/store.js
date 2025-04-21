import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer, { refreshToken } from "../Features/auth/authSlice";

import DepartmentReducer from "../Features/slices/departmentSlice";
import userAssetReducer from "../Features/slices/assetSlice";
import userAssignTagReducer from "../Features/AssignTagSlice";
import DateWishReportReducer from "../Features/DateWishReportSlice";
import OutForDeliveryReducer from "../Features/OutForDeiverySlice";
import OrganizationReducer from "../Features/slices/organizationSlice";
import BranchReducer from "../Features/slices/branchSlice";
import UserReducer from "../Features/slices/userSlice";
import AssignAssetReducer from "../Features/slices/assignAssetSlice";
import { injectStore } from "../App/api/axiosInstance";

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "token", "refreshToken"],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    usersData: UserReducer,
    departmentData: DepartmentReducer,
    assetUserData: userAssetReducer,
    assignData: userAssignTagReducer,
    dateWishReportUser: DateWishReportReducer,
    outForDeliverUser: OutForDeliveryReducer,
    organizationData: OrganizationReducer,
    branchData: BranchReducer,
    assignAssetData: AssignAssetReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

injectStore(store);

export const persistor = persistStore(store);

export default store;
