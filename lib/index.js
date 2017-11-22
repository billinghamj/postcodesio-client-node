const http = require('http');
const https = require('https');
const qs = require('querystring');
const Postcode = require('postcode');
const url = require('url');

const PostcodesIO = module.exports = function PostcodesIO(baseURL, opts = {}) {
	if (!(this instanceof PostcodesIO))
		return new PostcodesIO(baseURL, opts);

	let postcodesURL = {};

	if (typeof baseURL === 'string')
		postcodesURL = new url.URL(baseURL);

	const secure = postcodesURL.protocol !== 'http:';

	this.options = Object.assign({}, opts, {
		secure,
		hostname: postcodesURL.hostname || 'api.postcodes.io',
		port: postcodesURL.port || (secure ? '443' : '80'),
		headers: Object.assign({}, opts.headers, { Accept: 'application/json' }),
	});
};

PostcodesIO.prototype._request = function _request(method, inPath, params, opts) {
	const query = params ? `?${qs.stringify(params)}` : '';

	const path = inPath.replace(/^\//, '');

	const options = Object.assign({}, this.options, opts, {
		method: method,
		path: `/${path}${query}`,
	});

	const proto = this.options.secure ? https : http;

	return new Promise((resolve, reject) => {
		const request = proto.request(options, response => {
			let resData = '';

			response.setEncoding('utf8');

			response.on('data', chunk => {
				resData += chunk;
			});

			response.on('end', () => {
				let output;

				try {
					output = JSON.parse(resData);
				} catch (ex) {
					reject(new Error('Invalid JSON'));

					return;
				}

				// assuming that infinite loops won't happen
				if (response.statusCode >= 300 && response.statusCode < 400) {
					this
						._request('get', response.headers.location)
						.then(resolve, reject);

					return;
				}

				if (response.statusCode === 404) {
					resolve(null);

					return;
				}

				if (response.statusCode >= 200 && response.statusCode < 300) {
					resolve(output.result);

					return;
				}

				const error = new Error(output.error);

				error.code = error.statusCode = response.statusCode;
				reject(error);
			});
		});

		request.end();

		request.on('error', error => {
			reject(error);
		});
	});
};

PostcodesIO.prototype.lookup = function lookup(postcode) {
	if (Postcode.validOutcode(postcode))
		return this.lookupOutcode(postcode);

	return this.lookupPostcode(postcode);
};

PostcodesIO.prototype.lookupPostcode = function lookupPostcode(postcode) {
	return this._request('get', `postcodes/${encodeURIComponent(postcode)}`);
};

PostcodesIO.prototype.lookupOutcode = function lookupOutcode(postcode) {
	return this._request('get', `outcodes/${encodeURIComponent(postcode)}`);
};

/*
	Valid options:
	number, number, optional function - nearCoordinate
	string, optional function, null/undefined - nearPostcode
*/
PostcodesIO.prototype.near = function near(arg1, arg2, arg3) {
	if (typeof arg1 === 'number' && typeof arg2 === 'number')
		return this.nearCoordinate(arg1, arg2, null, arg3);

	if (typeof arg1 === 'string' && !arg3)
		return this.nearPostcode(arg1, arg2);

	throw new Error('Invalid arguments');
};

PostcodesIO.prototype.nearCoordinate = function nearCoordinate(latitude, longitude, options = {}) {
	Object.assign(options, {
		lat: latitude,
		lon: longitude,
	});

	return this
		._request('get', 'postcodes', options)
		.then(d => d || []);
};

PostcodesIO.prototype.nearPostcode = function nearPostcode(postcode) {
	return this
		._request('get', `postcodes/${encodeURIComponent(postcode)}/nearest`)
		.then(d => d || []);
};

const reverseGeocodeOptions = {
	limit: 1,
	radius: 20000,
	wideSearch: true,
};

PostcodesIO.prototype.reverseGeocode = function reverseGeocode(latitude, longitude) {
	return this
		.nearCoordinate(latitude, longitude, reverseGeocodeOptions)
		.then(d => (d.length && d[0]) || null);
};

PostcodesIO.prototype.validate = function validate(postcode) {
	return this._request('get', `postcodes/${encodeURIComponent(postcode)}/validate`);
};

PostcodesIO.prototype.random = function random() {
	return this._request('get', 'random/postcodes');
};
