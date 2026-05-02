/**
 * 八字排盘核心算法服务
 * 天命阁 - 戴密斯
 */

// ==================== 常量定义 ====================

// 天干 (10个)
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支 (12个)
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行对应 (天干)
const TIAN_GAN_WU_XING = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 五行对应 (地支)
const DI_ZHI_WU_XING = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 地支藏干
const DI_ZHI_CANG_GAN = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
};

// 五行强度系数 (月令对日主的影响)
const YUE_LING_STRENGTH = {
  '寅': { '木': 1.2, '火': 0.8, '土': 0.5, '金': 0.3, '水': 0.5 },
  '卯': { '木': 1.2, '火': 0.8, '土': 0.5, '金': 0.3, '水': 0.5 },
  '辰': { '土': 1.2, '金': 0.8, '水': 0.5, '木': 0.5, '火': 0.6 },
  '巳': { '火': 1.2, '土': 0.8, '金': 0.5, '木': 0.3, '水': 0.5 },
  '午': { '火': 1.2, '土': 0.8, '金': 0.5, '木': 0.3, '水': 0.5 },
  '未': { '土': 1.2, '火': 0.8, '木': 0.5, '金': 0.5, '水': 0.4 },
  '申': { '金': 1.2, '水': 0.8, '土': 0.5, '火': 0.3, '木': 0.5 },
  '酉': { '金': 1.2, '水': 0.8, '土': 0.5, '火': 0.3, '木': 0.5 },
  '戌': { '土': 1.2, '金': 0.8, '火': 0.5, '木': 0.5, '水': 0.6 },
  '亥': { '水': 1.2, '木': 0.8, '火': 0.3, '土': 0.5, '金': 0.5 },
  '子': { '水': 1.2, '木': 0.8, '火': 0.3, '土': 0.5, '金': 0.5 },
  '丑': { '土': 1.2, '水': 0.8, '金': 0.5, '木': 0.5, '火': 0.6 }
};

// 时辰映射
const SHI_CHEN_MAP = {
  '子时': 0, '丑时': 1, '寅时': 2, '卯时': 3,
  '辰时': 4, '巳时': 5, '午时': 6, '未时': 7,
  '申时': 8, '酉时': 9, '戌时': 10, '亥时': 11
};

// 时辰到24小时映射
const SHI_CHEN_HOUR = {
  '子时': [23, 1], '丑时': [1, 3], '寅时': [3, 5], '卯时': [5, 7],
  '辰时': [7, 9], '巳时': [9, 11], '午时': [11, 13], '未时': [13, 15],
  '申时': [15, 17], '酉时': [17, 19], '戌时': [19, 21], '亥时': [21, 23]
};

// 月干起始索引 (年干->月干起始)
const YUE_GAN_START = {
  '甲': 2, '己': 2,  // 甲己之年丙作首
  '乙': 4, '庚': 4,  // 乙庚之年戊为头
  '丙': 6, '辛': 6,  // 丙辛必定寻庚起
  '丁': 8, '壬': 8,  // 丁壬壬位顺行流
  '戊': 0, '癸': 0   // 戊癸之年何方发，甲寅之上好追求
};

// 日干起始索引 (时干->日干起始)
const RI_GAN_START = {
  '甲': 0, '己': 0,  // 甲己还生甲
  '乙': 2, '庚': 2,  // 乙庚丙作初
  '丙': 4, '辛': 4,  // 丙辛从戊起
  '丁': 6, '壬': 6,  // 丁壬庚子居
  '戊': 8, '癸': 8   // 戊癸何方发，壬子是真途
};

// 大运间隔 (年龄)
const DA_YUN_INTERVAL = 10;

// ==================== 核心算法 ====================

/**
 * 计算年柱
 * @param {number} year - 年份 (如 1990)
 * @returns {Object} { tianGan, diZhi, ganZhi, wuXing }
 */
function calcYearZhu(year) {
  const ganIndex = (year - 3) % 10;
  const zhiIndex = (year - 3) % 12;
  const tianGan = TIAN_GAN[ganIndex >= 0 ? ganIndex : ganIndex + 10];
  const diZhi = DI_ZHI[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12];
  return {
    tianGan,
    diZhi,
    ganZhi: tianGan + diZhi,
    wuXing: TIAN_GAN_WU_XING[tianGan]
  };
}

/**
 * 计算月柱
 * @param {number} year - 年份
 * @param {number} month - 月份 (1-12)
 * @returns {Object} { tianGan, diZhi, ganZhi, wuXing }
 */
function calcMonthZhu(year, month) {
  // 年干用于确定月干起始
  const yearGanIndex = (year - 3) % 10;
  const yearGan = TIAN_GAN[yearGanIndex >= 0 ? yearGanIndex : yearGanIndex + 10];
  
  const startIndex = YUE_GAN_START[yearGan];
  const ganIndex = (startIndex + month - 1) % 10;
  const tianGan = TIAN_GAN[ganIndex];
  
  const zhiIndex = (month - 1) % 12;
  const diZhi = DI_ZHI[zhiIndex];
  
  return {
    tianGan,
    diZhi,
    ganZhi: tianGan + diZhi,
    wuXing: TIAN_GAN_WU_XING[tianGan]
  };
}

/**
 * 计算日柱 (使用蔡勒公式变体)
 * @param {Date} date - 日期对象
 * @returns {Object} { tianGan, diZhi, ganZhi, wuXing }
 */
function calcDayZhu(date) {
  // 基准日期: 1900年1月1日是甲子日
  const baseDate = new Date(1900, 0, 1);
  
  // 计算天数差
  const daysDiff = Math.floor((date - baseDate) / (24 * 60 * 60 * 1000));
  
  // 甲子循环周期是60天
  const ganIndex = daysDiff % 10;
  const zhiIndex = daysDiff % 12;
  
  const tianGan = TIAN_GAN[ganIndex >= 0 ? ganIndex : ganIndex + 10];
  const diZhi = DI_ZHI[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12];
  
  return {
    tianGan,
    diZhi,
    ganZhi: tianGan + diZhi,
    wuXing: TIAN_GAN_WU_XING[tianGan]
  };
}

/**
 * 计算时柱
 * @param {string} dayGan - 日干
 * @param {string|number} shiChen - 时辰名称或索引(0-11)
 * @returns {Object} { tianGan, diZhi, ganZhi, wuXing }
 */
function calcTimeZhu(dayGan, shiChen) {
  let shiChenIndex;
  if (typeof shiChen === 'string') {
    shiChenIndex = SHI_CHEN_MAP[shiChen];
  } else {
    shiChenIndex = shiChen;
  }
  
  const startIndex = RI_GAN_START[dayGan];
  // 时干 = (起始索引 + floor(时辰索引/2)) % 10
  const ganIndex = (startIndex + Math.floor(shiChenIndex / 2)) % 10;
  const tianGan = TIAN_GAN[ganIndex];
  
  const diZhi = DI_ZHI[shiChenIndex];
  
  return {
    tianGan,
    diZhi,
    ganZhi: tianGan + diZhi,
    wuXing: TIAN_GAN_WU_XING[tianGan]
  };
}

/**
 * 五行分析
 * @param {Object} siZhu - 四柱对象
 * @returns {Object} 五行统计与分析
 */
function analyzeWuXing(siZhu) {
  const wuXingCount = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  
  // 统计天干五行
  [siZhu.nianZhu.tianGan, siZhu.yueZhu.tianGan, siZhu.riZhu.tianGan, siZhu.shiZhu.tianGan].forEach(gan => {
    wuXingCount[TIAN_GAN_WU_XING[gan]]++;
  });
  
  // 统计地支五行
  [siZhu.nianZhu.diZhi, siZhu.yueZhu.diZhi, siZhu.riZhu.diZhi, siZhu.shiZhu.diZhi].forEach(zhi => {
    wuXingCount[DI_ZHI_WU_XING[zhi]]++;
    // 地支藏干也要统计
    DI_ZHI_CANG_GAN[zhi].forEach(cangGan => {
      wuXingCount[TIAN_GAN_WU_XING[cangGan]] += 0.5;
    });
  });
  
  // 计算百分比
  const total = Object.values(wuXingCount).reduce((a, b) => a + b, 0);
  const percentage = {};
  for (const key in wuXingCount) {
    percentage[key] = Math.round((wuXingCount[key] / total) * 100);
  }
  
  // 确定日主五行
  const riZhuWuXing = siZhu.riZhu.wuXing;
  
  // 喜用神判断 (简化版: 弱则补，强则抑)
  // 获取月支
  const yueZhi = siZhu.yueZhu.diZhi;
  const yueLingStrength = YUE_LING_STRENGTH[yueZhi][riZhuWuXing] || 1;
  
  // 计算日主在月令中的强弱
  let riZhuPower = 1; // 基础分
  riZhuPower *= (yueLingStrength || 1);
  
  // 统计得令失令
  const lingScore = riZhuPower;
  
  // 喜用神判断
  let xiYong, shenYong;
  if (lingScore >= 1.1) {
    // 身强, 喜克泄
    const keZhi = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' };
    const xie = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    xiYong = keZhi[riZhuWuXing];
    shenYong = xie[riZhuWuXing];
  } else {
    // 身弱, 喜生扶
    const sheng = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };
    const fu = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };
    xiYong = sheng[riZhuWuXing];
    shenYong = fu[riZhuWuXing];
  }
  
  return {
    count: wuXingCount,
    percentage,
    xiYong: xiYong || riZhuWuXing,
    shenYong: shenYong || xiYong || riZhuWuXing,
    riZhuWuXing,
    lingScore: Math.round(lingScore * 100) / 100
  };
}

/**
 * 命盘强度分析
 * @param {Object} siZhu - 四柱
 * @param {Object} wuXingAnalysis - 五行分析结果
 * @returns {Object} { level, score, analysis }
 */
function analyzeMingPanStrength(siZhu, wuXingAnalysis) {
  const riZhuWuXing = wuXingAnalysis.riZhuWuXing;
  const lingScore = wuXingAnalysis.lingScore;
  
  // 基础分数
  let score = 50;
  
  // 月令强弱加成
  if (lingScore >= 1.2) score += 20;
  else if (lingScore >= 1.0) score += 10;
  else if (lingScore >= 0.8) score -= 10;
  else score -= 20;
  
  // 命局总分数
  const totalCount = Object.values(wuXingAnalysis.count).reduce((a, b) => a + b, 0);
  const riZhuCount = wuXingAnalysis.count[riZhuWuXing];
  const proportion = riZhuCount / totalCount;
  
  if (proportion >= 0.25) score += 15;
  else if (proportion >= 0.2) score += 8;
  else if (proportion < 0.12) score -= 15;
  else score -= 5;
  
  // 得分限制在0-100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // 等级判定
  let level;
  if (score >= 80) level = '极强';
  else if (score >= 65) level = '较强';
  else if (score >= 45) level = '中和';
  else if (score >= 30) level = '较弱';
  else level = '极弱';
  
  // 分析文字
  const analysis = `日主${riZhuWuXing}气，${level}。月令${siZhu.yueZhu.diZhi}对${riZhuWuXing}气的影响为${lingScore > 1 ? '相助' : lingScore < 1 ? '相克' : '持平'}。`;
  
  return { level, score, analysis };
}

/**
 * 计算大运
 * @param {number} birthYear - 出生年
 * @param {number} birthMonth - 出生月
 * @param {number} birthDay - 出生日
 * @param {string} gender - 性别 '男' 或 '女'
 * @returns {Array} 大运序列
 */
function calcDaYun(birthYear, birthMonth, birthDay, gender) {
  const now = new Date();
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  
  // 计算年龄 (简化: 从出生到今年的大运序号)
  const yearsPassed = now.getFullYear() - birthYear;
  const daYunStartAge = Math.floor(yearsPassed / DA_YUN_INTERVAL) * DA_YUN_INTERVAL;
  
  // 大运走向 (男阳年顺行，女阴年逆行)
  const yearGanIndex = (birthYear - 3) % 10;
  const isYangYear = yearGanIndex % 2 === 0; // 0,2,4,6,8为阳
  
  const forward = (gender === '男' && isYangYear) || (gender === '女' && !isYangYear);
  
  // 月柱天干索引
  const yueGanIndex = TIAN_GAN.indexOf(calculateMonthGan(birthYear, birthMonth));
  const yueZhiIndex = (birthMonth - 1) % 12;
  
  const daYunSequence = [];
  
  for (let i = 0; i < 8; i++) {
    const age = daYunStartAge + i * DA_YUN_INTERVAL;
    
    let ganIndex, zhiIndex;
    if (forward) {
      ganIndex = (yueGanIndex + i) % 10;
      zhiIndex = (yueZhiIndex + i) % 12;
    } else {
      ganIndex = (yueGanIndex - i + 10) % 10;
      zhiIndex = (yueZhiIndex - i + 12) % 12;
    }
    
    daYunSequence.push({
      age,
      ganZhi: TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex],
      wuXing: TIAN_GAN_WU_XING[TIAN_GAN[ganIndex]]
    });
  }
  
  return daYunSequence;
}

/**
 * 计算月干
 */
function calculateMonthGan(year, month) {
  const yearGanIndex = (year - 3) % 10;
  const yearGan = TIAN_GAN[yearGanIndex >= 0 ? yearGanIndex : yearGanIndex + 10];
  const startIndex = YUE_GAN_START[yearGan];
  const ganIndex = (startIndex + month - 1) % 10;
  return TIAN_GAN[ganIndex];
}

/**
 * 获取属相
 */
function getZodiac(year) {
  const zodiacIndex = (year - 4) % 12; // 1900年是鼠年
  return DI_ZHI[zodiacIndex >= 0 ? zodiacIndex : zodiacIndex + 12];
}

/**
 * 完整八字排盘
 * @param {Object} params - { year, month, day, hour, gender }
 * @returns {Object} 完整命盘
 */
function generateBaZi(params) {
  const { year, month, day, hour, gender } = params;
  
  // 解析日期
  const date = new Date(year, month - 1, day);
  
  // 计算四柱
  const nianZhu = calcYearZhu(year);
  const yueZhu = calcMonthZhu(year, month);
  const riZhu = calcDayZhu(date);
  const shiZhu = calcTimeZhu(riZhu.tianGan, hour);
  
  const siZhu = { nianZhu, yueZhu, riZhu, shiZhu };
  
  // 五行分析
  const wuXingAnalysis = analyzeWuXing(siZhu);
  
  // 命盘强度
  const mingPanStrength = analyzeMingPanStrength(siZhu, wuXingAnalysis);
  
  // 属相
  const zodiac = getZodiac(year);
  
  // 大运 (需要性别)
  let daYun = [];
  if (gender) {
    daYun = calcDaYun(year, month, day, gender);
  }
  
  return {
    nianZhu,
    yueZhu,
    riZhu,
    shiZhu,
    siZhu,
    wuXingAnalysis,
    riZhuStrength: mingPanStrength,
    zodiac,
    daYun,
    input: { year, month, day, hour, gender }
  };
}

// ==================== 辅助函数 ====================

/**
 * 格式化输出命盘
 */
function formatBaZiReport(bazi) {
  const { nianZhu, yueZhu, riZhu, shiZhu, wuXingAnalysis, riZhuStrength, zodiac, input } = bazi;
  
  let report = `【八字命盘分析报告】\n\n`;
  report += `出生信息：${input.year}年${input.month}月${input.day}日 ${input.hour}\n`;
  report += `性别：${input.gender || '未指定'}\n`;
  report += `属相：${zodiac}\n\n`;
  
  report += `▌四柱排盘\n`;
  report += `年柱：${nianZhu.ganZhi} (${nianZhu.wuXing}气)\n`;
  report += `月柱：${yueZhu.ganZhi} (${yueZhu.wuXing}气)\n`;
  report += `日柱：${riZhu.ganZhi} (${riZhu.wuXing}气)\n`;
  report += `时柱：${shiZhu.ganZhi} (${shiZhu.wuXing}气)\n\n`;
  
  report += `▌五行分析\n`;
  report += `木:${wuXingAnalysis.percentage.木}% 火:${wuXingAnalysis.percentage.火}% 土:${wuXingAnalysis.percentage.土}% 金:${wuXingAnalysis.percentage.金}% 水:${wuXingAnalysis.percentage.水}%\n`;
  report += `日主${wuXingAnalysis.riZhuWuXing}气，${riZhuStrength.level}（${riZhuStrength.analysis}）\n`;
  report += `喜用神：${wuXingAnalysis.xiYong} | 身神：${wuXingAnalysis.shenYong}\n\n`;
  
  if (bazi.daYun && bazi.daYun.length > 0) {
    report += `▌大运序列\n`;
    bazi.daYun.forEach(d => {
      report += `${d.age}岁：${d.ganZhi} (${d.wuXing})\n`;
    });
  }
  
  return report;
}

// ==================== 导出 ====================

module.exports = {
  // 核心计算
  calcYearZhu,
  calcMonthZhu,
  calcDayZhu,
  calcTimeZhu,
  generateBaZi,
  
  // 分析
  analyzeWuXing,
  analyzeMingPanStrength,
  calcDaYun,
  getZodiac,
  
  // 格式化
  formatBaZiReport,
  
  // 常量
  TIAN_GAN,
  DI_ZHI,
  TIAN_GAN_WU_XING,
  DI_ZHI_WU_XING,
  SHI_CHEN_MAP
};
