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
