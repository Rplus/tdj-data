import fs from 'fs';
import {
	outputJSON,
	pick_obj,
	remove_html_tag,
	read_json_file,
} from './u.mjs';

import { role_tags, } from './gen-role-tags.js';

import fetched_details from '../_mid/roles_details.raw.json' with { type: 'json' };
import merged_roles from '../_mid/roles.op.json' with { type: 'json' };
import all_skins from '../_pre/role_with_skin_imgs.json' with { type: 'json' };
import all_summons from '../_pre/summons.src.json' with { type: 'json' };

//// skills for query
let skills_for_query = fetched_details.map(i => {
	let role = i.data.data[0];
	let skills = role.skill.map(ss => {
		return {
			name: ss.name,
			desc: remove_html_tag(ss.desc),
		};
	});
	if (role.godclass_weapon) {
		let gg = role.godclass_weapon[role.godclass_weapon.length - 1];
		skills.push({
			name: gg.name,
			desc: remove_html_tag(gg.desc),
			type: 'godclass_weapon',
		});
	}
	skills.push({
		name: role.inherent_name,
		desc: role.star6,
		type: 'inherent',
	})
	return {
		name: role.name,
		pinyin: role.pinyin,
		// star6: role.star6,
		skills,
	};
});

outputJSON({
	json: skills_for_query,
	fn: './_pre/roles_skills_for_query.min.json',
	space: 0,
	cn2tw: true,
});

const all_icons = {};
const all_strategy = [];

let all_skill = [];

// handle details
const op_roles = fetched_details
	.map(i => {
		const role = i.data.data[0];
		const basic_role = merged_roles.find(r => r.hero_icon === role.hero_icon);

		all_icons[role.prop_icon.toLowerCase()] = role.prop;
		all_icons[role.career_icon.toLowerCase()] = role.career;

		// get strategy
		let strategy;
		const _strategy = role.strategy?.[0];
		if (_strategy?.name) {
			const { unlock_condition, ...rest } = _strategy; // 解構排除不需要的欄位
			strategy = _strategy.name;
			all_strategy.push(rest);
		}

		// get summons
		let summons;
		let _summons = all_summons.summons?.filter((summon) => summon.owner[1] === role.pinyin);
		if (_summons.length) {
			summons = _summons.map((s) => s.name);
		}

		/*
		// get skills
		if (role.skill) {
			all_skill = all_skill.concat(
				role.skill.map(i => {
					let o = pick_obj(i, ['img', 'name', 'type', 'cd', 'cost', 'shoot', 'range', 'way', 'desc',])
					o.desc = remove_html_tag(o.desc);
					return o;
				})
			);
		}
		*/

		let ooop = {
			...pick_obj(role, [
				'name',
				'rarity',
				'prop',
				'hero_icon',
				'career',
				'pinyin',
				'pic',
				'rarity',
				'position',
				'range',
				'speed'
			]),
			...pick_obj(basic_role, [
				'pinyin_tw',
				'path',
			]),

			status: {
				hp: +role.qixue,
				atk_mag: +role.magic_attack,
				atk_phy: +role.physical_attack,
				def_mag: +role.magic_defense,
				def_phy: +role.physical_defense,
				crit: +role.huixin,
			},

			...(strategy && {strategy}),
			...(summons && {summons}),

		};

		let skins = all_skins[role.pinyin]?.skins;
		if (skins) {
			ooop.skins = skins;
		}

		// attackive_tank
		if ((role.career === '铁卫' || role.career === '鐵衛') && role.equipment?.[3]?.physical_attack) {
			ooop.career2 = '猛士';
		}

		// tags
		let tags = role_tags[role.pinyin]?.tags;
		if (tags) {
			ooop.tags = tags;
		}

		{ // overwrite data
			if (ooop.prop === '火') {
				ooop.prop = '炎';
			}
			if (ooop.pinyin === 'guanyu') {
				ooop.career = '破軍';
				ooop.rarity = 'SSR';
				// delete ooop.pinyin_tw
			}

			if (ooop.pinyin === 'zhugeliang') {
				ooop.prop = '神';
				ooop.rarity = 'SSR';
			}

			// if (ooop.pinyin === 'yaoyouyushaorong') {
			// 	ooop.rarity = 'ULR';
			// }

			// if (ooop.pinyin === 'tianyinbaiwan') {
			// 	ooop.rarity = 'ULR';
			// }
		}

		return ooop;
	});

outputJSON({
	json: op_roles,
	fn: './_pre/roles.src.json',
	// space: 0,
	cn2tw: true,
});
outputJSON({
	json: op_roles,
	fn: '../src/lib/data/roles.min.json',
	space: 0,
	cn2tw: true,
});



// ================
// === strategy ===
// ================


const ICONS_MAPPING = {
	...all_icons,
	female: '女',
	male: '男',
	strategy_core: '陣眼',
	'fire/ice/electricity': '炎冰雷',
	'light/shadow/dusk': '光暗幽',
};

outputJSON({
	json: {all_icons, ICONS_MAPPING},
	fn: './_mid/_strategy_icons.json',
	// space: 0,
	// cn2tw: true,
});

const strategy_overrides = {
	'三身通智陣': { type: 'push', data: [ 'strategy_core', 'strategy_core' ], },
	'群芳馥鬱陣': { type: 'push', data: [ 'rider', ], },
	'六韜信戰陣': { type: 'replace', data: [ 'fire/ice/electricity', 'fire/ice/electricity', ], },
	// '驅雷魔魄陣': [ 'dusk' ],
	// '狐靈神氛陣': [ 'dusk' ],
	// '暗月鬥靈陣': [ 'melee' ],
};


const op_strategy = all_strategy.map((item) => {
	let obj = {
		name: item.name,
		img: item.img,
		desc: item.desc,
		members: [
			gen_mem_by_img(item.icon_center),
			...Object.keys(item)
				.filter((prop) => /^icon\d$/.test(prop) && item[prop])
				.map((prop) => gen_mem_by_img(item[prop])),
		],
	};

	if (strategy_overrides[item.name]) {
		if (strategy_overrides[item.name].type === 'push') {
			obj.members.push(...strategy_overrides[item.name].data.map(gen_mem_by_img));
		} else if (strategy_overrides[item.name].type === 'replace') {
			obj.members = [
				...obj.members.slice(0, 1),
				...strategy_overrides[item.name].data.map(gen_mem_by_img),
			];
		}
	}

	return obj;
});

outputJSON({
	json: op_strategy,
	fn: './_pre/strategy.src.json',
	// space: 0,
	cn2tw: true,
});
outputJSON({
	json: op_strategy,
	fn: '../src/lib/data/strategy.min.json',
	space: 0,
	cn2tw: true,
});

function gen_mem_by_img(img = '') {
	let role = op_roles.find((r) => r.hero_icon === img);
	if (role) {
		return {
			name: role.name,
			img: img,
		};
	}

	if (ICONS_MAPPING[img]) {
		return {
			name: ICONS_MAPPING[img],
		};
	}

	console.error('gg:', img);
	return img;
}
