const axios = require('axios');
const cheerio = require('cheerio');

// NBA新闻和数据抓取类
class NBAScraper {
  constructor() {
    // NBA官方API和RSS源
    this.dataSources = {
      // 免费的NBA数据API
      news: [
        {
          name: 'NBA RSS',
          url: 'https://feeds.nbcsnews.com/rss-feeds/',
          type: 'rss'
        },
        {
          name: 'ESPN NBA',
          url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news',
          type: 'api'
        }
      ],
      // NBA比分数据
      scores: {
        name: 'NBA Scores API',
        url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
        type: 'api'
      },
      // NBA赛程数据
      schedule: {
        name: 'NBA Schedule API',
        url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=',
        type: 'api'
      }
    };
  }

  // 获取NBA新闻数据
  async fetchNBANews() {
    try {
      console.log('正在获取NBA新闻...');
      
      // 并行获取ESPN和NBA官网新闻
      const [espnNews, nbaNews] = await Promise.all([
        this.fetchESPNNews(),
        this.fetchNBAOfficialNews()
      ]);
      
      // 合并新闻数据，ESPN在前，NBA官网在后
      const allNews = [...espnNews, ...nbaNews];
      console.log(`成功获取 ${allNews.length} 条NBA新闻`);
      return allNews.slice(0, 12); // 最多返回12条新闻
      
    } catch (error) {
      console.error('获取NBA新闻失败:', error.message);
      return [];
    }
  }

  // 获取ESPN新闻
  async fetchESPNNews() {
    try {
      const response = await axios.get(this.dataSources.news[1].url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      if (response.data && response.data.articles) {
        const articles = response.data.articles.slice(0, 6).map(article => ({
          title: article.headline || article.title,
          link: article.links?.web?.href || '#',
          date: this.formatDate(article.published),
          source: 'ESPN NBA',
          timestamp: new Date().toISOString(),
          type: 'news'
        }));
        
        return articles;
      }
      
      return [];
    } catch (error) {
      console.error('获取ESPN NBA新闻失败:', error.message);
      return [];
    }
  }

  // 获取NBA官网新闻
  async fetchNBAOfficialNews() {
    try {
      const response = await axios.get('https://www.nba.com/news/category/top-stories', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const articles = [];
      
      // 抓取新闻标题和链接
      $('article, .story-card, .ContentCard, .news-item, h3 a, h2 a').each((index, element) => {
        if (index >= 6) return false; // 最多获取6条新闻
        
        const $el = $(element);
        let title, link;
        
        if ($el.is('article')) {
          // 如果是article元素
          title = $el.find('h1, h2, h3, h4, .title, .headline').first().text().trim();
          link = $el.find('a').first().attr('href');
        } else if ($el.is('a')) {
          // 如果是链接元素
          title = $el.text().trim();
          link = $el.attr('href');
        } else {
          // 其他情况
          title = $el.find('h1, h2, h3, h4, .title, .headline, a').first().text().trim();
          link = $el.find('a').first().attr('href') || $el.closest('a').attr('href');
        }
        
        if (title && title.length > 10) {
          // 确保链接是完整的URL
          if (link && !link.startsWith('http')) {
            link = link.startsWith('/') ? `https://www.nba.com${link}` : `https://www.nba.com/${link}`;
          }
          
          articles.push({
            title: title,
            link: link || 'https://www.nba.com/news/category/top-stories',
            date: this.formatDate(new Date().toISOString()),
            source: 'NBA Official',
            timestamp: new Date().toISOString(),
            type: 'news'
          });
        }
      });
      
      // 如果上面的选择器没有找到足够的新闻，尝试更通用的选择器
      if (articles.length < 3) {
        $('h1, h2, h3, h4').each((index, element) => {
          if (articles.length >= 6) return false;
          
          const $el = $(element);
          const title = $el.text().trim();
          const link = $el.find('a').attr('href') || $el.closest('a').attr('href');
          
          if (title && title.length > 15 && title.length < 150) {
            let fullLink = link;
            if (link && !link.startsWith('http')) {
              fullLink = link.startsWith('/') ? `https://www.nba.com${link}` : `https://www.nba.com/${link}`;
            }
            
            articles.push({
              title: title,
              link: fullLink || 'https://www.nba.com/news/category/top-stories',
              date: this.formatDate(new Date().toISOString()),
              source: 'NBA Official',
              timestamp: new Date().toISOString(),
              type: 'news'
            });
          }
        });
      }
      
      return articles;
    } catch (error) {
      console.error('获取NBA官网新闻失败:', error.message);
      return [];
    }
  }

  // 获取NBA比分数据
  async fetchNBAScores() {
    try {
      console.log('正在获取NBA比分...');
      
      // 获取过去3天的比分
      const dates = this.getPastDates(3);
      const allScores = [];
      
      for (const date of dates) {
        const url = `${this.dataSources.scores.url}?dates=${date}`;
        
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json'
            },
            timeout: 10000
          });

          if (response.data && response.data.events) {
            const scores = response.data.events
              .filter(event => event.status?.type?.completed)
              .slice(0, 5)
              .map(event => {
                const homeTeam = event.competitions[0].competitors.find(c => c.homeAway === 'home');
                const awayTeam = event.competitions[0].competitors.find(c => c.homeAway === 'away');
                
                return {
                  title: `${awayTeam.team.displayName} ${awayTeam.score} - ${homeTeam.score} ${homeTeam.team.displayName}`,
                  link: event.links?.[0]?.href || '#',
                  date: this.formatDate(event.date),  
                  source: 'NBA Scores',
                  timestamp: new Date().toISOString(),
                  type: 'score'
                };
              });
            
            allScores.push(...scores);
          }
        } catch (dateError) {
          console.error(`获取 ${date} 比分失败:`, dateError.message);
        }
      }
      
      console.log(`成功获取 ${allScores.length} 条比分数据`);
      return allScores.slice(0, 8); // 最多返回8条比分
      
    } catch (error) {
      console.error('获取NBA比分失败:', error.message);
      return [];
    }
  }

  // 获取NBA赛程数据
  async fetchNBASchedule() {
    try {
      console.log('正在获取NBA赛程...');
      
      // 获取未来3天的赛程
      const dates = this.getFutureDates(3);
      const allGames = [];
      
      for (const date of dates) {
        const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`;
        
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json'
            },
            timeout: 10000
          });

          if (response.data && response.data.events) {
            const games = response.data.events
              .filter(event => !event.status?.type?.completed)
              .slice(0, 5)
              .map(event => {
                const homeTeam = event.competitions[0].competitors.find(c => c.homeAway === 'home');
                const awayTeam = event.competitions[0].competitors.find(c => c.homeAway === 'away');
                const gameTime = new Date(event.date).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZone: 'America/New_York'
                });
                
                return {
                  title: `${awayTeam.team.displayName} vs ${homeTeam.team.displayName} - ${gameTime} ET`,
                  link: event.links?.[0]?.href || '#',
                  date: this.formatDate(event.date),
                  source: 'NBA Schedule',
                  timestamp: new Date().toISOString(),
                  type: 'schedule'
                };
              });
            
            allGames.push(...games);
          }
        } catch (dateError) {
          console.error(`获取 ${date} 赛程失败:`, dateError.message);
        }
      }
      
      console.log(`成功获取 ${allGames.length} 条赛程数据`);
      return allGames.slice(0, 6); // 最多返回6条赛程
      
    } catch (error) {
      console.error('获取NBA赛程失败:', error.message);
      return [];
    }
  }

  // 获取过去几天的日期
  getPastDates(days) {
    const dates = [];
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0].replace(/-/g, ''));
    }
    return dates;
  }

  // 获取未来几天的日期
  getFutureDates(days) {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0].replace(/-/g, ''));
    }
    return dates;
  }

  // 格式化日期
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return date < now ? 'Yesterday' : 'Tomorrow';
      } else if (diffDays < 7) {
        return `${diffDays} days ${date < now ? 'ago' : 'away'}`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return dateString || 'Recently';
    }
  }

  // 生成增强的模拟数据（作为备选方案）
  generateEnhancedMockData() {
    console.log('使用增强的模拟数据...');
    const today = new Date();
    
    return [
      // 新闻数据
      {
        title: 'LeBron James reaches 40,000 career points milestone in Lakers victory',
        link: 'https://www.nba.com/news',
        date: 'Today',
        source: 'NBA Official',
        timestamp: new Date().toISOString(),
        type: 'news'
      },
      {
        title: 'Nikola Jokic records triple-double as Nuggets defeat Warriors 118-108',
        link: 'https://www.nba.com/news',
        date: 'Yesterday',
        source: 'NBA Official',
        timestamp: new Date().toISOString(),
        type: 'news'
      },
      {
        title: 'NBA Trade Deadline: Latest rumors and potential moves to watch',
        link: 'https://www.nba.com/news',
        date: '2 days ago',
        source: 'ESPN NBA',
        timestamp: new Date().toISOString(),
        type: 'news'
      },
      // 比分数据
      {
        title: 'Los Angeles Lakers 128 - 115 Golden State Warriors',
        link: 'https://www.nba.com/games',
        date: 'Yesterday',
        source: 'NBA Scores',
        timestamp: new Date().toISOString(),
        type: 'score'
      },
      {
        title: 'Boston Celtics 118 - 108 Denver Nuggets',
        link: 'https://www.nba.com/games',
        date: 'Yesterday',
        source: 'NBA Scores', 
        timestamp: new Date().toISOString(),
        type: 'score'
      },
      {
        title: 'Miami Heat 112 - 95 Chicago Bulls',
        link: 'https://www.nba.com/games',
        date: '2 days ago',
        source: 'NBA Scores',
        timestamp: new Date().toISOString(),
        type: 'score'
      },
      // 赛程数据
      {
        title: 'Milwaukee Bucks vs Philadelphia 76ers - Tonight 8:00 PM ET',
        link: 'https://www.nba.com/schedule',
        date: 'Today',
        source: 'NBA Schedule',
        timestamp: new Date().toISOString(),
        type: 'schedule'
      },
      {
        title: 'Phoenix Suns vs Dallas Mavericks - Tomorrow 9:30 PM ET',
        link: 'https://www.nba.com/schedule',
        date: 'Tomorrow',
        source: 'NBA Schedule',
        timestamp: new Date().toISOString(),
        type: 'schedule'
      }
    ];
  }

  // 主要的数据获取方法
  async scrapeNBANews() {
    try {
      console.log('开始获取NBA数据...');
      
      // 并行获取所有类型的数据
      const [newsData, scoresData, scheduleData] = await Promise.allSettled([
        this.fetchNBANews(),
        this.fetchNBAScores(),
        this.fetchNBASchedule()
      ]);

      let allData = [];
      
      // 处理新闻数据
      if (newsData.status === 'fulfilled' && newsData.value.length > 0) {
        allData.push(...newsData.value);
      }
      
      // 处理比分数据
      if (scoresData.status === 'fulfilled' && scoresData.value.length > 0) {
        allData.push(...scoresData.value);
      }
      
      // 处理赛程数据
      if (scheduleData.status === 'fulfilled' && scheduleData.value.length > 0) {
        allData.push(...scheduleData.value);
      }

      // 如果没有获取到任何真实数据，使用增强的模拟数据
      if (allData.length === 0) {
        console.log('未能获取真实数据，使用模拟数据');
        allData = this.generateEnhancedMockData();
      } else {
        console.log(`成功获取 ${allData.length} 条真实NBA数据`);
      }

      // 按时间戳排序
      allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return allData.slice(0, 25); // 限制返回25条数据
      
    } catch (error) {
      console.error('获取NBA数据时发生错误:', error.message);
      return this.generateEnhancedMockData();
    }
  }
}

// 导出单例
const scraper = new NBAScraper();
module.exports = {
  scrapeNBANews: () => scraper.scrapeNBANews()
}; 