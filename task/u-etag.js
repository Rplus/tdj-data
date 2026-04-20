import fs from 'fs'

class Etag_cache {
	constructor(cache_file = './_cache/etag.json') {
		this.cache_file = cache_file;
		this.cache = this.load();
	}

	load() {
		if (fs.existsSync(this.cache_file)) {
			return JSON.parse(fs.readFileSync(this.cache_file, 'utf8'));
		}
		return {};
	}

	save() {
		fs.writeFileSync(this.cache_file, JSON.stringify(this.cache, null, 2));
	}

	get(url) {
		return this.cache[url] || null;
	}

	set(url, etag) {
		this.cache[url] = etag;
		this.save();
	}

	delete(url) {
		if (this.cache[url]) {
			delete this.cache[url];
			this.save();
		}
	}

	reset() {
		this.cache = {};
		this.save();
	}
}

export const etag_cache = new Etag_cache();