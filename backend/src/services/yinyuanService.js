/**
 * 姻缘配对核心算法服务
 * 天命阁 - 戴密斯
 */

const baziService = require('./baziService');

// ==================== 常量定义 ====================

// 六合 (最高分)
const LIU_HE = {
  '子丑': 100, '丑子': 100,
  '寅亥': 100, '亥寅': 100,
  '卯戌': 100, '戌卯': 100,
  '辰酉': 100, '酉辰': 100,
  '巳申': 100, '申巳': 100,
  '午未': 100, '未午': 100
};

// 六冲 (最低分)
const LIU_CHONG = {
  '子午': 20, '午子': 20,
  '丑未': 20, '未丑': 20,
  '寅申': 20, '申寅': 20,
  '卯酉': 20, '酉卯': 20,
  '辰戌': 20, '戌辰': 20,
  '巳亥': 20, '亥巳': 20
};

// 三合 (中等)
const SAN_HE = {
  '申子辰': 70, '子申辰': 70, '辰申子': 70,
  '寅午戌': 70, '午寅戌': 70, '戌寅午': 70,
  '亥卯未': 70, '卯亥未': 70, '未亥卯': 70,
  '巳酉丑': 70, '酉巳丑': 70, '丑巳酉': 70
};

// 五行相生
const WU_XING_SHENG = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
};

// 五行相克
const WU_XING_KE = {
  '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
};

// 星座元素
const CONSTELLATION_ELEMENT = {
  '白羊座': '火', '金牛座': '土', '双子座': '风', '巨蟹座': '水',
  '狮子座': '火', '处女座': '土', '天秤座': '风', '天蝎座': '水',
  '射手座': '火', '摩羯座': '土', '水瓶座': '风', '双鱼座': '水'
};

// 星座很合关系 (同元素三角)
const CONSTELLATION_HARMONY = {
  '白羊座': ['狮子座', '射手座'],
  '金牛座': ['处女座', '摩羯座'],
  '双子座': ['天秤座', '水瓶座'],
  '巨蟹座': ['天蝎座', '双鱼座'],
  '狮子座': ['白羊座', '射手座'],
  '处女座': ['金牛座', '摩羯座'],
  '天秤座': ['双子座', '水瓶座'],
  '天蝎座': ['巨蟹座', '双鱼座'],
  '射手座': ['白羊座', '狮子座'],
  '摩羯座': ['金牛座', '处女座'],
  '水瓶座': ['双子座', '天秤座'],
  '双鱼座': ['巨蟹座', '天蝎座']
};

// 星座相冲
const CONSTELLATION_CHONG = {
  '白羊座': '天秤座', '天秤座': '白羊座',
  '金牛座': '天蝎座', '天蝎座': '金牛座',
  '双子座': '射手座', '射手座': '双子座',
  '巨蟹座': '摩羯座', '摩羯座': '巨蟹座',
  '狮子座': '水瓶座', '水瓶座': '狮子座',
  '处女座': '双鱼座', '双鱼座': '处女座'
};

// 天干五合
const TIAN_GAN_WU_HE = {
  '甲己': 100, '己甲': 100,
  '乙庚': 100, '庚乙': 100,
  '丙辛': 100, '辛丙': 100,
  '丁壬': 100, '壬丁': 100,
  '戊癸': 100, '癸戊': 100
};

// 地支六合
const DI_ZHI_LIU_HE = {
  '子丑': 100, '丑子': 100,
  '寅亥': 100, '亥寅': 100,
  '卯戌': 100, '戌卯': 100,
  '辰酉': 100, '酉辰': 100,
  '巳申': 100, '申巳': 100,
  '午未': 100, '未午': 100
};

// 权重配置
const WEIGHTS = {
  wuXing: 0.30,       // 五行匹配
  zodiac: 0.25,       // 属相匹配
  constellation: 0.25, // 星座匹配
  bazi: 0.20          // 八字匹配
};

// 等级阈值
const LEVEL_THRESHOLDS = [
  { min: 90, level: '极佳' },
  { min: 75, level: '优秀' },
  { min: 60, level: '良好' },
  { min: 45, level: '一般' },
  { min: 0, level: '欠佳' }
];

// ==================== 属相匹配算法 ====================

/**
 * 计算属相匹配度
 * @param {string} zodiac1 - 属相1
 * @param {string} zodiac2 - 属相2
 * @returns {Object} { score, relation, analysis }
 */
function calcZodiacMatch(zodiac1, zodiac2) {
  if (zodiac1 === zodiac2) {
    return { score: 70, relation: '同属相', analysis: '两人同属相，性格有相似之处。' };
  }
  
  // 检查六合
  const heKey = zodiac1 + zodiac2;
  if (LIU_HE[heKey]) {
    return { score: 100, relation: '六合', analysis: '六合之缘！生肖相合，感情融洽，互相助益。' };
  }
  
  // 检查六冲
  if (LIU_CHONG[heKey]) {
    return { score: 20, relation: '六冲', analysis: '六冲之象，两人易有冲突摩擦，需要更多包容理解。' };
  }
  
  // 检查三合
  const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const idx1 = zhiList.indexOf(zodiac1);
  const idx2 = zhiList.indexOf(zodiac2);
  
  // 三合: 申子辰、寅午戌、亥卯未、巳酉丑
  const sanHeGroups = [
    ['申', '子', '辰'],
    ['寅', '午', '戌'],
    ['亥', '卯', '未'],
    ['巳', '酉', '丑']
  ];
  
  for (const group of sanHeGroups) {
    if (group.includes(zodiac1) && group.includes(zodiac2)) {
      return { score: 75, relation: '三合', analysis: '三合之局，两人缘份深厚，能相互理解支持。' };
    }
  }
  
  // 检查相生
  const wuxing1 = baziService.DI_ZHI_WU_XING[zodiac1];
  const wuxing2 = baziService.DI_ZHI_WU_XING[zodiac2];
  
  if (WU_XING_SHENG[wuxing1] === wuxing2) {
    return { score: 80, relation: '相生', analysis: `生肖${zodiac1}（${wuxing1}）生${zodiac2}（${wuxing2}），一方包容付出，一方受益。` };
  }
  
  if (WU_XING_SHENG[wuxing2] === wuxing1) {
    return { score: 80, relation: '相生', analysis: `生肖${zodiac2}（${wuxing2}）生${zodiac1}（${wuxing1}），一方包容付出，一方受益。` };
  }
  
  // 检查相克
  if (WU_XING_KE[wuxing1] === wuxing2) {
    return { score: 40, relation: '相克', analysis: `生肖${zodiac1}（${wuxing1}）克${zodiac2}（${wuxing2}），需注意相处模式。` };
  }
  
  if (WU_XING_KE[wuxing2] === wuxing1) {
    return { score: 40, relation: '相克', analysis: `生肖${zodiac2}（${wuxing2}）克${zodiac1}（${wuxing1}），需注意相处模式。` };
  }
  
  // 同五行
  if (wuxing1 === wuxing2) {
    return { score: 70, relation: '同五行', analysis: `同属${wuxing1}属性，性格有共通之处。` };
  }
  
  return { score: 50, relation: '一般', analysis: '属相关系平淡，需靠双方共同经营。' };
}

// ==================== 星座匹配算法 ====================

/**
 * 计算星座匹配度
 * @param {string} constellation1 - 星座1
 * @param {string} constellation2 - 星座2
 * @returns {Object} { score, relation, analysis }
 */
function calcConstellationMatch(constellation1, constellation2) {
  if (!constellation1 || !constellation2) {
    return { score: 50, relation: '未知', analysis: '星座信息不全，无法准确分析。' };
  }
  
  if (constellation1 === constellation2) {
    return { score: 75, relation: '同星座', analysis: '两人同星座，性格相近，容易理解对方。' };
  }
  
  // 检查很合 (同元素三角)
  const harmony1 = CONSTELLATION_HARMONY[constellation1] || [];
  if (harmony1.includes(constellation2)) {
    return { score: 100, relation: '很合', analysis: '星座很合！元素相同，价值观相近，默契十足。' };
  }
  
  // 检查相冲
  if (CONSTELLATION_CHONG[constellation1] === constellation2) {
    return { score: 20, relation: '相冲', analysis: '星座相冲，两人性格差异大，容易产生矛盾。' };
  }
  
  // 检查元素相生
  const elem1 = CONSTELLATION_ELEMENT[constellation1];
  const elem2 = CONSTELLATION_ELEMENT[constellation2];
  
  if (WU_XING_SHENG[elem1] === elem2) {
    return { score: 85, relation: '相生', analysis: `火${elem1}生${elem2}，一方给予一方接受，关系和谐。` };
  }
  
  if (WU_XING_SHENG[elem2] === elem1) {
    return { score: 85, relation: '相生', analysis: `风${elem2}生${elem1}，一方给予一方接受，关系和谐。` };
  }
  
  // 同元素
  if (elem1 === elem2) {
    return { score: 75, relation: '同元素', analysis: `同${elem1}元素，沟通顺畅，理念相近。` };
  }
  
  // 检查相克
  if (WU_XING_KE[elem1] === elem2) {
    return { score: 35, relation: '相克', analysis: `${elem1}克${elem2}，需要更多包容与调整。` };
  }
  
  if (WU_XING_KE[elem2] === elem1) {
    return { score: 35, relation: '相克', analysis: `${elem2}克${elem1}，需要更多包容与调整。` };
  }
  
  return { score: 50, relation: '一般', analysis: '星座关系一般，需要双方共同努力经营。' };
}

// ==================== 五行匹配算法 ====================

/**
 * 计算五行匹配度
 * @param {Object} bazi1 - 八字1
 * @param {Object} bazi2 - 八字2
 * @returns {Object} { score, analysis }
 */
function calcWuXingMatch(bazi1, bazi2) {
  const wuXing1 = bazi1.wuXingAnalysis;
  const wuXing2 = bazi2.wuXingAnalysis;
  
  const riZhuWuXing1 = wuXing1.riZhuWuXing;
  const riZhuWuXing2 = wuXing2.riZhuWuXing;
  
  // 计算强度差异
  const strength1 = wuXing1.lingScore;
  const strength2 = wuXing2.lingScore;
  
  let score = 50;
  let analysis = '';
  
  // 日主五行关系
  if (riZhuWuXing1 === riZhuWuXing2) {
    score += 10;
    analysis += `双方日主同为${riZhuWuXing1}，性格有相似之处。`;
  }
  
  // 相生关系
  if (WU_XING_SHENG[riZhuWuXing1] === riZhuWuXing2) {
    score += 20;
    analysis += `${riZhuWuXing1}日主生${riZhuWuXing2}日主，一方包容付出。`;
  } else if (WU_XING_SHENG[riZhuWuXing2] === riZhuWuXing1) {
    score += 20;
    analysis += `${riZhuWuXing2}日主生${riZhuWuXing1}日主，一方包容付出。`;
  }
  
  // 相克关系
  if (WU_XING_KE[riZhuWuXing1] === riZhuWuXing2) {
    score -= 15;
    analysis += `${riZhuWuXing1}日主克${riZhuWuXing2}日主，可能有摩擦。`;
  } else if (WU_XING_KE[riZhuWuXing2] === riZhuWuXing1) {
    score -= 15;
    analysis += `${riZhuWuXing2}日主克${riZhuWuXing1}日主，可能有摩擦。`;
  }
  
  // 强弱互补
  if ((strength1 >= 1.1 && strength2 <= 0.9) || (strength2 >= 1.1 && strength1 <= 0.9)) {
    score += 15;
    analysis += '强弱互补，一方强势一方柔和，可达平衡。';
  }
  
  // 限制分数
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  return { score, analysis };
}

// ==================== 八字匹配算法 ====================

/**
 * 计算八字匹配度 (天干地支合盘)
 * @param {Object} bazi1 - 八字1
 * @param {Object} bazi2 - 八字2
 * @returns {Object} { score, analysis }
 */
function calcBaziMatch(bazi1, bazi2) {
  let score = 50;
  let matches = [];
  
  // 年柱关系
  const nianHe1 = bazi1.nianZhu.ganZhi + bazi2.nianZhu.ganZhi;
  const nianHe2 = bazi2.nianZhu.ganZhi + bazi1.nianZhu.ganZhi;
  
  if (TIAN_GAN_WU_HE[nianHe1] || TIAN_GAN_WU_HE[nianHe2]) {
    score += 15;
    matches.push('年干五合');
  }
  
  const nianZhiHe1 = bazi1.nianZhu.diZhi + bazi2.nianZhu.diZhi;
  const nianZhiHe2 = bazi2.nianZhu.diZhi + bazi1.nianZhu.diZhi;
  
  if (DI_ZHI_LIU_HE[nianZhiHe1] || DI_ZHI_LIU_HE[nianZhiHe2]) {
    score += 10;
    matches.push('年支六合');
  }
  
  // 日柱关系 (最重要)
  const riGanHe1 = bazi1.riZhu.tianGan + bazi2.riZhu.tianGan;
  const riGanHe2 = bazi2.riZhu.tianGan + bazi1.riZhu.tianGan;
  
  if (TIAN_GAN_WU_HE[riGanHe1] || TIAN_GAN_WU_HE[riGanHe2]) {
    score += 25;
    matches.push('日干五合（重要！）');
  }
  
  const riZhiHe1 = bazi1.riZhu.diZhi + bazi2.riZhu.diZhi;
  const riZhiHe2 = bazi2.riZhu.diZhi + bazi1.riZhu.diZhi;
  
  if (DI_ZHI_LIU_HE[riZhiHe1] || DI_ZHI_LIU_HE[riZhiHe2]) {
    score += 15;
    matches.push('日支六合');
  }
  
  // 月柱关系
  const yueZhiHe1 = bazi1.yueZhu.diZhi + bazi2.yueZhu.diZhi;
  const yueZhiHe2 = bazi2.yueZhu.diZhi + bazi1.yueZhu.diZhi;
  
  if (DI_ZHI_LIU_HE[yueZhiHe1] || DI_ZHI_LIU_HE[yueZhiHe2]) {
    score += 10;
    matches.push('月支六合');
  }
  
  // 生成分析
  let analysis;
  if (matches.length === 0) {
    analysis = '八字无特殊合冲关系，缘分平平。';
  } else {
    analysis = `合盘信息：${matches.join('、')}。${matches.length >= 3 ? '合多，缘份深厚！' : '有合，缘份不错。'}`;
  }
  
  // 限制分数
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  return { score, analysis, matches };
}

// ==================== 综合配对算法 ====================

/**
 * 获取等级
 */
function getLevel(score) {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (score >= threshold.min) {
      return threshold.level;
    }
  }
  return '欠佳';
}

/**
 * 完整姻缘配对分析
 * @param {Object} person1 - { name, birthDate, birthTime, gender, constellation }
 * @param {Object} person2 - { name, birthDate, birthTime, gender, constellation }
 * @returns {Object} 完整配对报告
 */
function matchYinYuan(person1, person2) {
  // 解析八字
  const [year1, month1, day1] = person1.birthDate.split('-').map(Number);
  const bazi1 = baziService.generateBaZi({
    year: year1, month: month1, day: day1,
    hour: person1.birthTime,
    gender: person1.gender
  });
  
  const [year2, month2, day2] = person2.birthDate.split('-').map(Number);
  const bazi2 = baziService.generateBaZi({
    year: year2, month: month2, day: day2,
    hour: person2.birthTime,
    gender: person2.gender
  });
  
  // 属相匹配
  const zodiacResult = calcZodiacMatch(bazi1.zodiac, bazi2.zodiac);
  
  // 星座匹配
  const constellationResult = calcConstellationMatch(person1.constellation, person2.constellation);
  
  // 五行匹配
  const wuXingResult = calcWuXingMatch(bazi1, bazi2);
  
  // 八字匹配
  const baziResult = calcBaziMatch(bazi1, bazi2);
  
  // 综合评分
  const totalScore = Math.round(
    wuXingResult.score * WEIGHTS.wuXing +
    zodiacResult.score * WEIGHTS.zodiac +
    constellationResult.score * WEIGHTS.constellation +
    baziResult.score * WEIGHTS.bazi
  );
  
  const level = getLevel(totalScore);
  
  // 详细信息
  const info = {
    person1: {
      name: person1.name,
      zodiac: bazi1.zodiac,
      constellation: person1.constellation || '未知',
      bazi: `${bazi1.riZhu.ganZhi}日主`,
      mingPanStrength: bazi1.riZhuStrength.level
    },
    person2: {
      name: person2.name,
      zodiac: bazi2.zodiac,
      constellation: person2.constellation || '未知',
      bazi: `${bazi2.riZhu.ganZhi}日主`,
      mingPanStrength: bazi2.riZhuStrength.level
    }
  };
  
  // 生成报告
  const report = generateReport(info, totalScore, level, {
    wuXing: wuXingResult,
    zodiac: zodiacResult,
    constellation: constellationResult,
    bazi: baziResult
  });
  
  return {
    score: totalScore,
    level,
    details: {
      wuXing: wuXingResult,
      zodiac: zodiacResult,
      constellation: constellationResult,
      bazi: baziResult
    },
    report,
    info,
    weights: WEIGHTS
  };
}

/**
 * 生成配对报告
 */
function generateReport(info, score, level, details) {
  const { person1, person2 } = info;
  
  let report = `【姻缘配对分析报告】\n\n`;
  report += `${person1.name}（${person1.zodiac} ${person1.constellation} ${person1.bazi}）\n`;
  report += `${person2.name}（${person2.zodiac} ${person2.constellation} ${person2.bazi}）\n\n`;
  
  report += `▌综合评分：${score}分（${level}）\n\n`;
  
  report += `▌分项分析\n`;
  report += `• 五行匹配：${details.wuXing.score}分\n  ${details.wuXing.analysis}\n\n`;
  
  report += `• 属相匹配：${details.zodiac.score}分（${details.zodiac.relation}）\n  ${details.zodiac.analysis}\n\n`;
  
  report += `• 星座匹配：${details.constellation.score}分（${details.constellation.relation}）\n  ${details.constellation.analysis}\n\n`;
  
  report += `• 八字合盘：${details.bazi.score}分\n  ${details.bazi.analysis}\n\n`;
  
  // 建议
  report += `▌相处建议\n`;
  if (score >= 75) {
    report += `缘分深厚，珍惜彼此！\n`;
  } else if (score >= 60) {
    report += `缘份不错，多沟通理解。\n`;
  } else if (score >= 45) {
    report += `需要双方共同努力经营。\n`;
  } else {
    report += `建议深入了解，谨慎发展。\n`;
  }
  
  return report;
}

// ==================== 导出 ====================

module.exports = {
  // 核心匹配
  calcZodiacMatch,
  calcConstellationMatch,
  calcWuXingMatch,
  calcBaziMatch,
  matchYinYuan,
  
  // 辅助
  getLevel,
  generateReport,
  
  // 常量
  WEIGHTS,
  LIU_HE,
  LIU_CHONG,
  CONSTELLATION_ELEMENT
};
