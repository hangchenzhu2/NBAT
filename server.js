const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const scraper = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 全局变量存储抓取的新闻数据
let newsData = [];

// API路由
app.get('/api/news', (req, res) => {
  res.json({
    success: true,
    data: newsData,
    timestamp: new Date().toISOString()
  });
});

// 手动刷新新闻数据
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('手动刷新新闻数据...');
    newsData = await scraper.scrapeNBANews();
    res.json({
      success: true,
      message: 'News data refreshed successfully',
      count: newsData.length
    });
  } catch (error) {
    console.error('刷新失败:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh news data'
    });
  }
});

// 定时任务 - 每30分钟自动抓取一次新闻
cron.schedule('*/30 * * * *', async () => {
  try {
    console.log('定时抓取NBA新闻...');
    newsData = await scraper.scrapeNBANews();
    console.log(`成功抓取 ${newsData.length} 条新闻`);
  } catch (error) {
    console.error('定时抓取失败:', error);
  }
});

// 服务器启动时立即抓取一次数据
async function initializeData() {
  try {
    console.log('初始化数据...');
    newsData = await scraper.scrapeNBANews();
    console.log(`初始化完成，共抓取 ${newsData.length} 条新闻`);
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`NBA新闻抓取服务器运行在 http://localhost:${PORT}`);
  initializeData();
}); 