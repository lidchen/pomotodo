class TodoService {
    constructor() {
        this.apiClient = apiClient;
        this.endpoints = API_CONFIG.endpoints;
    }

    validateUserId(userId) {
        if (userId === null || userId === undefined || typeof userId !== 'number' || !Number.isInteger(userId)) {
            return { isValid: false, error: 'The user ID must be an integer' };
        }
        if (userId <= 0) {
            return { isValid: false, error: 'The user ID must be a positive integer' };
        }
        return { isValid: true, error: null };
    }

    validateTaskId(taskId) {
        if (taskId === null || taskId === undefined || typeof taskId !== 'number' || !Number.isInteger(taskId)) {
            return { isValid: false, error: 'The task ID must be an integer' };
        }
        if (taskId <= 0) {
            return { isValid: false, error: 'The task ID must be a positive integer' };
        }
        return { isValid: true, error: null };
    }

    validateTitle(title) {
        if (!title || typeof title !== 'string') {
            return { isValid: false, error: 'The title cannot be empty' };
        }
        if (title.trim().length === 0) {
            return { isValid: false, error: 'The title cannot contain only whitespace characters' };
        }
        if (title.length > 255) {
            return { isValid: false, error: 'The title must not exceed 255 characters' };
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
                return Promise.reject(new Error(data.error?.message || 'Failed to load tasks'));
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
                    message: 'Task created successfully',
                    tasks: [data.data]
                };
            } else {
                return {
                    success: false,
                    errorcode: 400,
                    message: data.error?.message || 'Failed to create task',
                    tasks: []
                };
            }
        } catch (error) {
            return {
                success: false,
                errorcode: 500,
                message: error.message || 'Failed to connect to server, please ensure the backend service is running',
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
                message: 'Task deleted successfully',
                tasks: []
            };
        } catch (error) {
            return {
                success: false,
                errorcode: 500,
                message: error.message || 'Failed to connect to server, please ensure the backend service is running',
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
                    message: 'Task status toggled successfully',
                    tasks: [data.data]
                };
            } else {
                return {
                    success: false,
                    errorcode: 400,
                    message: data.error?.message || 'Failed to toggle task status',
                    tasks: []
                };
            }
        } catch (error) {
            return {
                success: false,
                errorcode: 500,
                message: error.message || 'Failed to connect to server, please ensure the backend service is running',
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
                    message: 'Pomodoro count incremented successfully',
                    tasks: [result.data]
                };
            } else {
                return {
                    success: false,
                    errorcode: 400,
                    message: result.error?.message || 'Failed to increment pomodoro count',
                    tasks: []
                };
            }
        } catch (error) {
            return {
                success: false,
                errorcode: 500,
                message: error.message || 'Failed to connect to server, please ensure the backend service is running',
                tasks: []
            };
        }
    }
}

const todoService = new TodoService();
