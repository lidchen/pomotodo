class PomodoroApp {
    constructor() {
        this.FOCUS_DURATION = 5;
        this.BREAK_DURATION = 5;
        
        this.isRunning = false;
        this.isPaused = false;
        this.isFocusPhase = true;
        this.remainingTime = this.FOCUS_DURATION;
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        this.attachEvents();
        this.updateTimerDisplay();
        this.updatePhaseDisplay();
    }

    attachEvents() {
        const startPauseBtn = document.getElementById('start-pause-btn');
        const skipBtn = document.getElementById('skip-btn');
        const addTaskBtn = document.getElementById('add-task-btn');
        const cancelAddTask = document.getElementById('cancel-add-task');
        const confirmAddTask = document.getElementById('confirm-add-task');
        const modalOverlay = document.getElementById('modal-overlay');

        startPauseBtn.addEventListener('click', () => this.toggleTimer());
        skipBtn.addEventListener('click', () => this.skipPhase());
        addTaskBtn.addEventListener('click', () => this.showAddTaskModal());
        cancelAddTask.addEventListener('click', () => this.hideAddTaskModal());
        confirmAddTask.addEventListener('click', () => this.handleAddTask());
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                errorHandler.hideModal();
            }
        });

        document.getElementById('add-task-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-task-modal') {
                this.hideAddTaskModal();
            }
        });
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.isFocusPhase && !taskManager.getCurrentTask()) {
            errorHandler.showAlert('请先选择一个任务');
            return;
        }

        if (this.isFocusPhase && taskManager.getCurrentTask().completed) {
            errorHandler.showAlert('该任务已完成，无法启动番茄钟。请选择未完成的任务或创建新任务。');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.updateStartPauseButton();
        
        this.timerInterval = setInterval(() => {
            this.remainingTime--;
            this.updateTimerDisplay();
            
            if (this.remainingTime <= 0) {
                this.completePhase();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        this.isPaused = true;
        this.updateStartPauseButton();
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    async completePhase() {
        this.pauseTimer();
        
        if (this.isFocusPhase) {
            const currentTask = taskManager.getCurrentTask();
            if (currentTask) {
                await taskManager.incrementTomatoes(currentTask.id);
            }
            this.switchToBreak();
        } else {
            this.switchToFocus();
        }
    }

    skipPhase() {
        if (this.isRunning) {
            this.pauseTimer();
        }
        
        if (this.isFocusPhase) {
            this.switchToBreak();
        } else {
            this.switchToFocus();
        }
    }

    switchToBreak() {
        this.isFocusPhase = false;
        this.remainingTime = this.BREAK_DURATION;
        this.updatePhaseDisplay();
        this.updateTimerDisplay();
        this.updateStartPauseButton();
        this.updateBackground();
    }

    switchToFocus() {
        this.isFocusPhase = true;
        this.remainingTime = this.FOCUS_DURATION;
        this.updatePhaseDisplay();
        this.updateTimerDisplay();
        this.updateStartPauseButton();
        this.updateBackground();
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        const seconds = this.remainingTime;
        timerElement.textContent = `00:${seconds.toString().padStart(2, '0')}`;
    }

    updatePhaseDisplay() {
        const phaseLabel = document.getElementById('phase-label');
        phaseLabel.textContent = this.isFocusPhase ? '专注中' : '休息中';
        phaseLabel.className = `phase-label ${this.isFocusPhase ? 'focus' : 'break'}`;
    }

    updateStartPauseButton() {
        const btn = document.getElementById('start-pause-btn');
        
        if (this.isRunning) {
            btn.textContent = '暂停';
            btn.className = 'px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium transition-all duration-300';
        } else if (this.isPaused) {
            btn.textContent = this.isFocusPhase ? '继续专注' : '继续休息';
            btn.className = 'px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5';
        } else {
            btn.textContent = this.isFocusPhase ? '开始专注' : '开始休息';
            btn.className = 'px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5';
        }
    }

    updateBackground() {
        document.body.classList.remove('focus-mode', 'break-mode', 'reminder-mode');
        document.body.classList.add(this.isFocusPhase ? 'focus-mode' : 'break-mode');
    }

    showAddTaskModal() {
        const modal = document.getElementById('add-task-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.getElementById('new-task-title').focus();
    }

    hideAddTaskModal() {
        const modal = document.getElementById('add-task-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.getElementById('new-task-title').value = '';
    }

    async handleAddTask() {
        const titleInput = document.getElementById('new-task-title');
        const title = titleInput.value.trim();
        
        if (!title) {
            errorHandler.showAlert('请输入任务标题');
            return;
        }
        
        const success = await taskManager.createTask(title);
        if (success) {
            this.hideAddTaskModal();
        }
    }
}

const app = new PomodoroApp();
