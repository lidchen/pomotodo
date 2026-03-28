const LOGIN_BASE_URL = 'http://localhost:3002/api';

/**
 * 登录服务 - 适配后端API
 * 修改记录：
 * - 2026-03-28: 修改API端点从 /auth/login 到 /login
 * - 2026-03-28: 修改响应格式适配后端 { success, data } 结构
 */
class LoginService {
    constructor() {
        this.baseUrl = LOGIN_BASE_URL;
    }

    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return {
                isValid: false,
                error: '用户名不能为空'
            };
        }

        if (username.length < 4) {
            return {
                isValid: false,
                error: '用户名至少需要4个字符'
            };
        }

        if (username.length > 32) {
            return {
                isValid: false,
                error: '用户名不能超过32个字符'
            };
        }

        return {
            isValid: true,
            error: null
        };
    }

    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return {
                isValid: false,
                error: '密码不能为空'
            };
        }

        if (password.length < 6) {
            return {
                isValid: false,
                error: '密码至少需要6个字符'
            };
        }

        return {
            isValid: true,
            error: null
        };
    }

    async handleLogin(username, password) {
        try {
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

            // 修改：API端点从 /auth/login 改为 /api/login
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            // 修改：适配后端响应格式 { success, data, error }
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
            console.error('登录请求失败:', error);
            return {
                success: false,
                errorcode: 500,
                message: '网络连接失败，请稍后重试',
                id: null,
                username: null
            };
        }
    }
}

const loginService = new LoginService();
