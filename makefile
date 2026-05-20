all:
	echo 123;

print-date:
	date +%FT%T%:::z > '../src/lib/data/latest-fetch-time.txt';


fetch-%--force:
	bun ./task/fetch-$*.mjs --force-fetch

fetch-%:
	bun ./task/fetch-$*.mjs


fetch-ornament:
	bun ./task/fetch-ornament.mjs;

fetch-ornament--force:
	bun ./task/fetch-ornament.mjs --force-fetch;

fetch-role:
	bun ./task/fetch-role.mjs;

fetch-role--force:
	bun ./task/fetch-role.mjs --force-fetch;

fetch: fetch-ornament fetch-role print-date
	echo 'done: update-data';

fetch-force: fetch-ornament--force fetch-role--force print-date
	echo 'done: fetch-force';

# fetch-parse: print-date
# 	bun ./task/fetch.mjs;

# fetch-sorting:
# 	bun ./task/sorting.mjs;


fetch-bili-summon:
	bun ./task/fetch-bili-summon.mjs;

fetch-bili-summon--force:
	bun ./task/fetch-bili-summon.mjs --force-fetch;


fetch-bili-state:
	bun ./task/fetch-bili-state.mjs;
fetch-bili-state--force:
	bun ./task/fetch-bili-state.mjs --force-fetch;


fetch-bili-skill--support:
	bun ./task/fetch-bili-skill--support.mjs;
fetch-bili-skill--support--force:
	bun ./task/fetch-bili-skill--support.mjs --force-fetch;


fetch-bili-skill: fetch-bili-skill--support
	bun ./task/fetch-bili-skill.mjs;
fetch-bili-skill--force: fetch-skill--support--force
	bun ./task/fetch-bili-skill.mjs --force-fetch;


# fetch-bili-skill:
# 	bun ./task/fetch-bili-skill.mjs;
# fetch-bili-skill--force:
# 	bun ./task/fetch-bili-skill.mjs --force-fetch;





gitgc:
	git gc --prune=now --aggressive;