import {
	pick_obj,
	outputJSON,
	uniq_array,
	read_json_file,
	remove_html_tag,
} from './u.mjs';

import {
	trans_key_map,
	// fetch_with_cached,
	fetch_bili_page_rest,
	// muli_fetch_bili_page_rest,
} from './u-fetch-bili.mjs';

import { converter_cn2tw, converter_tw2cn } from './opencc.mjs';


// const FORCE_FETCH = true;
const FORCE_FETCH = process.argv.includes('--force-fetch');

const role_details = read_json_file('./_mid/roles_details.raw.json');
const all_role_other_skills = read_json_file('./_pre/role_other_skills.src.json');


let basic_skills = [];
role_details.forEach(i => {
	const role = i.data.data[0];
	if (!role?.skill) {
		console.log('no skill', role.name);
		return;
	}

	basic_skills = basic_skills.concat(
		role.skill.map(i => {
			let o = pick_obj(i, ['img', 'name', 'type', 'cd', 'cost', 'shoot', 'range', 'way', 'desc',])
			o.desc = remove_html_tag(o.desc);
			return o;
		})
	);
})

const basic_skills_hant = JSON.parse(converter_cn2tw(JSON.stringify(
	basic_skills.toSorted((a, b) => {
		// localeCompare 可以正確處理字串與數字混合的情況
		return a.img.localeCompare(b.img, undefined, { numeric: true, sensitivity: 'base' });
	})
)));
// outputJSON({
// 	json: basic_skills_hant,
// 	fn: './_mid/_skills.hant.json',
// 	cn2tw: true,
// });

const unique_basic_skills = uniq_array(basic_skills_hant, 'name', 'img');
unique_basic_skills.forEach(s => {
	s._type = 'basic';
})
outputJSON({
	json: unique_basic_skills,
	fn: './_mid/_uni_skills.hant.json',
	cn2tw: true,
});

const other_skills = Object.values(all_role_other_skills).map(i => {
	let op = [];
	if (i.adv_skills) {
		op.push(...i.adv_skills.flat().filter(s => typeof s !== 'string'));
	}
	if (i.extra_skills) {
		op.push(...i.extra_skills.flat());
	}
	// if (i.support_skill) {
	// 	op.push(i.support_skill);
	// }
	return op;
}).flat()

other_skills.forEach(s => {
	s._type = 'other';
})

outputJSON({
	json: other_skills,
	fn: './_mid/_other_skills.json',
	// cn2tw: true,
});




// =================
// === subskills ===
// =================




const query_skills = [
	...unique_basic_skills,
	...other_skills,
];


const xx_kwds = [
	'可升級有害狀態',
	'有益狀態',
	'有害狀態',
	'神序狀態',
	'增益狀態',
	'疲弱',
	'連擊',
	'對戰前',
	'對戰中',
	'對戰後',
];
// query subkills
const subskills = query_skills.filter(i => {
	if (!i.desc) {
		// console.log(111, i);
		return false;
	}
	return (i.desc.includes('切換') && i.desc.match(/「[^」]+」/)) ||
	(i.desc.includes('選擇一個絕學') && i.desc.match(/「[^」]+」/g)) ||
	(i.desc.includes('選擇使用絕學') && i.desc.match(/「[^」]+」/g));
})
	.map(i => {
		let kwd = i.desc.match(/「[^」]+」/gm)
			.map((i) => i.replace(/[「」]/g, ''))
			.filter(i => !xx_kwds.includes(i))
			// .join(', ');
		let x__x = { main: i.name, sub: kwd, };
		return {
				name: i.name,
				desc: i.desc,
				x__x,
				_type: i._type,
			}
	});
outputJSON({
	json: subskills,
	fn: './_mid/_潛在subskills.json',
	cn2tw: true,
});




const subskills_whitelist = [
	{ main: '追風趕月', sub: ['逐星破日'] },
	{ main: '雷引萬宇', sub: ['天閃亂魂'] },
	{ main: '喜鵲穿枝', sub: ['細葉扶刃'] },
	{ main: '憤怒淵藪', sub: ['奪駭冥掌'] },
	{ main: '踏步炎斬', sub: ['穿陽連斬'] },
	{ main: '決戰無雙', sub: ['炎燼裂凶'] },
	{ main: '蠻荒戰技', sub: ['撕筋掠血', '剔骨掏心'] },
	{ main: '急召律令', sub: ['真炎律令', '天雷律令'] },
	{ main: '萬寶靈符', sub: ['顯形慧印', '道炁如壁'] },
	{ main: '小而無相', sub: ['怨生剛愎', '山魈索魂'] }, // source rest by hand
	{ main: '三衍劍訣', sub: ['天玄劍法', '破魔劍法', '御劍心法'] },
	{ main: '肉身成聖', sub: ['天目清曜', '天目煥赫'] },
	{ main: '靈劍點隙', sub: ['飛花勢', '疊浪勢', '遊螢勢'] },
	{ main: '折刃貫空', sub: ['透骨同悲'] },
	{ main: '劍心出鞘', sub: ['峙石藏鋒', '天霜一線', '千里戲風'] },
	{ main: '攝法聚神', sub: ['凶蝕之輪'] }, // source rest by hand
	{ main: '攝法聚神·壹式', sub: ['凶蝕之輪·壹式'], },
	{ main: '攝法聚神·貳式', sub: ['凶蝕之輪·貳式'], },
	{ main: '劍心出鞘·壹式', sub: ['峙石藏鋒·壹式', '天霜一線·壹式', '千里戲風·壹式'], },
	{ main: '劍心出鞘·貳式', sub: ['峙石藏鋒·貳式', '天霜一線·貳式', '千里戲風·貳式'], },
	{"main": "折刃貫空·壹式", "sub": ["透骨同悲·壹式"] },
	{"main": "折刃貫空·貳式", "sub": ["透骨同悲·貳式"] },
	{"main": "靈劍點隙·壹式", "sub": ["飛花勢·壹式", "疊浪勢·壹式", "遊螢勢·壹式"] },
	{"main": "靈劍點隙·貳式", "sub": ["飛花勢·貳式", "疊浪勢·貳式", "遊螢勢·貳式"] },
	{"main": "肉身成聖·壹式", "sub": ["天目清曜·壹式", "天目煥赫·壹式"] },
	{"main": "肉身成聖·貳式", "sub": ["天目清曜·貳式", "天目煥赫·貳式"] },
	{"main": "三衍劍訣·壹式", "sub": ["天玄劍法·壹式", "破魔劍法·壹式", "御劍心法·壹式"] },
	{"main": "三衍劍訣·貳式", "sub": ["天玄劍法·貳式", "破魔劍法·貳式", "御劍心法·貳式"] },
	{"main": "小而無相·壹式", "sub": ["怨生剛愎·壹式", "山魈索魂·壹式"] },
	{"main": "小而無相·貳式", "sub": ["怨生剛愎·貳式", "山魈索魂·貳式"] },
	{"main": "萬寶靈符·壹式", "sub": ["顯形慧印·壹式", "道炁如壁·壹式"] },
	{"main": "萬寶靈符·貳式", "sub": ["顯形慧印·貳式", "道炁如壁·貳式"] },
	{"main": "蠻荒戰技·壹式", "sub": ["撕筋掠血·壹式", "剔骨掏心·壹式"] },
	{"main": "蠻荒戰技·貳式", "sub": ["撕筋掠血·貳式", "剔骨掏心·貳式"] },
	{"main": "學以致用·壹式", "sub": ["倒背如流·壹式"] },
	{"main": "學以致用·貳式", "sub": ["倒背如流·貳式"] },
	{"main": "剎魂制心·壹式", "sub": ["魔天凜意·壹式"] },
	{"main": "剎魂制心·貳式", "sub": ["魔天凜意·貳式"] },
	{"main": "兩儀歸淵·壹式", "sub": ["天授尊魂·壹式", "憑魂換骨·壹式"] },
	{"main": "兩儀歸淵·貳式", "sub": ["天授尊魂·貳式", "憑魂換骨·貳式"] },
	{"main": "決戰無雙·壹式", "sub": ["炎燼裂凶·壹式"] },
	{"main": "決戰無雙·貳式", "sub": ["炎燼裂凶·貳式"] },
	{"main": "超度梵音·壹式", "sub": ["梵音超度·壹式"] },
	{"main": "超度梵音·貳式", "sub": ["梵音超度·貳式"] },
	{"main": "菩薩行·壹式", "sub": ["羅剎道·壹式"] },
	{"main": "菩薩行·貳式", "sub": ["羅剎道·貳式"] },
	{"main": "天鼓伽藍·壹式", "sub": ["嘆妙伽藍·壹式"] },
	{"main": "天鼓伽藍·貳式", "sub": ["嘆妙伽藍·貳式"] },
	// {"main": "梵音超度", "sub": ["超度梵音"] },
	// {"main": "往生禮讚", "sub": ["禮讚往生"] },
	// {"main": "羅剎道", "sub": ["菩薩行"] },
	// {"main": "嘆妙伽藍", "sub": ["天鼓伽藍"] },
	{"main": "踏步炎斬·壹式", "sub": ["穿陽連斬·壹式"] },
	{"main": "踏步炎斬·貳式", "sub": ["穿陽連斬·貳式"] },
	{"main": "憤怒淵藪·壹式", "sub": ["奪駭冥掌·壹式"] },
	{"main": "憤怒淵藪·貳式", "sub": ["奪駭冥掌·貳式"] },
	{"main": "七殺坐命·壹式", "sub": ["天尊主宰·壹式"] },
	{"main": "七殺坐命·貳式", "sub": ["天尊主宰·貳式"] },
	{"main": "聚星飛刺·壹式", "sub": ["聚星連斬·壹式"] },
	{"main": "聚星飛刺·貳式", "sub": ["聚星連斬·貳式"] },
	{"main": "喜鵲穿枝·壹式", "sub": ["細葉扶刃·壹式"] },
	{"main": "喜鵲穿枝·貳式", "sub": ["細葉扶刃·貳式", ] },
	{"main": "雷引萬宇·壹式", "sub": ["天閃亂魂·壹式"] },
	{"main": "雷引萬宇·貳式", "sub": ["天閃亂魂·貳式"] },
	{"main": "物華休·壹式", "sub": ["萬籟寂·壹式"] },
	{"main": "物華休·貳式", "sub": ["萬籟寂·貳式"] },
	{"main": "脫劍膝前·壹式", "sub": ["吳鉤流焰·壹式", "俠骨丹心·壹式"] },
	{"main": "脫劍膝前·貳式", "sub": ["吳鉤流焰·貳式", "俠骨丹心·貳式"] },
	{"main": "鬼蠱奪煞·壹式", "sub": ["竊法咒刃·壹式"] },
	{"main": "鬼蠱奪煞·貳式", "sub": ["竊法咒刃·貳式"] },
	{"main": "燕門劍訣·壹式", "sub": ["匣中劍·壹式", "滅魔劍·壹式"] },
	{"main": "燕門劍訣·貳式", "sub": ["匣中劍·貳式", "滅魔劍·貳式"] },
	{"main": "萬鱗在衣·壹式", "sub": ["遊鱗庇覆·壹式", "遊鱗孚佑·壹式"] },
	{"main": "萬鱗在衣·貳式", "sub": ["遊鱗庇覆·貳式", "遊鱗孚佑·貳式"] },
	{"main": "無極天光·壹式", "sub": ["無空生滅·壹式"] },
	{"main": "無極天光·貳式", "sub": ["無空生滅·貳式"] },
	{"main": "霜天劍匣·壹式", "sub": ["寒劍封喉·壹式", "胡霜千里·壹式"] },
	{"main": "霜天劍匣·貳式", "sub": ["寒劍封喉·貳式", "胡霜千里·貳式"] },
	{"main": "冰華飛刺·壹式", "sub": ["冰華連斬·壹式"] },
	{"main": "冰華飛刺·貳式", "sub": ["冰華連斬·貳式"] },
	{"main": "韓門旋刃·壹式", "sub": ["雙環映月·壹式", "光輪斬·壹式"] },
	{"main": "韓門旋刃·貳式", "sub": ["雙環映月·貳式", "光輪斬·貳式"] },
	{"main": "風捲殘雲·壹式", "sub": ["五雷轟頂·壹式"] },
	{"main": "風捲殘雲·貳式", "sub": ["五雷轟頂·貳式"] },
	{"main": "玄天劍匣·壹式", "sub": ["火靈神劍·壹式", "天華神劍·壹式", "幻月神劍·壹式"] },
	{"main": "玄天劍匣·貳式", "sub": ["火靈神劍·貳式", "天華神劍·貳式", "幻月神劍·貳式"] },
	{"main": "玄天劍匣·貳式", "sub": ["火靈神劍·貳式", "天華神劍·貳式", "幻月神劍·貳式"] },
	{"main": "計都秘術", "sub": ["冰華之陣", "噬魂之獄", "焚炎之陣",] },
	{"main": "羅睺真法", "sub": ["天霜雪舞", "無天黑炎", "離火神訣",] },
	{"main": "羅睺真法·壹式", "sub": ["天霜雪舞·壹式", "無天黑炎·壹式", "離火神訣·壹式",] },
	{"main": "羅睺真法·貳式", "sub": ["天霜雪舞·貳式", "無天黑炎·貳式", "離火神訣·貳式",] },
	{"main": "玄圖布策", "sub": ["流火散勢", "引渠覆軍", "神機奪魁",] },
	{"main": "玄圖布策·壹式", "sub": ["流火散勢·壹式", "引渠覆軍·壹式", "神機奪魁·壹式",] },
	{"main": "玄圖布策·貳式", "sub": ["流火散勢·貳式", "引渠覆軍·貳式", "神機奪魁·貳式",] },
	{"main": "玄圖布策·貳式", "sub": ["流火散勢·貳式", "引渠覆軍·貳式", "神機奪魁·貳式",] },
	{"main": "武魂青龍斬", "sub": ["君侯顯聖"] },
	{"main": "武魂青龍斬·壹式", "sub": ["君侯顯聖·壹式"] },
	{"main": "武魂青龍斬·貳式", "sub": ["君侯顯聖·貳式"] },
	{"main": "天地同游·横", "sub": ["天地同游·縱"] },
	{"main": "一剑封念·横", "sub": ["一剑封念·縱"] },
	{"main": "一剑封念·横·壹式", "sub": ["一剑封念·縱·壹式"] },
	{"main": "一剑封念·横·貳式", "sub": ["一剑封念·縱·貳式"] },
	{"main": "劍指天南·横", "sub": ["劍指天南·縱"] },
	{"main": "劍指天南·横·壹式", "sub": ["劍指天南·縱·壹式"] },
	{"main": "劍指天南·横·貳式", "sub": ["劍指天南·縱·貳式"] },
];


fetching_sub_skills();

async function fetching_sub_skills() {
	let subskills_data = [];

	for (const sss of subskills_whitelist) {
		for (const subskill_name of sss.sub) {
			// fetch defailt subskill
			const cn_name = converter_tw2cn(subskill_name);
			const _data = await fetch_bili_page_rest({
				name: ('绝学/' + cn_name),
				ignore_cached: FORCE_FETCH,
			});

			if (_data) {
				let op = trans_key_map(_data);
				subskills_data.push(op);
			} else {
				subskills_data.push([null, subskill_name]);
			}
		}
	}

	let subskills_obj = {
		map: subskills_whitelist.reduce((all, i) => {
			all[i.main] = i.sub;
			return all;
		}, {}),
		data: subskills_data,
	};

	subskills_obj = overwrite(subskills_obj);

	outputJSON({
		json: subskills_obj,
		fn: './_pre/subskills.src.json',
		// space: 0,
		cn2tw: true,
	});

	outputJSON({
		json: subskills_obj,
		fn: '../src/lib/data/subskills.min.json',
		space: 0,
		cn2tw: true,
	});
}


function overwrite(subskills_obj) {
	console.log('overwrite');
	let _map = {
		'十步殺一人': ['事了拂衣去'],
		'十步殺一人·壹式': ['事了拂衣去·壹式'],
		'十步殺一人·貳式': ['事了拂衣去·貳式'],
		'煞戾誅邪': ['追身縱切', '追身橫斬'],
		'煞戾誅邪·壹式': ['追身縱切', '追身橫斬'],
		'煞戾誅邪·貳式': ['追身縱切', '追身橫斬'],
	}
	let _data = [
		{
			"name": "追身縱切",
			"type": "物攻傷害",
			"cd": "",
			"cost": "",
			"shoot": "十字5格",
			"range": "平行5格",
			"desc": "對範圍內所有敵人共造成1倍傷害。"
		},
		{
			"name": "追身橫斬",
			"type": "物攻傷害",
			"cd": "",
			"cost": "",
			"shoot": "十字5格",
			"range": "垂直5格",
			"desc": "對範圍內所有敵人共造成1倍傷害。"
		},
		{
			"name": "事了拂衣去",
			"type": "支援",
			"cd": "",
			"cost": "",
			"shoot": "自身",
			"range": "直線5格",
			"desc": "向前穿刺並到達作用範圍（5格）最遠可到達的格子上，反轉範圍內所有友方和自身2個「有害狀態」為隨機「有益狀態」，行動結束時獲得「深藏身與名」狀態。\n「深藏身與名」：免傷提高50%，回合開始時轉化為「神睿I」狀態，持續2回合（主動攻擊「對戰後」或遭受攻擊受到傷害後消失）。"
		},
		{
			"name": "事了拂衣去·壹式",
			"type": "支援",
			"cd": "",
			"cost": "",
			"shoot": "自身",
			"range": "直線5格",
			"desc": "向前穿刺並到達作用範圍（5格）最遠可到達的格子上，反轉範圍內所有友方和自身3個「有害狀態」為隨機「有益狀態」並恢復氣血（恢復量為施術者物攻的1倍），行動結束時獲得「深藏身與名」狀態。\n「深藏身與名」：免傷提高50%，回合開始時轉化為「神睿I」「迅捷II」狀態，持續2回合（主動攻擊「對戰後」或遭受攻擊受到傷害後消失）。"
		},
		{
			"name": "事了拂衣去·貳式",
			"type": "支援",
			"cd": "",
			"cost": "",
			"shoot": "自身",
			"range": "直線5格",
			"desc": "向前穿刺並到達作用範圍（5格）最遠可到達的格子上，反轉範圍內所有友方和自身3個「有害狀態」為隨機「有益狀態」並恢復氣血（恢復量為施術者物攻的1.5倍），行動結束時獲得「深藏身與名」狀態。\n「深藏身與名」：免傷提高50%，回合開始時轉化為「神睿I」「迅捷II」狀態，持續2回合（主動攻擊「對戰後」或遭受攻擊受到傷害後消失）。"
		},
	];

	subskills_obj = {
		map: {
			...subskills_obj.map,
			..._map,
		},
		data: [
			...subskills_obj.data,
			..._data,
		],
	};
	return subskills_obj;
}