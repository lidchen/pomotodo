class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentTaskId = null;
        this.userId = null;
    }

    init(userId) {
        this.userId = userId;
    }

    sortTasks(tasks) {
        const incomplete = tasks.filter(t => !t.completed);
        const completed = tasks.filter(t => t.completed);
        
        const sortByCreatedAt = (a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
        };
        
        incomplete.sort(sortByCreatedAt);
        completed.sort(sortByCreatedAt);
        
        return [...incomplete, ...completed];
    }

    async loadTasks() {
        try {
            const data = await todoService.loadTasks(this.userId);
            this.tasks = this.sortTasks(data.tasks || []);
            this.renderTasks();
            return this.tasks;
        } catch (error) {
            errorHandler.showAlert(error.message || 'failed to load tasks');
            return [];
        }
    }

    async createTask(title) {
        try {
            const data = await todoService.createTask(this.userId, title);
            if (data.success) {
                const newTask = data.tasks[0];
                this.tasks.push(newTask);
                this.tasks = this.sortTasks(this.tasks);
                this.renderTasks();
                return true;
            } else {
                errorHandler.showAlert(data.message || 'failed to create task');
                return false;
            }
        } catch (error) {
            errorHandler.showAlert(error.message);
            return false;
        }
    }

    async deleteTask(taskId) {
        try {
            const data = await todoService.deleteTask(this.userId, taskId);
            if (data.success) {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                if (this.currentTaskId === taskId) {
                    this.currentTaskId = null;
                    this.updateCurrentTaskDisplay();
                }
                this.renderTasks();
                return true;
            } else {
                errorHandler.showAlert(data.message || 'failed to delete task');
                return false;
            }
        } catch (error) {
            errorHandler.showAlert(error.message);
            return false;
        }
    }

    async toggleTaskStatus(taskId) {
        try {
            const data = await todoService.toggleTaskStatus(this.userId, taskId);
            if (data.success) {
                const updatedTask = data.tasks[0];
                this.tasks = this.tasks.map(t => t.id === taskId ? updatedTask : t);
                
                if (updatedTask.completed && this.currentTaskId === taskId) {
                    this.currentTaskId = null;
                    this.updateCurrentTaskDisplay();
                }
                
                this.renderTasks();
                return true;
            } else {
                errorHandler.showAlert(data.message || 'failed to toggle task status');
                return false;
            }
        } catch (error) {
            errorHandler.showAlert(error.message);
            return false;
        }
    }

    async incrementTomatoes(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.completed) {
            errorHandler.showAlert('The task is already completed, you cannot increment the tomato count.');
            return false;
        }

        try {
            const data = await todoService.incrementTomatoes(this.userId, taskId);
            if (data.success) {
                const updatedTask = data.tasks[0];
                this.tasks = this.tasks.map(t => t.id === taskId ? updatedTask : t);
                this.renderTasks();
                return true;
            } else {
                errorHandler.showAlert(data.message || 'failed to increment tomato count');
                return false;
            }
        } catch (error) {
            errorHandler.showAlert(error.message);
            return false;
        }
    }

    async updateTaskTitle(taskId, newTitle) {
        try {
            const data = await todoService.updateTaskTitle(this.userId, taskId, newTitle);
            if (data.success) {
                const updatedTask = data.tasks[0];
                this.tasks = this.tasks.map(t => t.id === taskId ? updatedTask : t);
                if (this.currentTaskId === taskId) {
                    this.updateCurrentTaskDisplay();
                }
                this.renderTasks();
                return true;
            } else {
                errorHandler.showAlert(data.message || 'failed to update task title');
                return false;
            }
        } catch (error) {
            errorHandler.showAlert(error.message);
            return false;
        }
    }

    async deleteCompletedTasks() {
        try {
            const data = await todoService.deleteCompletedTasks(this.userId);
            if (data.success) {
                if (this.currentTaskId) {
                    const currentTask = this.tasks.find(t => t.id === this.currentTaskId);
                    if (currentTask && currentTask.completed) {
                        this.currentTaskId = null;
                        this.updateCurrentTaskDisplay();
                    }
                }
                this.tasks = this.tasks.filter(t => !t.completed);
                this.renderTasks();
                return true;
            } else {
                errorHandler.showAlert(data.message || 'failed to delete completed tasks');
                return false;
            }
        } catch (error) {
            errorHandler.showAlert(error.message);
            return false;
        }
    }

    selectTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.completed) {
            errorHandler.showAlert('The task is already completed, you cannot select it. Please choose an incomplete task or create a new one.');
            return;
        }
        this.currentTaskId = taskId;
        this.updateCurrentTaskDisplay();
        this.renderTasks();
    }

    getCurrentTask() {
        return this.tasks.find(t => t.id === this.currentTaskId);
    }

    updateCurrentTaskDisplay() {
        const currentTaskTitle = document.getElementById('current-task-title');
        const task = this.getCurrentTask();
        if (task) {
            currentTaskTitle.textContent = task.title;
        } else {
            currentTaskTitle.textContent = 'Select or create a task to start focusing';
        }
    }

    renderTasks() {
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');
        const deleteCompletedBtn = document.getElementById('delete-completed-btn');

        if (this.tasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.classList.remove('hidden');
            if (deleteCompletedBtn) {
                deleteCompletedBtn.disabled = true;
            }
            return;
        }

        emptyState.classList.add('hidden');
        if (deleteCompletedBtn) {
            deleteCompletedBtn.disabled = !this.tasks.some(t => t.completed);
        }

        taskList.innerHTML = this.tasks.map(task => this.createTaskElement(task)).join('');

        this.tasks.forEach(task => {
            this.attachTaskEvents(task);
        });
    }

    createTaskElement(task) {
        const isSelected = task.id === this.currentTaskId;
        const statusClass = task.completed ? 'completed' : (isSelected ? 'in-progress' : 'not-started');
        const cursorClass = task.completed ? 'cursor-not-allowed' : 'cursor-pointer';
        
        return `
            <div class="task-item ${statusClass} bg-gray-50 rounded-xl p-4 ${cursorClass}" data-task-id="${task.id}">
                <div class="flex items-start gap-3">
                    <button class="task-checkbox flex-shrink-0 w-6 h-6 rounded-full border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-amber-500'} flex items-center justify-center transition-all duration-300" data-task-id="${task.id}">
                        ${task.completed ? '<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : ''}
                    </button>
                    <div class="flex-1 min-w-0">
                        <div class="task-title ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'} font-medium break-words">
                            ${this.escapeHtml(task.title)}
                        </div>
                        <div class="flex items-center gap-4 mt-2">
                            <span class="text-sm text-gray-400 flex items-center gap-1">
                                🍅 ${task.pomo_count}
                            </span>
                            ${task.completed ? '<span class="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Completed</span>' : ''}
                            <button class="task-edit-btn text-sm text-gray-400 hover:text-amber-500 transition-colors duration-300" data-task-id="${task.id}">
                                Edit
                            </button>
                            <button class="task-delete-btn text-sm text-gray-400 hover:text-red-500 transition-colors duration-300" data-task-id="${task.id}">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachTaskEvents(task) {
        const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
        if (!taskElement) return;

        taskElement.addEventListener('click', (e) => {
            if (!e.target.closest('.task-checkbox') && 
                !e.target.closest('.task-delete-btn') &&
                !e.target.closest('.task-edit-btn')) {
                if (task.completed) {
                    errorHandler.showAlert('The task is already completed, you cannot select it. Please choose an incomplete task or create a new one.');
                } else {
                    this.selectTask(task.id);
                }
            }
        });

        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTaskStatus(task.id);
        });

        const editBtn = taskElement.querySelector('.task-edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEditTaskModal(task);
            });
        }

        const deleteBtn = taskElement.querySelector('.task-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            errorHandler.showConfirm('Are you sure you want to delete this task?', () => {
                this.deleteTask(task.id);
            });
        });
    }

    showEditTaskModal(task) {
        const modal = document.getElementById('edit-task-modal');
        const titleInput = document.getElementById('edit-task-title');
        titleInput.value = task.title;
        titleInput.dataset.taskId = task.id;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        titleInput.focus();
    }

    hideEditTaskModal() {
        const modal = document.getElementById('edit-task-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    async handleEditTask() {
        const titleInput = document.getElementById('edit-task-title');
        const taskId = parseInt(titleInput.dataset.taskId);
        const newTitle = titleInput.value.trim();
        
        if (!newTitle) {
            errorHandler.showAlert('Please enter a task title');
            return;
        }
        
        const success = await this.updateTaskTitle(taskId, newTitle);
        if (success) {
            this.hideEditTaskModal();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const taskManager = new TaskManager();
