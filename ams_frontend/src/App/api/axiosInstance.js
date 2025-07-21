import axios from "axios";
import { setCredentials, logOut } from "../../Features/auth/authSlice";

let storeInstance;

export const injectStore = (store) => {
  storeInstance = store;
};

const API = axios.create({
   // baseURL: "http://localhost:3000/api/v1",
    baseURL: "https://us-central1-asset-management-83e3b.cloudfunctions.net/ams_api/api/v1",
    withCredentials: true,
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

        const authEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
        const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url.includes(endpoint));

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;
            try {
        // const refreshResponse = await axios.get(
        //   "http://localhost:3000/api/v1/auth/refresh-tokens",
        //   { withCredentials: true }
        // );
        const refreshResponse = await axios.get(
          "https://us-central1-asset-management-83e3b.cloudfunctions.net/ams_api/api/v1/auth/refresh-tokens",
          { withCredentials: true }
        );

                if (!refreshResponse.data?.access?.token) {
                    throw new Error("No new access token received");
                }

                const newAccessToken = refreshResponse.data.access.token;
                const state = storeInstance.getState();

                storeInstance.dispatch(
                    setCredentials({
                        accessToken: newAccessToken,
                        user: state.auth.user
                    })
                );

                // Update the original request with new token
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

                // Retry the original request with new token
                return API(originalRequest);
            } catch (refreshError) {
                // Only logout if refresh token is invalid or expired
                if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
                    // Clear any stored tokens
                    storeInstance.dispatch(logOut());
                }
                return Promise.reject(refreshError);
            }
        }

        // Handle 403 errors (forbidden) - but not for auth endpoints
        if (error.response?.status === 403 && !isAuthEndpoint) {
            storeInstance.dispatch(logOut());
        }

        return Promise.reject(error);
    }
);
export default API;