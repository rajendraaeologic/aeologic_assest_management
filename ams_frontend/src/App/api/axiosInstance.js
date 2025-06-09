import axios from "axios";
import { setCredentials, logOut } from "../../Features/auth/authSlice";

let storeInstance;

export const injectStore = (store) => {
  storeInstance = store;
};

const API = axios.create({
  // baseURL: "http://localhost:3000/api/v1",
    baseURL: "http://ec2-3-93-185-33.compute-1.amazonaws.com:3000/api/v1",
    withCredentials: true,
});

API.interceptors.request.use(
    async (config) => {
        if (storeInstance) {
            let token = storeInstance.getState().auth.token;
            if (!token) {
                token = localStorage.getItem('accessToken');
                if (token) {
                    storeInstance.dispatch(setCredentials({ accessToken: token }));
                }
            }

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
        const originalRequest = error.config;

        if ([401, 403].includes(error.response?.status) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh tokens
        // const refreshResponse = await axios.get(
        //   "http://localhost:3000/api/v1/auth/refresh",
        //   { withCredentials: true }
        // );
        const refreshResponse = await axios.get(
          "http://ec2-3-93-185-33.compute-1.amazonaws.com:3000/api/v1/auth/refresh",
          { withCredentials: true }
        );

            if (!refreshResponse.data?.access?.token) {
                throw new Error("Invalid refresh response");
            }

            const newAccessToken = refreshResponse.data.access.token;

            storeInstance.dispatch(
                setCredentials({
                    accessToken: newAccessToken,
                    user: storeInstance.getState().auth.user
                })
            );
            localStorage.setItem('accessToken', newAccessToken);

                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                storeInstance.dispatch(logOut());
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default API;
