/**
 * 取名服务
 * 根据八字五行、生肖、性别生成名字列表
 */

const baziService = require('./baziService');

// 常用汉字五行属性（简化版字典）
const CHAR_WU_XING = {
  // 木部首
  '林': '木', '森': '木', '柳': '木', '桂': '木', '桐': '木',
  '梓': '木', '桑': '木', '槐': '木', '楷': '木', '枋': '木',
  '松': '木', '柏': '木', '杉': '木', '彬': '木', '琼': '木',
  '杨': '木', '桦': '木', '枫': '木', '竹': '木', '笋': '木',
  '芬': '木', '芳': '木', '芸': '木', '芷': '木', '花': '木',
  '苗': '木', '若': '木', '英': '木', '蕊': '木', '蕾': '木',
  '萱': '木', '蒸': '木', '荣': '木', '萍': '木', '蕾': '木',
  
  // 火部首
  '火': '火', '炎': '火', '焱': '火', '焱': '火', '焰': '火',
  '灿': '火', '灵': '火', '炜': '火', '炫': '火', '熠': '火',
  '辉': '火', '光': '火', '耀': '火', '熙': '火', '彤': '火',
  '丹': '火', '红': '火', '绛': '火', '紫': '火', '文': '火',
  '雯': '火', '焕': '火', '煜': '火', '炀': '火', '炯': '火',
  '点': '火', '烈': '火', '熔': '火', '爆': '火', '炸': '火',
  
  // 土部首
  '土': '土', '均': '土', '垣': '土', '城': '土', '域': '土',
  '培': '土', '基': '土', '堂': '土', '增': '土', '墨': '土',
  '坤': '土', '壁': '土', '壮': '土', '城': '土', '堡': '土',
  '坚': '土', '壤': '土', '堰': '土', '塔': '土', '境': '土',
  '增': '土', '佳': '土', '诚': '土', '坚': '土', '懿': '土',
  '安': '土', '宇': '土', '定': '土', '宗': '土', '宜': '土',
  
  // 金部首
  '金': '金', '银': '金', '铜': '金', '铁': '金', '锡': '金',
  '铭': '金', '锋': '金', '锐': '金', '镇': '金', '镖': '金',
  '钧': '金', '鑫': '金', '铎': '金', '钰': '金', '锦': '金',
  '绣': '金', '缙': '金', '绪': '金', '纲': '金', '纳': '金',
  '珍': '金', '珠': '金', '璧': '金', '玉': '金', '珞': '金',
  '璇': '金', '琳': '金', '琅': '金', '珏': '金', '琪': '金',
  
  // 水部首
  '水': '水', '冰': '水', '江': '水', '河': '水', '湖': '水',
  '海': '水', '涛': '水', '波': '水', '浪': '水', '涌': '水',
  '洁': '水', '洋': '水', '深': '水', '清': '水', '湛': '水',
  '湘': '水', '泽': '水', '润': '水', '汐': '水', '潮': '水',
  '洁': '水', '泽': '水', '淳': '水', '泓': '水', '泉': '水',
  '永': '水', '泳': '水', '涵': '水', '源': '水', '汝': '水'
};

// 常见名字用字（按五行分类）
const COMMON_NAMES = {
  木: ['林', '森', '柳', '桂', '桐', '松', '柏', '杉', '杨', '桦', '枫', '竹', '芸', '芷', '英', '芳', '芬', '萍', '萱', '荣', '岚', '彬', '琳', '琼', '瑶', '瑾', '琳', '琪', '琳', '荣'],
  火: ['火', '炎', '灿', '灵', '炜', '炫', '辉', '光', '耀', '熙', '彤', '丹', '红', '紫', '文', '雯', '焕', '煜', '炯', '昌', '明', '昊', '晟', '朗', '炎', '狄', '耿', '郴'],
  土: ['土', '均', '垣', '城', '域', '培', '基', '堂', '增', '墨', '坤', '壁', '坚', '佳', '诚', '安', '宇', '定', '宗', '宜', '怡', '予', '予', ' transcendental', '壤', '塔', '境'],
  金: ['金', '银', '钧', '鑫', '铎', '钰', '锦', '绣', '珍', '珠', '玉', '珞', '璇', '琳', '琅', '琪', '瑶', '瑾', '瑟', '珏', '瑞', '璋', '璞', '璁', '聪', '锦', '钒', '锡'],
  水: ['冰', '江', '河', '湖', '海', '涛', '波', '浪', '洁', '洋', '深', '清', '湛', '湘', '泽', '润', '汐', '潮', '永', '泳', '涵', '源', '泉', '瀚', '漾', '潞', '泽', '洁', '洋']
};

// 五行偏旁部首
const WU_XING_RADICALS = {
  木: ['木', '艹', '耒', '糸'],
  火: ['火', '灬', '光'],
  土: ['土', '玉', '石'],
  金: ['金', '刂', '刀', '戈'],
  水: ['水', '氵', '冫', '雨']
};

// 五行相生助名
const NAME_BANLIANG = {
  '木': { sheng: '火', zhu: '水' },
  '火': { sheng: '土', zhu: '木' },
  '土': { sheng: '金', zhu: '火' },
  '金': { sheng: '水', zhu: '土' },
  '水': { sheng: '木', zhu: '金' }
};

/**
 * 生成名字列表
 * @param {Object} params
 *   - birthYear, birthMonth, birthDay, birthTime: 八字参数
 *   - gender: 性别 1=男 2=女
 *   - surname: 姓氏
 *   - nameStyle: 风格（诗意/古典/现代/简洁）
 */
function generateNames(params) {
  const { birthYear, birthMonth, birthDay, birthTime, gender, surname = '', nameStyle = 'modern' } = params;
  
  // 1. 计算八字
  const bazi = baziService.calculateBaZi(birthYear, birthMonth, birthDay, birthTime || '子时');
  const { xiYong, shenYong } = bazi.wuXingAnalysis;
  
  // 2. 获取属相
  const zodiac = bazi.zodiac;
  
  // 3. 根据喜用神确定推荐五行
  const recommendWuXing = xiYong;
  const supportWuXing = shenYong;
  
  // 4. 生成候选字
  const candidates = generateCandidates(recommendWuXing, supportWuXing, gender, nameStyle);
  
  // 5. 组合名字
  const names = combineNames(candidates, surname, gender, zodiac, recommendWuXing);
  
  // 6. 评分排序
  const scoredNames = names.map(name => ({
    name: surname + name,
    score: scoreName(name, recommendWuXing, supportWuXing, zodiac),
    analysis: analyzeName(name, recommendWuXing, supportWuXing, bazi)
  }));
  
  scoredNames.sort((a, b) => b.score - a.score);
  
  return {
    baziInfo: {
      nianZhu: bazi.nianZhu.ganZhi,
      riZhu: bazi.riZhu.ganZhi,
      xiYong,
      supportWuXing,
      zodiac
    },
    recommendWuXing,
    totalGenerated: names.length,
    names: scoredNames.slice(0, 20) // 返回前20个
  };
}

/**
 * 生成候选字
 */
function generateCandidates(xiYing, support, gender, style) {
  let chars = [];
  
  // 主选五行字
  if (COMMON_NAMES[xiYing]) {
    chars = chars.concat(COMMON_NAMES[xiYing]);
  }
  
  // 喜用神相助五行
  if (COMMON_NAMES[support]) {
    chars = chars.concat(COMMON_NAMES[support]);
  }
  
  // 去除重复
  chars = [...new Set(chars)];
  
  // 根据性别筛选
  if (gender === 1) { // 男
    chars = chars.filter(c => !['婷', '媛', '媚', '娇', '娜', '莎', '琪'].includes(c));
  } else { // 女
    chars = chars.filter(c => !['浩', '刚', '烈', '威', '豪', '杰', '勇'].includes(c));
  }
  
  // 打乱顺序
  chars = shuffleArray(chars);
  
  return chars;
}

/**
 * 组合名字
 */
function combineNames(chars, surname, gender, zodiac, recommendWuXing) {
  const names = [];
  
  // 2字名
  for (let i = 0; i < chars.length && names.length < 30; i++) {
    for (let j = 0; j < chars.length && names.length < 30; j++) {
      if (i !== j) {
        const name = chars[i] + chars[j];
        // 避免与姓氏重复
        if (name !== surname + surname) {
          names.push(name);
        }
      }
    }
  }
  
  // 3字名（中间字）
  const middleChars = ['之', '于', '以', '宛', '思', '晓', '君', '子', '若', '永'];
  for (let i = 0; i < chars.length && names.length < 40; i++) {
    for (let m = 0; m < middleChars.length && names.length < 40; m++) {
      const name = chars[i] + middleChars[m] + chars[(i + 3) % chars.length];
      names.push(name);
    }
  }
  
  return names;
}

/**
 * 名字评分
 */
function scoreName(name, recommendWuXing, supportWuXing, zodiac) {
  let score = 60; // 基础分
  
  // 检查每个字的五行
  for (const char of name) {
    const charWuXing = CHAR_WU_XING[char] || guessWuXing(char);
    if (charWuXing === recommendWuXing) {
      score += 15; // 喜用神加分
    } else if (charWuXing === supportWuXing) {
      score += 8; // 扶持五行加分
    } else {
      // 检查是否被喜用神所生
      const sheng = NAME_BANLIANG[recommendWuXing]?.sheng;
      if (charWuXing === sheng) {
        score += 5; // 被喜用神所生
      }
    }
  }
  
  // 属相生肖匹配
  const zodiacChars = getZodiacLuckyChars(zodiac);
  for (const char of name) {
    if (zodiacChars.includes(char)) {
      score += 5;
    }
  }
  
  // 避免贬义字
  if (hasNegativeMeaning(name)) {
    score -= 20;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * 猜测汉字五行（根据偏旁部首）
 */
function guessWuXing(char) {
  const code = char.charCodeAt(0);
  
  // 简单判断
  if (char.includes('氵') || char.includes('冫') || char.includes('雨')) return '水';
  if (char.includes('火') || char.includes('灬')) return '火';
  if (char.includes('木') || char.includes('艹')) return '木';
  if (char.includes('金') || char.includes('刂')) return '金';
  if (char.includes('土') || char.includes('玉') || char.includes('石')) return '土';
  
  // 默认
  return '土';
}

/**
 * 获取属相吉运字
 */
function getZodiacLuckyChars(zodiac) {
  const luckyMap = {
    '鼠': ['米', '豆', '麦', '木', '穴', '宀'],
    '牛': ['艹', '土', '田', '车', '氵'],
    '虎': ['山', '林', '王', '君', '大', '弓'],
    '兔': ['艹', '木', '月', '田', '山', '糸'],
    '龙': ['辰', '云', '星', '月', '水', '氵'],
    '蛇': ['艹', '木', '石', '衣', '系', '虫'],
    '马': ['艹', '木', '月', '日', '火', '灬'],
    '羊': ['艹', '土', '玉', '王', '月', '禾'],
    '猴': ['木', '果', '大', '山', '石', '金'],
    '鸡': ['米', '豆', '虫', '石', '山', '土'],
    '狗': ['艹', '肉', '月', '心', '土', '金'],
    '猪': ['豆', '米', '水', '氵', '艹', '土']
  };
  return luckyMap[zodiac] || [];
}

/**
 * 检查是否有负面含义
 */
function hasNegativeMeaning(name) {
  const negativeChars = ['死', '亡', '凶', '杀', '煞', '鬼', '病', '痛', '苦', '灾', '祸', '刑', '牢', '牢', '刀', '血', '尸'];
  for (const char of name) {
    if (negativeChars.includes(char)) {
      return true;
    }
  }
  return false;
}

/**
 * 分析名字
 */
function analyzeName(name, xiYong, supportWuXing, bazi) {
  const lines = [];
  
  // 五行分析
  const charsWuXing = name.split('').map(c => CHAR_WU_XING[c] || guessWuXing(c));
  lines.push(`五行：${charsWuXing.join('·')}`);
  
  // 与喜用神关系
  if (charsWuXing.includes(xiYong)) {
    lines.push(`含${xiYong}行，补命中所需`);
  }
  
  // 与八字关系
  lines.push(`日主${bazi.riZhu.ganZhi}，${bazi.riZhuStrength.level}`);
  
  return lines.join('；');
}

/**
 * 打乱数组
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 测试函数
 */
function testNaming() {
  const result = generateNames({
    birthYear: 1990,
    birthMonth: 5,
    birthDay: 15,
    birthTime: '子时',
    gender: 1, // 男
    surname: '李',
    nameStyle: 'modern'
  });
  
  console.log('取名结果:');
  console.log('八字信息:', result.baziInfo);
  console.log('推荐五行:', result.recommendWuXing);
  console.log('\n候选名字（前10个）:');
  result.names.slice(0, 10).forEach((n, i) => {
    console.log(`${i + 1}. ${n.name} - ${n.score}分 - ${n.analysis}`);
  });
  
  return result;
}

module.exports = {
  generateNames,
  scoreName,
  analyzeName,
  testNaming
};
