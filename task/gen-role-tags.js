import fs from 'fs';
import {
	uniq,
	outputJSON,
	read_json_file,
} from './u.mjs';

const roles_details = read_json_file('./_mid/roles_details.raw.json');
const roles = read_json_file('./_pre/roles.src.json');
const role_other_skills = read_json_file('./_pre/role_other_skills.src.json');

const roles_has_adv_skill = Object.keys(role_other_skills).filter(i => role_other_skills[i]?.adv_skills.length);
const roles_has_support_skill = Object.keys(role_other_skills).filter(i => role_other_skills[i]?.support_skill);

// const kwd = '免除死亡';
// const rrr = roles_details.map(i => {
// 	const dd = i.data.data[0];
// 	let str = JSON.stringify(dd);
// 	return str.match(/免除死亡/g) && { pinyin: dd.pinyin, name: dd.name, };
// }).filter(Boolean);


function query_kwd(kwd = '') {
	return roles_details.reduce((acc, i) => {
		const dd = i.data?.data?.[0];
		if (dd && JSON.stringify(dd).includes(kwd)) {
			const { pinyin, name } = dd;
			// acc.push(name + ' - ' + pinyin);
			// acc.push(pinyin);
			acc.push([pinyin, name]);
		}
		return acc;
	}, []);
}

let tags = [
	{
		tag: '免死',
		data: query_kwd('免除死亡'),
	},
	{
		tag: '再啟動',
		data: query_kwd('再啟動'),
	},
	{
		tag: '陣眼',
		data: query_kwd('"strategy"'),
	},
	{
		tag: '召喚物',
		// data: roles.map(r => r.summons && r.name + ' - ' + r.pinyin).filter(Boolean),
		data: roles.map(r => r.summons && [r.pinyin, r.name]).filter(Boolean),
	},
	{
		tag: '協攻',
		data: [...new Set(['協攻', '友方主動發起對戰', '優先攻擊'].flatMap(tag => query_kwd(tag)))],
	},
	// {
	// 	tag: '抵擋致命傷害',
	// 	data: query_kwd('抵擋致命傷害'),
	// },
	{
		tag: '再行動',
		data: query_kwd('再行動'),
	},
	{
		tag: '援襲技能', // support_skill
		data: roles.map(r => !roles_has_support_skill.includes(r.pinyin) && [r.pinyin, r.name]).filter(Boolean),
	},
	// {
	// 	tag: '無3C',
	// 	data: roles.map(r => !roles_has_adv_skill.includes(r.pinyin) && r.name + ' - ' + r.pinyin).filter(Boolean),
	// },
	{
		tag: '剋制免死',
		data: [
			['nezha', '哪吒'],
			['libai', '李白'],
			['yuebei', '月孛'],
			['wukong', '悟空'],
			['xiangyin', '相胤'],
			['shuanghunyuxi', '雙魂虞兮'],
			['tianxuanyijian', '天玄義劍'],
			['jianxinwuxie', '劍心無邪'],
		],
	},
	{
		tag: '剋制召喚物',
		data: [
			['tianyinbaiwan', '天音白菀'],
			['shuanghunyuxi', '雙魂虞兮'],
			['luwensheng', '陸文生'],
			['luoyuannvhuang', '羅淵女皇'],
		],
	},
];


outputJSON({
	json: tags,
	fn: './_mid/_tags.json',
});

let role_tag_map = {
	'tianyinbaiwan': {
		'name': '天音白菀',
		'pinyin': 'tianyinbaiwan',
		'tags': []
	},
	'zitingsiming': {
		'name': '紫霆司命',
		'pinyin': 'zitingsiming',
		'tags': []
	},
	'shenhuangbingli': {
		'name': '神煌冰璃',
		'pinyin': 'shenhuangbingli',
		'tags': []
	},
	'mosuhuoyong': {
		'name': '魔宿霍雍',
		'pinyin': 'mosuhuoyong',
		'tags': []
	},
	'qinse': {
		'name': '琴色',
		'pinyin': 'qinse',
		'tags': [
			'再啟動'
		]
	},
	'yuchishen': {
		'name': '尉遲慎',
		'pinyin': 'yuchishen',
		'tags': []
	},
	'anyaoyanghuan': {
		'name': '暗曜陽寰',
		'pinyin': 'anyaoyanghuan',
		'tags': []
	},
	'libai': {
		'name': '李白',
		'pinyin': 'libai',
		'tags': []
	},
	'shangyuanfuren': {
		'name': '上元夫人',
		'pinyin': 'shangyuanfuren',
		'tags': []
	},
	'daoba': {
		'name': '刀八',
		'pinyin': 'daoba',
		'tags': []
	},
	'chengying': {
		'name': '承影',
		'pinyin': 'chengying',
		'tags': []
	},
	'youhuanxiahouyi': {
		'name': '幽寰夏侯儀',
		'pinyin': 'youhuanxiahouyi',
		'tags': []
	},
	'jidu': {
		'name': '計都',
		'pinyin': 'jidu',
		'tags': []
	},
	'jianxinwuxie': {
		'name': '劍心無邪',
		'pinyin': 'jianxinwuxie',
		'tags': []
	},
	'shimengmo': {
		'name': '食夢貘',
		'pinyin': 'shimengmo',
		'tags': []
	},
	'huer': {
		'name': '瑚兒',
		'pinyin': 'huer',
		'tags': [
			'免死'
		]
	},
	'liuwu': {
		'name': '流舞',
		'pinyin': 'liuwu',
		'tags': []
	},
	'zhaoyun': {
		'name': '趙雲',
		'pinyin': 'zhaoyun',
		'tags': [
			'免死'
		]
	},
	'shangguanyue': {
		'name': '上官玥',
		'pinyin': 'shangguanyue',
		'tags': []
	},
	'huanhaiminghuang': {
		'name': '幻海冥皇',
		'pinyin': 'huanhaiminghuang',
		'tags': []
	},
	'dierying': {
		'name': '第二瑛',
		'pinyin': 'dierying',
		'tags': []
	},
	'yelvsha': {
		'name': '耶律紗',
		'pinyin': 'yelvsha',
		'tags': []
	},
	'yinchuangongzhu': {
		'name': '銀川公主',
		'pinyin': 'yinchuangongzhu',
		'tags': []
	},
	'youjiluzhaoyi': {
		'name': '幽姬鹿昭依',
		'pinyin': 'youjiluzhaoyi',
		'tags': []
	},
	'qiongzhifusang': {
		'name': '瓊枝扶桑',
		'pinyin': 'qiongzhifusang',
		'tags': []
	},
	'ziqi': {
		'name': '紫炁',
		'pinyin': 'ziqi',
		'tags': []
	},
	'yewuling': {
		'name': '夜無陵',
		'pinyin': 'yewuling',
		'tags': []
	},
	'chibahanwusha': {
		'name': '赤魃韓無砂',
		'pinyin': 'chibahanwusha',
		'tags': [
			'免死'
		]
	},
	'sudaji': {
		'name': '蘇妲己',
		'pinyin': 'sudaji',
		'tags': []
	},
	'nezha': {
		'name': '哪吒',
		'pinyin': 'nezha',
		'tags': []
	},
	'yangjian': {
		'name': '楊戩',
		'pinyin': 'yangjian',
		'tags': []
	},
	'lingwaifeiyan': {
		'name': '嶺外飛燕',
		'pinyin': 'lingwaifeiyan',
		'tags': []
	},
	'wenrenyu': {
		'name': '聞任宇',
		'pinyin': 'wenrenyu',
		'tags': []
	},
	'shuanghunyuxi': {
		'name': '雙魂虞兮',
		'pinyin': 'shuanghunyuxi',
		'tags': [
			'免死'
		]
	},
	'yaokong': {
		'name': '瑤空',
		'pinyin': 'yaokong',
		'tags': []
	},
	'sixiangmingyue': {
		'name': '四象明月',
		'pinyin': 'sixiangmingyue',
		'tags': []
	},
	'sangran': {
		'name': '桑然',
		'pinyin': 'sangran',
		'tags': []
	},
	'longmenghuayao': {
		'name': '朧夢嫿妖',
		'pinyin': 'longmenghuayao',
		'tags': []
	},
	'dixianluocha': {
		'name': '地仙羅剎',
		'pinyin': 'dixianluocha',
		'tags': []
	},
	'baigufuren': {
		'name': '白骨夫人',
		'pinyin': 'baigufuren',
		'tags': []
	},
	'wukong': {
		'name': '悟空',
		'pinyin': 'wukong',
		'tags': []
	},
	'miaoyi': {
		'name': '妙弋',
		'pinyin': 'miaoyi',
		'tags': []
	},
	'tianxuanyijian': {
		'name': '天玄義劍',
		'pinyin': 'tianxuanyijian',
		'tags': []
	},
	'jingfeiyu': {
		'name': '驚飛羽',
		'pinyin': 'jingfeiyu',
		'tags': []
	},
	'luwensheng': {
		'name': '陸文生',
		'pinyin': 'luwensheng',
		'tags': []
	},
	'liuqi': {
		'name': '六歧',
		'pinyin': 'liuqi',
		'tags': []
	},
	'yushang': {
		'name': '玉觴',
		'pinyin': 'yushang',
		'tags': []
	},
	'jingleqi': {
		'name': '景樂齊',
		'pinyin': 'jingleqi',
		'tags': []
	},
	'suxingzhe': {
		'name': '甦醒者',
		'pinyin': 'suxingzhe',
		'tags': []
	},
	'boxunyuchiliang': {
		'name': '波旬尉遲良',
		'pinyin': 'boxunyuchiliang',
		'tags': []
	},
	'xiangyin': {
		'name': '相胤',
		'pinyin': 'xiangyin',
		'tags': []
	},
	'lucungaohuangjun': {
		'name': '祿存高皇君',
		'pinyin': 'lucungaohuangjun',
		'tags': []
	},
	'bailu': {
		'name': '白鹿',
		'pinyin': 'bailu',
		'tags': []
	},
	'canglang': {
		'name': '蒼狼',
		'pinyin': 'canglang',
		'tags': []
	},
	'bingchanyujian': {
		'name': '冰蟬玉劍',
		'pinyin': 'bingchanyujian',
		'tags': []
	},
	'lvlv': {
		'name': '律',
		'pinyin': 'lvlv',
		'tags': []
	},
	'saite': {
		'name': '賽特',
		'pinyin': 'saite',
		'tags': []
	},
	'lijing': {
		'name': '李靖',
		'pinyin': 'lijing',
		'tags': []
	},
	'nike': {
		'name': '妮可',
		'pinyin': 'nike',
		'tags': []
	},
	'qumuzhi': {
		'name': '瞿牧之',
		'pinyin': 'qumuzhi',
		'tags': []
	},
	'xuezhi': {
		'name': '雪芝',
		'pinyin': 'xuezhi',
		'tags': []
	},
	'jianhuntianzun': {
		'name': '劍魂·天尊',
		'pinyin': 'jianhuntianzun',
		'tags': []
	},
	'shuangyaobingli': {
		'name': '雙曜冰璃',
		'pinyin': 'shuangyaobingli',
		'tags': []
	},
	'yaoji': {
		'name': '瑤姬',
		'pinyin': 'yaoji',
		'tags': []
	},
	'yuebei': {
		'name': '月孛',
		'pinyin': 'yuebei',
		'tags': []
	},
	'zhujin': {
		'name': '朱槿',
		'pinyin': 'zhujin',
		'tags': []
	},
	'taixuanlinghu': {
		'name': '太玄靈狐',
		'pinyin': 'taixuanlinghu',
		'tags': []
	},
	'xiaohe': {
		'name': '蕭熇',
		'pinyin': 'xiaohe',
		'tags': []
	},
	'jiyuefeitian': {
		'name': '伎樂飛天',
		'pinyin': 'jiyuefeitian',
		'tags': []
	},
	'jiuselu': {
		'name': '九色鹿',
		'pinyin': 'jiuselu',
		'tags': []
	},
	'yuqing': {
		'name': '御卿',
		'pinyin': 'yuqing',
		'tags': []
	},
	'anyi': {
		'name': '安逸',
		'pinyin': 'anyi',
		'tags': []
	},
	'shuangshuang': {
		'name': '雙雙',
		'pinyin': 'shuangshuang',
		'tags': []
	},
	'baxionggaoqi': {
		'name': '霸熊高戚',
		'pinyin': 'baxionggaoqi',
		'tags': []
	},
	'guizhao': {
		'name': '歸棹',
		'pinyin': 'guizhao',
		'tags': []
	},
	'luoyuannvhuang': {
		'name': '羅淵女皇',
		'pinyin': 'luoyuannvhuang',
		'tags': []
	},
	'youhuang': {
		'name': '幽篁',
		'pinyin': 'youhuang',
		'tags': []
	},
	'zhaoge': {
		'name': '朝歌',
		'pinyin': 'zhaoge',
		'tags': []
	},
	'lukui': {
		'name': '露葵',
		'pinyin': 'lukui',
		'tags': []
	},
	'longye': {
		'name': '朧夜',
		'pinyin': 'longye',
		'tags': []
	},
	'yinqianyang': {
		'name': '殷千煬',
		'pinyin': 'yinqianyang',
		'tags': []
	},
	'shaoxiayingfengren': {
		'name': '少俠應奉仁',
		'pinyin': 'shaoxiayingfengren',
		'tags': []
	},
	'gongsunqiyue': {
		'name': '公孫七月',
		'pinyin': 'gongsunqiyue',
		'tags': []
	},
	'fuyayu': {
		'name': '傅雅魚',
		'pinyin': 'fuyayu',
		'tags': []
	},
	'xiliya': {
		'name': '西莉亞',
		'pinyin': 'xiliya',
		'tags': []
	},
	'xingzhanxianzhe': {
		'name': '星占賢者',
		'pinyin': 'xingzhanxianzhe',
		'tags': []
	},
	'baisuzhen': {
		'name': '白素貞',
		'pinyin': 'baisuzhen',
		'tags': []
	},
	'qing': {
		'name': '青',
		'pinyin': 'qing',
		'tags': []
	},
	'fahai': {
		'name': '法海',
		'pinyin': 'fahai',
		'tags': []
	},
	'aqiu': {
		'name': '阿秋',
		'pinyin': 'aqiu',
		'tags': []
	},
	'huyanshuo': {
		'name': '呼延朔',
		'pinyin': 'huyanshuo',
		'tags': []
	},
	'zhuoer': {
		'name': '卓爾',
		'pinyin': 'zhuoer',
		'tags': []
	},
	'baaier': {
		'name': '巴艾邇',
		'pinyin': 'baaier',
		'tags': []
	},
	'shenqueqingyi': {
		'name': '神闕青衣',
		'pinyin': 'shenqueqingyi',
		'tags': []
	},
	'zhenyin': {
		'name': '真胤',
		'pinyin': 'zhenyin',
		'tags': []
	},
	'mohuahuangfushen': {
		'name': '魔化皇甫申',
		'pinyin': 'mohuahuangfushen',
		'tags': [
			'免死'
		]
	},
	'yunjia': {
		'name': '允迦',
		'pinyin': 'yunjia',
		'tags': []
	},
	'yuchiliang': {
		'name': '尉遲良',
		'pinyin': 'yuchiliang',
		'tags': []
	},
	'yuxi': {
		'name': '虞兮',
		'pinyin': 'yuxi',
		'tags': []
	},
	'luzhaoyi': {
		'name': '鹿昭依',
		'pinyin': 'luzhaoyi',
		'tags': []
	},
	'zhanzhao': {
		'name': '展昭',
		'pinyin': 'zhanzhao',
		'tags': []
	},
	'baiyutang': {
		'name': '白玉堂',
		'pinyin': 'baiyutang',
		'tags': []
	},
	'tanxiang': {
		'name': '憛香',
		'pinyin': 'tanxiang',
		'tags': []
	},
	'suijiu': {
		'name': '隋酒',
		'pinyin': 'suijiu',
		'tags': []
	},
	'wuxiangmifu': {
		'name': '無相·弭服',
		'pinyin': 'wuxiangmifu',
		'tags': []
	},
	'baifugui': {
		'name': '白復歸',
		'pinyin': 'baifugui',
		'tags': []
	},
	'yunyigongzhu': {
		'name': '雲衣宮主',
		'pinyin': 'yunyigongzhu',
		'tags': []
	},
	'lingqu': {
		'name': '靈鼩',
		'pinyin': 'lingqu',
		'tags': []
	},
	'yinma': {
		'name': '銀瑪',
		'pinyin': 'yinma',
		'tags': []
	},
	'renduanli': {
		'name': '任斷離',
		'pinyin': 'renduanli',
		'tags': []
	},
	'huoyong': {
		'name': '霍雍',
		'pinyin': 'huoyong',
		'tags': []
	},
	'jiuyin': {
		'name': '九陰',
		'pinyin': 'jiuyin',
		'tags': []
	},
	'gaohuangjun': {
		'name': '高皇君',
		'pinyin': 'gaohuangjun',
		'tags': []
	},
	'chunlan': {
		'name': '春蘭',
		'pinyin': 'chunlan',
		'tags': []
	},
	'xige': {
		'name': '奚歌',
		'pinyin': 'xige',
		'tags': []
	},
	'ningcaichen': {
		'name': '寧采臣',
		'pinyin': 'ningcaichen',
		'tags': []
	},
	'niexiaoqian': {
		'name': '聶小倩',
		'pinyin': 'niexiaoqian',
		'tags': []
	},
	'yanchixia': {
		'name': '燕赤霞',
		'pinyin': 'yanchixia',
		'tags': []
	},
	'xuanyu': {
		'name': '玄羽',
		'pinyin': 'xuanyu',
		'tags': []
	},
	'yunxiang': {
		'name': '雲襄',
		'pinyin': 'yunxiang',
		'tags': []
	},
	'xianyuchao': {
		'name': '鮮于超',
		'pinyin': 'xianyuchao',
		'tags': []
	},
	'shangguanyuan': {
		'name': '上官遠',
		'pinyin': 'shangguanyuan',
		'tags': []
	},
	'fangyun': {
		'name': '方芸',
		'pinyin': 'fangyun',
		'tags': []
	},
	'mohuaxiahouyi': {
		'name': '魔化夏侯儀',
		'pinyin': 'mohuaxiahouyi',
		'tags': []
	},
	'zhaoyou': {
		'name': '召祐',
		'pinyin': 'zhaoyou',
		'tags': []
	},
	'chilian': {
		'name': '赤煉',
		'pinyin': 'chilian',
		'tags': []
	},
	'wuyingzhong': {
		'name': '武英仲',
		'pinyin': 'wuyingzhong',
		'tags': []
	},
	'wudie': {
		'name': '舞蝶',
		'pinyin': 'wudie',
		'tags': []
	},
	'yuxiaoxue': {
		'name': '于小雪',
		'pinyin': 'yuxiaoxue',
		'tags': []
	},
	'yuwentuo': {
		'name': '宇文拓',
		'pinyin': 'yuwentuo',
		'tags': []
	},
	'lixiaoyao': {
		'name': '李逍遙',
		'pinyin': 'lixiaoyao',
		'tags': []
	},
	'zhaolinger': {
		'name': '趙靈兒',
		'pinyin': 'zhaolinger',
		'tags': []
	},
	'linyueru': {
		'name': '林月如',
		'pinyin': 'linyueru',
		'tags': []
	},
	'zhugeai': {
		'name': '諸葛艾',
		'pinyin': 'zhugeai',
		'tags': []
	},
	'yinwuxie': {
		'name': '殷無邪',
		'pinyin': 'yinwuxie',
		'tags': []
	},
	'yushaorong': {
		'name': '宇韶容',
		'pinyin': 'yushaorong',
		'tags': []
	},
	'jianxie': {
		'name': '劍邪',
		'pinyin': 'jianxie',
		'tags': []
	},
	'liyou': {
		'name': '黎幽',
		'pinyin': 'liyou',
		'tags': []
	},
	'caoqin': {
		'name': '曹沁',
		'pinyin': 'caoqin',
		'tags': []
	},
	'qinweigang': {
		'name': '秦惟剛',
		'pinyin': 'qinweigang',
		'tags': []
	},
	'zifeng': {
		'name': '紫楓',
		'pinyin': 'zifeng',
		'tags': []
	},
	'bingli': {
		'name': '冰璃',
		'pinyin': 'bingli',
		'tags': []
	},
	'danyin': {
		'name': '鄲陰',
		'pinyin': 'danyin',
		'tags': [
			'協攻'
		]
	},
	'fenghanyue': {
		'name': '封寒月',
		'pinyin': 'fenghanyue',
		'tags': []
	},
	'fenglingsheng': {
		'name': '封鈴笙',
		'pinyin': 'fenglingsheng',
		'tags': []
	},
	'geyunyi': {
		'name': '葛雲衣',
		'pinyin': 'geyunyi',
		'tags': []
	},
	'gulunde': {
		'name': '古倫德',
		'pinyin': 'gulunde',
		'tags': []
	},
	'hanqianxiu': {
		'name': '韓千秀',
		'pinyin': 'hanqianxiu',
		'tags': []
	},
	'huangfushen': {
		'name': '皇甫申',
		'pinyin': 'huangfushen',
		'tags': []
	},
	'xieyu': {
		'name': '解臾',
		'pinyin': 'xieyu',
		'tags': []
	},
	'murongxuanji': {
		'name': '慕容璇璣',
		'pinyin': 'murongxuanji',
		'tags': []
	},
	'xiahouyi': {
		'name': '夏侯儀',
		'pinyin': 'xiahouyi',
		'tags': []
	},
	'yanmingrong': {
		'name': '燕明蓉',
		'pinyin': 'yanmingrong',
		'tags': []
	},
	'yinxi': {
		'name': '陰歙',
		'pinyin': 'yinxi',
		'tags': []
	},
	'yinjianping': {
		'name': '殷劍平',
		'pinyin': 'yinjianping',
		'tags': []
	},
	'baiwan': {
		'name': '白菀',
		'pinyin': 'baiwan',
		'tags': []
	},
	'changyifeng': {
		'name': '常逸風',
		'pinyin': 'changyifeng',
		'tags': []
	},
	'gaoqi': {
		'name': '高戚',
		'pinyin': 'gaoqi',
		'tags': []
	},
	'hanwusha': {
		'name': '韓無砂',
		'pinyin': 'hanwusha',
		'tags': []
	},
	'helantiehan': {
		'name': '赫蘭鐵罕',
		'pinyin': 'helantiehan',
		'tags': []
	},
	'huanjinglongyao': {
		'name': '幻鏡朧妖',
		'pinyin': 'huanjinglongyao',
		'tags': []
	},
	'liyingfeng': {
		'name': '李盈鳳',
		'pinyin': 'liyingfeng',
		'tags': []
	},
	'murongzheng': {
		'name': '慕容箏',
		'pinyin': 'murongzheng',
		'tags': []
	},
	'situying': {
		'name': '司徒纓',
		'pinyin': 'situying',
		'tags': []
	},
	'taiyuanyinyi': {
		'name': '太淵隱逸',
		'pinyin': 'taiyuanyinyi',
		'tags': []
	},
	'xianghuanzi': {
		'name': '相桓子',
		'pinyin': 'xianghuanzi',
		'tags': []
	},
	'yanghuan': {
		'name': '陽寰',
		'pinyin': 'yanghuan',
		'tags': []
	},
	'yangyunzuo': {
		'name': '楊雲佐',
		'pinyin': 'yangyunzuo',
		'tags': []
	},
	'yingfengren': {
		'name': '應奉仁',
		'pinyin': 'yingfengren',
		'tags': []
	},
	'zhouchong': {
		'name': '周崇',
		'pinyin': 'zhouchong',
		'tags': []
	},
	'zhuhuan': {
		'name': '朱繯',
		'pinyin': 'zhuhuan',
		'tags': []
	},
	'ziyun': {
		'name': '紫蘊',
		'pinyin': 'ziyun',
		'tags': []
	},
	'aertaiba': {
		'name': '阿爾泰巴',
		'pinyin': 'aertaiba',
		'tags': []
	},
	'gaoshijin': {
		'name': '高世津',
		'pinyin': 'gaoshijin',
		'tags': []
	},
	'huyanchong': {
		'name': '呼延崇',
		'pinyin': 'huyanchong',
		'tags': []
	},
	'qingluo': {
		'name': '青蘿',
		'pinyin': 'qingluo',
		'tags': []
	},
	'weisheng': {
		'name': '韋勝',
		'pinyin': 'weisheng',
		'tags': []
	},
	'xiweiya': {
		'name': '希維亞',
		'pinyin': 'xiweiya',
		'tags': []
	},
	'yabusi': {
		'name': '雅布斯',
		'pinyin': 'yabusi',
		'tags': []
	},
	'yisiduo': {
		'name': '伊絲朶',
		'pinyin': 'yisiduo',
		'tags': []
	},
	'yinglinghua': {
		'name': '應靈華',
		'pinyin': 'yinglinghua',
		'tags': []
	},
	'zhuhao': {
		'name': '朱浩',
		'pinyin': 'zhuhao',
		'tags': []
	}
};

tags.forEach(item => {
	item.data.forEach(i => {
		role_tag_map[i[0]].tags.push(item.tag);
	})
});

for (let item in role_tag_map) {
	if (!role_tag_map[item].tags?.length) {
		delete role_tag_map[item];
	} else {
		role_tag_map[item].tags = [...new Set(role_tag_map[item].tags)];
	}
}


outputJSON({
	json: role_tag_map,
	fn: './_mid/_role_tags_map.json',
});

export const role_tags = role_tag_map;
