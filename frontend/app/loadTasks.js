const LOAD_TASKS_BASE_URL = 'http://localhost:3002/api';

/**
 * 加载任务服务 - 适配后端API
 * 修改记录：
 * - 2026-03-28: 修改API端点从 /api/tasks/:userId 到 /api/todos
 * - 2026-03-28: 修改参数传递方式从路径参数到查询参数
 * - 2026-03-28: 修改响应格式适配后端 { success, data } 结构
 */
class LoadTasksService {
    constructor() {
        this.baseUrl = LOAD_TASKS_BASE_URL;
    }

    async loadTasks(userId) {
        if (userId === null || userId === undefined) {
            return Promise.reject(new Error('用户ID不能为空'));
        }

        if (typeof userId !== 'number' || !Number.isInteger(userId)) {
            return Promise.reject(new Error('用户ID必须为整数'));
        }

        if (userId <= 0) {
            return Promise.reject(new Error('用户ID必须为正整数'));
        }

        try {
            // 修改：使用查询参数 user_id，端点改为 /todos
            const response = await fetch(`${this.baseUrl}/todos?user_id=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            // 修改：适配后端响应格式 { success, data }
            if (data.success) {
                return {
                    errorcode: 0,
                    tasks: data.data || []
                };
            } else {
                return Promise.reject(new Error(data.error?.message || '加载任务失败'));
            }

        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                return Promise.reject(new Error('无法连接到服务器，请确保后端服务已启动'));
            }
            return Promise.reject(error);
        }
    }
}

const loadTasksService = new LoadTasksService();
