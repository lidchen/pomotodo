const REGISTER_BASE_URL = 'http://localhost:3002/api';

/**
 * 注册服务 - 适配后端API
 * 修改记录：
 * - 2026-03-28: 修改API端点从 /auth/register 到 /register
 * - 2026-03-28: 修改响应格式适配后端 { success, data } 结构
 */
class RegisterService {
    constructor() {
        this.baseUrl = REGISTER_BASE_URL;
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

    async handleRegister(username, password) {
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

            // 修改：API端点从 /auth/register 改为 /api/register
            const response = await fetch(`${this.baseUrl}/register`, {
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
            console.error('注册请求失败:', error);
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

const registerService = new RegisterService();
