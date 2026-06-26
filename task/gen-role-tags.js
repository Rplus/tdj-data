import fs from 'fs';
import {
	uniq,
	outputJSON,
	read_json_file,
} from './u.mjs';

const roles_details = read_json_file('./_mid/roles_details.raw.json');
const roles = read_json_file('./_pre/roles.src.json');
const role_other_skills = read_json_file('./_pre/role_other_skills.src.json');

const roles_has_adv_skill = Object.keys(role_other_skills).filter(i => role_other_skills[i]?.adv_skills.length);
const roles_has_support_skill = Object.keys(role_other_skills).filter(i => role_other_skills[i]?.support_skill);

// const kwd = '免除死亡';
// const rrr = roles_details.map(i => {
// 	const dd = i.data.data[0];
// 	let str = JSON.stringify(dd);
// 	return str.match(/免除死亡/g) && { pinyin: dd.pinyin, name: dd.name, };
// }).filter(Boolean);


function query_kwd(kwd = '') {
	return roles_details.reduce((acc, i) => {
		const dd = i.data?.data?.[0];
		if (dd && JSON.stringify(dd).includes(kwd)) {
			const { pinyin, name } = dd;
			// acc.push(name + ' - ' + pinyin);
			// acc.push(pinyin);
			acc.push([pinyin, name]);
		}
		return acc;
	}, []);
}

let role_tag_map = roles.reduce((all, role) => {
	all[role.pinyin] = {
		name: role.name,
		pinyin: role.pinyin,
		tags: [],
	};
	return all;
}, {});

let tags = [
	{
		tag: '免死',
		data: [
			...query_kwd('免除死亡'),
			['', '瑚兒'],
			['', '趙雲'],
			['', '赤魃韓無砂'],
			['', '雙魂虞兮'],
			['', '魔化皇甫申'],
		],
	},
	{
		tag: '再啟動',
		data: [
			...query_kwd('再啟動'),
			['', '琴色'],
			['', '暗曜陽寰'],
		],
	},
	{
		tag: '陣眼',
		data: query_kwd('"strategy"'),
	},
	{
		tag: '召喚物',
		// data: roles.map(r => r.summons && r.name + ' - ' + r.pinyin).filter(Boolean),
		data: [
			...roles.map(r => r.summons && [r.pinyin, r.name]).filter(Boolean),
			['', '燕明蓉'],
			['', '朧夢嫿妖'],
		],
	},
	{
		tag: '協攻',
		data: [
			...[...new Set(['協攻', '友方主動發起對戰', '優先攻擊'].flatMap(tag => query_kwd(tag)))],
			['', '鄲陰'],
		],
	},
	// {
	// 	tag: '抵擋致命傷害',
	// 	data: query_kwd('抵擋致命傷害'),
	// },
	{
		tag: '再行動',
		data: query_kwd('再行動'),
	},
	{
		tag: '援襲技能', // support_skill
		data: roles.map(r => roles_has_support_skill.includes(r.pinyin) && [r.pinyin, r.name]).filter(Boolean),
	},
	// {
	// 	tag: '無3C',
	// 	data: roles.map(r => !roles_has_adv_skill.includes(r.pinyin) && r.name + ' - ' + r.pinyin).filter(Boolean),
	// },
	{
		tag: '結界',
		data: [
			['', '霍雍'],
			['', '雲衣宮主'],
			['', '星占賢者'],
			['', '祿存高皇君'],
			['', '赤魃韓無砂'],
			['', '幽寰夏侯儀'],
			['', '紫霆司命'],
		],
	},
	{
		tag: '挪移友方',
		data: [
			['', '相桓子'],
			['', '諸葛艾'],
			['', '伎樂飛天'],
			['', '李逍遙'],
			['', '葛雲衣'],
			['', '瑚兒'],
			['', '寧采臣'],
			['', '歸棹'],
			['', '蒼狼'],
			['', '尉遲慎'],
			['', '真胤'],
			['', '桑然'],
			['', '春蘭'],
		],
	},
	{
		tag: '機關',
		data: [
			['', '白骨夫人'],
			['', '朱槿'],
			['', '聞任宇'],
			['', '銀川公主'],
			['', '幻海冥皇'],
			['', '流舞'],
			['', '計都'],
			['', '承影'],
			['', '刀八'],
			['', '暗曜陽寰'],
			['', '紫霆司命'],
			['', '呼延崇'],
			['', '韓千秀'],
			['', '朱繯'],
			['', '方芸'],
			['', '允迦'],
			['', '地仙羅剎'],
			['', '桑然'],
			['', '嶺外飛燕'],
			['', '紫炁'],
			['', '諸葛亮'],
		],
	},
	{
		tag: '剋制機關',
		data: [
			['', '冰璃'],
			['', '鮮于超'],
			['', '呼延朔'],
			['', '白素貞'],
			['', '霸熊高戚'],
			['', '雙曜冰璃'],
			['', '天玄義劍'],
			['', '悟空'],
			['', '地仙羅剎'],
			['', '雙魂虞兮'],
			['', '楊戩'],
			['', '食夢貘'],
			['', '幽姬鹿昭依'],
			['', '幽寰夏侯儀'],
			['', '承影'],
			['', '諸葛亮'],
		],
	},
	{
		tag: '剋制護盾',
		data: [
			['', '雪芝'],
			['', '冰蟬玉劍'],
			['', '聞任宇'],
			['', '承影'],
		],
	},
	{
		tag: '剋制結界',
		data: [
			['', '銀川公主'],
		],
	},
	{
		tag: '戍援',
		data: [
			['', '銀川公主'],
			['', '魔宿霍雍'],
			['', '劍心無邪'],
		],
	},
	{
		tag: '領域',
		data: [
			['', '幽寰夏侯儀'],
			['', '耶律紗'],
			['', '幽姬鹿昭依'],
			['', '紫炁'],
			['', '桑然'],
			['', '白鹿'],
			['', '太玄靈狐'],
			['', '蕭熇'],
			['', '伎樂飛天'],
			['', '霸熊高戚'],
			['', '西莉亞'],
			['', '允迦'],
			['', '隋酒'],
			['', '春蘭'],
			['', '寧采臣'],
			['', '聶小倩'],
			['', '武英仲'],
			['', '宇文拓'],
			['', '殷無邪'],
			['', '秦惟剛'],
			['', '陰歙'],
			['', '朱浩'],
			['', '劍魂·天尊'],
		],
	},
	{
		tag: '剋制地形',
		data: [
			['', '幽姬鹿昭依'],
			['', '封鈴笙'],
			['', '鮮于超'],
			['', '呼延朔'],
			['', '白素貞'],
			['', '霸熊高戚'],
			['', '雙曜冰璃'],
			['', '天玄義劍'],
			['', '地仙羅剎'],
			['', '雙魂虞兮'],
			['', '蘇妲己'],
			['', '銀川公主'],
			['', '琴色'],
			['', '諸葛亮'],
		],
	},
	{
		tag: '剋制免死',
		data: [
			['', '哪吒'],
			['', '李白'],
			['', '月孛'],
			['', '趙雲'],
			['', '悟空'],
			['', '楊戩'],
			['', '相胤'],
			['', '雙魂虞兮'],
			['', '天玄義劍'],
			['', '劍心無邪'],
		],
	},
	{
		tag: '剋制召喚物',
		data: [
			['', '天音白菀'],
			['', '雙魂虞兮'],
			['', '陸文生'],
			['', '羅淵女皇'],
		],
	},
	{
		tag: '剋制再動',
		data: [
			['', '展昭'],
			['', '白鹿'],
			['', '幽姬鹿昭依'],
			['', '驚飛羽'],
			['', '少俠應奉仁'],
			['', '蘇妲己'],
			['', '祿存高皇君'],
			['', '蒼狼'],
			['', '允迦'],
			['', '韓千秀'],
		],
	},
	// {
	// 	tag: '挪移敵方',
	// 	data: [
	// 		['', ''],
	// 		['', ''],
	// 	],
	// },
];

tags.forEach(tag => {
	tag.data.forEach(item => {
		if (item[0] === '' && item[1]) {
			let _role = roles.find(role => role.name === item[1]);
			if (_role) {
				item[0] = _role.pinyin;
			}
		}
	})
})

outputJSON({
	json: tags,
	fn: './_mid/_tags.json',
});


role_tag_map = {
	...roles.reduce((all, r) => {
		all[r.pinyin] = {
			name: r.name,
			pinyin: r.pinyi,
			tags: [],
		};
		return all;
	}, {}),
	...role_tag_map,
}

tags.forEach(item => {
	item.data.forEach(i => {
		if (!role_tag_map[i[0]]) {
			console.log(i[0]);
			return;
		}
		role_tag_map[i[0]].tags.push(item.tag);
	})
});

for (let item in role_tag_map) {
	if (!role_tag_map[item].tags?.length) {
		delete role_tag_map[item];
	} else {
		role_tag_map[item].tags = [...new Set(role_tag_map[item].tags)];
	}
}


outputJSON({
	json: role_tag_map,
	fn: './_mid/_role_tags_map.json',
});

export const role_tags = role_tag_map;
