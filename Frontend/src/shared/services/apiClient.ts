import axios, { type InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// File d'attente des requêtes en attente d'un refresh en cours
let isRefreshing = false;
let pendingQueue: Array<{
    resolve: () => void;
    reject: (err: unknown) => void;
}> = [];

function processPendingQueue(error: unknown) {
    pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
    pendingQueue = [];
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
        if (!axios.isAxiosError(error)) return Promise.reject(error);

        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // On n'intercepte que les 401, et jamais une requête déjà rejouée
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Si un refresh est déjà en cours, on met la requête en file d'attente
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({
                    resolve: () => resolve(apiClient(originalRequest)),
                    reject,
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await apiClient.post('/auth/refresh');
            processPendingQueue(null);
            return apiClient(originalRequest);
        } catch (refreshError) {
            processPendingQueue(refreshError);
            // Hors du contexte React — on vide la session et on force un rechargement
            localStorage.removeItem('session');
            window.location.href = '/connexion';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);
