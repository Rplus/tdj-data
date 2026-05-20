import {
	outputJSON,
	fetch_with_cached,
	remove_html_tag,
	read_json_file,
	pick_obj,
	// fetch_bili_name_from_xml_to_json,
} from './u.mjs';
import { converter_cn2tw, converter_tw2cn } from './opencc.mjs';

import {
	// trans_key_map,
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


let support_skills = results.reduce((all, i) => {
	const owner = i.owner;
	const role = roles.find(r => r.name === converter_cn2tw(owner));
	const pinyin = role?.pinyin || owner;
	if (!all[pinyin]) {
		all[pinyin] = {
			owner,
			owner_pinyin: role?.pinyin,
			support_skill: {
				name: i.name,
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


outputJSON({
	json: support_skills,
	fn: `./_mid/roles_with_support_skills.json`,
	// space: 0,
	// cn2tw: true,
});
