/**
 * 年运分析服务
 * 根据八字分析年度运势
 */
const baziService = require('./baziService');

// 五行常数
const WU_XING = ['木', '火', '土', '金', '水'];
const WU_XING_RELATIONS = {
  '木': { '木': 1, '火': 0.8, '土': -0.5, '金': -1, '水': 0.6 },
  '火': { '木': 0.6, '火': 1, '土': 0.8, '金': -0.5, '水': -1 },
  '土': { '木': -0.5, '火': 0.6, '土': 1, '金': 0.8, '水': -1 },
  '金': { '木': -1, '火': -0.5, '土': 0.6, '金': 1, '水': 0.8 },
  '水': { '木': 0.8, '火': -1, '土': -0.5, '金': 0.6, '水': 1 }
};

// 生肖五行强度表
const ZODIAC_WU_XING = {
  '鼠': '水', '牛': '土', '虎': '木', '兔': '木',
  '龙': '土', '蛇': '火', '马': '火', '羊': '土',
  '猴': '金', '鸡': '金', '狗': '土', '猪': '水'
};

// 吉凶判断阈值
const LEVEL_THRESHOLDS = [
  { min: 85, level: 1, levelName: '大吉' },
  { min: 70, level: 2, levelName: '吉' },
  { min: 45, level: 3, levelName: '平' },
  { min: 25, level: 4, levelName: '凶' },
  { min: 0, level: 5, levelName: '大凶' }
];

/**
 * 计算年度运势
 * @param {Object} input - { year, month, day, time, gender }
 * @returns {Object} 年运分析结果
 */
function analyzeYearFortune(input) {
  const { year, month, day, time, gender } = input;
  
  // 1. 获取八字信息
  const bazi = baziService.calculateBaZi(year, month, day, time);
  
  // 2. 计算五行分数
  const wuXingScore = calculateWuXingScore(bazi);
  
  // 3. 计算流年运势
  const liuYearScore = calculateLiuYearScore(year, bazi);
  
  // 4. 计算月份运势
  const monthlyFortunes = calculateMonthlyFortunes(year, bazi);
  
  // 5. 综合评分
  // 将五行分数转换为单一数值（取均值）
  const wuXingAvg = (wuXingScore.木 + wuXingScore.火 + wuXingScore.土 + wuXingScore.金 + wuXingScore.水) / 5;
  const totalScore = Math.round(
    wuXingAvg * 0.4 + liuYearScore * 0.6
  );
  
  // 6. 判断等级
  const levelInfo = getLevelInfo(totalScore);
  
  // 7. 生成分析文本
  const summary = generateSummary(bazi, totalScore, levelInfo, gender);
  const details = generateDetails(bazi, monthlyFortunes, wuXingScore, gender);
  
  // 8. 找出最好和最差月份
  const luckyMonth = findBestMonth(monthlyFortunes);
  const unluckyMonth = findWorstMonth(monthlyFortunes);
  
  return {
    score: totalScore,
    level: levelInfo.level,
    levelName: levelInfo.levelName,
    summary,
    details,
    luckyMonth,
    unluckyMonth,
    wuxing: wuXingScore,
    bazi: {
      year: bazi.nianZhu,
      month: bazi.yueZhu,
      day: bazi.riZhu,
      time: bazi.shiZhu
    },
    monthlyFortunes,
    zodiac: bazi.zodiac,
    gender: gender === 'male' ? '男' : '女'
  };
}

/**
 * 计算五行分数
 */
function calculateWuXingScore(bazi) {
  const { wuXingAnalysis } = bazi;
  const count = wuXingAnalysis.count;
  
  // 基准分数（每行2个为平衡）
  const baseScore = 40;
  let total = 0;
  const wuxingResult = {};
  
  for (const wx of WU_XING) {
    const c = count[wx] || 0;
    // 2个为最佳(20分)，每多1个+5分，少1个-5分
    const score = baseScore + (c - 2) * 8;
    wuxingResult[wx] = Math.max(0, Math.min(100, score));
    total += wuxingResult[wx];
  }
  
  // 归一化
  const normalized = {};
  for (const wx of WU_XING) {
    normalized[wx] = Math.round((wuxingResult[wx] / total) * 100);
  }
  
  return normalized;
}

/**
 * 计算流年运势
 * 流年地支对命局的影响
 */
function calculateLiuYearScore(year, bazi) {
  // 流年地支
  const liuZhi = DI_ZHI[(year - 3) % 12];
  const liuGan = TIAN_GAN[(year - 3) % 10];
  
  // 获取日主五行
  const riWuXing = bazi.wuXingAnalysis.riGanWuXing;
  
  // 计算流年天干与命局的关系
  let score = 50; // 基础分
  
  // 流年天干对日主的影响
  const ganInfluence = getGanInfluence(liuGan, bazi);
  score += ganInfluence;
  
  // 流年地支对日主的影响
  const zhiInfluence = getZhiInfluence(liuZhi, bazi);
  score += zhiInfluence;
  
  // 生肖年特殊加成
  const zodiac = bazi.zodiac;
  const zodiacWuXing = ZODIAC_WU_XING[zodiac];
  if (zodiacWuXing === bazi.wuXingAnalysis.xiYong) {
    score += 10; // 喜用神到位
  }
  
  return Math.max(0, Math.min(100, score));
}

// 需要引入常量和函数
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const WU_XING_TIAN_GAN = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

// 月干起始表（年上起月）
const YUE_GAN_START = {
  '甲': 2,  // 丙
  '乙': 4,  // 戊
  '丙': 6,  // 庚
  '丁': 9,  // 壬
  '戊': 0,  // 甲
  '己': 2,  // 丙
  '庚': 4,  // 戊
  '辛': 6,  // 庚
  '壬': 9,  // 壬
  '癸': 0   // 甲
};

/**
 * 获取天干对命局的影响
 */
function getGanInfluence(流Gan, bazi) {
  const riWuXing = bazi.wuXingAnalysis.riGanWuXing;
  const riWuXingKey = WU_XING_TIAN_GAN[riWuXing] || riWuXing;
  const流WuXingKey = WU_XING_TIAN_GAN[流Gan] || WU_XING_TIAN_GAN[流Gan];
  
  // 相生相助为吉
  if (WU_XING_RELATIONS[riWuXingKey] && WU_XING_RELATIONS[riWuXingKey][流WuXingKey] > 0) {
    return Math.round(WU_XING_RELATIONS[riWuXingKey][流WuXingKey] * 20);
  }
  // 相克相冲为凶
  if (WU_XING_RELATIONS[riWuXingKey] && WU_XING_RELATIONS[riWuXingKey][流WuXingKey] < 0) {
    return Math.round(WU_XING_RELATIONS[riWuXingKey][流WuXingKey] * 20);
  }
  return 0;
}

/**
 * 获取地支对命局的影响
 */
function getZhiInfluence(流Zhi, bazi) {
  // 地支藏干简化处理
  const zhiWuXing = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
    '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
    '戌': '土', '亥': '水'
  };
  
  const riWuXing = bazi.wuXingAnalysis.riGanWuXing;
  const riWuXingKey = WU_XING_TIAN_GAN[riWuXing] || riWuXing;
  const流WuXingKey = zhiWuXing[流Zhi] || '土';
  
  if (WU_XING_RELATIONS[riWuXingKey] && WU_XING_RELATIONS[riWuXingKey][流WuXingKey] > 0) {
    return Math.round(WU_XING_RELATIONS[riWuXingKey][流WuXingKey] * 15);
  }
  if (WU_XING_RELATIONS[riWuXingKey] && WU_XING_RELATIONS[riWuXingKey][流WuXingKey] < 0) {
    return Math.round(WU_XING_RELATIONS[riWuXingKey][流WuXingKey] * 15);
  }
  return 0;
}

/**
 * 计算12个月运势
 */
function calculateMonthlyFortunes(year, bazi) {
  const results = [];
  const baseMonthZhi = (year - 3) % 12;
  
  for (let i = 1; i <= 12; i++) {
    const monthZhi = DI_ZHI[(baseMonthZhi + i - 1) % 12];
    const monthGanIndex = (YUE_GAN_START[bazi.nianZhu.tianGan] + i - 1) % 10;
    const monthGan = TIAN_GAN[monthGanIndex];
    
    // 简单评分：基于该月与日主的关系
    let score = 50;
    const monthWuXing = WU_XING_TIAN_GAN[monthGan];
    const riWuXing = bazi.wuXingAnalysis.riGanWuXing;
    
    if (WU_XING_RELATIONS[riWuXing] && WU_XING_RELATIONS[riWuXing][monthWuXing] > 0) {
      score += 15;
    }
    if (WU_XING_RELATIONS[riWuXing] && WU_XING_RELATIONS[riWuXing][monthWuXing] < 0) {
      score -= 10;
    }
    
    // 旺相休囚死简单判断
    const seasonalStrength = getSeasonalStrength(monthZhi, monthWuXing);
    score += seasonalStrength;
    
    results.push({
      month: i,
      ganZhi: monthGan + monthZhi,
      score: Math.max(0, Math.min(100, score)),
      description: getMonthDescription(score, monthWuXing)
    });
  }
  
  return results;
}

/**
 * 季节对五行的影响
 */
function getSeasonalStrength(zhi, wuXing) {
  // 旺相休囚死简化表
  const seasonal = {
    '木': { '寅': 20, '卯': 20, '亥': 10, '子': -10, '申': -15, '酉': -15 },
    '火': { '巳': 20, '午': 20, '寅': 10, '卯': 10, '亥': -10, '子': -15 },
    '土': { '辰': 15, '戌': 15, '丑': 15, '未': 15, '卯': -10, '申': -10 },
    '金': { '申': 20, '酉': 20, '辰': 10, '丑': 10, '寅': -15, '巳': -15 },
    '水': { '亥': 20, '子': 20, '申': 10, '酉': 10, '午': -15, '巳': -15 }
  };
  
  return seasonal[wuXing]?.[zhi] || 0;
}

/**
 * 月份描述
 */
function getMonthDescription(score, wuXing) {
  if (score >= 80) return `${wuXing}气旺盛，事事顺遂`;
  if (score >= 65) return `${wuXing}气不错，稳步发展`;
  if (score >= 45) return `${wuXing}气平稳，静待时机`;
  if (score >= 30) return `${wuXing}气较弱，需谨慎行事`;
  return `${wuXing}气受制，宜守不宜动`;
}

/**
 * 获取等级信息
 */
function getLevelInfo(score) {
  for (const t of LEVEL_THRESHOLDS) {
    if (score >= t.min) {
      return { level: t.level, levelName: t.levelName };
    }
  }
  return { level: 5, levelName: '大凶' };
}

/**
 * 生成年度总述
 */
function generateSummary(bazi, totalScore, levelInfo, gender) {
  const genderStr = gender === 'male' ? '男' : '女';
  const zodiac = bazi.zodiac;
  const riZhu = bazi.riZhu.ganZhi;
  const xiYong = bazi.wuXingAnalysis.xiYong;
  
  const levelDesc = {
    '大吉': '运势极佳，各方面都将有很好的发展机会。',
    '吉': '运势良好，适合稳步推进计划。',
    '平': '运势平稳，需要稳扎稳打。',
    '凶': '运势较低，建议保守行事。',
    '大凶': '运势低迷，宜静不宜动，谨慎决策。'
  };
  
  return `${genderStr}命${zodiac}，日主${riZhu}。` +
    `命局五行以${xiYong}为用神。` +
    `流年运势${levelInfo.levelName}，${levelDesc[levelInfo.levelName]}` +
    `建议多关注${xiYong}相关的领域。`;
}

/**
 * 生成详细分析
 */
function generateDetails(bazi, monthlyFortunes, wuXingScore, gender) {
  const genderStr = gender === 'male' ? '男' : '女';
  const xiYong = bazi.wuXingAnalysis.xiYong;
  const shenYong = bazi.wuXingAnalysis.shenYong;
  
  let details = `【五行分析】\n`;
  details += `木:${wuXingScore.木 || 0} 火:${wuXingScore.火 || 0} 土:${wuXingScore.土 || 0} 金:${wuXingScore.金 || 0} 水:${wuXingScore.水 || 0}\n\n`;
  
  details += `【用神分析】\n`;
  details += `喜神:${xiYong}  助神:${shenYong}\n`;
  details += `建议多接触${xiYong}、${shenYong}属性的事物。\n\n`;
  
  details += `【月份运势】\n`;
  monthlyFortunes.forEach(m => {
    const emoji = m.score >= 70 ? '🌟' : m.score >= 50 ? '✓' : '△';
    details += `${emoji} ${m.month}月(${m.ganZhi}): ${m.score}分 - ${m.description}\n`;
  });
  
  return details;
}

/**
 * 找出最好月份
 */
function findBestMonth(monthlyFortunes) {
  const best = monthlyFortunes.reduce((a, b) => a.score > b.score ? a : b);
  return `${best.month}月(${best.ganZhi})`;
}

/**
 * 找出最差月份
 */
function findWorstMonth(monthlyFortunes) {
  const worst = monthlyFortunes.reduce((a, b) => a.score < b.score ? a : b);
  return `${worst.month}月(${worst.ganZhi})`;
}

/**
 * 测试函数
 */
function test() {
  const result = analyzeYearFortune({
    year: 1990,
    month: 8,
    day: 8,
    time: '丑时',
    gender: 'male'
  });
  console.log('年运分析结果:', JSON.stringify(result, null, 2));
  return result;
}

module.exports = {
  analyzeYearFortune,
  test
};
