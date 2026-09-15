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

// workaround for new support skills
support_skills['yushaorong'] = {
	'owner': '宇韶容',
	'owner_pinyin': 'yushaorong',
	'support_skill': {
		'name': '靈元命護·援',
		'img': 'https://cdn.imgchest.com/files/45df3b074a71.png',
		'type': '治療',
		'cd': '3',
		'shoot': '自身',
		'range': '菱形3格',
		'descs': [
			{
				'star': '4',
				'desc': '[共勢]全場友方「鐵衛」職業，若自身不滿血，遭受攻擊「對戰前」恢復氣血（恢復量為自身物攻的0.75倍）（每回合觸發1次）\n[主動]驅散3格範圍內友方2個「有害狀態」並恢復氣血（恢復量為施術者(物攻+法攻)的1倍）。\n若自身為「鐵衛」職業，絕學後自身護衛範圍提高到3格，獲得「靈元盾」狀態，持續3回合。\n「靈元盾」：免傷+15%，遭受傷害後消失，狀態消失時為2格範圍內友方角色驅散2個「有害狀態」。'
			},
			{
				'star': '5',
				'desc': '[共勢]全場友方「鐵衛」職業，若自身不滿血，遭受攻擊「對戰前」恢復氣血（恢復量為自身物攻的1倍）（每回合觸發1次）\n[主動]驅散3格範圍內友方2個「有害狀態」並恢復氣血（恢復量為施術者(物攻+法攻)的1.5倍），並施加「光鎧」狀態。\n若自身為「鐵衛」職業，絕學後自身護衛範圍提高到3格，獲得「靈元盾」「固元II」狀態，持續3回合。\n「靈元盾」：免傷+15%，遭受傷害後消失，狀態消失時為2格範圍內友方角色驅散2個「有害狀態」。'
			}
		]
	}
};

support_skills['wudie'] = {
	'owner': '舞蝶',
	'owner_pinyin': 'wudie',
	'support_skill': {
		'name': '織焰同心·援',
		'img': 'https://cdn.imgchest.com/files/60276bb2e916.png',
		'type': '治療',
		'cd': '3',
		'shoot': '3格',
		'range': '菱形3格',
		'descs': [
			{
				'star': '4',
				'desc': '[共勢]全場友方「祝由」職業，法攻、法防提高5%。\n[主動]恢復範圍內所有目標氣血（恢復量為施術者（物攻+法攻）的1倍），驅散1個「有害狀態」施加「焚炎」和「涅槃」狀態，持續2回合。\n若自身為「祝由」職業，絕學後驅散自身1個「有害狀態」。\n「涅槃」：「對戰前」恢復自身氣血（恢復量為施術者（物攻+法攻）的0.5倍）（有益狀態，不可驅散）\n「焚炎」：受到來自敵方的主動攻擊傷害後消失，恢復自身氣血（恢復量為施術者（物攻+法攻）的0.5倍）並對菱形2格敵人造成1次「固定傷害」（施術者（物攻+法攻）的0.4倍）。'
			},
			{
				'star': '5',
				'desc': '[共勢]全場友方「祝由」職業，法攻、法防提高7%。\n[主動]恢復範圍內所有目標氣血（恢復量為施術者（物攻+法攻）的1.5倍），驅散2個「有害狀態」施加「焚炎」和「涅槃」狀態，持續2回合。\n若自身為「祝由」職業，絕學後驅散自身2個「有害狀態」，並獲得「神護II」狀態，持續2回合。\n「涅槃」：「對戰前」恢復自身氣血（恢復量為施術者（物攻+法攻）的0.5倍）（有益狀態，不可驅散）\n「焚炎」：受到來自敵方的主動攻擊傷害後消失，恢復自身氣血（恢復量為施術者（物攻+法攻）的0.5倍）並對菱形2格敵人造成1次「固定傷害」（施術者（物攻+法攻）的0.4倍）。'
			}
		]
	}
};

support_skills['huangfushen'] = {
	'owner': '皇甫申',
	'owner_pinyin': 'huangfushen',
	'support_skill': {
		'name': '號令群雄·援',
		'img': 'https://cdn.imgchest.com/files/0a861dc3e9cf.png',
		'type': '支援',
		'cd': '0',
		'shoot': '自身',
		'range': '菱形3格',
		'descs': [
			{
				'star': '4',
				'desc': '[共勢]全場友方「俠客」職業，主動攻擊傷害、暴擊率提升5%。\n[主動]主動使用，為範圍內所有友方施加「神睿I」「信步」狀態，持續3回合。\n若自身為「俠客」職業，絕學後自身獲得「蓄電」狀態。'
			},
			{
				'star': '5',
				'desc': '[共勢]全場友方「俠客」職業，主動攻擊傷害、暴擊率提升7%。\n[主動]主動使用，為範圍內所有友方施加「神睿I」「信步」狀態，持續3回合。\n若自身為「俠客」職業，絕學後自身獲得「蓄電」「凝鋒I」狀態，持續3回合。'
			}
		]
	}
};

support_skills['yinwuxie'] = {
	'owner': '殷無邪',
	'owner_pinyin': 'yinwuxie',
	'support_skill': {
		'name': '無方劍制·援',
		'img': 'https://cdn.imgchest.com/files/321a50db4eb6.png',
		'type': '物攻傷害',
		'cd': '2回合',
		'shoot': '3',
		'range': '菱形2格',
		'descs': [
			{
				'star': '4',
				'desc': '[共勢]全場友方「俠客」職業，若氣血大於等於70%，遭受攻擊「對戰中」發動「先攻」且「先攻」射程提高1格，「先攻」傷害提高10%。\n[主動]對範圍內所有敵人造成0.5倍傷害，施加「封勁」狀態，持續2回合。\n若自身為「俠客」職業，絕學後在自身周圍2格張開領域「劍絕霜獄」，持續1回合。\n「劍絕霜獄」：自身周圍2格內所有敵人移動力-3，主動絕學冷卻時間無法減少。'
			},
			{
				'star': '5',
				'desc': '[共勢]全場友方「俠客」職業，若氣血大於等於70%，遭受攻擊「對戰中」發動「先攻」且「先攻」射程提高1格，「先攻」傷害提高15%。\n[主動]對範圍內所有敵人造成0.5倍傷害，施加「無摧·封勁」狀態，持續2回合。\n若自身為「俠客」職業，絕學後在自身周圍2格張開領域「劍絕霜獄」，持續1回合。\n「劍絕霜獄」：自身周圍2格內所有敵人移動力-3，主動絕學冷卻時間無法減少。'
			}
		]
	}
};

support_skills['yunxiang'] = {
	'owner': '雲襄',
	'owner_pinyin': 'yunxiang',
	'support_skill': {
		'name': '煌焰迴旋·援',
		'img': 'https://cdn.imgchest.com/files/728201e758ab.png',
		'type': '法攻傷害',
		'cd': '3',
		'shoot': '3',
		'range': '菱形2格',
		'descs': [
			{
				'star': '4',
				'desc': '[共勢]全場友方「咒師」職業，法攻提高3%。行動結束時，對自身十字7格隨機1個敵人施加1層「燃燒」狀態，持續2回合。\n[主動]攻擊單個敵人，造成0.1倍傷害。並在目標身周2格範圍內的單位間彈射造成傷害，每彈射1次，傷害降低10%（最多降低40%傷害），且有10%機率施加「暈眩」狀態，持續1回合。（對「燃燒」目標額外提高15%機率，當目標2格範圍內不存在除施術者外的其他單位，可彈射至施術者，且施術者不受絕學影響；最多彈射4次，且優先彈射未造成過傷害的目標。）\n若自身為「咒師」職業，絕學後，自身獲得「爍金」狀態。\n「爍金」：移動力+1，「對戰中」傷害減免持聽筒高15%（「對戰後」移除）。'
			},
			{
				'star': '5',
				'desc': '[共勢]全場友方「咒師」職業，法攻提高5%。行動結束時，對自身十字7格隨機2個敵人施加1層「燃燒」狀態，持續2回合。\n[主動]攻擊單個敵人，造成0.1倍傷害。並在目標身周2格範圍內的單位間彈射造成傷害，每彈射1次，傷害降低10%（最多降低40%傷害），且有10%機率施加「暈眩」狀態，持續1回合。（對「燃燒」目標額外提高15%機率，當目標2格範圍內不存在除施術者外的其他單位，可彈射至施術者，且施術者不受絕學影響；最多彈射4次，且優先彈射未造成過傷害的目標。）\n若自身為「咒師」職業，絕學後，自身獲得「爍金」狀態和「神睿I」「辟攻」狀態，持續3回合。\n「爍金」：移動力+1，「對戰中」傷害減免持聽筒高15%（「對戰後」移除）。'
			}
		]
	}
};

support_skills['xuanyu'] = {
	'owner': '玄羽',
	'owner_pinyin': 'xuanyu',
	'support_skill': {
		'name': '幽鏑戒殺·援',
		'img': 'https://cdn.imgchest.com/files/759f4e202414.png',
		'type': '主動',
		'cd': '1',
		'shoot': '自身',
		'range': '直線(2-5)*3格',
		'descs': [
			{
				'star': '4',
				'desc': '[共勢]全場友方「羽士」職業，主動攻擊「對戰中」與目標距離每增加1格，暴擊率、暴擊傷害提高2%（最多提高8%）。若本次行動未發起攻擊，行動結束時獲得「括羽」狀態。\n[主動]主動使用，擊退範圍內所有敵人1格，施加「封穴」狀態，持續2回合。\n若自身為「羽士」職業，額外施加2個「屬性降低類有害狀態」。'
			},
			{
				'star': '5',
				'desc': '[共勢]全場友方「羽士」職業，主動攻擊「對戰中」與目標距離每增加1格，暴擊率、暴擊傷害提高3%（最多提高12%）。若本次行動未發起攻擊，行動結束時獲得「括羽」狀態。\n[主動]主動使用，擊退範圍內所有敵人2格，施加「封穴」「封匿」狀態，持續2回合。\n若自身為「羽士」職業，額外施加2個「屬性降低類有害狀態」，絕學後自身所有主動絕學的冷卻時間減少1回合。\n「封匿」：「無法被選中」效果（「煙霧」地形除外）失效\n「括羽」：單體絕學射程+1（使用單體絕學後消耗）'
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



outputJSON({
	json: support_skills,
	fn: `./_mid/roles_with_support_skills.json`,
	// space: 0,
	// cn2tw: true,
});
