import fs from 'fs';
// import pLimit from 'p-limit';
import {
	// raw_data,
	outputJSON,
	fetch_with_cached,
	// pick_obj,
	// remove_html_tag,
	// converter,
	// converter_tw2cn,
	// uniq_array,
	random_time,
	get_bili_data_url,
	bilidata_to_obj,
	fetch_bili_name_from_xml_to_json,
	// wikitext_to_obj,
	// parse_wikitext_res,
	// read_json_file,
} from './u.mjs';
// import { addition_skills } from './addtion_skills.mjs';

// const FORCE_FETCH = true;
const FORCE_FETCH = process.argv.includes('--force-fetch');

let support_skills = [];

try {
	const raw = fs.readFileSync('./_mid/bili-support-skills.json', 'utf8');
	support_skills = JSON.parse(raw);
} catch (err) {
	console.error('讀取 bili-support-skills.json 失敗:', err.message);
	// 這裡可以選擇給預設值
}




