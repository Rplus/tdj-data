all:
	echo 123;

# print-date:
# 	date +%FT%T%:::z > '../src/lib/data/latest-fetch-time.txt';


sync_official_data_version:
	printf '{"folder_commit_sha":"%s","sync_time":"%s"}' \
	"$$(git log -1 --format=%H -- _cache/tdj-roles)" \
	"$$(date +%FT%T%:::z)" \
	> '../src/lib/data/version.json'

#

update-official: fetch-ornament fetch-role handle-role sync_official_data_version
	echo 'update-official';

#

fetch-ornament:
	bun ./task/fetch-ornament.mjs;
fetch-ornament--force:
	bun ./task/fetch-ornament.mjs --force-fetch;

fetch-role:
	bun ./task/fetch-role.mjs;
fetch-role--force:
	bun ./task/fetch-role.mjs --force-fetch;

handle-role:
	bun ./task/handle-role.mjs;

gen-tags:
	bun ./task/gen-role-tags.js;

# fetch: fetch-ornament fetch-role print-date
# 	echo 'done: update-data';

# fetch-force: fetch-ornament--force fetch-role--force print-date
# 	echo 'done: fetch-force';

#
#
#

update-biliwiki: fetch-bili-summon fetch-bili-state fetch-bili-skill fetch-bili-skin handle-role
	echo 'update from biliwiki'

fetch-bili-summon:
	bun ./task/fetch-bili-summon.mjs;
fetch-bili-summon--force:
	bun ./task/fetch-bili-summon.mjs --force-fetch;

fetch-bili-state:
	bun ./task/fetch-bili-state.mjs;
fetch-bili-state--force:
	bun ./task/fetch-bili-state.mjs --force-fetch;

fetch-bili-skill: fetch-bili-skill--adv fetch-bili-skill--extra fetch-bili-skill--sub fetch-bili-skill--support merge-skills;
	echo 'fetch-bili-skill';

fetch-bili-skill--adv:
	bun ./task/fetch-bili-skill--adv.mjs;
fetch-bili-skill--adv--force:
	bun ./task/fetch-bili-skill--adv.mjs --force-fetch;

fetch-bili-skill--extra:
	bun ./task/fetch-bili-skill--extra.mjs;
fetch-bili-skill--extra--force:
	bun ./task/fetch-bili-skill--extra.mjs --force-fetch;

fetch-bili-skill--sub:
	bun ./task/fetch-bili-skill--sub.mjs;
fetch-bili-skill--sub--force:
	bun ./task/fetch-bili-skill--sub.mjs --force-fetch;

fetch-bili-skill--support:
	bun ./task/fetch-bili-skill--support.mjs;
fetch-bili-skill--support--force:
	bun ./task/fetch-bili-skill--support.mjs --force-fetch;

fetch-bili-skin:
	bun run task/fetch-bili-skin.mjs;
fetch-bili-skin--force:
	bun run task/fetch-bili-skin.mjs --force-fetch;

merge-skills:
	bun ./task/merge_skills.mjs;

gitgc:
	git gc --prune=now --aggressive;