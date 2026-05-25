// import fs from 'fs';
import {
	outputJSON,
	pick_obj,
	fetch_with_cached,
	read_json_file,
} from './u.mjs';
import {
	trans_key_map,
	fetch_bili_page_rest,
	muli_fetch_bili_page_rest,
} from './u-fetch-bili.mjs';
import { converter_cn2tw, converter_tw2cn, } from './opencc.mjs';

import { extra_fetching_resource, custom_skills, } from './extra-skill-resource.js';

const FORCE_FETCH = process.argv.includes('--force-fetch');

let extra_skills = {};

for (let role in extra_fetching_resource) {
	const role_data = extra_fetching_resource[role];
	extra_skills[role] = {
		pinyin: role,
		name: role_data.name,
		extra_skills: [],
	};
	for (let _skill of role_data.skills) {
		const data = await fetch_bili_page_rest({
			name: converter_tw2cn('绝学/' + _skill.name),
			ignore_cached: FORCE_FETCH,
		});
		extra_skills[role].extra_skills.push({
			...trans_key_map(data),
			imgsrc: _skill.imgsrc,
		});
		// _skill.data.imgsrc = _skill.imgsrc;
	}
}

outputJSON({
	json: extra_skills,
	fn: `./_mid/extra_skills.json`,
	// space: 0,
	// cn2tw: true,
});

//
//
//
//


const skill_template = {
	'name': '',
	'cd': '-',
	'cost': '-',
	'shoot': '自身',
	'range': '單體',
	'type': '',
	'desc': '',
};

for (let role in custom_skills) {
	custom_skills[role].custom_skills = custom_skills[role].custom_skills.map(i => {
		return {
			...skill_template,
			...{
				'shoot': i[3],
				'name': i[0],
				'type': i[2],
				'desc': i[1],
			},
		};
	})
}


outputJSON({
	json: custom_skills,
	fn: `./_mid/custom_skills.json`,
	// space: 0,
	// cn2tw: true,
});
