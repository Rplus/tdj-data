import fs from 'fs';
// import pLimit from 'p-limit';
import {
	raw_data,
	outputJSON,
} from './u.mjs';

import {
	fetch_with_cached,
} from './u-fetch-bili.mjs';

// import { converter_cn2tw, converter_tw2cn } from './opencc.mjs';


// const FORCE_FETCH = true;
const FORCE_FETCH = process.argv.includes('--force-fetch');
// const fetch_limit = pLimit(5);

const roles_tw = await fetch_with_cached({
	url: raw_data.roles.url('tw'),
	cached_path: 'roles.tw.res.json',
	// ignore_cached: FORCE_FETCH,
	ignore_cached: true,
});
const roles_cn = await fetch_with_cached({
	url: raw_data.roles.url('cn'),
	cached_path: 'roles.cn.res.json',
	// ignore_cached: FORCE_FETCH,
	ignore_cached: true,
});

const tw_map = new Map(
	roles_tw.data.data.map(r => [r.hero_icon, r])
);

const merged_roles = roles_cn.data.data.map(role_cn => {
	role_cn.path = encodeURIComponent(role_cn.name);
	const role_tw = tw_map.get(role_cn.hero_icon);

	let op = role_tw
		? {
				...role_tw,
				pinyin_tw: role_tw.pinyin,
				pinyin: role_cn.pinyin,
				path: role_cn.path,
			}
		: role_cn;

	// // tw 宇文拓資料錯誤
	// if (role_cn.pinyin === 'yuwentuo') {
	// 	op.pinyin_tw = null;
	// }

	return op;
});

outputJSON({
	json: roles_tw,
	fn: `./_mid/roles.tw.raw.json`,
	cn2tw: false,
});
outputJSON({
	json: roles_cn,
	fn: `./_mid/roles.cn.raw.json`,
	cn2tw: false,
});
outputJSON({
	json: merged_roles,
	fn: `./_mid/roles.op.json`,
	cn2tw: false,
});


// fetch all roles' detail json
let fetched_details = [];
for (const role of merged_roles) {
	const _lang = role.pinyin_tw ? 'tw' : 'cn';
	const _pinyin = _lang === 'tw' ? role.pinyin_tw : role.pinyin;

	const detail = await fetch_with_cached({
		url: raw_data.role_deatil.url(_pinyin, _lang),
		cached_path: `tdj-roles/${role.name}.${_lang}.json`,
		is_json: true,
		ignore_cached: FORCE_FETCH,
		// skip_sleep: true,
	});

	if (role.pinyin_tw) {
		detail.data.data[0].pinyin = role.pinyin;
		detail.data.data[0].pinyin_tw = role.pinyin_tw;
	}

	fetched_details.push(detail);
}

outputJSON({
	json: fetched_details,
	fn: './_mid/roles_details.raw.json',
	// space: 0,
	cn2tw: true,
});
