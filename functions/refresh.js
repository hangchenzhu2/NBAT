// 引用news.js中的处理逻辑
const { handler } = require('./news');

// 刷新功能就是调用news处理器的POST方法
exports.handler = async (event, context) => {
  // 将请求方法改为POST来触发刷新
  const refreshEvent = {
    ...event,
    httpMethod: 'POST'
  };
  
  return handler(refreshEvent, context);
}; 