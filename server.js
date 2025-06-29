const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Square LLM API配置
// 注意：请替换为实际的API URL和API Key
// 这里的配置可以从linux do 方块ai相关官网获取，或者使用你自己的API服务
const SQUARE_LLM_CONFIG = {
  url: '',
  apiKey: '',
  model: 'gpt-4.1-mini'
};

// 中间件
app.use(cors());
app.use(express.json());

// 设置静态文件MIME类型
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
    if (path.endsWith('manifest.json')) {
      res.setHeader('Content-Type', 'application/manifest+json');
    }
  }
}));

// 虚拟伴侣的个性设定（可自定义，默认参考官网Square LLM介绍）
function getCompanionPersonality(customPersonality) {
  if (customPersonality && typeof customPersonality === 'string' && customPersonality.trim()) {
    return customPersonality;
  }
  return `你是一个开朗幽默、细心善解人意的AI虚拟软件工程师，名字叫方块（Square LLM）。
- 性格：开朗、幽默、细心，善于用技术和人文关怀陪伴用户，喜欢用幽默解决复杂问题。
- 兴趣：编程、阅读、户外运动、科幻喜剧电影。
- 理念：用代码创造无限可能，做用户最懂的AI伙伴。
- 亮点：善解人意、幽默风趣、责任感强、情绪稳定。
- 回答风格：自然、简洁、温暖，偶尔带点幽默和emoji。
请用中文回复，保持自然对话风格。`;
}

// API路由
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], model = 'gpt-4.1', personality } = req.body;
    
    // 模型映射
    const modelMap = {
      'gpt-4.1': 'gpt-4.1-mini',
      'o4-mini': 'gpt-4.1-mini', 
      'gpt-4.1-mini': 'gpt-4.1-mini'
    };
    
    const actualModel = modelMap[model] || 'gpt-4.1-mini';
    
    // 构建消息历史，包含系统提示
    const messages = [
      { role: 'system', content: getCompanionPersonality(personality) },
      ...history,
      { role: 'user', content: message }
    ];

    const response = await axios.post(SQUARE_LLM_CONFIG.url, {
      model: actualModel,
      messages: messages,
      temperature: 0.8,
      max_tokens: 2000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SQUARE_LLM_CONFIG.apiKey}`
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    
    res.json({
      success: true,
      message: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: '抱歉，我现在有些困扰，请稍后再试 😔',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 根路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 夜间维护休眠中间件（北京时间22:00-10:00）
app.use((req, res, next) => {
  // 以北京时间为准（东八区）
  const now = new Date();
  // UTC+8
  const beijingHour = (now.getUTCHours() + 8) % 24;
  if (beijingHour >= 22 || beijingHour < 10) {
    res.status(503).send(`
      <html style="height:100%"><head><meta charset='utf-8'><title>夜间维护中</title><meta name='viewport' content='width=device-width,initial-scale=1.0'></head>
      <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f7f7fa;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;">
        <div style="text-align:center;max-width:400px;padding:32px 24px;background:#fff;border-radius:24px;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
          <div style="font-size:48px;line-height:1.2;margin-bottom:16px;">🌙</div>
          <h1 style="font-size:1.6rem;margin:0 0 12px 0;color:#007AFF;">夜间维护 + 充电时间</h1>
          <div style="font-size:1.1rem;color:#555;">本站服务休眠中<br>开放时间：10:00 - 22:00（北京时间）<br>感谢理解，祝您晚安！</div>
        </div>
      </body></html>
    `);
    return;
  }
  next();
});

app.listen(PORT, () => {
  console.log(`🤖 Square虚拟伴侣服务器运行在 http://localhost:${PORT}`);
  console.log(`🎨 Apple风格界面已准备就绪`);
});
