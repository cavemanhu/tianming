/**
 * 易经64卦占卜服务
 * 天命阁 v2.0
 */

// ==================== 64卦数据 ====================
const HEXAGRAMS = [
  { id: 1, name: '乾', gua: '☰☰', wuxing: '金', meaning: '元亨利贞', interpretation: '天行健，君子以自强不息。卦德刚健进取，不可限量。', poetry: '大哉乾元，万物资始，乃统天。' },
  { id: 2, name: '坤', gua: '☷☷', wuxing: '土', meaning: '元亨利牝马之贞', interpretation: '地势坤，君子以厚德载物。卦德柔顺安静，承载万物。', poetry: '地势坤，君子以厚德载物。' },
  { id: 3, name: '屯', gua: '☳☶', wuxing: '水', meaning: '元亨利贞，勿用有攸往', interpretation: '万物始生，艰难困顿之时，宜守正待机。', poetry: '屯如邅如，乘马班如。' },
  { id: 4, name: '蒙', gua: '☶☳', wuxing: '土', meaning: '亨，匪我求童蒙，童蒙求我', interpretation: '蒙昧初始，当启发愚蒙，教化育人。', poetry: '山下出泉，蒙；君子以果行育德。' },
  { id: 5, name: '需', gua: '☰☵', wuxing: '水', meaning: '有孚，光亨，贞吉', interpretation: '等待时机，有信则通达，守正则吉祥。', poetry: '云上于天，需；君子以饮食宴乐。' },
  { id: 6, name: '讼', gua: '☵☰', wuxing: '水', meaning: '有孚，窒惕，中吉，终凶', interpretation: '争讼是非，宜和解勿争，中途吉利，终则凶。', poetry: '天与水违行，讼；君子以作事谋始。' },
  { id: 7, name: '师', gua: '☷☵', wuxing: '水', meaning: '贞，丈人吉，无咎', interpretation: '率众出师，任用贤明则吉。', poetry: '地中有水，师；君子以容民畜众。' },
  { id: 8, name: '比', gua: '☵☷', wuxing: '水', meaning: '吉，原筮，元永贞，不宁方来', interpretation: '亲比辅佐，团结和谐，先王以建万国，亲诸侯。', poetry: '地上有水，比；先王以建万国，亲诸侯。' },
  { id: 9, name: '小畜', gua: '☴☰', wuxing: '木', meaning: '亨，密云不雨，自我西郊', interpretation: '小有积蓄，时机未至，密云不雨之象。', poetry: '风行天上，小畜；君子以懿文德。' },
  { id: 10, name: '履', gua: '☰☱', wuxing: '金', meaning: '履虎尾，不咥人，亨', interpretation: '小心翼翼行事，虽履虎尾而不被咬，亨通。', poetry: '上天下泽，履；君子以辨上下，定民志。' },
  { id: 11, name: '泰', gua: '☰☷', wuxing: '土', meaning: '小往大来，吉，亨', interpretation: '天地交泰，万物通泰，国泰民安。', poetry: '天地交，泰；后以财成天地之道，辅相天地之宜。' },
  { id: 12, name: '否', gua: '☷☰', wuxing: '土', meaning: '否之匪人，不利君子贞，大往小来', interpretation: '天地不交，闭塞不通，小人道长，君子道消。', poetry: '天地不交，否；君子以俭德辟难，不可荣以禄。' },
  { id: 13, name: '同人', gua: '☰☲', wuxing: '火', meaning: '同人于野，亨，利涉大川，利君子贞', interpretation: '与人同心，志同道合，亨通畅达。', poetry: '天与火，同人；君子以类族辨物。' },
  { id: 14, name: '大有', gua: '☲☰', wuxing: '火', meaning: '元亨', interpretation: '大丰收，富有盛大之象。', poetry: '火在天上，大有；君子以遏恶扬善，顺天休命。' },
  { id: 15, name: '谦', gua: '☶☷', wuxing: '土', meaning: '亨，君子有终', interpretation: '谦逊有德，君子有终，吉祥。', poetry: '地中有山，谦；君子以裒多益寡，称物平施。' },
  { id: 16, name: '豫', gua: '☷☳', wuxing: '木', meaning: '利建侯行师', interpretation: '和乐愉悦，有利于封侯建国，出兵征伐。', poetry: '雷出地奋，豫；先王以作乐崇德，殷荐之上帝，以配祖考。' },
  { id: 17, name: '随', gua: '☳☱', wuxing: '金', meaning: '元亨利贞，无咎', interpretation: '随从顺从，择善而从，贞正则无咎。', poetry: '泽中有雷，随；君子以向晦入宴息。' },
  { id: 18, name: '蛊', gua: '☱☶', wuxing: '木', meaning: '元亨，利涉大川，先甲三日，后甲三日', interpretation: '除弊治乱，振民育德。', poetry: '山下有风，蛊；君子以振民育德。' },
  { id: 19, name: '临', gua: '☷☱', wuxing: '土', meaning: '元亨利贞，至于八月有凶', interpretation: '居高临下，临近百姓，八月有凶需警惕。', poetry: '泽上有地，临；君子以教思无穷，容保民无疆。' },
  { id: 20, name: '观', gua: '☴☷', wuxing: '木', meaning: '盥而不荐，有孚颙若', interpretation: '观仰祭祀，诚心敬仰，民心归附。', poetry: '风行地上，观；先王以省方观民设教。' },
  { id: 21, name: '噬嗑', gua: '☲☶', wuxing: '火', meaning: '亨，利用狱', interpretation: '明罚敕法，审理案件，除暴安良。', poetry: '雷电噬嗑；先王以明罚敕法。' },
  { id: 22, name: '贲', gua: '☶☲', wuxing: '火', meaning: '亨，小利有攸往', interpretation: '文饰美化，礼尚往来，小利前行。', poetry: '山下有火，贲；君子以明庶政，无敢折狱。' },
  { id: 23, name: '剥', gua: '☷☶', wuxing: '土', meaning: '不利有攸往', interpretation: '群阴剥阳，衰落之时，不宜行动。', poetry: '山附于地，剥；上以厚下安宅。' },
  { id: 24, name: '复', gua: '☶☷', wuxing: '木', meaning: '亨，出入无疾，朋来无咎', interpretation: '阳气复生，一阳来复，吉祥通达。', poetry: '雷在地中，复；先王以至日闭关，商旅不行，后不省方。' },
  { id: 25, name: '无妄', gua: '☳☰', wuxing: '金', meaning: '元亨利贞，其匪正有眚，不利有攸往', interpretation: '天真无邪，不妄为则吉，邪道有祸。', poetry: '天下雷行，物与无妄；先王以茂对时，育万物。' },
  { id: 26, name: '大畜', gua: '☶☰', wuxing: '土', meaning: '利贞，不家食吉，利涉大川', interpretation: '大积蓄，待时而动，外出发展吉。', poetry: '天在山中，大畜；君子以多识前言往行，以畜其德。' },
  { id: 27, name: '颐', gua: '☶☳', wuxing: '木', meaning: '贞吉，观颐，自求口实', interpretation: '养身养德，自食其力，观察颐养之道。', poetry: '山下有雷，颐；君子以慎言语，节饮食。' },
  { id: 28, name: '大过', gua: '☱☴', wuxing: '金', meaning: '栋桡，利有攸往，亨', interpretation: '大过失常，栋梁弯曲，利于前行，亨通。', poetry: '泽灭木，大过；君子以独立不惧，遁世无闷。' },
  { id: 29, name: '坎', gua: '☵☵', wuxing: '水', meaning: '习坎，有孚，维心亨，行有尚', interpretation: '重重险陷，心怀诚信，亨通畅达。', poetry: '水洊至，习坎；君子以常德行，习教事。' },
  { id: 30, name: '离', gua: '☲☲', wuxing: '火', meaning: '畜牝牛，吉', interpretation: '附着光明，如日丽天，柔顺则吉。', poetry: '明两作，离；大人以继明照于四方。' },
  { id: 31, name: '咸', gua: '☱☶', wuxing: '金', meaning: '亨利贞，取女吉', interpretation: '感应交心，心意相通，娶女则吉。', poetry: '山上有泽，咸；君子以虚受人。' },
  { id: 32, name: '恒', gua: '☶☱', wuxing: '木', meaning: '亨，无咎，利贞，利有攸往', interpretation: '恒久不变，守正持久，亨通无祸。', poetry: '雷风，恒；君子以立不易方。' },
  { id: 33, name: '遁', gua: '☰☶', wuxing: '金', meaning: '亨，小利贞', interpretation: '退隐躲避，小的进展，守正为吉。', poetry: '天下有山，遁；君子以远小人，不恶而严。' },
  { id: 34, name: '大壮', gua: '☳☰', wuxing: '木', meaning: '利贞', interpretation: '盛大强壮，阳气壮盛，守正则利。', poetry: '雷在天上，大壮；君子以非礼勿履。' },
  { id: 35, name: '晋', gua: '☷☲', wuxing: '火', meaning: '康侯用锡马蕃庶，昼日三接', interpretation: '晋升进用，受赏发达，一日三迁。', poetry: '明出地上，晋；君子以自昭明德。' },
  { id: 36, name: '明夷', gua: '☲☷', wuxing: '火', meaning: '利艰贞', interpretation: '明入地中，光明受损，艰贞自守。', poetry: '明入地中，明夷；君子以莅众，用晦而明。' },
  { id: 37, name: '家人', gua: '☴☲', wuxing: '木', meaning: '利女贞', interpretation: '家庭和美，女正位内，吉祥。', poetry: '风自火出，家人；君子以言有物，而行有恒。' },
  { id: 38, name: '睽', gua: '☲☱', wuxing: '火', meaning: '小事吉', interpretation: '乖离违逆，矛盾分离，小事则吉。', poetry: '上火下泽，睽；君子以同而异。' },
  { id: 39, name: '蹇', gua: '☶☵', wuxing: '水', meaning: '利西南，不利东北，利见大人', interpretation: '艰难险阻，西南有利，宜见贵人。', poetry: '山上有水，蹇；君子以反身修德。' },
  { id: 40, name: '解', gua: '☵☳', wuxing: '木', meaning: '利西南，无所往，其来复吉，有攸往，夙吉', interpretation: '解除困难，危难消散，返归则吉。', poetry: '雷雨作，解；君子以赦过宥罪。' },
  { id: 41, name: '损', gua: '☱☶', wuxing: '金', meaning: '有孚，元吉，无咎，可贞，利有攸往', interpretation: '减损之道，诚信为本，大吉无祸。', poetry: '山下有泽，损；君子以惩忿窒欲。' },
  { id: 42, name: '益', gua: '☶☴', wuxing: '木', meaning: '利有攸往，利涉大川', interpretation: '增益之道，损上益下，利于前进。', poetry: '风雷，益；君子以见善则迁，有过则改。' },
  { id: 43, name: '夬', gua: '☰☱', wuxing: '金', meaning: '扬于王庭，孚号有厉，告自邑，不利即戎', interpretation: '决断刚断，消除小人，警惕危险。', poetry: '泽上于天，夬；君子以施禄及下，居德则忌。' },
  { id: 44, name: '姤', gua: '☱☴', wuxing: '金', meaning: '女壮，勿用取女', interpretation: '阴阳相遇，女方过壮，不宜娶女。', poetry: '天下有风，姤；后以施命诰四方。' },
  { id: 45, name: '萃', gua: '☷☱', wuxing: '土', meaning: '亨，王假有庙，利见大人，亨利贞', interpretation: '荟萃聚合，聚集人才，见大人则利。', poetry: '泽上于地，萃；君子以除戎器，戒不虞。' },
  { id: 46, name: '升', gua: '☷☴', wuxing: '木', meaning: '南征吉', interpretation: '上升发展，向南方进发则吉。', poetry: '地中生木，升；君子以顺德，积小以高大。' },
  { id: 47, name: '困', gua: '☱☵', wuxing: '金', meaning: '亨，贞大人吉，无咎，有言不信', interpretation: '困境穷厄，坚守正道，大人则吉。', poetry: '泽无水，困；君子以致命遂志。' },
  { id: 48, name: '井', gua: '☵☴', wuxing: '水', meaning: '改邑不改井，无丧无得，往来井井', interpretation: '井养不竭，居常守正，往来皆宜。', poetry: '木上有水，井；君子以劳民劝相。' },
  { id: 49, name: '革', gua: '☱☲', wuxing: '金', meaning: '己日乃孚，元亨利贞，悔亡', interpretation: '变革改革，择日而行，悔恨消散。', poetry: '泽中有火，革；君子以治历明时。' },
  { id: 50, name: '鼎', gua: '☴☲', wuxing: '火', meaning: '元吉，亨', interpretation: '鼎立稳重，革故鼎新，大吉亨通。', poetry: '木上有火，鼎；君子以正位凝命。' },
  { id: 51, name: '震', gua: '☳☳', wuxing: '木', meaning: '亨，震来虩虩，笑言哑哑', interpretation: '雷震天下，惊惧警觉，笑语自如。', poetry: '洊雷，震；君子以恐惧修省。' },
  { id: 52, name: '艮', gua: '☶☶', wuxing: '土', meaning: '艮其背，不获其身，行其庭，不见其人', interpretation: '抑止守静，背止其心，相遇不相见。', poetry: '兼山，艮；君子以思不出其位。' },
  { id: 53, name: '渐', gua: '☴☶', wuxing: '木', meaning: '女归吉，利贞', interpretation: '循序渐进，女归吉祥，守正有利。', poetry: '山上有木，渐；君子以居贤德善俗。' },
  { id: 54, name: '归妹', gua: '☱☳', wuxing: '金', meaning: '征凶，无攸利', interpretation: '嫁女求偶，行动有凶，无利可言。', poetry: '泽上有雷，归妹；君子以永终知敝。' },
  { id: 55, name: '丰', gua: '☳☲', wuxing: '火', meaning: '亨，王假之，勿忧，宜日中', interpretation: '盛大丰盈，勿忧，宜保持盛况。', poetry: '雷电皆至，丰；君子以折狱致刑。' },
  { id: 56, name: '旅', gua: '☶☲', wuxing: '火', meaning: '小亨，旅贞吉', interpretation: '旅途漂泊，小有通达，守正则吉。', poetry: '山上有火，旅；君子以明慎用刑，而不留狱。' },
  { id: 57, name: '巽', gua: '☴☴', wuxing: '木', meaning: '小亨，利有攸往，利见大人', interpretation: '顺从谦逊，小有通达，前行有利。', poetry: '随风，巽；君子以申命行事。' },
  { id: 58, name: '兑', gua: '☱☱', wuxing: '金', meaning: '亨，利贞', interpretation: '喜悦和乐，言笑晏晏，亨通畅达。', poetry: '丽泽，兑；君子以朋友讲习。' },
  { id: 59, name: '涣', gua: '☴☵', wuxing: '水', meaning: '亨，王假有庙，利涉大川，利贞', interpretation: '涣散离散，拯救危难，利于涉川。', poetry: '风行水上，涣；先王以享于帝立庙。' },
  { id: 60, name: '节', gua: '☵☱', wuxing: '水', meaning: '亨，苦节不可贞', interpretation: '节制节约，适度为亨，过分则凶。', poetry: '泽上有水，节；君子以制数度，议德行。' },
  { id: 61, name: '中孚', gua: '☴☱', wuxing: '金', meaning: '豚鱼吉，利涉大川，利贞', interpretation: '诚信中满，泽中有鱼，吉利通达。', poetry: '泽上有风，中孚；君子以议狱缓死。' },
  { id: 62, name: '小过', gua: '☶☳', wuxing: '金', meaning: '亨，利贞，可小事，不可大事', interpretation: '小有过度，通达守正，宜小事不宜大事。', poetry: '山上有雷，小过；君子以行过乎恭，丧过乎哀，用过乎俭。' },
  { id: 63, name: '既济', gua: '☵☲', wuxing: '水', meaning: '亨，小利贞，初吉终乱', interpretation: '事已成办，初吉终乱，宜守成防乱。', poetry: '水在火上，既济；君子以思患而豫防之。' },
  { id: 64, name: '未济', gua: '☲☵', wuxing: '火', meaning: '亨，小狐汔济，濡其尾，无攸利', interpretation: '事未完成，小狐渡水沾湿尾巴，无利。', poetry: '火在水上，未济；君子以慎辨物居方。' }
];

// ==================== 卦象符号 ====================
const HEXAGRAM_SYMBOLS = {
  '☰': 1,  // 乾 (三连)
  '☷': 0,  // 坤 (三断)
  '☳': 1,  // 震 (单阳)
  '☶': 0,  // 艮 (单阴)
  '☴': 1,  // 巽 (阴上阳下)
  '☱': 0,  // 兑 (阳上阴下)
  '☵': 0,  // 坎 (中阴)
  '☲': 1   // 离 (中阳)
};

// 卦象到ID映射
const GUA_TO_ID = {};
HEXAGRAMS.forEach(h => {
  GUA_TO_ID[h.gua] = h.id;
});

// ==================== 核心函数 ====================

/**
 * 摇卦 - 模拟三枚铜钱摇6次
 * @returns {Array} 六爻数组 [1,0,1,1,0,1] (1=阳爻, 0=阴爻)
 */
function divine() {
  const yaoList = [];
  for (let i = 0; i < 6; i++) {
    // 模拟三枚铜钱：正面=7/9(阳)，背面=6/8(阴)
    let sum = 0;
    for (let j = 0; j < 3; j++) {
      sum += Math.random() > 0.5 ? 7 : 6;
    }
    // 7,9为阳爻(少阳、老阳)，6,8为阴爻(少阴、老阴)
    // 老阳(9)为动阳，老阴(8)为动阴
    yaoList.push(sum >= 7 ? 1 : 0);
  }
  return yaoList;
}

/**
 * 六爻转卦象字符串
 * @param {Array} yaoList 六爻数组
 * @returns {string} 卦象字符串如 '☰☰' 或 '☷☳'
 */
function yaoListToGua(yaoList) {
  // 上卦(前3爻) + 下卦(后3爻)
  const upper = yaoList.slice(0, 3).map(y => y === 1 ? '☰' : '☷').join('');
  const lower = yaoList.slice(3, 6).map(y => y === 1 ? '☰' : '☷').join('');
  
  // 八卦符号映射
  const trigramMap = {
    '☰☰': '☰', '☰☰': '☰', '☰☰': '☰', '☰☰': '☰',
    '☰☰': '☰', '☰☰': '☰', '☰☰': '☰', '☰☰': '☰',
    '☷☷': '☷', '☷☷': '☷', '☷☷': '☷', '☷☷': '☷',
    '☷☷': '☷', '☷☷': '☷', '☷☷': '☷', '☷☷': '☷'
  };
  
  // 简化：直接根据爻象组合判断
  return getTrigram(yaoList.slice(0, 3)) + getTrigram(yaoList.slice(3, 6));
}

function getTrigram(yaoList) {
  // 爻列表: [初爻, 二爻, 三爻] 从下往上
  // 阳爻为1，阴爻为0
  const yang = yaoList.filter(y => y === 1).length;
  
  // 八卦: 乾(☰)震(☳)坎(☵)艮(☶)坤(☷)巽(☴)离(☲)兑(☱)
  if (yaoList[2] === 1 && yaoList[1] === 1 && yaoList[0] === 1) return '☰'; // 乾
  if (yaoList[2] === 0 && yaoList[1] === 0 && yaoList[0] === 0) return '☷'; // 坤
  if (yaoList[2] === 1 && yaoList[1] === 0 && yaoList[0] === 0) return '☳'; // 震
  if (yaoList[2] === 0 && yaoList[1] === 0 && yaoList[0] === 1) return '☶'; // 艮
  if (yaoList[2] === 0 && yaoList[1] === 1 && yaoList[0] === 0) return '☴'; // 巽
  if (yaoList[2] === 1 && yaoList[1] === 0 && yaoList[0] === 1) return '☲'; // 离
  if (yaoList[2] === 0 && yaoList[1] === 1 && yaoList[0] === 1) return '☱'; // 兑
  return '☵'; // 坎 (default)
}

/**
 * 获取卦象名称
 */
function getHexagramName(guaStr) {
  for (const h of HEXAGRAMS) {
    if (h.gua === guaStr) return h;
  }
  return null;
}

/**
 * 获取变卦（阳变阴，阴变阳）
 */
function getChangedGua(yaoList) {
  const changedList = yaoList.map(y => y === 1 ? 0 : 1);
  return yaoListToGua(changedList);
}

/**
 * 完整解卦
 */
function interpret(yaoList) {
  const guaStr = yaoListToGua(yaoList);
  const mainHexagram = getHexagramName(guaStr);
  const changedGuaStr = getChangedGua(yaoList);
  const changedHexagram = getHexagramName(changedGuaStr);
  
  // 找出动爻
  const dongYao = [];
  yaoList.forEach((y, i) => {
    // 简单处理：标记需要变化的爻
    if ((y === 1 && i % 2 === 0) || (y === 0 && i % 2 === 1)) {
      dongYao.push(i);
    }
  });
  
  return {
    yaoList,           // 六爻 [1,0,1,1,0,1]
    yaoNames: ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'],
    mainHexagram,
    changedHexagram,
    dongYao: dongYao.length > 0 ? dongYao : [0], // 默认动初爻
    interpretation: mainHexagram ? mainHexagram.interpretation : '',
    poetry: mainHexagram ? mainHexagram.poetry : '',
    wuxing: mainHexagram ? mainHexagram.wuxing : '',
    meaning: mainHexagram ? mainHexagram.meaning : ''
  };
}

/**
 * 完整的占卜流程
 */
function divineFull() {
  const yaoList = divine();
  const result = interpret(yaoList);
  
  // 动爻位置名称
  const dongYaoNames = result.dongYao.map(i => result.yaoNames[i]);
  
  return {
    hexagram: result.mainHexagram ? {
      id: result.mainHexagram.id,
      name: result.mainHexagram.name,
      gua: result.mainHexagram.gua,
      wuxing: result.mainHexagram.wuxing,
      meaning: result.mainHexagram.meaning,
      interpretation: result.mainHexagram.interpretation,
      poetry: result.mainHexagram.poetry
    } : null,
    changedHexagram: result.changedHexagram ? {
      id: result.changedHexagram.id,
      name: result.changedHexagram.name
    } : null,
    yaoList: result.yaoList,
    yaoDescriptions: getYaoDescriptions(result.yaoList),
    dongYao: dongYaoNames,
    createdAt: new Date().toISOString()
  };
}

/**
 * 获取六爻描述
 */
function getYaoDescriptions(yaoList) {
  const yaoTexts = [
    '初爻：万物始生，根基之位',
    '二爻：才华显露，事业进取',
    '三爻：努力奋斗，小心前行',
    '四爻：德才兼备，谨慎行事',
    '五爻：位居尊位，中正之道',
    '上爻：事物终极，盛极必衰'
  ];
  
  return yaoList.map((y, i) => ({
    position: yaoTexts[i],
    type: y === 1 ? '阳爻' : '阴爻',
    value: y
  }));
}

/**
 * 根据卦名搜索卦象
 */
function searchHexagram(name) {
  return HEXAGRAMS.filter(h => h.name.includes(name));
}

/**
 * 获取所有卦象
 */
function getAllHexagrams() {
  return HEXAGRAMS;
}

/**
 * 获取卦象详情
 */
function getHexagramById(id) {
  return HEXAGRAMS.find(h => h.id === id);
}

module.exports = {
  divine,
  divineFull,
  interpret,
  getHexagramName,
  getAllHexagrams,
  getHexagramById,
  searchHexagram,
  HEXAGRAMS
};
