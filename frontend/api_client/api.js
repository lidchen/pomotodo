const API_BASE_URL = 'http://localhost:3002/api';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API请求失败:', error);
            throw new Error('网络连接失败，请确保后端服务已启动');
        }
    }
}

const apiClient = new ApiClient();
