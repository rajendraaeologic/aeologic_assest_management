import axios from "axios";
import { setCredentials, logOut } from "../../Features/auth/authSlice";

let storeInstance;

export const injectStore = (store) => {
  storeInstance = store;
};

const API = axios.create({
  // baseURL: "http://localhost:3000/api/v1",
  baseURL: "http://ec2-3-93-185-33.compute-1.amazonaws.com:3000/api/v1",
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
        // const refreshResponse = await axios.get(
        //   "http://localhost:3000/api/v1/auth/refresh",
        //   { withCredentials: true }
        // );
        const refreshResponse = await axios.get(
          "http://ec2-3-93-185-33.compute-1.amazonaws.com:3000/api/v1/auth/refresh",
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
