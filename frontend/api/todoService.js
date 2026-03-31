class TodoService {
    constructor() {
        this.apiClient = apiClient;
        this.endpoints = API_CONFIG.endpoints;
    }

    validateUserId(userId) {
        if (userId === null || userId === undefined || typeof userId !== 'number' || !Number.isInteger(userId)) {
            return { isValid: false, error: '用户ID必须为整数' };
        }
        if (userId <= 0) {
            return { isValid: false, error: '用户ID必须为正整数' };
        }
        return { isValid: true, error: null };
    }

    validateTaskId(taskId) {
        if (taskId === null || taskId === undefined || typeof taskId !== 'number' || !Number.isInteger(taskId)) {
            return { isValid: false, error: '任务ID必须为整数' };
        }
        if (taskId <= 0) {
            return { isValid: false, error: '任务ID必须为正整数' };
        }
        return { isValid: true, error: null };
    }

    validateTitle(title) {
        if (!title || typeof title !== 'string') {
            return { isValid: false, error: '任务标题不能为空' };
        }
        if (title.trim().length === 0) {
            return { isValid: false, error: '任务标题不能只包含空白字符' };
        }
        if (title.length > 255) {
            return { isValid: false, error: '任务标题不能超过255个字符' };
        }
        return { isValid: true, error: null };
    }

    async loadTasks(userId) {
        const userIdValidation = this.validateUserId(userId);
        if (!userIdValidation.isValid) {
            return Promise.reject(new Error(userIdValidation.error));
        }

        try {
            const data = await this.apiClient.get(this.endpoints.todos, { user_id: userId });
            if (data.success) {
                return { errorcode: 0, tasks: data.data || [] };
            } else {
                return Promise.reject(new Error(data.error?.message || '加载任务失败'));
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async createTask(userId, title) {
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

        try {
            const data = await this.apiClient.post(this.endpoints.todos, {
                user_id: userId,
                title: title.trim()
            });

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
            return {
                success: false,
                errorcode: 500,
                message: error.message || '网络连接失败，请稍后重试',
                tasks: []
            };
        }
    }

    async deleteTask(userId, taskId) {
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

        try {
            const data = await this.apiClient.delete(this.endpoints.todos, {
                user_id: userId,
                id: taskId
            });

            return {
                success: true,
                errorcode: 0,
                message: '任务删除成功',
                tasks: []
            };
        } catch (error) {
            return {
                success: false,
                errorcode: 500,
                message: error.message || '网络连接失败，请稍后重试',
                tasks: []
            };
        }
    }

    async toggleTaskStatus(userId, taskId) {
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

        try {
            const url = `${this.endpoints.todoToggle}?user_id=${userId}&id=${taskId}`;
            const data = await this.apiClient.request(url, { method: 'PATCH' });

            if (data.success) {
                return {
                    success: true,
                    errorcode: 0,
                    message: '任务状态切换成功',
                    tasks: [data.data]
                };
            } else {
                return {
                    success: false,
                    errorcode: 400,
                    message: data.error?.message || '任务状态切换失败',
                    tasks: []
                };
            }
        } catch (error) {
            return {
                success: false,
                errorcode: 500,
                message: error.message || '网络连接失败，请稍后重试',
                tasks: []
            };
        }
    }

    async incrementTomatoes(userId, taskId) {
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

        try {
            const url = `${this.endpoints.todoPomo}?user_id=${userId}&id=${taskId}`;
            const result = await this.apiClient.request(url, { method: 'POST' });

            if (result.success) {
                return {
                    success: true,
                    errorcode: 0,
                    message: '番茄钟计数增加成功',
                    tasks: [result.data]
                };
            } else {
                return {
                    success: false,
                    errorcode: 400,
                    message: result.error?.message || '番茄钟计数增加失败',
                    tasks: []
                };
            }
        } catch (error) {
            return {
                success: false,
                errorcode: 500,
                message: error.message || '网络连接失败，请稍后重试',
                tasks: []
            };
        }
    }
}

const todoService = new TodoService();
