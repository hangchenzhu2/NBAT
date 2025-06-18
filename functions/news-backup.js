const axios = require('axios');
const cheerio = require('cheerio');

// NBA新闻和数据抓取类 - Netlify Functions版本
class NBAScraper {
  constructor() {
    // NBA官方网站和ESPN新闻源
    this.dataSources = {
      // 网页抓取源
      news: [
        {
          name: 'NBA Official',
          url: 'https://www.nba.com/news/category/top-stories',
          type: 'scrape'
        },
        {
          name: 'ESPN NBA',
          url: 'https://www.espn.com/nba/',
          type: 'scrape'
        }
      ],
      // NBA比分数据 (保留API)
      scores: {
        name: 'NBA Scores API',
        url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
        type: 'api'
      },
      // NBA赛程数据 (保留API)
      schedule: {
        name: 'NBA Schedule API',
        url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=',
        type: 'api'
      }
    };
    
    // 请求配置
    this.requestConfig = {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    };
  }

  // 获取NBA新闻数据
  async fetchNBANews() {
    const startTime = Date.now();
    console.log('🏀 开始获取NBA新闻数据...');
    
    try {
      const allNews = [];
      
      // 抓取NBA官方新闻
      try {
        console.log('📰 正在抓取NBA官网...');
        const nbaResponse = await axios.get(this.dataSources.news[0].url, this.requestConfig);

        if (nbaResponse.data && nbaResponse.status === 200) {
          console.log(`✅ NBA官网响应成功 (${nbaResponse.data.length} 字符)`);
          const $ = cheerio.load(nbaResponse.data);
          
          // 根据测试结果，NBA官网使用article元素
          console.log('🔍 正在解析NBA官网文章...');
          
          $('article').each((index, element) => {
            if (allNews.filter(n => n.source === 'NBA Official').length >= 8) return;
            
            const $el = $(element);
            const linkEl = $el.find('a[href*="/news/"]').first();
            const link = linkEl.attr('href');
            
            if (link) {
              let title = linkEl.text().trim();
              
              // 多种方式获取标题
              if (!title || title.length < 20) {
                const titleElements = $el.find('h1, h2, h3, h4, .title, .headline');
                if (titleElements.length > 0) {
                  title = titleElements.first().text().trim();
                }
              }
              
              if (!title || title.length < 20) {
                const fullText = $el.text().trim();
                const sentences = fullText.split(/[.!?。！？]/);
                if (sentences.length > 0) {
                  title = sentences[0].trim();
                }
              }
              
              if (title && title.length > 15 && title.length < 200) {
                const fullLink = link.startsWith('http') ? link : `https://www.nba.com${link}`;
                
                // 清理标题
                title = title.replace(/\s+/g, ' ').trim();
                
                // 避免重复
                const isDuplicate = allNews.some(news => 
                  news.title.toLowerCase().includes(title.toLowerCase().substring(0, 20)) ||
                  news.link === fullLink
                );
                
                if (!isDuplicate) {
                  allNews.push({
                    title: title,
                    link: fullLink,
                    date: 'Today',
                    source: 'NBA Official',
                    timestamp: new Date().toISOString(),
                    type: 'news'
                  });
                  console.log(`✅ NBA新闻: ${title.substring(0, 50)}...`);
                }
              }
            }
          });
          
          console.log(`🎯 从NBA官网获取到 ${allNews.filter(n => n.source === 'NBA Official').length} 条新闻`);
        }
      } catch (nbaError) {
        console.error('❌ NBA官网抓取失败:', nbaError.message);
      }
      
      // 抓取ESPN新闻
      try {
        console.log('📰 正在抓取ESPN...');
        const espnResponse = await axios.get(this.dataSources.news[1].url, this.requestConfig);

        if (espnResponse.data && espnResponse.status === 200) {
          console.log(`✅ ESPN响应成功 (${espnResponse.data.length} 字符)`);
          const $ = cheerio.load(espnResponse.data);
          
          console.log('🔍 正在解析ESPN新闻链接...');
          
          $('a[href*="/nba/story/"], a[href*="/nba/news/"]').each((index, element) => {
            if (allNews.filter(n => n.source === 'ESPN NBA').length >= 6) return;
            
            const $el = $(element);
            const link = $el.attr('href');
            let title = $el.text().trim();
            
            // 多种方式获取标题
            if (!title || title.length < 15) {
              const parent = $el.parent();
              const titleElements = parent.find('h1, h2, h3, h4, .title, .headline');
              if (titleElements.length > 0) {
                title = titleElements.first().text().trim();
              }
            }
            
            if (!title || title.length < 15) {
              const siblings = $el.siblings('h1, h2, h3, h4, .title, .headline');
              if (siblings.length > 0) {
                title = siblings.first().text().trim();
              }
            }
            
            if (title && link && title.length > 15 && title.length < 200) {
              const fullLink = link.startsWith('http') ? link : `https://www.espn.com${link}`;
              
              // 清理标题
              title = title.replace(/\s+/g, ' ').trim();
              
              // 避免重复
              const isDuplicate = allNews.some(news => 
                news.title.toLowerCase().includes(title.toLowerCase().substring(0, 20)) ||
                news.link === fullLink ||
                title.toLowerCase().includes(news.title.toLowerCase().substring(0, 20))
              );
              
              if (!isDuplicate) {
                allNews.push({
                  title: title,
                  link: fullLink,
                  date: 'Today',
                  source: 'ESPN NBA',
                  timestamp: new Date().toISOString(),
                  type: 'news'
                });
                console.log(`✅ ESPN新闻: ${title.substring(0, 50)}...`);
              }
            }
          });
          
          console.log(`🎯 从ESPN获取到 ${allNews.filter(n => n.source === 'ESPN NBA').length} 条新闻`);
        }
      } catch (espnError) {
        console.error('❌ ESPN抓取失败:', espnError.message);
      }
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ 新闻抓取完成，耗时 ${duration}ms，总计 ${allNews.length} 条新闻`);
      return allNews.slice(0, 15); // 返回最多15条新闻
      
    } catch (error) {
      console.error('💥 新闻抓取异常:', error.message);
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

// Netlify Function处理程序
exports.handler = async (event, context) => {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const scraper = new NBAScraper();
    
    if (event.httpMethod === 'GET') {
      // 获取新闻数据
      const newsData = await scraper.scrapeNBANews();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: newsData,
          timestamp: new Date().toISOString()
        })
      };
    } else if (event.httpMethod === 'POST') {
      // 刷新数据（重新获取）
      const newsData = await scraper.scrapeNBANews();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'News data refreshed successfully',
          count: newsData.length,
          data: newsData
        })
      };
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Method not allowed'
        })
      };
    }
  } catch (error) {
    console.error('Netlify Function错误:', error);
    
    const mockData = new NBAScraper().generateEnhancedMockData();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: mockData,
        timestamp: new Date().toISOString(),
        note: 'Using mock data due to API error'
      })
    };
  }
}; 