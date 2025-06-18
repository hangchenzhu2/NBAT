// NBA新闻网站前端脚本
class NBANewsApp {
    constructor() {
        this.newsData = [];
        this.isLoading = false;
        this.init();
    }

    // 初始化应用
    init() {
        this.bindEvents();
        this.loadNews();
        this.setupTabs();
        
        // 每5分钟自动刷新一次页面数据
        setInterval(() => {
            this.loadNews(false); // 静默刷新
        }, 5 * 60 * 1000);
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
        // 等待DOM完全加载
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

    // 从API加载新闻数据
    async loadNews(showLoader = true) {
        if (this.isLoading) return;
        
        try {
            if (showLoader) {
                this.showLoading(true);
            }
            
            console.log('🚀 开始加载NBA新闻...');
            
            // 首先尝试API调用
            try {
                console.log('📡 尝试API调用: /api/news');
                const response = await fetch('/api/news', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });
                
                console.log('📊 API响应状态:', response.status, response.statusText);
                console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ API响应数据:', result);
                    
                    if (result.success && result.data && result.data.length > 0) {
                        this.newsData = result.data;
                        this.renderNews();
                        this.updateStatus(this.newsData.length, result.timestamp);
                        console.log(`🎯 成功从API加载 ${this.newsData.length} 条新闻`);
                        
                        // 在页面顶部显示成功状态
                        this.showToast(`✅ 成功加载 ${this.newsData.length} 条真实NBA新闻`, 'success');
                        return;
                    } else {
                        console.warn('⚠️ API返回数据无效:', result);
                    }
                } else {
                    console.error('❌ API响应失败:', response.status, response.statusText);
                    const errorText = await response.text();
                    console.error('错误详情:', errorText);
                }
            } catch (apiError) {
                console.error('🔥 API调用异常:', apiError);
                console.error('错误堆栈:', apiError.stack);
            }
            
            // API失败时使用后备数据
            console.log('🔄 API失败，使用后备数据...');
            this.loadFallbackData();
            
        } catch (error) {
            console.error('💥 加载新闻时出错:', error);
            this.loadFallbackData();
        } finally {
            if (showLoader) {
                this.showLoading(false);
            }
        }
    }

    // 加载后备数据
    loadFallbackData() {
        console.log('📂 使用后备静态数据...');
        
        // 检查是否有全局数据
        if (window.NBA_NEWS_DATA) {
            const fallbackData = [];
            
            // 合并所有类型的数据
            if (window.NBA_NEWS_DATA.news) {
                fallbackData.push(...window.NBA_NEWS_DATA.news);
            }
            if (window.NBA_NEWS_DATA.scores) {
                fallbackData.push(...window.NBA_NEWS_DATA.scores);
            }
            if (window.NBA_NEWS_DATA.schedule) {
                fallbackData.push(...window.NBA_NEWS_DATA.schedule);
            }
            
            if (fallbackData.length > 0) {
                this.newsData = fallbackData;
                this.renderNews();
                this.updateStatus(this.newsData.length, new Date().toISOString());
                console.log(`📋 成功加载后备数据 ${this.newsData.length} 条`);
                
                // 显示后备数据警告
                this.showToast(`⚠️ API连接失败，显示后备数据 (${this.newsData.length}条)`, 'warning');
                return;
            }
        }
        
        // 如果没有后备数据，显示错误状态
        this.showError('Unable to load NBA news. Please check your connection and try again.');
    }

    // 手动刷新新闻
    async refreshNews() {
        if (this.isLoading) return;
        
        try {
            this.showLoading(true);
            console.log('手动刷新新闻...');
            
            // 首先尝试刷新API
            try {
                const response = await fetch('/api/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 15000
                });
                
                if (response.ok) {
                    const result = await response.json();
                    
                    if (result.success) {
                        // 刷新成功后重新加载数据
                        await this.loadNews(false);
                        this.showToast('News refreshed successfully!', 'success');
                        return;
                    }
                }
            } catch (refreshError) {
                console.warn('API刷新失败:', refreshError.message);
            }
            
            // API刷新失败时，重新加载后备数据
            this.loadFallbackData();
            this.showToast('Using cached data. Please try again later.', 'warning');
            
        } catch (error) {
            console.error('刷新新闻时出错:', error);
            this.showToast('Failed to refresh news. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 渲染新闻列表
    renderNews() {
        console.log('🎨 开始渲染新闻...');
        console.log('📊 当前newsData:', this.newsData);
        console.log('📈 数据条数:', this.newsData.length);
        
        // 显示前3条数据的标题用于调试
        if (this.newsData.length > 0) {
            console.log('🔍 前3条数据标题:');
            this.newsData.slice(0, 3).forEach((item, index) => {
                console.log(`  ${index + 1}. [${item.source}] ${item.title}`);
            });
        }
        
        const newsGrid = document.getElementById('newsGrid');
        const scoresGrid = document.getElementById('scoresGrid');
        const scheduleGrid = document.getElementById('scheduleGrid');
        const emptyState = document.getElementById('emptyState');
        
        console.log('🔍 DOM元素检查:');
        console.log('  newsGrid:', newsGrid ? '✅ 找到' : '❌ 未找到');
        console.log('  scoresGrid:', scoresGrid ? '✅ 找到' : '❌ 未找到');
        console.log('  scheduleGrid:', scheduleGrid ? '✅ 找到' : '❌ 未找到');
        
        if (!newsGrid) {
            console.error('❌ 找不到newsGrid元素，无法渲染');
            return;
        }
        
        // 清空现有内容
        newsGrid.innerHTML = '';
        if (scoresGrid) scoresGrid.innerHTML = '';
        if (scheduleGrid) scheduleGrid.innerHTML = '';
        
        console.log('🧹 已清空所有容器');
        
        if (this.newsData.length === 0) {
            console.log('⚠️ 没有数据可显示');
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
        
        console.log('📋 数据分类结果:');
        console.log(`  新闻: ${newsItems.length} 条`);
        console.log(`  比分: ${scoreItems.length} 条`);
        console.log(`  赛程: ${scheduleItems.length} 条`);
        
        // 渲染新闻卡片
        newsItems.forEach((article, index) => {
            console.log(`🃏 渲染新闻卡片 ${index + 1}: ${article.title.substring(0, 50)}...`);
            const card = this.createNewsCard(article);
            card.classList.add('fade-in');
            card.style.animationDelay = `${index * 0.1}s`;
            newsGrid.appendChild(card);
        });
        
        // 渲染比分卡片
        if (scoresGrid) {
            scoreItems.forEach((score, index) => {
                console.log(`🏆 渲染比分卡片 ${index + 1}: ${score.title.substring(0, 50)}...`);
                const card = this.createScoreCard(score);
                card.classList.add('fade-in');
                card.style.animationDelay = `${index * 0.1}s`;
                scoresGrid.appendChild(card);
            });
        }
        
        // 渲染赛程卡片
        if (scheduleGrid) {
            scheduleItems.forEach((game, index) => {
                console.log(`📅 渲染赛程卡片 ${index + 1}: ${game.title.substring(0, 50)}...`);
                const card = this.createScheduleCard(game);
                card.classList.add('fade-in');
                card.style.animationDelay = `${index * 0.1}s`;
                scheduleGrid.appendChild(card);
            });
        }
        
        console.log('✅ 新闻渲染完成!');
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
        
        // 解析比分信息 - 改进的正则表达式
        const scoreMatch = score.title.match(/(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+?)(?:\s*\((.+?)\))?$/);
        let team1 = '', team2 = '', score1 = '', score2 = '', gameInfo = '';
        
        if (scoreMatch && scoreMatch.length >= 5) {
            team1 = scoreMatch[1].trim();
            score1 = scoreMatch[2];
            score2 = scoreMatch[3];
            team2 = scoreMatch[4].trim();
            gameInfo = scoreMatch[5] || '';
        } else {
            // 如果正则匹配失败，尝试更简单的解析
            const simpleMatch = score.title.match(/(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+)/);
            if (simpleMatch) {
                team1 = simpleMatch[1].trim();
                score1 = simpleMatch[2];
                score2 = simpleMatch[3];
                team2 = simpleMatch[4].replace(/\s*\(.+?\)/, '').trim();
            } else {
                // 最后的备选方案
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
            // 在新标签页中打开链接
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    // 格式化日期显示
    formatDate(dateString) {
        if (!dateString || dateString === 'Recently') {
            return 'Recently';
        }
        
        // 尝试解析日期
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // 如果无法解析，返回原始字符串
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
                <button class="btn-primary" onclick="app.loadNews()">
                    <i class="fas fa-sync-alt"></i>
                    Try Again
                </button>
            `;
            emptyState.style.display = 'block';
        }
    }

    // 显示提示消息
    showToast(message, type = 'info') {
        // 创建提示元素
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
        
        // 显示动画
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
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
    console.log('NBA新闻应用初始化...');
    app = new NBANewsApp();
});

// 全局函数供HTML调用
function loadNews() {
    if (app) {
        app.loadNews();
    }
} 