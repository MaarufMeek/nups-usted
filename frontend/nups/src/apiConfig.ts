import axios from "axios";

// Base URL for Django backend
const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Main axios instance (used everywhere in the app)
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

/* ------------------------------------------------------------------
   REQUEST INTERCEPTOR
   - Runs before every request
   - Attaches access token if available
------------------------------------------------------------------- */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* ------------------------------------------------------------------
   RESPONSE INTERCEPTOR
   - Handles expired access tokens (401)
   - Refreshes token silently
   - Retries original request
------------------------------------------------------------------- */
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config as any;

        // If access token expired
        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken =
                    localStorage.getItem("refresh_token");

                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                const refreshResponse = await axios.post(
                    `${BASE_URL}/token/refresh/`,
                    { refresh: refreshToken }
                );

                const newAccessToken =
                    refreshResponse.data.access;

                // Save new access token
                localStorage.setItem(
                    "access_token",
                    newAccessToken
                );

                // Update header and retry original request
                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed → force logout
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");

                window.location.href = "/admin-login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
