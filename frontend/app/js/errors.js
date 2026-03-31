class ErrorHandler {
    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.remove('hidden');
            setTimeout(() => {
                element.classList.add('hidden');
            }, 3000);
        }
    }

    clearError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }

    showAlert(message, type = 'info') {
        this.showModal('提示', message, [{
            text: '确定',
            class: 'bg-amber-500 hover:bg-amber-600 text-white'
        }]);
    }

    showModal(title, content, buttons) {
        const overlay = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        const modalButtons = document.getElementById('modal-buttons');

        modalTitle.textContent = title;
        modalContent.innerHTML = typeof content === 'string' ? `<p class="text-gray-600">${content}</p>` : '';
        
        modalButtons.innerHTML = '';
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.className = `px-6 py-2 rounded-full font-medium transition-all duration-300 ${btn.class}`;
            button.onclick = () => {
                this.hideModal();
                if (btn.onClick) btn.onClick();
            };
            modalButtons.appendChild(button);
        });

        overlay.classList.add('show');
    }

    hideModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('show');
    }

    showConfirm(message, onConfirm, onCancel) {
        this.showModal('确认', message, [
            {
                text: '取消',
                class: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
                onClick: onCancel
            },
            {
                text: '确定',
                class: 'bg-amber-500 hover:bg-amber-600 text-white',
                onClick: onConfirm
            }
        ]);
    }
}

const errorHandler = new ErrorHandler();
