const TASK_BASE_URL = 'http://localhost:3002/api';

class UpdateTaskService {
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

    validateTitle(title) {
        if (title === null || title === undefined) {
            return {
                isValid: true,
                error: null
            };
        }

        if (typeof title !== 'string') {
            return {
                isValid: false,
                error: '任务标题必须为字符串'
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

    validateCompleted(completed) {
        if (completed === null || completed === undefined) {
            return {
                isValid: true,
                error: null
            };
        }

        if (typeof completed !== 'boolean') {
            return {
                isValid: false,
                error: 'completed必须为布尔值'
            };
        }

        return {
            isValid: true,
            error: null
        };
    }

    validatePomoCount(pomoCount) {
        if (pomoCount === null || pomoCount === undefined) {
            return {
                isValid: true,
                error: null
            };
        }

        if (typeof pomoCount !== 'number' || !Number.isInteger(pomoCount)) {
            return {
                isValid: false,
                error: 'pomo_count必须为整数'
            };
        }

        if (pomoCount < 0) {
            return {
                isValid: false,
                error: 'pomo_count不能为负数'
            };
        }

        return {
            isValid: true,
            error: null
        };
    }

    async updateTask(userId, taskId, title, completed, pomoCount) {
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

            const titleValidation = this.validateTitle(title);
            if (!titleValidation.isValid) {
                return {
                    success: false,
                    errorcode: 400,
                    message: titleValidation.error,
                    tasks: []
                };
            }

            const completedValidation = this.validateCompleted(completed);
            if (!completedValidation.isValid) {
                return {
                    success: false,
                    errorcode: 400,
                    message: completedValidation.error,
                    tasks: []
                };
            }

            const pomoCountValidation = this.validatePomoCount(pomoCount);
            if (!pomoCountValidation.isValid) {
                return {
                    success: false,
                    errorcode: 400,
                    message: pomoCountValidation.error,
                    tasks: []
                };
            }

            const requestBody = {
                user_id: userId,
                task_id: taskId
            };

            if (title !== undefined && title !== null) {
                requestBody.title = title.trim();
            }

            if (completed !== undefined && completed !== null) {
                requestBody.completed = completed;
            }

            if (pomoCount !== undefined && pomoCount !== null) {
                requestBody.pomo_count = pomoCount;
            }

            const response = await fetch(`${this.baseUrl}/tasks`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.errorcode === 0) {
                return {
                    success: true,
                    errorcode: 0,
                    message: '任务更新成功',
                    tasks: data.tasks || []
                };
            } else {
                return {
                    success: false,
                    errorcode: data.errorcode,
                    message: data.message || '任务更新失败',
                    tasks: []
                };
            }
        } catch (error) {
            console.error('更新任务请求失败:', error);
            return {
                success: false,
                errorcode: 500,
                message: '网络连接失败，请稍后重试',
                tasks: []
            };
        }
    }
}

const updateTaskService = new UpdateTaskService();
