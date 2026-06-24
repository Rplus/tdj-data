import {
	outputJSON,
	remove_html_tag,
	read_json_file,
} from './u.mjs';
import { converter_cn2tw, converter_tw2cn } from './opencc.mjs';

import {
	// trans_key_map,
	fetch_with_cached,
	fetch_bili_page_rest,
	muli_fetch_bili_page_rest,
} from './u-fetch-bili.mjs';


// const FORCE_FETCH = true;
const FORCE_FETCH = process.argv.includes('--force-fetch');

let roles = read_json_file('./_pre/roles.src.json') || [];

// 現在技能少，一次全撈回來
const json = await fetch_with_cached({
	url: 'https://wiki.biligame.com/tdj/api.php?action=ask&query=[[Category:援袭绝学]]|?所属=owner|?星数=star|?名称=name|?类别=type|?冷却=cd|?射程=shoot|?范围=range|?描述=desc|limit=500&format=json&utf8=1',
	cached_path: `bili/援袭绝学/援袭绝学.query.json`,
	is_json: true,
	ignore_cached: FORCE_FETCH,
});

let results = Object.values(json.query.results).map(item => {
	// 自動將所有 printouts 的陣列值取第一個元素出來
	return Object.fromEntries(
		Object.entries(item.printouts).map(([key, value]) => [key, value[0]])
	);
});

// 取得技能圖片網址
let skills_name = [...new Set(results.map(i => i.name))];
// console.log(skills_name);
let _titles = skills_name.map(i => `File:援袭绝学 ${i}.png`).join('|');
let skills_image_raw = await fetch_with_cached({
	url: `https://wiki.biligame.com/tdj/api.php?action=query&titles=${_titles}&prop=imageinfo&iiprop=url&format=json`,
	cached_path: `bili/援袭绝学/援袭绝学img.json`,
	is_json: true,
	ignore_cached: FORCE_FETCH,
});

let skills_image_map = Object.values(skills_image_raw?.query.pages).reduce((all, page) => {
	let title = page.title.match(/^文件:援袭绝学 (.+)\.png$/)?.[1];
	if (title) {
		all[title] = page.imageinfo?.[0]?.url;
	}
	return all;
}, {});


let support_skills = results.reduce((all, i) => {
	const owner = i.owner;
	const role = roles.find(r => r.name === converter_cn2tw(owner));
	const pinyin = role?.pinyin || owner;
	const img = skills_image_map[i.name] || '';
	if (!all[pinyin]) {
		all[pinyin] = {
			owner,
			owner_pinyin: role?.pinyin,
			support_skill: {
				name: i.name,
				img,
				type: i.type,
				cd: i.cd,
				shoot: i.shoot,
				range: i.range,
				descs: [],
			},
		};
	}

	all[pinyin].support_skill.descs.push(
		{ star: i.star, desc: remove_html_tag(i.desc), },
	)
	return all;
}, {});


{
	// workaround for new support skills
	support_skills['geyunyi'] = {
		'owner': '葛雲衣',
		'owner_pinyin': 'geyunyi',
		'support_skill': {
			'name': '諸星神曜·援',
			'img': 'https://cdn.imgchest.com/files/55396a0b5ec9.png',
			'type': '治療',
			'cd': '2回合',
			'shoot': '3格',
			'range': '菱形3格',
			'descs': [
				{
					'star': '4',
					'desc': '[共勢]全場友方「祝由」職業，免疫「禁療」狀態。\n[主動]恢復範圍內所有目標氣血（恢復量為施術者（物攻+法攻）的0.75倍），並施加「祝安·熙」「神護I」「固元I」狀態，持續3回合。\n「祝安·熙」：行動結束時，恢復自身氣血。（恢復量為施術者（物攻+法攻）的0.6倍），氣血高於30%時免疫「治療降低」「禁療」和「治療轉傷害」類狀態。（有益狀態，不可驅散，不可偷取，不可擴散）\n若自身為「祝由」職業，絕學後自身獲得「披甲I」「御魔I」狀態，持續2回合。'
				},
				{
					'star': '5',
					'desc': '[共勢]全場友方「祝由」職業，免疫「禁療」狀態。\n[主動]恢復範圍內所有目標氣血（恢復量為施術者（物攻+法攻）的1倍），並施加「祝安·熙」「神護II」「固元II」狀態，持續3回合。\n「祝安·熙」：行動結束時，恢復自身氣血。（恢復量為施術者（物攻+法攻）的0.6倍），氣血高於30%時免疫「治療降低」「禁療」和「治療轉傷害」類狀態。（有益狀態，不可驅散，不可偷取，不可擴散）\n若自身為「祝由」職業，絕學後自身獲得「披甲I」「御魔I」「辟防」狀態，持續2回合。'
				}
			]
		}
	};

	support_skills['jianxie'] = {
		'owner': '劍邪',
		'owner_pinyin': 'jianxie',
		'support_skill': {
			'name': '化魔厲宿·援',
			'img': 'https://cdn.imgchest.com/files/4eb23aa0918e.png',
			'type': '主動',
			'cd': '4回合',
			'shoot': '自身',
			'range': '單體',
			'descs': [
				{
					'star': '4',
					'desc': '[共勢]全場友方「御風」職業，周圍2圈內每有1個敵人，自身除氣血外全屬性提高1%（最多3%）。\n[主動]主動使用，自身獲得「化魔厲宿」狀態。\n若自身為「御風」職業，獲得「迅捷I」狀態，持續2回合。\n「化魔厲宿」：使用絕學後自身獲得「天魔護鎧」狀態，持續1回合（觸發後移除）。\n「天魔護鎧」：免傷提高50%（受到傷害後消失）'
				},
				{
					'star': '5',
					'desc': '[共勢]全場友方「御風」職業，周圍2圈內每有1個敵人，自身除氣血外全屬性提高2%（最多6%）。\n[主動]主動使用，自身獲得「化魔厲宿·荒」狀態。\n若自身為「御風」職業，獲得「迅捷I」「迅目I」狀態，持續2回合。\n「化魔厲宿·荒」：使用絕學後自身獲得「閻天護鎧」狀態，持續1回合（觸發後移除）。\n「閻天護鎧」：免傷、暴擊抗性提高80%，狀態消失時，對周圍2圈內所有敵人施加2個「有害狀態」，恢復自身100%氣血（受到傷害後消失）'
				}
			]
		}
	};

	support_skills['yinxi'] = {
		'owner': '陰歙',
		'owner_pinyin': 'yinxi',
		'support_skill': {
			'name': '幽冥冰縛·援',
			'img': 'https://cdn.imgchest.com/files/d40d519de4e4.png',
			'type': '主動',
			'cd': '2回合',
			'shoot': '3格',
			'range': '單體',
			'descs': [
				{
					'star': '4',
					'desc': '[共勢]全場友方「鐵衛」職業，物防、物理免傷提高3%。\n[主動]對目標施加「遲緩I」狀態，持續2回合，並在自身周圍2格張開領域「幽冥冰縛」，持續2回合。\n若自身為「鐵衛」職業，絕學後自身護衛範圍提高到3格，持續3回合。\n「幽冥冰縛」：自身2格內所有敵方物攻降低15%，移動力-2。'
				},
				{
					'star': '5',
					'desc': '[共勢]全場友方「鐵衛」職業，物防、物理免傷提高5%。\n[主動]對目標施加「遲緩II」狀態，持續2回合，並在自身周圍2格張開領域「幽冥冰縛」，持續2回合。\n若自身為「鐵衛」職業，絕學後自身護衛範圍提高到3格，並獲得「寒襲」狀態，持續3回合。\n「幽冥冰縛」：自身2格內所有敵方物攻降低15%，移動力-2。\n「寒襲」：遭受攻擊「對戰後」對目標施加「遲緩I」狀態，持續1回合。遭受近戰攻擊「對戰中」發動「先攻」。'
				}
			]
		}
	};

	support_skills['yinjianping'] = {
		'owner': '殷劍平',
		'owner_pinyin': 'yinjianping',
		'support_skill': {
			'name': '融會貫通·援',
			'img': 'https://cdn.imgchest.com/files/66fb67be8555.png',
			'type': '治療',
			'cd': '1回合',
			'shoot': '3格',
			'range': '菱形1格',
			'descs': [
				{
					'star': '4',
					'desc': '[共勢]全場友方「俠客」職業，傷害提升3%，若本次行動未發起攻擊，行動結束時獲得「起勢」狀態，持續1回合。\n[主動]主動使用，恢復範圍內所有友方氣血（恢復量為施術者(物攻+法攻)的1倍），驅散1個「有害狀態」自身獲得「炎浴」狀態，持續2回合。\n若自身為「俠客」職業，絕學後自身獲得「續戰」狀態，持續2回合。\n「炎浴」： 主動攻擊「對戰後」恢復傷害數值50%的氣血，驅散自身2個「有害狀態」。\n「續戰」：主動攻擊「對戰前」驅散自身所有「禁療」類狀態，且恢復35%最大氣血。（有益狀態，不可驅散）'
				},
				{
					'star': '5',
					'desc': '[共勢]全場友方「俠客」職業，傷害提升5%，若本次行動未發起攻擊，行動結束時獲得「起勢」狀態，持續1回合。\n[主動]主動使用，恢復範圍內所有友方氣血（恢復量為施術者(物攻+法攻)的1.5倍），驅散2個「有害狀態」自身獲得「炎浴」狀態，持續2回合。\n若自身為「俠客」職業，絕學後自身獲得「神睿I」「續戰」狀態，持續2回合。\n「炎浴」： 主動攻擊「對戰後」恢復傷害數值50%的氣血，驅散自身2個「有害狀態」。\n「續戰」：主動攻擊「對戰前」驅散自身所有「禁療」類狀態，且恢復35%最大氣血。（有益狀態，不可驅散）'
				}
			]
		}
	};

	support_skills['yinjianping'] = {
		'owner': '殷劍平',
		'owner_pinyin': 'yinjianping',
		'support_skill': {
			'name': '融會貫通·援',
			'img': 'https://cdn.imgchest.com/files/66fb67be8555.png',
			'type': '治療',
			'cd': '1回合',
			'shoot': '3格',
			'range': '菱形1格',
			'descs': [
				{
					'star': '4',
					'desc': '[共勢]全場友方「俠客」職業，傷害提升3%，若本次行動未發起攻擊，行動結束時獲得「起勢」狀態，持續1回合。\n[主動]主動使用，恢復範圍內所有友方氣血（恢復量為施術者(物攻+法攻)的1倍），驅散1個「有害狀態」自身獲得「炎浴」狀態，持續2回合。\n若自身為「俠客」職業，絕學後自身獲得「續戰」狀態，持續2回合。\n「炎浴」： 主動攻擊「對戰後」恢復傷害數值50%的氣血，驅散自身2個「有害狀態」。\n「續戰」：主動攻擊「對戰前」驅散自身所有「禁療」類狀態，且恢復35%最大氣血。（有益狀態，不可驅散）'
				},
				{
					'star': '5',
					'desc': '[共勢]全場友方「俠客」職業，傷害提升5%，若本次行動未發起攻擊，行動結束時獲得「起勢」狀態，持續1回合。\n[主動]主動使用，恢復範圍內所有友方氣血（恢復量為施術者(物攻+法攻)的1.5倍），驅散2個「有害狀態」自身獲得「炎浴」狀態，持續2回合。\n若自身為「俠客」職業，絕學後自身獲得「神睿I」「續戰」狀態，持續2回合。\n「炎浴」： 主動攻擊「對戰後」恢復傷害數值50%的氣血，驅散自身2個「有害狀態」。\n「續戰」：主動攻擊「對戰前」驅散自身所有「禁療」類狀態，且恢復35%最大氣血。（有益狀態，不可驅散）'
				}
			]
		}
	};

	support_skills['fenghanyue'] = {
		'owner': '封寒月',
		'owner_pinyin': 'fenghanyue',
		'support_skill': {
			'name': '踏雪前行·援',
			'img': 'https://cdn.imgchest.com/files/3653bd91a4c8.png',
			'type': '法攻傷害',
			'cd': '3回合',
			'shoot': '自身',
			'range': '直線5格',
			'descs': [
				{
					'star': '4',
					'desc': '[共勢]全場友方「咒師」職業，法術穿透、法防提高5%。\n[主動]對範圍內所有敵人造成0.4倍傷害，施加「遲緩II」和「封脈」狀態，持續2回合。\n若自身為「咒師」職業，額外獲得「踵步」狀態，持續1回合。\n「踵步」：主動施放絕學後自身獲得再移動（2格）。'
				},
				{
					'star': '5',
					'desc': '[共勢]全場友方「咒師」職業，法術穿透、法防提高10%。\n[主動]對範圍內所有敵人造成0.4倍傷害，施加「遲緩II」和「封脈」狀態，並製造「霜凍」地形，持續2回合。\n若自身為「咒師」職業，額外獲得「履霜」「踵步」狀態，持續1回合。\n「履霜」：穿透提升10%，自身在友方「霜凍」地形上移動時不消耗移動力。\n「踵步」：主動施放絕學後自身獲得再移動（2格）。'
				}
			]
		}
	};

	support_skills['gulunde'] = {
		'owner': '古倫德',
		'owner_pinyin': 'gulunde',
		'support_skill': {
			'name': '回光槍技·援',
			'img': 'https://cdn.imgchest.com/files/62a590b42f9b.png',
			'type': '物攻傷害',
			'cd': '2回合',
			'shoot': '自身',
			'range': '菱形3格',
			'descs': [
				{
					'star': '4',
					'desc': '[共勢]全場友方「鐵衛」職業，自身氣血每損失10%，物攻、物防提高1%，最多提高4%。\n[主動]對範圍內所有敵人造成0.4倍傷害，施加「電流」狀態，持續2回合。\n若自身為「鐵衛」職業，獲得「回刺」「復仇」狀態，持續3回合。\n「回刺」：反擊射程+1，主動攻擊後獲得再移動（2格）。'
				},
				{
					'star': '5',
					'desc': '[共勢]全場友方「鐵衛」職業，自身氣血每損失10%，物攻、物防提高2%，最多提高8%。\n[主動]對範圍內所有敵人造成0.4倍傷害，施加「電流」狀態，持續2回合。\n若自身為「鐵衛」職業，擊退十字方向目標1格。獲得「回刺」「復仇」狀態，持續3回合。\n「回刺」：反擊射程+1，主動攻擊後獲得再移動（2格）。'
				}
			]
		}
	};

	support_skills['xieyu'] = {
		'owner': '解臾',
		'owner_pinyin': 'xieyu',
		'support_skill': {
			'name': '龍焰化鱗·援',
			'img': 'https://cdn.imgchest.com/files/fb8e24f08bdb.png',
			'type': '物攻傷害',
			'cd': '3回合',
			'shoot': '自身',
			'range': '菱形3格',
			'descs': [
				{
					'star': '4',
					'desc': '[共勢]全場友方「鐵衛」職業，遭受物理攻擊「對戰中」物防、物理免傷提高7%。（每回合觸發1次）\n[主動]對範圍內所有敵人造成0.4倍傷害，施加1個隨機「有害狀態」。\n若自身為「鐵衛」職業，絕學後自身護衛範圍提高到3格，持續3回合。'
				},
				{
					'star': '5',
					'desc': '[共勢]全場友方「鐵衛」職業，遭受物理攻擊「對戰中」物防、物理免傷提高10%。（每回合觸發1次）\n[主動]對範圍內所有敵人造成0.4倍傷害，施加1個隨機「有害狀態」和「封勁」狀態，持續2回合，自身獲得「暗鎧」狀態。\n若自身為「鐵衛」職業，絕學後自身護衛範圍提高到3格，並獲得「龍威」狀態，持續3回合。\n「龍威」：免疫「封脈」狀態，反擊射程+1，遭受攻擊「對戰前」對目標施加2個隨機「有害狀態」。'
				}
			]
		}
	};

	support_skills['zhujin'] = {
		'owner': '朱槿',
		'owner_pinyin': 'zhujin',
		'support_skill': {
			'name': '揚旗振曜·援',
			'img': 'https://cdn.imgchest.com/files/c1138b49cdfb.png',
			'type': '法攻傷害',
			'cd': '1回合',
			'shoot': '5格',
			'range': '菱形2格',
			'descs': [
				{
					'star': '4',
					'desc': '[共勢]全場友方「鬥將」職業，攜帶護盾時，傷害、暴擊率提高3%。\n[主動]選擇1個空格釋放，對範圍內所有敵人造成0.3倍傷害，轉化範圍內的目標最多2個「有益狀態」為「燃燒」「罔效I」狀態，持續2回合。\n若自身為「鬥將」職業，使用絕學後在點選格召喚「貫日旗」機關，持續2回合。\n「貫日旗」：相鄰1格開啟「限制區域」：敵方移動力消耗+1。（無法再生成其他地形，不可停留）'
				},
				{
					'star': '5',
					'desc': '[共勢]全場友方「鬥將」職業，攜帶護盾時，傷害、暴擊率提高5%。\n[主動]選擇1個空格釋放，對範圍內所有敵人造成0.3倍傷害，轉化範圍內的目標最多3個「有益狀態」為「燃燒」「罔效I」「降療I」狀態，持續2回合，清除範圍內的敵方機關。\n若自身為「鬥將」職業，使用絕學後在點選格召喚「貫日旗」機關，持續2回合，並獲得護盾（自身最大氣血的30%）\n「貫日旗」：相鄰1格開啟「限制區域」：敵方移動力消耗+1。（無法再生成其他地形，不可停留）'
				}
			]
		}
	};

	support_skills['yanmingrong'] = {
		'owner': '燕明蓉',
		'owner_pinyin': 'yanmingrong',
		'support_skill': {
			'name': '靈狐穿刺·援',
			'img': 'https://cdn.imgchest.com/files/adffb0c7dc3f.png',
			'type': '物攻傷害',
			'cd': '5回合',
			'shoot': '自身',
			'range': '直線5格',
			'descs': [
				{
					'star': '4',
					'desc': '[共勢]全場友方「御風」職業，每累計主動移動10格，獲得「靈犀」狀態，持續1回合。\n[主動]向前穿刺並到達作用範圍（5格）最遠可到達的格子上，對範圍內所有敵人造成0.4倍傷害，施加「電流」狀態 ，持續2回合。\n若自身為「御風」職業，獲得「靈狐雀步」狀態，持續2回合。\n「靈狐雀步」：主動擊殺敵人或觸發「抵擋致命傷害」的效果後，可再移動3格，並獲得「隱狐」狀態，持續2回合。\n「靈犀」：暴擊率、暴擊傷害提高3%（下次主動攻擊後移除）\n「隱狐」：無法作為目標被選中，範圍免傷提高50%，主動攻擊「對戰後」或者承受1次範圍傷害後狀態消失'
				},
				{
					'star': '5',
					'desc': '[共勢]全場友方「御風」職業，每累計主動移動10格，獲得「靈犀」狀態，持續1回合。\n[主動]向前穿刺並到達作用範圍（5格）最遠可到達的格子上，對範圍內所有敵人造成0.4倍傷害，施加「電流」狀態 ，持續2回合。\n若自身為「御風」職業，獲得「靈狐雀步」「迅目I」狀態，持續2回合。\n「靈狐雀步」：主動擊殺敵人或觸發「抵擋致命傷害」的效果後，可再移動3格，並獲得「隱狐」狀態，持續2回合。\n「靈犀」：暴擊率、暴擊傷害提高5%（下次主動攻擊後移除）\n「隱狐」：無法作為目標被選中，範圍免傷提高50%，主動攻擊「對戰後」或者承受1次範圍傷害後狀態消失'
				}
			]
		}
	};
	// support_skills['xxxx'] = {
	// 	'owner': '',
	// 	'owner_pinyin': 'xxxx',
	// 	'support_skill': {
	// 		'name': '',
	// 		'img': '',
	// 		'type': '',
	// 		'cd': '',
	// 		'shoot': '',
	// 		'range': '',
	// 		'descs': [
	// 			{
	// 				'star': '4',
	// 				'desc': ''
	// 			},
	// 			{
	// 				'star': '5',
	// 				'desc': ''
	// 			}
	// 		]
	// 	}
	// };
}



outputJSON({
	json: support_skills,
	fn: `./_mid/roles_with_support_skills.json`,
	// space: 0,
	// cn2tw: true,
});
