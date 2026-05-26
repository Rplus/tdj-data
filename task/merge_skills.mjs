// import fs from 'fs';
import {
	outputJSON,
	// fetch_with_cached,
	read_json_file,
	// get_bili_data_url,
	// bilidata_to_obj,
	// fetch_bili_name_from_xml_to_json,
} from './u.mjs';
import { converter_cn2tw, converter_tw2cn } from './opencc.mjs';
// import { addition_skills } from './addtion_skills.mjs';
import {
	// trans_key_map,
	fetch_bili_page_rest,
	muli_fetch_bili_page_rest,
} from './u-fetch-bili.mjs';

// const FORCE_FETCH = true;
const FORCE_FETCH = process.argv.includes('--force-fetch');

let roles = read_json_file('./_pre/roles.src.json') || [];

let role_details = read_json_file('./_mid/roles_details.raw.json');
let all_adv_skills = read_json_file('./_mid/adv_skills.json') || [];
let role_with_adv_skills = read_json_file('./_mid/roles_with_adv_skills_list.json') || {};
let role_with_extra_skills = read_json_file('./_mid/extra_skills.json') || {};
let role_with_custom_skills = read_json_file('./_mid/custom_skills.json') || {};
let role_with_support_skills = read_json_file('./_mid/roles_with_support_skills.json') || {};


let all_basic_skills_with_img = role_details
	.flatMap(dd => dd.data?.data?.[0]?.skill)
	.map(s => {
		return {
			name: converter_tw2cn(s.name),
			img: s.img,
		}
	});


outputJSON({
	json: all_basic_skills_with_img,
	fn: `./_mid/_all_basic_skills_with_img.json`,
	// space: 0,
	// cn2tw: true,
});

// merge adv skills
for (let role in role_with_adv_skills) {
	role_with_adv_skills[role].adv_skills = role_with_adv_skills[role].adv_skills.map(skill_set => {
		return skill_set.map(skill_name => {
			const _skill = all_adv_skills.find(s => s.name === skill_name);
			if (_skill) {
				return _skill;
			}

			let _basic_skill = all_basic_skills_with_img.find(i => i.name === skill_name)

			return {
				name: skill_name,
				// path: encodeURIComponent(skill_name),
				img: _basic_skill?.img,
			}
		})
	});
}

// outputJSON({
// 	json: adv_skills,
// 	fn: `./_mid/__adv_skills.json`,
// 	// space: 0,
// 	// cn2tw: true,
// });


let role_addition_skills = {};

roles.forEach(role => {
	const pinyin = role.pinyin;
	// const pinyin_tw = role.pinyin_tw;
	let adv_skills = role_with_adv_skills[pinyin]?.adv_skills;
	let extra_skills = [
		...(role_with_extra_skills[pinyin]?.extra_skills || []),
		...(role_with_custom_skills[pinyin]?.custom_skills || []),
	];
	let support_skill = role_with_support_skills[pinyin]?.support_skill;

	let obj = {
		...(adv_skills?.length && { adv_skills, }),
		...(extra_skills?.length && { extra_skills, }),
		...(support_skill && { support_skill, }),
	};
	if (Object.keys(obj).length !== 0) {
		role_addition_skills[pinyin] = obj;
	}
	// role_addition_skills[pinyin].name = role.name
})


outputJSON({
	json: role_addition_skills,
	fn: `./_pre/role_other_skills.src.json`,
	// space: 0,
	cn2tw: true,
});
outputJSON({
	json: role_addition_skills,
	fn: '../src/lib/data/role_other_skills.min.json',
	space: 0,
	cn2tw: true,
});
