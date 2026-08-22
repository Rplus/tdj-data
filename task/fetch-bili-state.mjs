import fs from 'fs';
import {
	outputJSON,
	compress_objects,
	remove_html_tag,
} from './u.mjs';

import {
	fetch_with_cached,
} from './u-fetch-bili.mjs';
// import { parse } from 'node-html-parser';


// const FORCE_FETCH = true;
const FORCE_FETCH = process.argv.includes('--force-fetch');

/*
// HTML
const res = await fetch_with_cached({
	url: 'https://wiki.biligame.com/tdj/api.php?action=parse&pageid=4467&prop=text&format=json',
	cached_path: `bili/state.res.json`,
	is_json: true,
	ignore_cached: FORCE_FETCH,
});

const doc = parse(res?.parse?.text?.['*'] ?? '');
const tbody = doc.querySelector('table.datatable tbody');
const rows = tbody.querySelectorAll('tr');

const status = rows.map((row, row_index) => {
	return row_index && row.querySelectorAll('td')
		.map((td, td_index) => td_index && td.textContent)
		.filter(Boolean);
})
.filter(Boolean)
.map(item => {
	return {
		name: item[0].replace('状态/', ''),
		cate: item[1],
		desc: item[5],
		dispellable: !item[2].includes('不可'),
		extendable: !item[3].includes('不可'),
		stealable: !item[4].includes('不可'),
	};
})
 */

const res = await fetch_with_cached({
	url: 'https://wiki.biligame.com/tdj/api.php?action=ask&query=[[分类:状态]]|limit=9999|?类别=cate|?驱散=dispellable|?扩散=extendable|?偷取=stealable|?描述=desc&format=json',
	cached_path: `bili-state.askquery.res.json`,
	is_json: true,
	ignore_cached: FORCE_FETCH,
});

const rawdata = res?.query?.results || {};
let status = Object.values(rawdata).map(({fulltext, printouts}) => {
	return {
		name: fulltext.replace('状态/', ''),
		cate: printouts.cate[0],
		desc: remove_html_tag(printouts.desc[0]),
		// dispellable: !printouts.dispellable[0].includes('不可'),
		// extendable: !printouts.extendable[0].includes('不可'),
		// stealable: !printouts.stealable[0].includes('不可'),
		'驅': !printouts.dispellable[0].includes('不可'),
		'擴': !printouts.extendable[0].includes('不可'),
		'偷': !printouts.stealable[0].includes('不可'),
	};
})



outputJSON({
	json: status,
	fn: './_mid/_state.raw.json',
	space: 2,
	// cn2tw: true,
});

{ // hotfix
	status.push({
		name: '䔄毒',
		desc: '攻擊前每移動1格，暴擊率降低15%（最多降低30%），行動結束時，損失10%最大氣血，若攻擊前每多移動1格，則額外損失10%最大氣血（最多額外20%）',
		'驅': true,
		'擴': false,
		'偷': false,
	})
	status.push({
		name: '濟世',
		// cate: '其它',
		desc: '受到來自敵方的主動攻擊傷害後消失，移除1個「減益狀態」並恢復氣血（恢復量為施術者法攻的0.5倍）',
		'驅': false,
		'擴': false,
		'偷': false,
	})
	status.push({
		name: '濟世·煥',
		// cate: '其它',
		desc: '受到來自敵方的主動攻擊傷害後消失，移除1個「減益狀態」，獲得1層「神佑狀態」並恢復氣血（恢復量為施術者法攻的0.5倍）',
		'驅': false,
		'擴': false,
		'偷': false,
	})

	status.forEach(i => {
		switch (i.name) {
			case '断寸I':
				i['驅'] = false;
				i['偷'] = false;
				break;
			case '压制':
				i['驅'] = false;
				break;
			case '蛇毒':
				i.cate = '有害';
				break;
			default:
				break;
		}
	})
}

status.sort((a, b) => {
	return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
});

// status = compress_objects(status, [
// 	'dispellable',
// 	'extendable',
// 	'stealable'
// ]);

outputJSON({
	json: status,
	fn: './_pre/state.src.json',
	space: 2,
	cn2tw: true,
});

outputJSON({
	json: status,
	fn: '../src/lib/data/state.min.json',
	space: 0,
	cn2tw: true,
});
