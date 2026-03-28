const TASK_BASE_URL = 'http://localhost:3002/api';

class IncrementTomatoesService {
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

    validateTaskId(taskId) {
        if (taskId === null || taskId === undefined || typeof taskId !== 'number' || !Number.isInteger(taskId)) {
            return {
                isValid: false,
                error: '任务ID必须为整数'
            };
        }

        if (taskId <= 0) {
            return {
                isValid: false,
                error: '任务ID必须为正整数'
            };
        }

        return {
            isValid: true,
            error: null
        };
    }

    async incrementTomatoes(userId, taskId) {
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

            const taskIdValidation = this.validateTaskId(taskId);
            if (!taskIdValidation.isValid) {
                return {
                    success: false,
                    errorcode: 400,
                    message: taskIdValidation.error,
                    tasks: []
                };
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${this.baseUrl}/todos/pomo?user_id=${userId}&id=${taskId}`, {
                method: 'POST',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (data.success) {
                return {
                    success: true,
                    errorcode: 0,
                    message: '番茄钟计数增加成功',
                    tasks: [data.data]
                };
            } else {
                return {
                    success: false,
                    errorcode: 400,
                    message: data.error?.message || '番茄钟计数增加失败',
                    tasks: []
                };
            }
        } catch (error) {
            console.error('增加番茄钟请求失败:', error);
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

const incrementTomatoesService = new IncrementTomatoesService();
