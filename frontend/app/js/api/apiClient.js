class ApiClient {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
        this.timeout = API_CONFIG.timeout;
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        this.initDefaultInterceptors();
    }

    initDefaultInterceptors() {
        this.addRequestInterceptor((config) => {
            config.headers = {
                'Content-Type': 'application/json',
                ...config.headers
            };
            return config;
        });

        this.addResponseInterceptor(
            (response) => response,
            (error) => {
                console.error('API request error:', error);
                if (error.name === 'AbortError') {
                    throw new Error('Request timed out, please try again later');
                }
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    throw new Error('Failed to connect to server, please ensure the backend service is running');
                }
                throw error;
            }
        );
    }

    addRequestInterceptor(onFulfilled) {
        this.requestInterceptors.push(onFulfilled);
    }

    addResponseInterceptor(onFulfilled, onRejected) {
        this.responseInterceptors.push({ onFulfilled, onRejected });
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        let config = { ...options };

        for (const interceptor of this.requestInterceptors) {
            config = interceptor(config);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        config.signal = controller.signal;

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            let result = response;
            for (const interceptor of this.responseInterceptors) {
                try {
                    result = await interceptor.onFulfilled(result);
                } catch (error) {
                    if (interceptor.onRejected) {
                        result = await interceptor.onRejected(error);
                    } else {
                        throw error;
                    }
                }
            }

            if (result.status === 204) {
                return { success: true };
            }

            const data = await result.json();
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            let processedError = error;
            for (const interceptor of this.responseInterceptors) {
                if (interceptor.onRejected) {
                    try {
                        processedError = await interceptor.onRejected(processedError);
                    } catch (e) {
                        processedError = e;
                    }
                }
            }
            throw processedError;
        }
    }

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'DELETE' });
    }
}

const apiClient = new ApiClient();
