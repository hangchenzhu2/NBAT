// NBA新闻网站前端脚本 - Netlify版本
class NBANewsApp {
    constructor() {
        this.newsData = [];
        this.isLoading = false;
        this.init();
    }

    // 初始化应用
    init() {
        this.bindEvents();
        this.setupTabs();
        this.loadStaticData();
    }

    // 绑定事件监听器
    bindEvents() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshNews());
        }
    }

    // 设置标签页功能
    setupTabs() {
        setTimeout(() => {
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            
            console.log(`找到 ${tabBtns.length} 个标签按钮, ${tabContents.length} 个内容区域`);
            
            tabBtns.forEach((btn, index) => {
                console.log(`绑定标签 ${index + 1}: ${btn.dataset.tab}`);
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetTab = btn.dataset.tab;
                    console.log(`点击标签: ${targetTab}`);
                    
                    // 移除所有active类
                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    // 激活当前标签
                    btn.classList.add('active');
                    const targetContent = document.getElementById(`${targetTab}-content`);
                    if (targetContent) {
                        targetContent.classList.add('active');
                        console.log(`成功切换到标签: ${targetTab}`);
                    } else {
                        console.error(`未找到内容区域: ${targetTab}-content`);
                    }
                });
            });
        }, 100);
    }

    // 加载静态数据
    loadStaticData() {
        console.log('加载静态NBA数据...');
        
        if (window.NBA_NEWS_DATA) {
            // 合并所有数据
            this.newsData = [
                ...window.NBA_NEWS_DATA.news,
                ...window.NBA_NEWS_DATA.scores,
                ...window.NBA_NEWS_DATA.schedule
            ];
            
            this.renderNews();
            this.updateStatus(this.newsData.length, new Date().toISOString());
            console.log(`成功加载 ${this.newsData.length} 条数据`);
        } else {
            console.error('NBA_NEWS_DATA 未找到');
            this.showError('Failed to load NBA data.');
        }
    }

    // 手动刷新数据（静态版本）
    refreshNews() {
        console.log('刷新静态数据...');
        this.showLoading(true);
        
        // 模拟API调用延迟
        setTimeout(() => {
            this.loadStaticData();
            this.showLoading(false);
            this.showToast('News refreshed successfully!', 'success');
        }, 1000);
    }

    // 显示加载状态
    showLoading(show = true) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            if (show) {
                loadingIndicator.classList.remove('hidden');
            } else {
                loadingIndicator.classList.add('hidden');
            }
        }
        this.isLoading = show;
    }

    // 更新状态信息
    updateStatus(count, timestamp) {
        const newsCount = document.getElementById('newsCount');
        const lastUpdate = document.getElementById('lastUpdate');
        
        if (newsCount) {
            newsCount.textContent = `${count} articles loaded`;
        }
        
        if (lastUpdate && timestamp) {
            const date = new Date(timestamp);
            lastUpdate.textContent = `Last updated: ${date.toLocaleTimeString()}`;
        }
    }

    // 渲染新闻列表
    renderNews() {
        const newsGrid = document.getElementById('newsGrid');
        const scoresGrid = document.getElementById('scoresGrid');
        const scheduleGrid = document.getElementById('scheduleGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!newsGrid) return;
        
        // 清空现有内容
        newsGrid.innerHTML = '';
        if (scoresGrid) scoresGrid.innerHTML = '';
        if (scheduleGrid) scheduleGrid.innerHTML = '';
        
        if (this.newsData.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        // 分类数据
        const newsItems = this.newsData.filter(item => !item.type || item.type === 'news');
        const scoreItems = this.newsData.filter(item => item.type === 'score');
        const scheduleItems = this.newsData.filter(item => item.type === 'schedule');
        
        // 渲染新闻卡片
        newsItems.forEach((article, index) => {
            const card = this.createNewsCard(article);
            card.classList.add('fade-in');
            card.style.animationDelay = `${index * 0.1}s`;
            newsGrid.appendChild(card);
        });
        
        // 渲染比分卡片
        if (scoresGrid) {
            scoreItems.forEach((score, index) => {
                const card = this.createScoreCard(score);
                card.classList.add('fade-in');
                card.style.animationDelay = `${index * 0.1}s`;
                scoresGrid.appendChild(card);
            });
        }
        
        // 渲染赛程卡片
        if (scheduleGrid) {
            scheduleItems.forEach((game, index) => {
                const card = this.createScheduleCard(game);
                card.classList.add('fade-in');
                card.style.animationDelay = `${index * 0.1}s`;
                scheduleGrid.appendChild(card);
            });
        }
    }

    // 创建新闻卡片DOM元素
    createNewsCard(article) {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.onclick = () => this.openArticle(article.link);
        
        // 处理标题长度
        const truncatedTitle = article.title.length > 100 
            ? article.title.substring(0, 100) + '...' 
            : article.title;
        
        // 格式化日期
        const formattedDate = this.formatDate(article.date);
        
        card.innerHTML = `
            <div class="news-card-header">
                <span class="news-source">${this.escapeHtml(article.source)}</span>
                <span class="news-date">${this.escapeHtml(formattedDate)}</span>
            </div>
            <h3 class="news-title">${this.escapeHtml(truncatedTitle)}</h3>
            <div class="news-footer">
                <span class="read-more">
                    Read Full Article
                    <i class="fas fa-arrow-right"></i>
                </span>
                <i class="fas fa-external-link-alt news-link-icon"></i>
            </div>
        `;
        
        return card;
    }

    // 创建比分卡片DOM元素
    createScoreCard(score) {
        const card = document.createElement('div');
        card.className = 'score-card';
        card.onclick = () => this.openArticle(score.link);
        
        // 解析比分信息
        const scoreMatch = score.title.match(/(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+?)(?:\s*\((.+?)\))?$/);
        let team1 = '', team2 = '', score1 = '', score2 = '', gameInfo = '';
        
        if (scoreMatch && scoreMatch.length >= 5) {
            team1 = scoreMatch[1].trim();
            score1 = scoreMatch[2];
            score2 = scoreMatch[3];
            team2 = scoreMatch[4].trim();
            gameInfo = scoreMatch[5] || '';
        } else {
            const simpleMatch = score.title.match(/(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+)/);
            if (simpleMatch) {
                team1 = simpleMatch[1].trim();
                score1 = simpleMatch[2];
                score2 = simpleMatch[3];
                team2 = simpleMatch[4].replace(/\s*\(.+?\)/, '').trim();
            } else {
                team1 = score.title;
                score1 = '--';
                score2 = '--';
                team2 = '';
            }
        }
        
        card.innerHTML = `
            <div class="score-header">
                <span class="game-status">FINAL${gameInfo ? ' - ' + this.escapeHtml(gameInfo) : ''}</span>
                <span class="game-date">${this.escapeHtml(score.date)}</span>
            </div>
            <div class="game-teams">${this.escapeHtml(team1)} vs ${this.escapeHtml(team2)}</div>
            <div class="game-score">${this.escapeHtml(score1)} - ${this.escapeHtml(score2)}</div>
        `;
        
        return card;
    }

    // 创建赛程卡片DOM元素
    createScheduleCard(game) {
        const card = document.createElement('div');
        card.className = 'schedule-card';
        card.onclick = () => this.openArticle(game.link);
        
        // 解析比赛信息
        const gameMatch = game.title.match(/(.+?)\s+vs\s+(.+?)\s*-\s*(.+)/);
        let team1 = '', team2 = '', gameTime = '';
        
        if (gameMatch) {
            team1 = gameMatch[1].trim();
            team2 = gameMatch[2].trim();
            gameTime = gameMatch[3].trim();
        } else {
            team1 = game.title;
            gameTime = game.date;
        }
        
        card.innerHTML = `
            <div class="schedule-header">
                <span class="game-status">UPCOMING</span>
                <span class="game-date">${this.escapeHtml(game.date)}</span>
            </div>
            <div class="game-teams">${this.escapeHtml(team1)} vs ${this.escapeHtml(team2)}</div>
            <div class="game-time">${this.escapeHtml(gameTime)}</div>
        `;
        
        return card;
    }

    // 打开文章链接
    openArticle(url) {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    // 格式化日期显示
    formatDate(dateString) {
        if (!dateString || dateString === 'Recently') {
            return 'Recently';
        }
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else {
                return date.toLocaleDateString();
            }
        } catch (error) {
            return dateString;
        }
    }

    // HTML转义防止XSS攻击
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 显示错误信息
    showError(message) {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading News</h3>
                <p>${this.escapeHtml(message)}</p>
                <button class="btn-primary" onclick="app.loadStaticData()">
                    <i class="fas fa-sync-alt"></i>
                    Try Again
                </button>
            `;
            emptyState.style.display = 'block';
        }
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('NBA新闻应用初始化 - Netlify版本...');
    app = new NBANewsApp();
});

// 全局函数供HTML调用
function loadNews() {
    if (app) {
        app.loadStaticData();
    }
} 