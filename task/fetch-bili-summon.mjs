import fs from 'fs';
import {
	outputJSON,
	uniq_array,
} from './u.mjs';

import {
	fetch_bili_page_rest,
	fetch_with_cached,
	trans_key_map,
} from './u-fetch-bili.mjs';

// const FORCE_FETCH = true;
const FORCE_FETCH = process.argv.includes('--force-fetch');

const raw = await fetch_with_cached({
	url: 'https://wiki.biligame.com/tdj/api.php?action=ask&query=[[Category:召唤物]]|?名称=name|?属相=prop|?职业=career|?射程=range|?移动=speed|?属性=status|?天赋=inherent_name|?绝学=skills_name&format=json',
	cached_path: 'bili-summon-list.query.res.json',
	// is_json: true,
	ignore_cached: FORCE_FETCH,
	// ignore_cached: true,
});

const bili_summons = Object.values(raw.query.results)
	.map(i => {
		let op = i.printouts;

		for (let key in op) {
			if (Array.isArray(op[key]) && op[key].length <= 1) {
				op[key] = op[key][0] ?? null; // 有值就取第一個，沒值(空陣列)就給 null
			}
		}

		return op;
	});


outputJSON({
	json: bili_summons,
	fn: `./_mid/_bili_summons.json`,
});

const owner = {
	'冥渊魁王': ['幻海冥皇', 'huanhaiminghuang'],
	'剑魂': ['武英仲', 'wuyingzhong'],
	'哮天犬': ['楊戩', 'yangjian'],
	'啸霜': ['銀瑪', 'yinma'],
	'守卫灵俑': ['鄲陰', 'danyin'],
	'封豨': ['相胤', 'xiangyin'],
	'庞傀': ['鄲陰', 'danyin'],
	'式鬼': ['真胤', 'zhenyin'],
	'式鬼·壹': ['真胤', 'zhenyin'],
	'式鬼·贰': ['真胤', 'zhenyin'],
	'律.蛛母': ['尉遲良', 'yuchiliang'],
	'律.蛛母·贰': ['尉遲良', 'yuchiliang'],
	'昂昴': ['相胤', 'xiangyin'],
	'梦种灯': ['白鹿', 'bailu'],
	'独角仙': ['阿秋', 'aqiu'],
	'独角仙·壹': ['阿秋', 'aqiu'],
	'独角仙·贰': ['阿秋', 'aqiu'],
	'白泽': ['尉遲慎', 'yuchishen'],
	'驺吾': ['尉遲慎', 'yuchishen'],
	'链·蛛母': ['波旬尉遲良', 'boxunyuchiliang'],
	'秽土灵俑': ['鄲陰', 'danyin'],
	'秽土灵俑·壹': ['鄲陰', 'danyin'],
	'秽土灵俑·贰': ['鄲陰', 'danyin'],
	'雷晶分身': ['上官玥', 'shangguanyue'],
};


let summon_data = [];
let summon_skills_name = [];
let summon_skills = [];
let matched_subskills = [];


// fetch basic summon data
for (const summon of bili_summons) {
	const inherent_data = await fetch_bili_page_rest({
		name: ('天赋/' + summon.inherent_name),
		ignore_cached: FORCE_FETCH,
	});

	let op = {
		...summon,
		key: encodeURIComponent('召唤物/' + summon.name),
		owner: owner[summon.name] ?? '',
		status: summon.status.split(',').map(i => parseFloat(i) || 0),
		inherent: inherent_data['天赋6星'],
	}

	summon_data.push(op);
	summon_skills_name.push(summon.skills_name);
}

// fetch summon skills' data
for (const skill_name of summon_skills_name.flat()) {
	const _data = await fetch_bili_page_rest({
		name: ('绝学/' + skill_name),
		ignore_cached: FORCE_FETCH,
	});

	let op = trans_key_map(_data);
	op.name = skill_name;

	{
		let sub_skills = [];
		const _desc = op.desc;
		if (_desc.includes('切换') && _desc.match(/「[^」]+」/)) {
			const subskills_name = _desc.match(/「[^」]+」/gm).map((i) => i.replace(/[「」]/g, ''));

			for (let _ssname of subskills_name) {
				const _ssdata = await fetch_bili_page_rest({
					name: ('绝学/' + _ssname),
					ignore_cached: FORCE_FETCH,
				});

				sub_skills.push({
					...trans_key_map(_ssdata),
					name: _ssname,
				})
			};
		}

		if (sub_skills.length) {
			op.sub_skills = sub_skills;
		}
	}

	summon_skills.push(op);
}


// overrides
{
	summon_data.forEach(sss => {
		// workaround: fix 式鬼
		if (sss.name?.startsWith('式鬼')) {
			sss.speed = 5;
			sss.range = 1;
			sss.career = '御风';
		}

		if (sss.name === '冥渊魁王') {
			sss.career = 'boss';
		}

		if (sss.name === '梦种灯') {
			sss.speed = 3;
			sss.range = 0;
		}
	});
}


// fill data by hand
{
	{
		// workaround: add 賽特|召喚物/賽特分身
		summon_data.push({
			key: '召喚物/賽特分身',
			name: '賽特分身',
			owner: ['賽特', 'saite'],
			inherent_name: '火神降臨',
			inherent:
				'氣血越高，傷害、炎屬相免傷越高（最高25%）。\n主動攻擊造成傷害後，對目標施加「燃燒」狀態，持續2回合。\n主動攻擊「對戰中」有機率（氣血越高，機率越高（最高100%））觸發「重擊·崩山」。',
			stats: [100, 100, 100, 100, 100, 100],
			prop: '炎',
			career: '俠客',
			range: 1,
			speed: 3,
			skill_names: ['天狼巽閃', '霸王崩山勁', '蛟龍翻身'],
		});
	}

	{
		// workaround: add 劍聖|召喚物/天劍
		summon_data.push({
			key: '召喚物/天劍',
			name: '天劍',
			owner: ['武英仲', 'wuyingzhong'],
			inherent_name: '凶劍煬魂',
			inherent:
				'行動時無視敵方角色阻擋。死亡時對周圍2格敵人施加「魂創」狀態，持續2回合，重置「天劍聖裁」冷卻時間。',
			stats: [80, 80, 80, 80, 80, 80],
			prop: '光',
			career: '御風',
			range: 1,
			speed: 5,
			skill_names: ['鎮罪之儀', '逆轉乾坤‧天劍', '魂刻‧天劍'],
		});
		summon_skills.push(...[
			{
				name: '鎮罪之儀',
				cd: '3回合',
				shoot: '自身',
				range: '菱形3格',
				type: '物攻傷害',
				desc: '對範圍內所有敵人造成0.5倍傷害，施加2層「魂創」狀態，持續2回合。',
			},
			{
				name: '逆轉乾坤‧天劍',
				cd: '4回合',
				shoot: '3格',
				range: '單體',
				type: '支援',
				desc: '和召喚者交換氣血，並轉移所有「減益狀態」到自身。',
			},
			{
				name: '魂刻‧天劍',
				cd: '-',
				shoot: '-',
				range: '-',
				type: '被動',
				desc: '行動結束時恢復2格內的友方氣血（最大氣血的20%）。',
			},
		]);
	}

	{
		// workaround: add 夜無陵|召喚物/九黎悍士
		summon_data.push({
			key: '召喚物/九黎悍士',
			name: '九黎悍士',
			owner: ['夜無陵', 'yewuling'],
			inherent_name: '捐身循義',
			inherent:
				'免傷提高15%。行動結束時，對夜無陵施加1層「徇義」狀態(上限15層)。\n「徇義」：除氣血外全屬性提高2%。',
			stats: [100, 100, 100, 100, 100, 100],
			prop: '暗',
			career: '鐵衛',
			range: 1,
			speed: 3,
			skill_names: ['頂踵盡捐', '抱令守盟', '地禦符'],
		});
		summon_skills.push(...[
			{
				name: '頂踵盡捐',
				cd: 2,
				shoot: '自身',
				range: '菱形3格',
				type: '物攻傷害',
				desc: '[被動]若被夜無陵獻祭，對自身3格範圍內敵人造成1次「固定傷害」(自身當前氣血的20%)，並施加1個隨機「有害狀態」。\n[主動]損耗自身當前氣血20%(無法免疫)，對範圍內敵人造成「固定傷害」，傷害值為釋放者消耗的氣血。並施加1個 隨機「有害狀態」。絕學後立刻死亡。',
			},
			{
				name: '抱令守盟',
				cd: 2,
				shoot: '自身',
				range: '單體',
				type: '主動',
				desc: '[被動]代替相鄰1格內友方承受攻擊。\n[主動]護衛範圍提高到2格，自身獲得1個隨機「有益狀態」和「復仇」狀態，持續2回合。',
			},
			{
				name: '地禦符',
				type: '被動',
				desc: '行動結束時，使相鄰1格內物防屬性最高的1個其他友方施加「披甲I」狀態，持續1回合。',
			},
		]);
	}

	{
		// workaround: add 上官玥|召喚物/雷晶分身
		summon_data.push({
			key: '召喚物/雷晶分身',
			name: '雷晶分身',
			owner: ['上官玥', 'shangguanyue'],
			inherent_name: '玲瓏妙心',
			inherent:
				'主動攻擊物攻提高15%。\n若氣血大於等於80%，物理免傷提高20%且主動普攻觸發「追擊」（0.5倍傷害）。\n主動攻擊若造成暴擊，則行動結束時為自身召喚物/召喚者施加「蓄電」狀態。\n若不攜帶「離魂」狀態，受到致命傷害免除死亡，氣血恢復50%，並永久進入「離魂」狀態。\n場上不存在友方「雷晶分身」時，行動結束前可選擇使用絕學「凝雷聚形」（間隔4回合觸發）',
			stats: [100, 140, 100, 100, 100, 100],
			prop: '雷',
			career: '俠客',
			range: 1,
			speed: 3,
			skill_names: ['雷晶護體', '輕身', '流霆'],
		});
		summon_skills.push(...[
			{
				name: '雷晶護體',
				type: '被動',
				desc: '遭受範圍傷害、固定傷害降低20%。\n若自身處於「離魂」狀態，遭受「固定傷害」額外降低30%。',
			},
			{
				name: '輕身',
				type: '被動',
				desc: '永久獲得輕功能力，可以翻越障礙。',
			},
			{
				name: '流霆',
				type: '被動',
				desc: '追擊傷害提升30%，主動攻擊「對戰後」恢復自身氣血，恢復量為本次傷害的30%。\n若本回合發起過攻擊，行動結束時使自身召喚物/召喚者移除「移動力限制」狀態，並施加「奮起」狀態，持續2回合。',
			},
		]);
	}

	{
		// workaround: add 瑚兒|召喚物/公主親從
		summon_data.push({
			key: '召喚物/公主親從',
			name: '公主親從',
			owner: ['瑚兒', 'huer'],
			inherent_name: '公主親從?',
			inherent: '免傷提高15%。法攻的75%額外附加到物攻上。拾取的「御禮奇珍」獲得「有益狀態」數量+1。\n若本回合拾取過友方「御禮奇珍」,行動結束時使「瑚兒」隨機絕學冷卻-1。\n自身在場時,「瑚兒」受到致命傷害時免除死亡且氣血恢復50%,若成功觸發, 「公主親從」自身死亡。',
			stats: [140, 100, 100, 100, 100, 100],
			prop: '冰',
			career: '俠客',
			range: 1,
			speed: 3,
			skill_names: ['公主親從-誓死捍衛', '承令援助', '受賞'],
		});
		summon_skills.push(...[
			{
				name: '公主親從-誓死捍衛',
				cd: 2,
				shoot: '自身',
				range: '單體',
				type: '主動',
				desc: '[被動]代替相鄰1格內友方承受攻擊。\n[主動]護衛範圍提高到2格,持續2回合,並獲得「衛主」狀態。\n「衛主」:免傷、物防提高20%，遭受攻擊後移除。',
			},
			{
				name: '承令援助',
				cd: 2,
				shoot: 5,
				range: '單體',
				type: '支援',
				desc: '對單個其他友方釋放，將自身所有「有益狀態」轉移給目標並轉移目標2個「有害狀態」至自身，且自身本回合拾取的友方「御禮奇珍」效果將施加於目標。若本回合拾取過友方「御禮奇珍」，行動結束時本絕學冷卻-1。',
			},
			{
				name: '受賞',
				type: '被動',
				desc: '[被動]若本回合未遭受攻擊，則下回合開始時使自身「有益狀態」等級+1。',
			},
		]);

		// workaround: add 瑚兒|召喚物/帝姬侍女
		summon_data.push({
			key: '召喚物/帝姬侍女',
			name: '帝姬侍女',
			owner: ['瑚兒', 'huer'],
			inherent_name: '帝姬侍女?',
			inherent: '治療效果提高15%。拾取的「御禮奇珍」獲得「有益狀態」等級+1。\n若本回合拾取過友方「御禮奇珍」，行動結束時使「瑚兒」隨機絕學冷卻-1。\n自身在場時，「瑚兒」受到致命傷害時免除死亡且氣血恢復50%，若成功觸發，「帝姬侍女」自身死亡。',
			stats: [100, 100, 100, 100, 100, 100],
			prop: '光',
			career: '祝由',
			range: 2,
			speed: 3,
			skill_names: ['氣愈之術', '奉命賜福', '受賞'],
		});
		summon_skills.push(...[
			{
				name: '氣愈之術',
				cd: 0,
				shoot: 3,
				range: '單體',
				type: '治療',
				desc: '主動使用，恢復單個角色氣血(恢復量為施術者法攻的1.5倍)，驅散1個「有害狀態」。',
			},
			{
				name: '奉命賜福',
				cd: 2,
				shoot: 5,
				range: '單體',
				type: '支援',
				desc: '對單個其他友方釋放，將自身所有「有益狀態」轉移給目標並在目標周身2格內生成2個「御禮奇珍」，持續1回合，且自身本回合拾取的友方「御禮奇珍」效果將施加於目標。若本回合拾取過友方「御禮奇珍」，行動結束時本絕學冷卻-1。',
			},
		]);
	}

	{
		// workaround: add 波旬尉遲良|召喚物/鏈.蛛母
		summon_data.push({
			key: '召喚物/鏈.蛛母',
			name: '鏈.蛛母',
			owner: ['波旬尉遲良', 'boxunyuchiliang'],
			inherent_name: '縛魔羅網',
			inherent:
				'傷害提高20%。主動攻擊「對戰前」自身獲得1個隨機「進攻類增益狀態」。行動結束時，若本次行動未發起攻擊，獲得1個「防禦類增益狀態」。',
			stats: [100, 100, 100, 100, 100, 100],
			prop: '幽',
			career: '俠客',
			range: 1,
			speed: 3,
			skill_names: ['化垠蛛絲', '承災庇主', '幽澤延綿'],
		});
		summon_skills.push(...[
			{
				name: '化垠蛛絲',
				cd: 2,
				shoot: 1,
				range: '單體',
				type: '物攻傷害',
				desc: '攻擊單個敵人，造成1.5倍物攻傷害，「對戰前」使目標「減益狀態」等級提升1級。',
			},
			{
				name: '承災庇主',
				cd: 3,
				shoot: 3,
				range: '單體',
				type: '支援',
				desc: '選擇1個其他友方，使其「減益狀態」持續時間-2。',
			},
			{
				name: '幽澤延綿',
				type: '被動',
				desc: '獲得「增益狀態」時，使其等級+1。',
			},
		]);
	}

}



const all_data = {
	summons: summon_data,
	// skills_name: summon_skills_name.flat(),
	skills: uniq_array(summon_skills, 'name', 'desc')
		.sort((a, b) => {
			return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
		}),
};

outputJSON({
	json: all_data,
	fn: `./_pre/summons.src.json`,
	cn2tw: true,
});

outputJSON({
	json: all_data,
	fn: '../src/lib/data/summons.min.json',
	space: 0,
	cn2tw: true,
});