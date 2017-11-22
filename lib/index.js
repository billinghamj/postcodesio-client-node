const http = require('http');
const https = require('https');
const qs = require('querystring');
const Q = require('q');
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

	const deferred = Q.defer();
	const proto = this.options.secure ? https : http;

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
				deferred.reject(new Error('Invalid JSON'));

				return;
			}

			// assuming that infinite loops won't happen
			if (response.statusCode >= 300 && response.statusCode < 400) {
				this
					._request('get', response.headers.location)
					.then(deferred.resolve, deferred.reject);

				return;
			}

			if (response.statusCode === 404) {
				deferred.resolve(null);

				return;
			}

			if (response.statusCode >= 200 && response.statusCode < 300) {
				deferred.resolve(output.result);

				return;
			}

			const error = new Error(output.error);

			error.code = error.statusCode = response.statusCode;
			deferred.reject(error);
		});
	});

	request.end();

	request.on('error', error => {
		deferred.reject(error);
	});

	return deferred.promise;
};

PostcodesIO.prototype.lookup = function lookup(postcode) {
	if (Postcode.validOutcode(postcode))
		return this.lookupOutcode(postcode);

	return this.lookupPostcode(postcode);
};

PostcodesIO.prototype.lookupPostcode = function lookupPostcode(postcode) {
	return this._request('get', `postcodes/${qs.escape(postcode)}`);
};

PostcodesIO.prototype.lookupOutcode = function lookupOutcode(postcode) {
	return this._request('get', `outcodes/${qs.escape(postcode)}`);
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
		._request('get', `postcodes/${qs.escape(postcode)}/nearest`)
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
	return this._request('get', `postcodes/${qs.escape(postcode)}/validate`);
};

PostcodesIO.prototype.random = function random() {
	return this._request('get', 'random/postcodes');
};
