import axios from "axios";
import { setCredentials, logOut } from "../../Features/auth/authSlice";
import {API_URL} from "./config.js";

let storeInstance;

export const injectStore = (store) => {
  storeInstance = store;
};

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use(
  (config) => {
    if (storeInstance) {
      const state = storeInstance.getState();
      const token = state.auth.token;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!storeInstance) return Promise.reject(error);

    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.get(
          `${API_URL}/auth/refresh`,
          { withCredentials: true }
        );

        if (!refreshResponse.data.accessToken) {
          throw new Error("Refresh token expired");
        }

        const newAccessToken = refreshResponse.data.accessToken;
        const state = storeInstance.getState();

        storeInstance.dispatch(
          setCredentials({ accessToken: newAccessToken, user: state.auth.user })
        );

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        storeInstance.dispatch(logOut());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
