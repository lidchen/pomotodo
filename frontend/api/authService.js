class AuthService {
    constructor() {
        this.apiClient = apiClient;
        this.endpoints = API_CONFIG.endpoints;
    }

    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { isValid: false, error: 'The username cannot be empty' };
        }
        if (username.length < 4 || username.length > 32) {
            return { isValid: false, error: 'The username must be between 4 and 32 characters' };
        }
        return { isValid: true, error: null };
    }

    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { isValid: false, error: 'The password cannot be empty' };
        }
        if (password.length < 6) {
            return { isValid: false, error: 'The password must be at least 6 characters' };
        }
        return { isValid: true, error: null };
    }

    async login(username, password) {
        const usernameValidation = this.validateUsername(username);
        if (!usernameValidation.isValid) {
            return {
                success: false,
                errorcode: 400,
                message: usernameValidation.error,
                id: null,
                username: null
            };
        }

        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.isValid) {
            return {
                success: false,
                errorcode: 400,
                message: passwordValidation.error,
                id: null,
                username: null
            };
        }

        try {
            const data = await this.apiClient.post(this.endpoints.login, {
                username: username,
                password: password
            });

            if (data.success) {
                return {
                    success: true,
                    errorcode: 0,
                    message: 'Login successful',
                    id: data.data.id,
                    username: data.data.username
                };
            } else {
                return {
                    success: false,
                    errorcode: data.error?.code || 500,
                    message: data.error?.message || 'Login failed due to unknown error',
                    id: null,
                    username: null
                };
            }
        } catch (error) {
            return {
                success: false,
                errorcode: 500,
                message: error.message || 'Failed to connect to server, please ensure the backend service is running',
                id: null,
                username: null
            };
        }
    }

    async register(username, password) {
        const usernameValidation = this.validateUsername(username);
        if (!usernameValidation.isValid) {
            return {
                success: false,
                errorcode: 400,
                message: usernameValidation.error,
                id: null,
                username: null
            };
        }

        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.isValid) {
            return {
                success: false,
                errorcode: 400,
                message: passwordValidation.error,
                id: null,
                username: null
            };
        }

        try {
            const data = await this.apiClient.post(this.endpoints.register, {
                username: username,
                password: password
            });

            if (data.success) {
                return {
                    success: true,
                    errorcode: 0,
                    message: 'Registration successful',
                    id: data.data.id,
                    username: data.data.username
                };
            } else {
                return {
                    success: false,
                    errorcode: data.error?.code || 500,
                    message: data.error?.message || 'Registration failed due to unknown error',
                    id: null,
                    username: null
                };
            }
        } catch (error) {
            return {
                success: false,
                errorcode: 500,
                message: error.message || 'Failed to connect to server, please ensure the backend service is running',
                id: null,
                username: null
            };
        }
    }
}

const authService = new AuthService();
