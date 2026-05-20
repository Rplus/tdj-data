# official

```js

const domains = {
	cn: 'tdj-activity.zlongame.com',
	// cn: 'tdj-activitytest.zlongame.com', // test
	tw: 'tdj-activity.game-beans.com',
	// tw: 'tdj-activitytest.game-beans.com', // test
};

function get_url(qs_obj = {}, lang = 'cn') {
	const defaults = {
		id: lang === 'cn' ? 0 : 1,
		action: 'info',
		module: 'hero',
		type: 'basic',
	};

	const params = new URLSearchParams({ ...defaults, ...qs_obj });
	const _url = `https://${domains[lang]}/tdj/data/mQuery.do?${params}`;

	// 如果需要代理，可在這裡開啟
	// if (lang === 'cn') {
	// 	console.log('cn use proxy');
	// 	return `https://corsproxy.io/?url=${_url}`;
	// }
	return _url;
};
{
	roles: {
		url: (lang) => get_url({ module: 'hero', type: 'basic' }, lang),
	},
	role_deatil: {
		url: (name, lang) => get_url({ module: 'hero', type: 'detail', query: name }, lang),
	},
	ornaments: {
		url: (name) => get_url({ module: 'ornaments', type: 'ornaments' }),
	},
	ornaments_tw: {
		url: (name) => get_url({ module: 'ornaments', type: 'ornaments' }, 'tw'),
	},
}
```

# bili api

## Action API

拿到所有狀態的 name array
https://wiki.biligame.com/tdj/api.php?action=ask&query=[[分类:状态]]|limit=9999&format=json

拿到所有狀態的 name array
https://wiki.biligame.com/tdj/api.php?action=ask&query=[[分类:状态]]|limit=9999|?类别=cate|?驱散=dispellable|?扩散=extendable|?偷取=stealable|?描述=desc&format=json

拿到狀態頁 HTML，需搭配 html structure parser
https://wiki.biligame.com/tdj/api.php?action=parse&pageid=4467&prop=text&format=json


拿到 召唤物 name array，比較準
https://wiki.biligame.com/tdj/api.php?action=ask&query=[[分类:召唤物]]|limit=1000&format=json

拿到 召唤物 name array，search字串可能誤判
https://wiki.biligame.com/tdj/api.php?action=opensearch&search=召唤物&limit=50

v
https://wiki.biligame.com/tdj/api.php?action=ask&query=[[Category:召唤物]]|?名称=name|?属相=prop|?职业=career|?射程=range|?移动=speed|?属性=status|?天赋=inherent_name|?绝学=skill&format=json



更精準拿到所有 category 條目
https://wiki.biligame.com/tdj/api.php?action=query&list=categorymembers&cmtitle=Category:召唤物&cmlimit=max&format=json


特定角色的援袭绝学
https://wiki.biligame.com/tdj/api.php?action=ask&query=[[分类:援袭绝学]][[所属::尉迟良]]&format=json

所有的 援袭绝学
https://wiki.biligame.com/tdj/api.php?action=ask&query=[[分类:援袭绝学]]&format=json
https://wiki.biligame.com/tdj/api.php?action=query&list=categorymembers&cmtitle=Category:援袭绝学&cmlimit=max&format=json

批次撈取所有 category 條目 以及其特定屬性之值
https://wiki.biligame.com/tdj/api.php?action=ask&query=[[Category:援袭绝学]]|?所属|?星数|?名称|?类别|?冷却|?射程|?范围|?描述|limit=500&format=json&utf8=1
https://wiki.biligame.com/tdj/api.php?action=ask&query=[[Category:援袭绝学]]|?所属=owner|?星数=star|?名称=name|?类别=type|?冷却=cd|?射程=shoot|?范围=range|?描述=desc|limit=500&format=json&utf8=1



通用型取頁面 property，資料較髒
```js
let params = encodeURIComponent(
	JSON.stringify({
		subject: name,
		ns: 0,
		type: 'xml',
	})
);
const url = `https://wiki.biligame.com/tdj/api.php?action=smwbrowse&format=json&browse=subject&params=${params}`;
```


通用型取頁面
https://wiki.biligame.com/tdj/api.php?action=parse&page=天赋/五采仁兽&prop=wikitext&format=json&formatversion=2&utf8=1
https://wiki.biligame.com/tdj/api.php?action=parse&page=天赋/五采仁兽&prop=parsetree&format=json&formatversion=2&utf8=1
* formatversion 2: 現代style，更少奇怪的 source
* prop=wikitext: wiki source text，wikitext，要手動用 regexp parse
* prop=parsetree: wikitext 轉成 xml tree，不用自己 parse

批次撈取(數量50以內較安全)， encodeURIComponent`{title}`
https://wiki.biligame.com/tdj/api.php?action=query&prop=revisions&titles=天赋/五采仁兽|天赋/通世瑞灵&rvprop=content&format=json&utf8=1



## REST API
https://wiki.biligame.com/tdj/rest.php/v1/page/召唤物%2F啸霜

