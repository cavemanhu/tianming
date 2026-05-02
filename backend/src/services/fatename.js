/**
 * 智能取名服务
 * 天命阁 v2.0
 */
const NAME_LIB = {
  '木': [
    {char:'森',meaning:'树木众多，寓意兴旺',strokes:12,poetry:'忽逢桃花林，夹岸数百步。——陶渊明'},
    {char:'林',meaning:'树木成林，寓意团结',strokes:8,poetry:'羁鸟恋旧林，池鱼思故渊。——陶渊明'},
    {char:'松',meaning:'松柏常青，寓意长寿',strokes:8,poetry:'亭亭山上松，瑟瑟谷中风。——刘桢'},
    {char:'柏',meaning:'松柏之志，寓意坚定',strokes:9,poetry:'岁寒，然后知松柏之后凋也。——论语'},
    {char:'桐',meaning:'梧桐栖凤，寓意高洁',strokes:10,poetry:'桐花万里丹山路，雏凤清于老凤声。——李商隐'},
    {char:'楠',meaning:'楠木珍贵，寓意富贵',strokes:13,poetry:'豫樟生深山，七年而后知。——韩愈'},
    {char:'槐',meaning:'槐树吉祥，寓意仕途',strokes:14,poetry:'三辅窃朝贵，唯昔羡槐乡。——梅尧臣'},
    {char:'桂',meaning:'桂花飘香，寓意科举',strokes:10,poetry:'桂子月中落，天香云外飘。——宋之问'},
    {char:'桃',meaning:'桃花艳丽，寓意爱情',strokes:10,poetry:'桃之夭夭，灼灼其华。——诗经'},
    {char:'栋',meaning:'栋梁之才，寓意担当',strokes:12,poetry:'千钧重担当，栋梁当此选。——乾隆'},
    {char:'材',meaning:'栋材之资，寓意才能',strokes:7,poetry:'试玉要烧三日满，辨材须待七年期。——白居易'},
    {char:'梓',meaning:'梓树故乡，寓意故乡',strokes:11,poetry:'埋骨何须桑梓地，人生无处不青山。——毛泽东'},
    {char:'茂',meaning:'草木繁盛，寓意兴旺',strokes:8,poetry:'桃之夭夭，其叶蓁蓁。——诗经'},
    {char:'萱',meaning:'萱草忘忧，寓意母亲',strokes:12,poetry:'萱草生堂阶，游子行天涯。——孟郊'},
    {char:'菲',meaning:'花草芬芳，寓意美好',strokes:11,poetry:'到处皆诗境，随时有物华。——张道洽'},
    {char:'苏',meaning:'万物复苏，寓意新生',strokes:7,poetry:'山有扶苏，隰有荷华。——诗经'},
    {char:'若',meaning:'如若、仿佛，寓意优雅',strokes:10,poetry:'高山仰止，景行行止。——诗经'},
    {char:'萧',meaning:'艾蒿萧瑟，寓意高洁',strokes:16,poetry:'秋风宝剑孤臣泪，落日旌旗大将坛。——李鸿章'},
    {char:'芸',meaning:'香草名，寓意美德',strokes:7,poetry:'艺菊东篱下，悠然见南山。——陶渊明'},
    {char:'苒',meaning:'草木茂盛，寓意进取',strokes:8,poetry:'光阴者，百代之过客。——李白'}
  ],
  '火': [
    {char:'焱',meaning:'火光闪耀，寓意光明',strokes:12,poetry:'杲杲为日光炎炎，照临下土。——诗经'},
    {char:'煜',meaning:'光辉照耀，寓意荣耀',strokes:13,poetry:'星拱北辰光万丈，煜当阳。——李白'},
    {char:'耀',meaning:'光耀夺目，寓意才华',strokes:20,poetry:'光摇朱户金铺地，日照玉兰银丝。——纳兰性德'},
    {char:'灿',meaning:'灿烂辉煌，寓意前程',strokes:7,poetry:'东风夜放花千树，更吹落、星如雨。——辛弃疾'},
    {char:'灵',meaning:'心灵手巧，寓意智慧',strokes:7,poetry:'身无彩凤双飞翼，心有灵犀一点通。——李商隐'},
    {char:'明',meaning:'日月光明，寓意睿智',strokes:8,poetry:'海上生明月，天涯共此时。——张九龄'},
    {char:'昊',meaning:'苍天广阔，寓意志向',strokes:8,poetry:'昊天明命，集庆无疆。——诗经'},
    {char:'昀',meaning:'日光温暖，寓意温和',strokes:8,poetry:'和风吹衣袂，昀日照园林。——谢灵运'},
    {char:'晖',meaning:'春晖温暖，寓意感恩',strokes:13,poetry:'谁言寸草心，报得三春晖。——孟郊'},
    {char:'昭',meaning:'光明显著，寓意美德',strokes:9,poetry:'为政以德，譬如北辰，居其所而众星共之。——论语'},
    {char:'丹',meaning:'丹心赤诚，寓意忠诚',strokes:4,poetry:'人生自古谁无死，留取丹心照汗青。——文天祥'},
    {char:'炜',meaning:'光彩鲜明，寓意精彩',strokes:8,poetry:'文茵畅毂，驾我骐馵言。——诗经'},
    {char:'荧',meaning:'荧光闪烁，寓意微光',strokes:12,poetry:'星河耿耿，银波荡漾。——曹雪芹'},
    {char:'燃',meaning:'燃烧热烈，寓意激情',strokes:16,poetry:'野火烧不尽，春风吹又生。——白居易'},
    {char:'夏',meaning:'夏季炎热，寓意热情',strokes:10,poetry:'力尽不知热，但惜夏日长。——白居易'},
    {char:'晓',meaning:'破晓晨光，寓意希望',strokes:16,poetry:'春眠不觉晓，处处闻啼鸟。——孟浩然'},
    {char:'曦',meaning:'晨曦微露，寓意新生',strokes:20,poetry:'清晨入古寺，初日照高林。——常建'},
    {char:'耿',meaning:'耿直明亮，寓意正直',strokes:10,poetry:'尚有绨袍赠，应念鄙夫贪。——李白'},
    {char:'烽',meaning:'烽火传递，寓意信息',strokes:11,poetry:'烽火连三月，家书抵万金。——杜甫'},
    {char:'灼',meaning:'灼热闪耀，寓意光彩',strokes:8,poetry:'桃之夭夭，灼灼其华。——诗经'}
  ],
  '土': [
    {char:'墨',meaning:'墨香书卷，寓意文雅',strokes:15,poetry:'笔落惊风雨，诗成泣鬼神。——杜甫'},
    {char:'垣',meaning:'城墙坚固，寓意守护',strokes:9,poetry:'崇墉积翠，玉阁凌霄。——王勃'},
    {char:'城',meaning:'城池坚固，寓意安定',strokes:10,poetry:'城阙辅三秦，风烟望五津。——王勃'},
    {char:'培',meaning:'培育培养，寓意教化',strokes:11,poetry:'十年树木，百年树人。——管子'},
    {char:'增',meaning:'增加增益，寓意积累',strokes:15,poetry:'不积跬步，无以至千里。——荀子'},
    {char:'圣',meaning:'圣人之道，寓意高尚',strokes:13,poetry:'圣人无常师。——韩愈'},
    {char:'坤',meaning:'大地之德，寓意包容',strokes:8,poetry:'地势坤，君子以厚德载物。——易经'},
    {char:'坚',meaning:'坚强坚定，寓意意志',strokes:11,poetry:'千磨万击还坚劲，任尔东西南北风。——郑燮'},
    {char:'均',meaning:'均衡公平，寓意正义',strokes:7,poetry:'政不平则患不均。——礼记'},
    {char:'在',meaning:'存在永恒，寓意珍惜',strokes:6,poetry:'春江潮水连海平，海上明月共潮生。——张若虚'},
    {char:'庄',meaning:'庄严端正，寓意稳重',strokes:6,poetry:'非礼勿视，非礼勿听，非礼勿言，非礼勿动。——论语'},
    {char:'坊',meaning:'里坊制度，寓意秩序',strokes:7,poetry:'忆昔开元全盛日，小邑犹藏万家室。——杜甫'},
    {char:'堪',meaning:'堪能胜任，寓意才能',strokes:12,poetry:'天戴其苍，地履其黄。——梁启超'},
    {char:'域',meaning:'疆域广阔，寓意志向',strokes:11,poetry:'壮志饥餐胡虏肉，笑谈渴饮匈奴血。——岳飞'},
    {char:'壤',meaning:'土地肥沃，寓意富饶',strokes:16,poetry:'厥土黑坟，厥草惟繇，厥木惟条。——尚书'},
    {char:'壁',meaning:'墙壁坚固，寓意守护',strokes:16,poetry:'家书抵万金。——杜甫'},
    {char:'至',meaning:'到达极致，寓意完美',strokes:6,poetry:'致知在格物。——礼记'},
    {char:'壑',meaning:'山沟深邃，寓意胸怀',strokes:17,poetry:'朗如日月，清如水镜。——李白'},
    {char:'阿',meaning:'山之阿，寓意依靠',strokes:7,poetry:'山有扶苏，隰有荷华。——诗经'},
    {char:'坠',meaning:'落下、坠落，寓意独特',strokes:6,poetry:'大漠孤烟直，长河落日圆。——王维'}
  ],
  '金': [
    {char:'铭',meaning:'铭刻于心，寓意铭记',strokes:14,poetry:'镌金勒石，纪功颂德。——旧唐书'},
    {char:'锐',meaning:'锐意进取，寓意勇猛',strokes:15,poetry:'锐卒勿攻，饵兵勿食。——孙子兵法'},
    {char:'锦',meaning:'锦绣前程，寓意美好',strokes:16,poetry:'锦瑟无端五十弦，一弦一柱思华年。——李商隐'},
    {char:'钟',meaning:'钟灵毓秀，寓意凝聚',strokes:17,poetry:'钟鼓馔玉不足贵，但愿长醉不复醒。——李白'},
    {char:'钧',meaning:'钧天广乐，寓意尊贵',strokes:9,poetry:'千里送鹅毛，礼轻情意重。——邢俊臣'},
    {char:'锡',meaning:'锡金属贵，寓意恩赐',strokes:13,poetry:'桃之夭夭，灼灼其华。之子于归，宜其室家。——诗经'},
    {char:'锋',meaning:'锋芒毕露，寓意才华',strokes:15,poetry:'笔落惊风雨，诗成泣鬼神。——杜甫'},
    {char:'镖',meaning:'保镖护卫，寓意安全',strokes:17,poetry:'一身转战三千里，一剑曾当百万师。——王维'},
    {char:'钰',meaning:'珍宝金属，寓意珍贵',strokes:13,poetry:'兰陵美酒郁金香，玉碗盛来琥珀光。——李白'},
    {char:'铁',meaning:'铁骨铮铮，寓意刚毅',strokes:13,poetry:'铁衣远戍辛勤久，玉箸应啼别离后。——杜甫'},
    {char:'鉴',meaning:'镜子借鉴，寓意明智',strokes:22,poetry:'以铜为镜，可以正衣冠。——李世民'},
    {char:'铜',meaning:'青铜古器，寓意传承',strokes:14,poetry:'旧时王谢堂前燕，飞入寻常百姓家。——刘禹锡'},
    {char:'银',meaning:'白银光辉，寓意纯洁',strokes:14,poetry:'金樽清酒斗十千，玉盘珍羞直万钱。——李白'},
    {char:'铠',meaning:'铠甲勇士，寓意英勇',strokes:18,poetry:'黄沙百战穿金甲，不破楼兰终不还。——王昌龄'},
    {char:'钮',meaning:'印章之钮，寓意权贵',strokes:9,poetry:'封侯非我意，但愿海波平。——戚继光'},
    {char:'鏖',meaning:'激烈战斗，寓意拼搏',strokes:20,poetry:'千淘万漉虽辛苦，吹尽狂沙始到金。——刘禹锡'},
    {char:'鑫',meaning:'财富兴盛，寓意富贵',strokes:24,poetry:'积土成山，风雨兴焉。——荀子'},
    {char:'铎',meaning:'铃声清脆，寓意教化',strokes:17,poetry:'振振君子，归哉洋洋。——诗经'},
    {char:'铖',meaning:'金属锋利，寓意刚强',strokes:13,poetry:'男儿何不带吴钩，收取关山五十州。——李贺'},
    {char:'钲',meaning:'金属乐器，寓意音乐',strokes:11,poetry:'钟鼓馔玉不足贵，但愿长醉不复醒。——李白'}
  ],
  '水': [
    {char:'泽',meaning:'润泽万物，寓意恩惠',strokes:8,poetry:'泽国江山入战图，生民何计乐樵苏。——李商隐'},
    {char:'润',meaning:'滋润成长，寓意教养',strokes:16,poetry:'润物细无声，随风潜入夜。——杜甫'},
    {char:'涵',meaning:'包含容纳，寓意度量',strokes:11,poetry:'涵养须用敬，进学则在致知。——程颐'},
    {char:'澜',meaning:'波澜壮阔，寓意壮志',strokes:21,poetry:'长风破浪会有时，直挂云帆济沧海。——李白'},
    {char:'泊',meaning:'淡泊明志，寓意宁静',strokes:8,poetry:'泊舟疏短扉，垂柳覆渔扉。——王维'},
    {char:'深',meaning:'深谋远虑，寓意智慧',strokes:11,poetry:'深林人不知，明月来相照。——王维'},
    {char:'清',meaning:'清白做人，寓意高洁',strokes:11,poetry:'问渠那得清如许，为有源头活水来。——朱熹'},
    {char:'洁',meaning:'洁白无瑕，寓意纯净',strokes:9,poetry:'出淤泥而不染，濯清涟而不妖。——周敦颐'},
    {char:'洪',meaning:'洪荒之力，寓意强大',strokes:9,poetry:'洪水横流，兽蹄鸟迹之道。——孟子'},
    {char:'海',meaning:'海纳百川，寓意包容',strokes:10,poetry:'海内存知己，天涯若比邻。——王勃'},
    {char:'溪',meaning:'山间溪流，寓意灵秀',strokes:13,poetry:'缘溪行，忘路之远近。——陶渊明'},
    {char:'沐',meaning:'沐浴恩泽，寓意受惠',strokes:7,poetry:'浴兰汤兮沐芳，华采衣兮若英。——屈原'},
    {char:'波',meaning:'波光粼粼，寓意灵动',strokes:8,poetry:'春江潮水连海平，海上明月共潮生。——张若虚'},
    {char:'泉',meaning:'泉水清澈，寓意纯净',strokes:9,poetry:'明月松间照，清泉石上流。——王维'},
    {char:'源',meaning:'源远流长，寓意根本',strokes:13,poetry:'问渠那得清如许，为有源头活水来。——朱熹'},
    {char:'淳',meaning:'淳朴善良，寓意美德',strokes:11,poetry:'浇浮料民伪，崇饰删《诗》《书》。——韩愈'},
    {char:'潮',meaning:'潮水涌动，寓意力量',strokes:15,poetry:'春江潮水连海平，海上明月共潮生。——张若虚'},
    {char:'潭',meaning:'深潭静水，寓意沉稳',strokes:15,poetry:'桃花流水窅然去，别有天地非人间。——李白'},
    {char:'济',meaning:'济世安民，寓意奉献',strokes:9,poetry:'安得广厦千万间，大庇天下寒士俱欢颜。——杜甫'},
    {char:'潇',meaning:'水深清远，寓意潇洒',strokes:14,poetry:'潇洒江城暮，风流画家儿。——李白'}
  ]
};

const STROKES = {
  '文':4,'心':4,'日':4,'月':4,'水':4,'火':4,'木':4,'金':8,'土':3,
  '大':3,'小':3,'中':4,'上':3,'下':3,'人':2,'口':3,'山':3,
  '天':4,'雨':8,'风':4,'云':4,'光':6,'明':8,
  '东':5,'西':6,'南':9,'北':5,'春':9,'夏':10,'秋':9,'冬':5,
  '福':14,'禄':13,'寿':14,'喜':12,'吉':6,'祥':11,'和':8,
  '德':15,'义':13,'仁':4,'孝':7,'忠':8,'信':9,
  '安':6,'宁':14,'定':8,'静':16,'平':5,'正':5,
  '伟':6,'刚':10,'强':11,'勇':9,'志':7,'毅':15,
  '华':10,'美':9,'丽':7,'秀':7,'雅':12,'倩':8,'婷':12,
  '睿':14,'智':12,'慧':15,'敏':11,'学':8,'思':9,
  '博':12,'广':3,'宽':10,'宏':7,'宇':6,'宙':8,'洪':9,
  '泽':8,'润':16,'海':10,'波':8,'泉':9,'源':13,'洁':9,
  '玉':5,'珠':10,'珍':10,'琳':12,'瑶':14,'琪':12,'瑾':14,
  '岚':12,'岩':8,'峰':10,'岭':8,'岳':8,'巍':20,'崇':11,
  '林':8,'森':12,'松':8,'柏':9,'桐':10,'桂':10,'桃':10,
  '栋':12,'梁':11,'桥':16,'帆':12,'航':10,
  '诗':13,'书':10,'易':8
};

const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const TIAN_GAN_WX = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'};
const DI_ZHI_WX = {'子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水'};

function getStrokes(char) { return STROKES[char] || 8; }

function getWuxingCount(y,m,d) {
  const yIdx = (y-4)%10, mIdx = (m-1)%12, dIdx = ((y*5+m*3+d)%10+10)%10;
  const yGan = TIAN_GAN[yIdx], mZhi = DI_ZHI[mIdx], dGan = TIAN_GAN[dIdx];
  const wx = {'金':0,'木':0,'水':0,'火':0,'土':0};
  [yGan,dGan].forEach(g=>{const x=TIAN_GAN_WX[g];if(x)wx[x]++;});
  [mZhi].forEach(z=>{const x=DI_ZHI_WX[z];if(x)wx[x]++;});
  return wx;
}

function findLack(wx) {
  const min=Math.min(...Object.values(wx));
  return Object.entries(wx).filter(([k,v])=>v===0||v===min).map(([k])=>k);
}

function calcTiancai(surname, name) {
  const tian = getStrokes(surname);
  const di = getStrokes(name);
  const ren = tian + di;
  const wai = tian + 1;
  const zong = tian + di + 1;
  return {tian,di,ren,wai,zong};
}

function matchPoetry(char) {
  const poems = [
    {title:'关雎',content:'关关雎鸠，在河之洲。窈窕淑女，君子好逑。'},
    {title:'蒹葭',content:'蒹葭苍苍，白露为霜。所谓伊人，在水一方。'},
    {title:'桃夭',content:'桃之夭夭，灼灼其华。之子于归，宜其室家。'},
    {title:'离骚',content:'路漫漫其修远兮，吾将上下而求索。'},
    {title:'登鹳雀楼',content:'白日依山尽，黄河入海流。欲穷千里目，更上一层楼。'},
    {title:'将进酒',content:'人生得意须尽欢，莫使金樽空对月。天生我材必有用，千金散尽还复来。'},
    {title:'水调歌头',content:'明月几时有，把酒问青天。不知天上宫阙，今夕是何年。'}
  ];
  return poems[Math.floor(Math.random()*poems.length)];
}

function generate(birthYear, birthMonth, birthDay, gender, surname) {
  const wx = getWuxingCount(birthYear, birthMonth, birthDay);
  const lack = findLack(wx);
  const names = [];
  
  for (const wxLack of lack) {
    const lib = NAME_LIB[wxLack] || [];
    for (const item of lib.slice(0,5)) {
      const fullName = surname + item.char;
      const tc = calcTiancai(surname, item.char);
      const poetry = matchPoetry(item.char);
      const score = Math.floor(75 + Math.random()*20);
      names.push({
        name: fullName,
        char: item.char,
        wuxing: wxLack,
        meaning: item.meaning,
        strokes: item.strokes,
        poetry: item.poetry,
        tiancai: tc,
        score: score,
        poem: poetry
      });
    }
  }
  
  names.sort((a,b)=>b.score-a.score);
  return {
    bazi: {year:birthYear,month:birthMonth,day:birthDay,gender},
    wuxingCount: wx,
    wuxingLack: lack,
    dayMaster: TIAN_GAN_WX[TIAN_GAN[((birthYear*5+birthMonth*3+birthDay)%10+10)%10]],
    names: names.slice(0,10)
  };
}

module.exports = {generate, matchPoetry};
