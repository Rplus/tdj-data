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
