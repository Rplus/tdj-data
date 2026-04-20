import fs from 'fs';
import path from 'path';
import pLimit from 'p-limit';
import logUpdate from 'log-update';
import wtf from 'wtf_wikipedia';

import { etag_cache } from './u-etag.js';

export const key_map = {
	'绝学': {
		'绝学名称': 'name',
		'绝学类别': 'type',
		'绝学冷却': 'cd',
		'绝学消耗': 'cost',
		'绝学射程': 'shoot',
		'绝学范围': 'range',
		'绝学描述': 'desc',
	},
	'援袭绝学': {
		'名称': 'name',
		'所属': 'owner',
		'星数': '',
		'类别': 'type',
		'冷却': 'cd',
		'射程': 'shoot',
		'范围': 'range',
		'描述': 'desc',
	},
};

export function trans_key_map(data = [], template = '') {
	return data.map(item => {
		const mapping = key_map[template || data.template]; // 根據 template 找到轉換規則
		const newItem = {};

		// 遍歷原始資料的每個 Key
		Object.keys(item).forEach(key => {
			if (mapping && mapping[key]) {
				// 如果 key_map 有定義，使用新名稱
				newItem[mapping[key]] = item[key];
			} else {
				// 如果沒定義（如 template 本身），保留原始名稱或視需求捨棄
				newItem[key] = item[key];
			}
		});

		return newItem;
	});
}

/*
 * output: object (key-value pair)
 */
export async function fetch_bili_page_rest({
	name = '',
	// cached_path = './_cache/123.json',
	ignore_cached = false,
}) {
	const res = await fetch_with_cached({
		url: `https://wiki.biligame.com/tdj/rest.php/v1/page/${encodeURIComponent(name)}`,
		cached_path: `bili/${name}.rest.json`,
		is_json: true,
		ignore_cached,
	});

	return parse_wikitext(res.source);
}
function parse_wikitext(str = '') {
	const doc = wtf(str.replaceAll('<br>', '\n'));
	const templates = doc.templates();
	return doc.templates()[0].json();
}



export async function muli_fetch_bili_page_rest({
	names = [],
	ignore_cached = false,
}) {
	const results = [];
	for (const _name of names) {
		// console.log(_names);
		try {
			const data = await fetch_bili_page_rest({
				name: _name,
				ignore_cached,
			});

			results.push(data);
		} catch (error) {
			console.error(`請求失敗: ${_name}`, error);
		}
	}
	return results;
}



//
//
//
//
//
//
//
//
//
//
//


const log_state = {
	row1: '',
	row2: '',
	row3: '',
};
/**
 * 通用型 fetch_with_cached
 * @param {Object} options
 * @param {string} options.url - 要抓取的 URL
 * @param {string} [options.cached_path='./123.json'] - 快取檔案存放路徑
 * @param {boolean} [options.is_json=true] - 是否以 JSON 處理
 * @param {boolean} [options.ignore_cached=false] - 是否忽略快取強制重新抓取
 * @param {boolean} [options.sleep_time=0] - 延遲多久再發出請求，以避免被ban
 */
const CACHE_FOLDER = './_cache/';
export async function fetch_with_cached({
	url = '',
	cached_path = '123.json',
	is_json = true,
	ignore_cached = false,
	skip_sleep = false,
	sleep_time = null,
}) {
	if (!url) throw new Error('URL is required');
	cached_path = CACHE_FOLDER + cached_path;

	const cached_dir_path = path.dirname(cached_path);

	try {
		// 1. 檢查快取檔案是否存在
		if (!ignore_cached && fs.existsSync(cached_path)) {
			return get_cache_file(cached_path, is_json);
		}

		if (!skip_sleep) {
			sleep_time = sleep_time ?? random_time(1000, 3000);
			// console.log(`🛑 準備連網，冷卻 ${sleep_time}ms...`);
			log_state.row1 = sleep_time;
			render_log(0);
			await sleep(sleep_time);
		}

		// console.log(111, url, 222, decodeURIComponent(url));
		log_state.row2 = `${url}, ${decodeURIComponent(url)}`;
		render_log(1);

		const old_etag = etag_cache.get(url);

		// 2. 若無快取或忽略快取 → fetch
		const res = await fetch(url, {
			headers: {
				...random_header(),
				// ...(old_etag ? { 'If-None-Match': old_etag } : {}),
			},
		});

		if (res.status === 304) {
			log_state.row3 = '沒有更新，使用快取即可';
			render_log(2);
			if (fs.existsSync(cached_path)) {
				return get_cache_file(cached_path, is_json);
			} else {
				// console.error('!! no cache file !!');
				etag_cache.delete(url);
			}
		} else if (!res.ok) {
			throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
		} else {
			const new_etag = res.headers.get('etag');
			log_state.row3 = `有更新，重新處理 ${new_etag}`;
			render_log(2);
			if (new_etag) {
				etag_cache.set(url, new_etag);
			}

			const text = await res.text();
			const parsed = is_json ? JSON.parse(text) : text;

			// 確保快取目錄存在
			fs.mkdirSync(cached_dir_path, { recursive: true });
			fs.writeFileSync(cached_path, text, 'utf8');

			return parsed;
		}

	} catch (err) {
		// 3. 錯誤處理 → log
		// const log_path = path.join(cached_path, 'fetch_errors.log');
		const log_msg = `[${new Date().toISOString()}] URL: ${url}, Cache: ${cached_path}, Error: ${err.message}\n`;
		fs.appendFileSync('./task/fetch_errors.log', log_msg, 'utf8');
		throw err;
	}
}


//
//
//
//
//



function get_cache_file(path, is_json) {
	const data = fs.readFileSync(path, 'utf8');
	return is_json ? JSON.parse(data) : data;
}

function render_log(index = 0) {
	let emoji = [
		['>💤', ' 🧲', ' 🆕'],
		[' 💤', '>🧲', ' 🆕'],
		[' 💤', ' 🧲', '> 🆕'],
	][index];
	logUpdate(`${emoji[0]} 冷卻 ${log_state.row1}ms...\n${emoji[1]} ${log_state.row2}\n${emoji[2]} ${log_state.row3}`);
}

function random_header() {
	const USER_AGENTS = [
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
			'(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 ' +
			'(KHTML, like Gecko) Version/17.0 Safari/605.1.15',
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
			'(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
	];
	const ACCEPT_LANGS = [
		'zh-TW,zh;q=0.9,en;q=0.8',
		'zh-CN,zh;q=0.9,en;q=0.8',
		'zh-CN,zh;q=0.9,ja;q=0.8',
		'en-US,en;q=0.9,zh;q=0.8',
		'ja,en;q=0.9,zh;q=0.8'
	];
	const REFERERS = [
		'https://wiki.biligame.com/',
		'http://tdj.zlongame.com/',
		'https://wiki.biligame.com/tdj/',
		'https://wiki.biligame.com/tdj/%E7%BB%9D%E5%AD%A6%E5%88%97%E8%A1%A8',
		'https://wiki.biligame.com/tdj/%E5%8F%8A%E8%BA%AB%E5%9B%BE%E9%89%B4',
		'https://wiki.biligame.com/tdj/%E8%8B%B1%E7%81%B5%E5%9B%BE%E9%89%B4',
		'https://wiki.biligame.com/tdj/%E5%8F%AC%E5%94%A4%E7%89%A9/%E5%95%B8%E9%9C%9C',
	];

	const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
	return {
		'User-Agent': pick(USER_AGENTS),
		'Accept-Language': pick(ACCEPT_LANGS),
		'Referer': pick(REFERERS),
		'Connection': 'keep-alive',
	};
}

function random_time(min = 0, max = 1000) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const sleep = (time = 0) => {
	return new Promise(resolve => setTimeout(resolve, time));
};