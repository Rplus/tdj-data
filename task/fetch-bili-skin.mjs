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
	// ignore_cached: FORCE_FETCH,
	ignore_cached: true,
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

// const group_size = 50;
// const all_skin_fn_per50 = Array.from(
// 	{ length: Math.ceil(all_skins.length / group_size) },
// 	(_, i) => all_skins
// 		.slice(i * group_size, (i + 1) * group_size)
// 		.map(skin => `File:立绘_${skin.name}.png`)
// 		.join('|')
// );

let raw_skin_info = [];

for (let skin of all_skins) {
	let title = `File:立绘_${skin.name}.png`;

	try {
		const data = await fetch_with_cached({
			url: `https://wiki.biligame.com/tdj/api.php?action=query&titles=${title}&prop=imageinfo&iiprop=url&iiurlheight=550&format=json`,
			// wiki source x550px: thumb with 550px height
			cached_path: `bili/时装/${skin.name}.query.json`,
			ignore_cached: FORCE_FETCH,
			// ignore_cached: true,
		});
		let pinyin = pinyin_map[skin.owner];

		let img_info = Object.values(data.query.pages)[0].imageinfo[0];

		let thumburl = img_info.thumburl
			.replace('https://patchwiki.biligame.com/images/tdj/thumb', '')
			.replace(/\d+px\-%E7%AB%8B%E7%BB%98_/, '♥');

		let thumburl_sizes = [
			img_info.thumbwidth,
			// extract_px_size(img_info.responsiveUrls?.['1.5']) || '',
			extract_px_size(img_info.responsiveUrls?.['2']) || '',
		];

		if (!thumburl_sizes[1]) {
			// console.log(11, skin.name);
		}

		role_with_skin_imgs[pinyin].skins[skin.name] = thumburl + '♥' + thumburl_sizes.join('♥');

	} catch (error) {
		console.error(`請求失敗: ${title}`, error);
	}
}

{ // workaround
	role_with_skin_imgs['shangguanyue'].skins['錦鳶逗晴'] = 'https://tw-media.game-beans.com/media/pictures/tdj/260715/02.png';
}

outputJSON({
	json: role_with_skin_imgs,
	fn: `./_pre/role_with_skin_imgs.json`,
	// space: 0,
	// cn2tw: true,
});

function extract_px_size(url) {
  const regex = /\.png\/(\d+)px-/;
  const match = url.match(regex);
  return match ? parseInt(match[1], 10) : null;
}