// import fs from 'fs';
import {
	outputJSON,
	read_json_file,
	// get_bili_data_url,
	// bilidata_to_obj,
	// fetch_bili_name_from_xml_to_json,
} from './u.mjs';
// import { addition_skills } from './addtion_skills.mjs';
import {
	// fetch_with_cached,
	trans_array_key_map,
	fetch_bili_page_rest,
	muli_fetch_bili_page_rest,
} from './u-fetch-bili.mjs';

// const FORCE_FETCH = true;
const FORCE_FETCH = process.argv.includes('--force-fetch');

let roles = read_json_file('./_pre/roles.src.json') || [];

// let roles_with_adv_skills_list_raw = await muli_fetch_bili_page_rest({
// 	names: roles.map(role => decodeURIComponent(role.path)),
// 	ignore_cached: FORCE_FETCH,
// });

// let roles_with_adv_skills_list = roles_with_adv_skills_list_raw.map((data, index) => {
// 	const role = roles[index];
// 	return {
// 		name: role.name,
// 		pinyin: role.pinyin,
// 		new: !role.pinyin_tw,
// 		adv_skills: [
// 			(data['绝学化神1'] || '').split(','),
// 			(data['绝学化神2'] || '').split(','),
// 			(data['绝学化神3'] || '').split(','),
// 		].flat().filter(Boolean),
// 	};
// })
// .filter(i => i.adv_skills.length)

let roles_with_adv_skills_list = {};
for (const role of roles) {
	try {
		const data = await fetch_bili_page_rest({
			name: decodeURIComponent(role.path),
			ignore_cached: FORCE_FETCH,
		});

		if (!data) {
			console.log(111, 'error data:', role);
			continue;
		}

		const adv_skills = [
				(data['绝学化神1'] || '').split(',').filter(Boolean),
				(data['绝学化神2'] || '').split(',').filter(Boolean),
				(data['绝学化神3'] || '').split(',').filter(Boolean),
			].filter(i => i.length);

		if (adv_skills.length) {
			roles_with_adv_skills_list[role.pinyin] = {
				name: role.name,
				pinyin: role.pinyin,
				new: !role.pinyin_tw,
				adv_skills,
			};
		}

		// roles_with_adv_skills_list.push({
		// 	name: role.name,
		// 	pinyin: role.pinyin,
		// 	new: !role.pinyin_tw,
		// 	adv_skills: [
		// 		(data['绝学化神1'] || '').split(','),
		// 		(data['绝学化神2'] || '').split(','),
		// 		(data['绝学化神3'] || '').split(','),
		// 	].flat().filter(Boolean),
		// });
	} catch (error) {
		console.error(`請求失敗: ${role.name}`, error);
	}
}

const adv_skills_name = Object.values(roles_with_adv_skills_list)
	.flatMap(i => (i.adv_skills.flat() || []))
	.filter(i => i.includes('·'));

const adv_skills = await muli_fetch_bili_page_rest({
	names: adv_skills_name.map(i => '绝学/' + i),
	ignore_cached: FORCE_FETCH,
});

{ // workaround

	// 太玄靈狐 反制禁咒 => 反咒禁制
	roles_with_adv_skills_list.taixuanlinghu.adv_skills[1].forEach((s, index) => {
		roles_with_adv_skills_list.taixuanlinghu.adv_skills[1][index] = s.replace('反制禁咒', '反咒禁制');
	});
	adv_skills.forEach(i => {
		if (i?.['绝学名称'] && i['绝学名称'].indexOf('反制禁咒') !== -1) {
			i['绝学名称'] = i['绝学名称'].replace('反制禁咒', '反咒禁制');
		}
	})
}


outputJSON({
	json: roles_with_adv_skills_list,
	fn: `./_mid/roles_with_adv_skills_list.json`,
	// space: 0,
	// cn2tw: true,
});

outputJSON({
	json: trans_array_key_map(adv_skills, '绝学'),
	fn: `./_mid/adv_skills.json`,
	// space: 0,
	// cn2tw: true,
});
