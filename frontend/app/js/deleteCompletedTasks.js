const TASK_BASE_URL = 'http://localhost:3002/api';

class TaskOperationsService {
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

    async deleteCompletedTasks(userId) {
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

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${this.baseUrl}/tasks/completed`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (data.errorcode === 0) {
                return {
                    success: true,
                    errorcode: 0,
                    message: '已完成任务删除成功',
                    tasks: data.tasks || []
                };
            } else {
                return {
                    success: false,
                    errorcode: data.errorcode,
                    message: data.message || '已完成任务删除失败',
                    tasks: []
                };
            }
        } catch (error) {
            console.error('删除已完成任务请求失败:', error);
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    errorcode: 408,
                    message: '请求超时，请稍后重试',
                    tasks: []
                };
            }
            return {
                success: false,
                errorcode: 500,
                message: '网络连接失败，请稍后重试',
                tasks: []
            };
        }
    }
}

const taskOperationsService = new TaskOperationsService();
