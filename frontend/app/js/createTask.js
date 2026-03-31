const TASK_BASE_URL = 'http://localhost:3002/api';

class TaskService {
    constructor() {
        this.baseUrl = TASK_BASE_URL;
    }

    validateUserId(userId) {
        if (userId === null || userId === undefined || typeof userId !== 'number' || !Number.isInteger(userId)) {
            return {
                isValid: false,
                error: '用户ID必须为整数'
            };
        }

        if (userId <= 0) {
            return {
                isValid: false,
                error: '用户ID必须为正整数'
            };
        }

        return {
            isValid: true,
            error: null
        };
    }

    validateTitle(title) {
        if (!title || typeof title !== 'string') {
            return {
                isValid: false,
                error: '任务标题不能为空'
            };
        }

        if (title.trim().length === 0) {
            return {
                isValid: false,
                error: '任务标题不能只包含空白字符'
            };
        }

        if (title.length > 255) {
            return {
                isValid: false,
                error: '任务标题不能超过255个字符'
            };
        }

        return {
            isValid: true,
            error: null
        };
    }

    async createTask(userId, title) {
        try {
            const userIdValidation = this.validateUserId(userId);
            if (!userIdValidation.isValid) {
                return {
                    success: false,
                    errorcode: 400,
                    message: userIdValidation.error,
                    tasks: []
                };
            }

            const titleValidation = this.validateTitle(title);
            if (!titleValidation.isValid) {
                return {
                    success: false,
                    errorcode: 400,
                    message: titleValidation.error,
                    tasks: []
                };
            }

            const response = await fetch(`${this.baseUrl}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    title: title.trim()
                })
            });

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    errorcode: 0,
                    message: '任务创建成功',
                    tasks: [data.data]
                };
            } else {
                return {
                    success: false,
                    errorcode: 400,
                    message: data.error?.message || '任务创建失败',
                    tasks: []
                };
            }
        } catch (error) {
            console.error('创建任务请求失败:', error);
            return {
                success: false,
                errorcode: 500,
                message: '网络连接失败，请稍后重试',
                tasks: []
            };
        }
    }
}

const taskService = new TaskService();
