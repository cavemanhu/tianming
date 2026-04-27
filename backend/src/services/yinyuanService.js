/**
 * 姻缘配对服务
 * 核心算法：五行、属相、星座匹配度计算
 */

const baziService = require('./baziService');

// 星座信息
const CONSTELLATIONS = [
  { name: '白羊座', start: [3, 21], end: [4, 19], element: '火' },
  { name: '金牛座', start: [4, 20], end: [5, 20], element: '土' },
  { name: '双子座', start: [5, 21], end: [6, 21], element: '风' },
  { name: '巨蟹座', start: [6, 22], end: [7, 22], element: '水' },
  { name: '狮子座', start: [7, 23], end: [8, 22], element: '火' },
  { name: '处女座', start: [8, 23], end: [9, 22], element: '土' },
  { name: '天秤座', start: [9, 23], end: [10, 23], element: '风' },
  { name: '天蝎座', start: [10, 24], end: [11, 22], element: '水' },
  { name: '射手座', start: [11, 23], end: [12, 21], element: '火' },
  { name: '摩羯座', start: [12, 22], end: [1, 19], element: '土' },
  { name: '水瓶座', start: [1, 20], end: [2, 18], element: '风' },
  { name: '双鱼座', start: [2, 19], end: [3, 20], element: '水' }
];

// 属相五行
const ZODIAC_WU_XING = {
  '鼠': '水', '牛': '土', '虎': '木', '兔': '木',
  '龙': '土', '蛇': '火', '马': '火', '羊': '土',
  '猴': '金', '鸡': '金', '狗': '土', '猪': '水'
};

// 五行相生相克
const WU_XING_XIANG_SHENG = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
};

const WU_XING_XIANG_KE = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
};

// 属相相合（六合）
const ZODIAC_HARMONY = {
  '鼠': '牛', '牛': '鼠',
  '虎': '猪', '猪': '虎',
  '兔': '狗', '狗': '兔',
  '龙': '鸡', '鸡': '龙',
  '蛇': '猴', '猴': '蛇',
  '马': '羊', '羊': '马'
};

// 属相相冲（六冲）
const ZODIAC_CONFLICT = {
  '鼠': '马', '马': '鼠',
  '牛': '羊', '羊': '牛',
  '虎': '猴', '猴': '虎',
  '兔': '鸡', '鸡': '兔',
  '龙': '狗', '狗': '龙',
  '蛇': '猪', '猪': '蛇'
};

// 星座相合
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
const CONSTELLATION_CONFLICT = {
  '白羊座': ['天秤座'],
  '金牛座': ['天蝎座'],
  '双子座': ['射手座'],
  '巨蟹座': ['摩羯座'],
  '狮子座': ['水瓶座'],
  '处女座': ['双鱼座'],
  '天秤座': ['白羊座'],
  '天蝎座': ['金牛座'],
  '射手座': ['双子座'],
  '摩羯座': ['巨蟹座'],
  '水瓶座': ['狮子座'],
  '双鱼座': ['处女座']
};

/**
 * 根据生日获取星座
 */
function getConstellation(year, month, day) {
  for (const c of CONSTELLATIONS) {
    // 处理跨年的星座（如摩羯座）
    if (c.name === '摩羯座') {
      if ((month === 12 && day >= c.start[1]) || (month === 1 && day <= c.end[1])) {
        return c;
      }
    } else {
      if ((month === c.start[0] && day >= c.start[1]) || (month === c.end[0] && day <= c.end[1])) {
        return c;
      }
    }
  }
  return CONSTELLATIONS[0]; // 默认
}

/**
 * 计算姻缘配对
 * @param {Object} person1 - { name, gender, birthYear, birthMonth, birthDay, birthTime }
 * @param {Object} person2 - { name, gender, birthYear, birthMonth, birthDay, birthTime }
 */
function calculateMatch(person1, person2) {
  // 1. 获取双方八字
  const bazi1 = baziService.calculateBaZi(
    person1.birthYear, person1.birthMonth, person1.birthDay, person1.birthTime || '子时'
  );
  const bazi2 = baziService.calculateBaZi(
    person2.birthYear, person2.birthMonth, person2.birthDay, person2.birthTime || '子时'
  );

  // 2. 获取属相
  const zodiac1 = baziService.getZodiac(person1.birthYear);
  const zodiac2 = baziService.getZodiac(person2.birthYear);

  // 3. 获取星座
  const constellation1 = getConstellation(person1.birthYear, person1.birthMonth, person1.birthDay);
  const constellation2 = getConstellation(person2.birthYear, person2.birthMonth, person2.birthDay);

  // 4. 计算各项匹配度
  const wuXingMatch = calculateWuXingMatch(bazi1, bazi2);
  const zodiacMatch = calculateZodiacMatch(zodiac1, zodiac2);
  const constellationMatch = calculateConstellationMatch(constellation1, constellation2);
  const baziMatch = calculateBaziMatch(bazi1, bazi2);

  // 5. 综合评分
  const overallScore = Math.round(
    wuXingMatch.score * 0.3 +
    zodiacMatch.score * 0.25 +
    constellationMatch.score * 0.25 +
    baziMatch.score * 0.2
  );

  // 6. 生成详细报告
  const report = generateReport(person1, person2, {
    bazi1, bazi2,
    zodiac1, zodiac2,
    constellation1, constellation2,
    wuXingMatch,
    zodiacMatch,
    constellationMatch,
    baziMatch,
    overallScore
  });

  return {
    score: overallScore,
    level: getMatchLevel(overallScore),
    details: {
      wuXing: wuXingMatch,
      zodiac: zodiacMatch,
      constellation: constellationMatch,
      bazi: baziMatch
    },
    report,
    info: {
      person1: {
        name: person1.name,
        zodiac: zodiac1,
        constellation: constellation1.name,
        bazi: `${bazi1.riZhu.ganZhi}日主`
      },
      person2: {
        name: person2.name,
        zodiac: zodiac2,
        constellation: constellation2.name,
        bazi: `${bazi2.riZhu.ganZhi}日主`
      }
    }
  };
}

/**
 * 五行匹配度计算
 */
function calculateWuXingMatch(bazi1, bazi2) {
  const wx1 = bazi1.wuXingAnalysis;
  const wx2 = bazi2.wuXingAnalysis;

  // 计算五行互补程度
  let complementScore = 0;
  const elements = ['木', '火', '土', '金', '水'];

  for (const el of elements) {
    // 如果一方弱，另一方强，则加分
    const diff = wx1.count[el] - wx2.count[el];
    if (Math.abs(diff) >= 2) {
      // 一方有，一方无或很少，互补
      complementScore += 20;
    }
  }

  // 计算日主关系
  const ri1 = bazi1.riZhuStrength;
  const ri2 = bazi2.riZhuStrength;

  // 检查日主是否相生
  let riScore = 0;
  for (const [key, value] of Object.entries(WU_XING_XIANG_SHENG)) {
    if (ri1.riGanWuXing === key && ri2.riGanWuXing === value) {
      riScore += 30; // 日主相生
    }
  }

  // 检查日主是否相克
  for (const [key, value] of Object.entries(WU_XING_XIANG_KE)) {
    if (ri1.riGanWuXing === key && ri2.riGanWuXing === value) {
      riScore -= 20; // 日主相克
    }
  }

  const totalScore = Math.max(0, Math.min(100, 50 + complementScore + riScore));

  return {
    score: totalScore,
    person1: { wuXing: wx1.summary, xiYong: wx1.xiYong },
    person2: { wuXing: wx2.summary, xiYong: wx2.xiYong },
    analysis: generateWuXingAnalysis(wx1, wx2)
  };
}

/**
 * 属相匹配度计算
 */
function calculateZodiacMatch(zodiac1, zodiac2) {
  // 六合：100分
  if (ZODIAC_HARMONY[zodiac1] === zodiac2) {
    return {
      score: 100,
      relation: '六合',
      analysis: `${zodiac1}与${zodiac2}为六合关系，是天生一对，缘分极深。`
    };
  }

  // 相冲：20分
  if (ZODIAC_CONFLICT[zodiac1] === zodiac2) {
    return {
      score: 20,
      relation: '六冲',
      analysis: `${zodiac1}与${zodiac2}为六冲关系，相处易有矛盾，需要相互包容。`
    };
  }

  // 同五行：70分
  if (ZODIAC_WU_XING[zodiac1] === ZODIAC_WU_XING[zodiac2]) {
    return {
      score: 70,
      relation: '同五行',
      analysis: `${zodiac1}与${zodiac2}五行相同，性情相近，沟通顺畅。`
    };
  }

  // 相生：80分
  const wx1 = ZODIAC_WU_XING[zodiac1];
  if (WU_XING_XIANG_SHENG[wx1] === ZODIAC_WU_XING[zodiac2]) {
    return {
      score: 80,
      relation: '相生',
      analysis: `${zodiac1}生${zodiac2}，一方愿意付出，另一方懂得感恩。`
    };
  }

  // 被生：60分
  if (WU_XING_XIANG_SHENG[ZODIAC_WU_XING[zodiac2]] === wx1) {
    return {
      score: 60,
      relation: '相生（被生）',
      analysis: `${zodiac2}生${zodiac1}，一方付出较多，需注意平衡。`
    };
  }

  // 相克：40分
  if (WU_XING_XIANG_KE[wx1] === ZODIAC_WU_XING[zodiac2]) {
    return {
      score: 40,
      relation: '相克',
      analysis: `${zodiac1}克${zodiac2}，需要一方收敛锋芒，相互体谅。`
    };
  }

  // 被克：30分
  if (WU_XING_XIANG_KE[ZODIAC_WU_XING[zodiac2]] === wx1) {
    return {
      score: 30,
      relation: '相克（被克）',
      analysis: `${zodiac2}克${zodiac1}，需注意相处方式，避免冲突。`
    };
  }

  return {
    score: 50,
    relation: '一般',
    analysis: `${zodiac1}与${zodiac2}组合一般，需要多沟通了解。`
  };
}

/**
 * 星座匹配度计算
 */
function calculateConstellationMatch(c1, c2) {
  // 完全相合：100分
  if (CONSTELLATION_HARMONY[c1.name]?.includes(c2.name)) {
    return {
      score: 100,
      relation: '很合',
      element: `${c1.element}与${c2.element}`,
      analysis: `${c1.name}与${c2.name}是天生一对，在一起非常和谐。`
    };
  }

  // 相冲：20分
  if (CONSTELLATION_CONFLICT[c1.name]?.includes(c2.name)) {
    return {
      score: 20,
      relation: '相冲',
      element: `${c1.element}与${c2.element}`,
      analysis: `${c1.name}与${c2.name}容易有分歧，需要多理解和妥协。`
    };
  }

  // 同元素：75分
  if (c1.element === c2.element) {
    return {
      score: 75,
      relation: '同元素',
      element: `${c1.element}`,
      analysis: `${c1.name}与${c2.name}同属${c1.element}元素，性情相近，相处融洽。`
    };
  }

  // 相生元素：85分
  if (WU_XING_XIANG_SHENG[c1.element] === c2.element) {
    return {
      score: 85,
      relation: '相生',
      element: `${c1.element}生${c2.element}`,
      analysis: `${c1.name}的${c1.element}能量滋润${c2.name}，相处舒适。`
    };
  }

  // 被相生：65分
  if (WU_XING_XIANG_SHENG[c2.element] === c1.element) {
    return {
      score: 65,
      relation: '相生（被生）',
      element: `${c1.element}被${c2.element}生`,
      analysis: `${c2.name}的${c2.element}能量滋润${c1.name}，一方需多付出。`
    };
  }

  // 相克：35分
  if (WU_XING_XIANG_KE[c1.element] === c2.element) {
    return {
      score: 35,
      relation: '相克',
      element: `${c1.element}克${c2.element}`,
      analysis: `${c1.name}的${c1.element}克制${c2.name}的${c2.element}，需注意平衡。`
    };
  }

  // 被相克：45分
  if (WU_XING_XIANG_KE[c2.element] === c1.element) {
    return {
      score: 45,
      relation: '相克（被克）',
      element: `${c2.element}克${c1.element}`,
      analysis: `${c2.name}的${c2.element}克制${c1.name}的${c1.element}，需相互体谅。`
    };
  }

  return {
    score: 55,
    relation: '一般',
    element: `${c1.element}与${c2.element}`,
    analysis: `${c1.name}与${c2.name}相处需要一些磨合。`
  };
}

/**
 * 八字匹配度计算（简化版）
 */
function calculateBaziMatch(bazi1, bazi2) {
  let score = 60; // 基础分

  // 检查日主是否相合
  const riGan1 = bazi1.riZhu.tianGan;
  const riGan2 = bazi2.riZhu.tianGan;

  // 天干五合：甲己、乙庚、丙辛、丁壬、戊癸
  const TIAN_GAN_HE = {
    '甲': '己', '己': '甲',
    '乙': '庚', '庚': '乙',
    '丙': '辛', '辛': '丙',
    '丁': '壬', '壬': '丁',
    '戊': '癸', '癸': '戊'
  };

  if (TIAN_GAN_HE[riGan1] === riGan2) {
    score += 25;
  }

  // 检查地支是否相合（子丑、寅亥、卯戌、辰酉、巳申、午未）
  const DI_ZHI_HE = {
    '子': '丑', '丑': '子',
    '寅': '亥', '亥': '寅',
    '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰',
    '巳': '申', '申': '巳',
    '午': '未', '未': '午'
  };

  const riZhi1 = bazi1.riZhu.diZhi;
  const riZhi2 = bazi2.riZhu.diZhi;

  if (DI_ZHI_HE[riZhi1] === riZhi2) {
    score += 15;
  }

  return {
    score: Math.min(100, score),
    person1: { riZhu: bazi1.riZhu.ganZhi },
    person2: { riZhu: bazi2.riZhu.ganZhi },
    analysis: `日柱${bazi1.riZhu.ganZhi}与${bazi2.riZhu.ganZhi}${score >= 80 ? '配合较好' : '关系一般'}。`
  };
}

/**
 * 生成匹配等级
 */
function getMatchLevel(score) {
  if (score >= 90) return '极佳';
  if (score >= 75) return '优秀';
  if (score >= 60) return '良好';
  if (score >= 45) return '一般';
  return '欠佳';
}

/**
 * 五行分析文字
 */
function generateWuXingAnalysis(wx1, wx2) {
  const lines = [];
  lines.push(`一方五行：${wx1.summary}，喜用${wx1.xiYong}`);
  lines.push(`另一方五行：${wx2.summary}，喜用${wx2.xiYong}`);
  return lines.join('；') + '。';
}

/**
 * 生成完整报告
 */
function generateReport(p1, p2, data) {
  const { wuXingMatch, zodiacMatch, constellationMatch, baziMatch, overallScore } = data;

  const lines = [
    `【姻缘配对分析报告】`,
    ``,
    `${p1.name}（${data.zodiac1} ${data.constellation1.name}）`,
    `${p2.name}（${data.zodiac2} ${data.constellation2.name}）`,
    ``,
    `▌综合评分：${overallScore}分（${getMatchLevel(overallScore)}）`,
    ``,
    `▌属相分析`,
    `${zodiacMatch.analysis}`,
    `匹配度：${zodiacMatch.score}分`,
    ``,
    `▌星座分析`,
    `${constellationMatch.analysis}`,
    `匹配度：${constellationMatch.score}分`,
    ``,
    `▌五行分析`,
    `${wuXingMatch.analysis}`,
    `匹配度：${wuXingMatch.score}分`,
    ``,
    `▌八字简析`,
    `${baziMatch.analysis}`,
    `匹配度：${baziMatch.score}分`,
    ``,
    `▌建议`,
    getSuggestion(overallScore, zodiacMatch, constellationMatch)
  ];

  return lines.join('\n');
}

/**
 * 获取建议
 */
function getSuggestion(score, zodiacMatch, constellationMatch) {
  if (score >= 85) {
    return '缘分很好！各方面都非常契合，是难得的理想组合。';
  } else if (score >= 70) {
    return '缘分不错！虽然有小分歧，但整体和谐，适合发展。';
  } else if (score >= 55) {
    return '缘分一般，需要多一些包容和理解，多沟通培养感情。';
  } else {
    return '缘分较弱，双方差异较大，建议谨慎考虑，长期关系需要更多努力。';
  }
}

/**
 * 测试函数
 */
function testMatch() {
  const result = calculateMatch(
    { name: '张三', gender: 1, birthYear: 1990, birthMonth: 5, birthDay: 15, birthTime: '子时' },
    { name: '李四', gender: 2, birthYear: 1992, birthMonth: 8, birthDay: 20, birthTime: '午时' }
  );
  console.log('配对结果:', JSON.stringify(result, null, 2));
  console.log('\n报告:\n', result.report);
  return result;
}

module.exports = {
  calculateMatch,
  getConstellation,
  testMatch
};
