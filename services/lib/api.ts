import axios, { AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from "axios";
import { getSession, signOut } from "next-auth/react";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const session = await getSession();
        const token = session?.user?.accessToken;

        if (token) {
            // Ensure headers is of type AxiosHeaders
            if (!config.headers) config.headers = new AxiosHeaders();
            (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized! Token may have expired.");
            // Session clear (browser storage)
            sessionStorage.clear();
            localStorage.clear();

            // NextAuth cookies + session clear
            await signOut({ callbackUrl: "/login", redirect: true });

            return;
        }
        return Promise.reject(error);
    }
);

export default api;
