class AuthManager {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        this.checkSession();
        this.attachEvents();
    }

    checkSession() {
        const savedUser = localStorage.getItem('pomotodo_user');
        if (savedUser) {
            try {
                this.user = JSON.parse(savedUser);
                this.showMainApp();
            } catch (e) {
                localStorage.removeItem('pomotodo_user');
            }
        }
    }

    saveSession(user) {
        this.user = user;
        localStorage.setItem('pomotodo_user', JSON.stringify(user));
    }

    clearSession() {
        this.user = null;
        localStorage.removeItem('pomotodo_user');
    }

    attachEvents() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authSwitchBtn = document.getElementById('auth-switch-btn');
        const logoutBtn = document.getElementById('logout-btn');

        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        authSwitchBtn.addEventListener('click', () => this.switchAuthForm());
        logoutBtn.addEventListener('click', () => this.logout());
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        this.clearAllErrors();
        
        if (!username) {
            errorHandler.showError('login-username-error', 'enter one user name');
            return;
        }
        
        if (!password) {
            errorHandler.showError('login-password-error', 'enter your password');
            return;
        }
        
        const loginBtn = document.getElementById('login-btn');
        const loginBtnText = document.getElementById('login-btn-text');
        const loginBtnLoading = document.getElementById('login-btn-loading');
        
        loginBtn.disabled = true;
        loginBtnText.classList.add('hidden');
        loginBtnLoading.classList.remove('hidden');
        
        try {
            const data = await authService.login(username, password);
            
            if (data.success) {
                this.saveSession({ id: data.id, username: data.username });
                this.showMainApp();
            } else {
                document.getElementById('login-error-text').textContent = data.message || 'Login failed';
                document.getElementById('login-error').classList.remove('hidden');
            }
        } catch (error) {
            document.getElementById('login-error-text').textContent = error.message;
            document.getElementById('login-error').classList.remove('hidden');
        } finally {
            loginBtn.disabled = false;
            loginBtnText.classList.remove('hidden');
            loginBtnLoading.classList.add('hidden');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        this.clearAllErrors();
        
        if (!username) {
            errorHandler.showError('register-username-error', 'please enter a user name');
            return;
        }
        
        if (username.length < 4 || username.length > 20) {
            errorHandler.showError('register-username-error', 'Username must be between 4 and 20 characters');
            return;
        }
        
        if (!password) {
            errorHandler.showError('register-password-error', 'please enter a password');
            return;
        }
        
        if (password.length < 6) {
            errorHandler.showError('register-password-error', 'Password must be at least 6 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            errorHandler.showError('register-confirm-password-error', 'The passwords you entered do not match');
            return;
        }
        
        const registerBtn = document.getElementById('register-btn');
        const registerBtnText = document.getElementById('register-btn-text');
        const registerBtnLoading = document.getElementById('register-btn-loading');
        
        registerBtn.disabled = true;
        registerBtnText.classList.add('hidden');
        registerBtnLoading.classList.remove('hidden');
        
        try {
            const data = await authService.register(username, password);
            
            if (data.success) {
                this.saveSession({ id: data.id, username: data.username });
                this.showMainApp();
            } else {
                document.getElementById('register-error-text').textContent = data.message || 'Registration failed';
                document.getElementById('register-error').classList.remove('hidden');
            }
        } catch (error) {
            document.getElementById('register-error-text').textContent = error.message;
            document.getElementById('register-error').classList.remove('hidden');
        } finally {
            registerBtn.disabled = false;
            registerBtnText.classList.remove('hidden');
            registerBtnLoading.classList.add('hidden');
        }
    }

    switchAuthForm() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authSwitchText = document.getElementById('auth-switch-text');
        const authSwitchBtnText = document.getElementById('auth-switch-btn-text');
        
        this.clearAllErrors();
        
        loginForm.classList.toggle('hidden');
        registerForm.classList.toggle('hidden');
        
        if (loginForm.classList.contains('hidden')) {
            authSwitchText.textContent = 'Already have an account?';
            authSwitchBtnText.textContent = 'Sign in now';
        } else {
            authSwitchText.textContent = 'no account yet?';
            authSwitchBtnText.textContent = 'Sign up now';
        }
    }

    logout() {
        this.clearSession();
        this.showAuthForm();
        this.resetForms();
    }

    showMainApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        taskManager.init(this.user.id);
        taskManager.loadTasks();
    }

    showAuthForm() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    clearAllErrors() {
        errorHandler.clearError('login-username-error');
        errorHandler.clearError('login-password-error');
        errorHandler.clearError('login-error');
        errorHandler.clearError('register-username-error');
        errorHandler.clearError('register-password-error');
        errorHandler.clearError('register-confirm-password-error');
        errorHandler.clearError('register-error');
    }

    resetForms() {
        document.getElementById('login-form').reset();
        document.getElementById('register-form').reset();
        
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authSwitchText = document.getElementById('auth-switch-text');
        const authSwitchBtnText = document.getElementById('auth-switch-btn-text');
        
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authSwitchText.textContent = 'no account yet?';
        authSwitchBtnText.textContent = 'Sign up now';
    }

    getUser() {
        return this.user;
    }
}

const authManager = new AuthManager();
