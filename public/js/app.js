// Square LLM 虚拟伴侣机器人 - 前端应用增强版
class SquareCompanion {
    constructor() {
        this.chatHistory = [];
        this.isLoading = false;
        this.isDarkTheme = this.detectThemePreference();
        this.typingTimer = null;
        this.currentModel = localStorage.getItem('selectedModel') || 'gpt-4.1';
        this.initializeElements();
        this.bindEvents();
        this.setupInputHandlers();
        this.initializeTheme();
        this.initializeSettings();
    }

    initializeElements() {
        // 获取DOM元素
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.chatArea = document.getElementById('chatArea');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.charCount = document.getElementById('charCount');
        this.inputSuggestions = document.getElementById('inputSuggestions');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.sendProgress = document.getElementById('sendProgress');
        this.settingsModal = document.getElementById('settingsModal');
    }

    bindEvents() {
        // 发送按钮点击事件
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // 输入框事件
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 自动调整输入框高度和实时更新
        this.messageInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
            this.updateCharCount();
            this.updateSendButton();
            this.showInputSuggestions();
        });

        // 输入框焦点事件
        this.messageInput.addEventListener('focus', () => {
            this.showInputSuggestions();
        });

        this.messageInput.addEventListener('blur', () => {
            setTimeout(() => this.hideInputSuggestions(), 150);
        });

        // 窗口大小变化事件
        window.addEventListener('resize', () => {
            this.adjustTextareaHeight();
        });

        // 主题变化检测
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme-preference')) {
                this.isDarkTheme = e.matches;
                this.updateTheme();
            }
        });
    }

    setupInputHandlers() {
        // 初始化字符计数
        this.updateCharCount();
        this.updateSendButton();
    }

    // 主题相关方法
    detectThemePreference() {
        const saved = localStorage.getItem('theme-preference');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    initializeTheme() {
        this.updateTheme();
    }

    updateTheme() {
        if (this.isDarkTheme) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // 更新主题图标
        const themeIcon = document.querySelector('.header-button i.fa-moon, .header-button i.fa-sun');
        if (themeIcon) {
            themeIcon.className = this.isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        localStorage.setItem('theme-preference', this.isDarkTheme ? 'dark' : 'light');
        this.updateTheme();
    }

    adjustTextareaHeight() {
        const textarea = this.messageInput;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = newHeight + 'px';
    }

    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = count;
        
        // 颜色反馈
        if (count > 950) {
            this.charCount.style.color = 'var(--accent-red)';
        } else if (count > 800) {
            this.charCount.style.color = 'var(--accent-orange)';
        } else {
            this.charCount.style.color = 'var(--text-quaternary)';
        }
    }

    updateSendButton() {
        const hasContent = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasContent || this.isLoading;
        
        if (hasContent && !this.isLoading) {
            this.sendButton.style.opacity = '1';
            this.sendButton.style.cursor = 'pointer';
        } else {
            this.sendButton.style.opacity = '0.5';
            this.sendButton.style.cursor = 'not-allowed';
        }
    }

    showInputSuggestions() {
        const inputValue = this.messageInput.value.toLowerCase();
        if (inputValue.length > 0 && inputValue.length < 10) {
            this.inputSuggestions.classList.add('show');
        } else {
            this.hideInputSuggestions();
        }
    }

    hideInputSuggestions() {
        this.inputSuggestions.classList.remove('show');
    }

    showTypingIndicator() {
        this.typingIndicator.classList.add('show');
    }

    hideTypingIndicator() {
        this.typingIndicator.classList.remove('show');
    }

    async sendMessage(content = null) {
        const message = content || this.messageInput.value.trim();
        
        if (!message || this.isLoading) return;

        // 隐藏欢迎界面，显示聊天区域
        this.showChatArea();

        // 隐藏输入建议
        this.hideInputSuggestions();

        // 添加用户消息到界面
        this.addMessage(message, 'user');
        
        // 清空输入框
        if (!content) {
            this.messageInput.value = '';
            this.adjustTextareaHeight();
            this.updateCharCount();
            this.updateSendButton();
        }

        // 显示发送按钮旋转动画
        this.setLoadingState(true);
        this.showTypingIndicator();

        try {
            const response = await this.callSquareLLM(message);
            
            if (response.success) {
                // 添加AI回复到界面
                this.addMessage(response.message, 'assistant');
                
                // 更新聊天历史
                this.chatHistory.push(
                    { role: 'user', content: message },
                    { role: 'assistant', content: response.message }
                );
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            alert(error.message || '抱歉，我现在有些困扰，请稍后再试 😔');
        } finally {
            this.setLoadingState(false);
            this.hideTypingIndicator();
        }
    }

    async callSquareLLM(message) {
        // 添加发送进度动画
        this.sendButton.classList.add('sending');
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    history: this.chatHistory.slice(-10), // 保留最近10轮对话
                    model: this.currentModel,
                    personality: localStorage.getItem('customPersonality') || ''
                })
            });

            if (!response.ok) {
                throw new Error(`网络错误: ${response.status}`);
            }

            return await response.json();
        } finally {
            this.sendButton.classList.remove('sending');
        }
    }

    showChatArea() {
        if (this.welcomeScreen.style.display !== 'none') {
            // 添加淡出动画
            this.welcomeScreen.style.animation = 'fadeOut 0.3s ease-out forwards';
            
            setTimeout(() => {
                this.welcomeScreen.style.display = 'none';
                this.chatArea.classList.add('active');
                this.chatArea.style.animation = 'fadeInUp 0.5s ease-out';
            }, 300);
        }
    }

    addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const currentTime = new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // 添加头像
        const avatar = role === 'assistant' ? 
            '<div class="message-avatar"><i class="fas fa-robot"></i></div>' : 
            '<div class="message-avatar user-avatar"><i class="fas fa-user"></i></div>';

        messageDiv.innerHTML = `
            ${avatar}
            <div class="message-content">
                ${role === 'assistant' ? this.renderMarkdown(content) : this.escapeHtml(content)}
                <div class="message-time">${currentTime}</div>
            </div>
        `;

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // 添加消息气泡动画
        setTimeout(() => {
            messageDiv.style.animation = 'messageSlideIn 0.5s ease-out';
        }, 50);
    }

    formatMessage(content) {
        // 增强的文本格式化
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }

    renderMarkdown(content) {
        // 简单的markdown渲染器
        let html = content;
        
        // 代码块处理
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<div class="code-block">
                ${lang ? `<div class="code-header">${lang}</div>` : ''}
                <pre><code class="language-${lang || 'text'}">${this.escapeHtml(code.trim())}</code></pre>
            </div>`;
        });
        
        // 行内代码
        html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        
        // 加粗文本
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // 斜体文本
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');
        
        // 链接
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // 列表项
        html = html.replace(/^[-*+] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // 有序列表
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        
        // 换行处理
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.sendButton.classList.add('loading');
            this.sendButton.disabled = true;
        } else {
            this.sendButton.classList.remove('loading');
            this.updateSendButton();
        }
    }

    exportChat() {
        if (this.chatHistory.length === 0) {
            alert('暂无聊天记录可导出');
            return;
        }

        // 生成导出内容
        const exportData = {
            title: 'Square AI虚拟伴侣 - 聊天记录',
            exportTime: new Date().toLocaleString('zh-CN'),
            totalMessages: this.chatHistory.length,
            conversation: this.chatHistory.map((msg, index) => ({
                messageId: index + 1,
                timestamp: msg.timestamp,
                sender: msg.type === 'user' ? '我' : 'Square',
                content: msg.content
            }))
        };

        // 创建可读的文本格式
        let textContent = `${exportData.title}\n`;
        textContent += `导出时间: ${exportData.exportTime}\n`;
        textContent += `消息总数: ${exportData.totalMessages} 条\n`;
        textContent += `\n${'='.repeat(50)}\n\n`;

        exportData.conversation.forEach(msg => {
            textContent += `[${msg.timestamp}] ${msg.sender}:\n`;
            textContent += `${msg.content}\n\n`;
        });

        // 创建并下载文件
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        a.href = url;
        a.download = `Square聊天记录_${timestamp}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // 显示成功提示
        alert('聊天记录已成功导出！');
    }

    clearChatHistory() {
        // 显示确认对话框
        if (this.chatHistory.length > 0) {
            const confirmed = confirm('确定要重新开始对话吗？当前的聊天记录将被清除。');
            if (!confirmed) return;
        }

        // 清除聊天历史和界面
        this.chatHistory = [];
        this.messagesContainer.innerHTML = '';
        
        // 显示欢迎界面
        this.chatArea.classList.remove('active');
        this.welcomeScreen.style.display = 'flex';
        this.welcomeScreen.style.animation = 'fadeInUp 0.5s ease-out';
        
        // 清空输入框
        this.messageInput.value = '';
        this.adjustTextareaHeight();
        this.updateCharCount();
        this.updateSendButton();
        this.hideInputSuggestions();
    }

    initializeSettings() {
        // 初始化模型选择
        const modelRadios = document.querySelectorAll('input[name="model"]');
        modelRadios.forEach(radio => {
            if (radio.value === this.currentModel) {
                radio.checked = true;
            }
        });
        // 个性设定输入框
        const personalityInput = document.getElementById('personalityInput');
        if (personalityInput) {
            const savedPersonality = localStorage.getItem('customPersonality') || '';
            personalityInput.value = savedPersonality;
        }
    }

    openSettings() {
        this.settingsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeSettings() {
        this.settingsModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    saveSettings() {
        const selectedModel = document.querySelector('input[name="model"]:checked')?.value;
        if (selectedModel) {
            this.currentModel = selectedModel;
            localStorage.setItem('selectedModel', selectedModel);
            alert(`模型已切换至 ${this.getModelDisplayName(selectedModel)}`);
        }
        // 保存个性设定
        const personalityInput = document.getElementById('personalityInput');
        if (personalityInput) {
            localStorage.setItem('customPersonality', personalityInput.value.trim());
        }
        this.closeSettings();
    }

    getModelDisplayName(model) {
        const modelNames = {
            'gpt-4.1': 'GPT-4.1',
            'o4-mini': 'o4-mini',
            'gpt-4.1-mini': 'GPT-4.1 Mini'
        };
        return modelNames[model] || model;
    }
}

// 全局函数
function sendSuggestion(message) {
    if (window.squareApp) {
        window.squareApp.sendMessage(message);
    }
}

function applySuggestion(text) {
    if (window.squareApp) {
        window.squareApp.messageInput.value = text;
        window.squareApp.adjustTextareaHeight();
        window.squareApp.updateCharCount();
        window.squareApp.updateSendButton();
        window.squareApp.hideInputSuggestions();
        window.squareApp.messageInput.focus();
    }
}

function clearChat() {
    if (window.squareApp) {
        window.squareApp.clearChat();
    }
}

function toggleTheme() {
    if (window.squareApp) {
        window.squareApp.toggleTheme();
    }
}

// 添加消息样式
const messageStyles = document.createElement('style');
messageStyles.textContent = `
    .message {
        display: flex;
        margin-bottom: var(--spacing-lg);
        animation: messageSlideIn 0.5s ease-out;
        align-items: flex-start;
        gap: var(--spacing-sm);
    }

    .message.user {
        justify-content: flex-end;
    }

    .message.assistant {
        justify-content: flex-start;
    }

    .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-round);
        background: linear-gradient(135deg, var(--primary-blue), var(--accent-purple));
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        flex-shrink: 0;
        box-shadow: var(--shadow-card);
    }

    .message-avatar.user-avatar {
        background: linear-gradient(135deg, var(--accent-green), var(--primary-blue));
        order: 2;
    }

    .message.user .message-content {
        order: 1;
    }

    .message-content {
        max-width: 70%;
        padding: var(--spacing-md) var(--spacing-lg);
        border-radius: var(--radius-large);
        font-size: 16px;
        line-height: 1.5;
        position: relative;
        box-shadow: var(--shadow-card);
        word-wrap: break-word;
    }

    .message.user .message-content {
        background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark));
        color: white;
        border-bottom-right-radius: var(--radius-small);
    }

    .message.assistant .message-content {
        background-color: var(--background-elevated);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        border-bottom-left-radius: var(--radius-small);
    }

    .message-content code {
        background-color: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 14px;
    }

    .message.assistant .message-content code {
        background-color: var(--background-secondary);
    }

    .message-content a {
        color: inherit;
        text-decoration: underline;
        opacity: 0.8;
    }

    .message-content a:hover {
        opacity: 1;
    }

    .message-time {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        margin-top: var(--spacing-xs);
        text-align: right;
    }

    .message.assistant .message-time {
        color: var(--text-quaternary);
        text-align: left;
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(messageStyles);

// 全局函数
function sendSuggestion(message) {
    if (window.squareApp) {
        window.squareApp.messageInput.value = message;
        window.squareApp.sendMessage();
    }
}

function applySuggestion(message) {
    if (window.squareApp) {
        window.squareApp.messageInput.value = message;
        window.squareApp.adjustTextareaHeight();
        window.squareApp.updateCharCount();
        window.squareApp.updateSendButton();
        window.squareApp.messageInput.focus();
    }
}

function clearChat() {
    if (window.squareApp) {
        window.squareApp.clearChatHistory();
    }
}

function exportChatHistory() {
    if (window.squareApp) {
        window.squareApp.exportChat();
    }
}

function openSettings() {
    if (window.squareApp) {
        window.squareApp.openSettings();
    }
}

function closeSettings() {
    if (window.squareApp) {
        window.squareApp.closeSettings();
    }
}

function saveSettings() {
    if (window.squareApp) {
        window.squareApp.saveSettings();
    }
}

function toggleTheme() {
    if (window.squareApp) {
        window.squareApp.toggleTheme();
    }
}

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    window.squareApp = new SquareCompanion();
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K 清除对话
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearChat();
        }
        
        // Ctrl/Cmd + E 导出聊天记录
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportChatHistory();
        }
        
        // Escape 关闭错误提示
        if (e.key === 'Escape') {
            // 可以添加其他Escape键功能
        }
    });

    // 点击事件处理
    document.addEventListener('click', (e) => {
        // 点击事件处理逻辑
    });

    // 防止右键菜单（可选）
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
            return; // 允许在输入框中使用右键
        }
        // e.preventDefault(); // 取消注释以禁用右键菜单
    });

    // 应用加载完成提示
    console.log('🤖 Square虚拟伴侣已准备就绪！');
    console.log('🎨 Apple风格界面已加载');
    console.log('💡 快捷键: Ctrl/Cmd + K 重新开始对话');
    console.log('📁 快捷键: Ctrl/Cmd + E 导出聊天记录');
    console.log('🌙 支持自动暗色模式切换');
});
