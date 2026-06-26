import * as OpenCC from 'opencc-js';
// import { Converter } from 'opencc-js';

const customDict = [
	['於小雪', '于小雪'],
	['寧採臣', '寧采臣'],
	['鮮於超', '鮮于超'],
	['星佔賢者', '星占賢者'],
	['激活', '啟動'],
	['概率', '機率'],
	['酒困', '酒睏'],
	['减', '減'],
	['絃歌', '弦歌'],
	['地御之陣', '地禦之陣'],
	['兇', '凶'],
	['血魂之系', '血魂之繫'],
	['蘇生', '甦生'],
	['捲土歸', '卷土歸'],
	['指鑑', '指鑒'],
	['希光迴音', '希光回音'],
	['公子同游', '公子同遊'],
	['魂嫋無明', '魂裊無明'],
	['幹擾', '干擾'],
	// ['六慾', '六欲'],
];

const customDictTw2Cn = [
	['千栗', '千慄'],
	['摧心暗矢', '摧心闇矢'],
];

export const converter_cn2tw = OpenCC
	// .Converter({ from: 'cn', to: 'tw' })
	.ConverterFactory(OpenCC.Locale.from.cn, OpenCC.Locale.to.tw, [customDict]);

export const converter_tw2cn = OpenCC
	// .Converter({ from: 'cn', to: 'tw' })
	.ConverterFactory(OpenCC.Locale.from.tw, OpenCC.Locale.to.cn, [customDictTw2Cn]);
