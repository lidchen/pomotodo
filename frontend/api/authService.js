class AuthService {
    constructor() {
        this.apiClient = apiClient;
        this.endpoints = API_CONFIG.endpoints;
    }

    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { isValid: false, error: '用户名不能为空' };
        }
        if (username.length < 4 || username.length > 32) {
            return { isValid: false, error: '用户名需要4-32个字符' };
        }
        return { isValid: true, error: null };
    }

    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { isValid: false, error: '密码不能为空' };
        }
        if (password.length < 6) {
            return { isValid: false, error: '密码至少需要6个字符' };
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
                    message: '登录成功',
                    id: data.data.id,
                    username: data.data.username
                };
            } else {
                return {
                    success: false,
                    errorcode: data.error?.code || 500,
                    message: data.error?.message || '登录失败',
                    id: null,
                    username: null
                };
            }
        } catch (error) {
            return {
                success: false,
                errorcode: 500,
                message: error.message || '网络连接失败，请稍后重试',
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
                    message: '注册成功',
                    id: data.data.id,
                    username: data.data.username
                };
            } else {
                return {
                    success: false,
                    errorcode: data.error?.code || 500,
                    message: data.error?.message || '注册失败',
                    id: null,
                    username: null
                };
            }
        } catch (error) {
            return {
                success: false,
                errorcode: 500,
                message: error.message || '网络连接失败，请稍后重试',
                id: null,
                username: null
            };
        }
    }
}

const authService = new AuthService();
