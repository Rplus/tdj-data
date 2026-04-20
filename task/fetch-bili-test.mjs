import fs from 'fs';
import {
	outputJSON,
	// fetch_with_cached,
	// pick_obj,
	// remove_html_tag,
	// get_bili_data_url,
	// bilidata_to_obj,
	// fetch_bili_name_from_xml_to_json,
	// wikitext_to_obj,
	// parse_wikitext_res,
	// read_json_file,
} from './u.mjs';
import { fetch_bili_page_rest, fetch_with_cached, } from './u-fetch-bili.mjs';

// const FORCE_FETCH = true;
const FORCE_FETCH = process.argv.includes('--force-fetch');


// const url = `https://wiki.biligame.com/tdj/rest.php/v1/page/绝学%2F六转寒凛·贰式`;
const url = `https://wiki.biligame.com/tdj/api.php?action=ask&query=[[Category:援袭绝学]]|?所属|?星数|?名称|?类别|?冷却|?射程|?范围|?描述&format=json`;

fetch_with_cached({
	url,
	cached_path: './123-Category-援袭绝学.json',
	ignore_cached: true,
})




// let res = await fetch_bili_page_rest({
// 	name: '朱浩',
// 	ignore_cached: FORCE_FETCH,
// });
// outputJSON({
// 	json: res,
// 	fn: `./_mid/_test_rest.json`,
// 	// space: 0,
// 	// cn2tw: true,
// });



await fetch_with_cached({
	url: 'https://wiki.biligame.com/tdj/api.php?action=ask&query=[[Category:援袭绝学]]|?所属=owner|?星数=star|?名称=name|?类别=type|?冷却=cd|?射程=shoot|?范围=range|?描述=desc|limit=500&format=json&utf8=1',

	// url: 'https://wiki.biligame.com/tdj/api.php?action=query&prop=revisions&titles=天赋/五采仁兽|天赋/通世瑞灵&rvprop=content&format=json&utf8=1',
	// url: 'https://wiki.biligame.com/tdj/api.php?action=opensearch&search=援袭绝学&limit=50',
	cached_path: `./__test.ask.res.json`,
	// is_json: true,
	ignore_cached: FORCE_FETCH,
});



// {
// 	// SUPPORT SKILLS, 援襲絕學
// 	let data = await fetch_with_cached({
// 		url: 'https://wiki.biligame.com/tdj/api.php?action=ask&query=[[分类:援袭绝学]]&format=json',
// 		// url: 'https://wiki.biligame.com/tdj/api.php?action=opensearch&search=援袭绝学&limit=50',
// 		cached_path: `bili/分類:援襲絕學.res.json`,
// 		is_json: true,
// 		ignore_cached: FORCE_FETCH,
// 	});

// 	await fetch_with_cached({
// 		url: 'https://wiki.biligame.com/tdj/api.php?action=query&list=categorymembers&cmtitle=Category:援袭绝学&cmlimit=max&format=json',
// 		// url: 'https://wiki.biligame.com/tdj/api.php?action=opensearch&search=援袭绝学&limit=50',
// 		cached_path: `_cate.援袭绝学.res.json`,
// 		is_json: true,
// 		ignore_cached: FORCE_FETCH,
// 	});

// 	await fetch_with_cached({
// 		url: 'https://wiki.biligame.com/tdj/api.php?action=query&list=categorymembers&cmtitle=Category:召唤物&cmlimit=max&format=json',
// 		// url: 'https://wiki.biligame.com/tdj/api.php?action=opensearch&search=援袭绝学&limit=50',
// 		cached_path: `_cate.召唤物.res.json`,
// 		is_json: true,
// 		ignore_cached: FORCE_FETCH,
// 	});

// 	data.query.results


// }



// await fetch_with_cached({
// 	url: 'https://wiki.biligame.com/tdj/api.php?action=query&list=categorymembers&cmtitle=Category:援袭绝学&cmlimit=max&format=json',
// 	// url: 'https://wiki.biligame.com/tdj/api.php?action=opensearch&search=援袭绝学&limit=50',
// 	cached_path: `bili/分類_援襲絕學.query.res.json`,
// 	is_json: true,
// 	ignore_cached: FORCE_FETCH,
// });




// // let page = '绝学/矩子之域·贰式';
// // let page = '绝学/机巧制造·贰式';
// let page = '援袭绝学/光轮斩·援/4';

// let res2 = await fetch_bili_name_from_xml_to_json({
// 	name: page,
// 	ignore_cached: FORCE_FETCH,
// });

// outputJSON({
// 	json: res2,
// 	fn: `./_mid/_x_bili.${page.replaceAll('/', '-')}.test.json`,
// 	// space: 0,
// 	// cn2tw: true,
// });
