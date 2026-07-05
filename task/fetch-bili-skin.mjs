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
	fetch_with_cached,
	trans_array_key_map,
	fetch_bili_page_rest,
	muli_fetch_bili_page_rest,
} from './u-fetch-bili.mjs';

// const FORCE_FETCH = true;
const FORCE_FETCH = process.argv.includes('--force-fetch');

let roles = read_json_file('./_mid/roles.cn.raw.json') || {};

let pinyin_map = roles.data.data.reduce((all, i) => {
	all[i.name] = i.pinyin;
	return all;
}, {});

let raw_skins = await fetch_with_cached({
	url: 'https://wiki.biligame.com/tdj/api.php?action=ask&query=[[分类:时装]]|?名称=name|?所属=owner|limit=9999&format=json',
	cached_path: `bili/时装/all_skin_info.askquery.res.json`,
	// is_json: true,
	ignore_cached: FORCE_FETCH,
});

let all_skins = Object.values(raw_skins.query.results).map(i => {
	let d = i.printouts;
	return {
		name: d.name[0],
		owner: d.owner[0],
	}
});

all_skins = all_skins.concat(roles.data.data.map(i => ({ name: i.name, owner: i.name, })))

let role_with_skin_imgs = roles.data.data.reduce((all, i) => {
	all[i.pinyin] = {
		name: i.name,
		pinyin: i.pinyin,
		skins: {},
	};
	return all;
}, {});

outputJSON({
	json: all_skins,
	fn: `./_mid/_all_skins.json`,
});

/////
/////
/////

const group_size = 50;
const all_skin_fn_per50 = Array.from(
	{ length: Math.ceil(all_skins.length / group_size) },
	(_, i) => all_skins
		.slice(i * group_size, (i + 1) * group_size)
		.map(skin => `File:立绘_${skin.name}.png`)
		.join('|')
);


// let all_skill_info = await fetch_with_cached({
// 	url: `https://wiki.biligame.com/tdj/api.php?action=query&titles=${all_skin_titles}&prop=imageinfo&iiprop=url&format=json`,
// 	cached_path: `bili/时装/all_skin_url_info.query.res.json`,
// 	// is_json: true,
// 	ignore_cached: FORCE_FETCH,
// })

let raw_skin_info = [];
for (let idx = 0; idx < all_skin_fn_per50.length; idx++) {
	const title_strings = all_skin_fn_per50[idx];
	try {
		const data = await fetch_with_cached({
			url: `https://wiki.biligame.com/tdj/api.php?action=query&titles=${title_strings}&prop=imageinfo&iiprop=url&format=json`,
			cached_path: `bili/时装/skin_info_${idx}.query.json`,
			ignore_cached: FORCE_FETCH,
			// ignore_cached: true,
		});

		raw_skin_info.push(Object.values(data.query.pages));
	} catch (error) {
		console.error(`請求失敗: ${title_strings}`, error);
	}
}

let skin_img_map = raw_skin_info.flat().reduce((all, i) => {
	let title = i.title.replace('文件:立绘 ', '').replace('.png', '');
	let url = i.imageinfo[0].url;
	all[title] = url;
	return all;
}, {});

outputJSON({
	json: skin_img_map,
	fn: `./_mid/_all_skin_imgs.json`,
	// space: 0,
	// cn2tw: true,
});

//
//
//


all_skins.forEach(i => {
	let pinyin = pinyin_map[i.owner];
	role_with_skin_imgs[pinyin].skins[i.name] = skin_img_map[i.name];
});


outputJSON({
	json: role_with_skin_imgs,
	fn: `./_pre/role_with_skin_imgs.json`,
	// space: 0,
	// cn2tw: true,
});
