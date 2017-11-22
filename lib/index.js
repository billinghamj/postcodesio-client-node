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

PostcodesIO.prototype._request = function (method, path, params, options) {
	var query = (params ? '?' + qs.stringify(params) : '');

	path = path.replace(/^\//, '');

	options = Object.assign({}, this.options, options, {
		method: method,
		path: '/' + path + query
	});

	var self = this;
	var deferred = Q.defer();
	var proto = this.options.secure ? https : http;

	var request = proto.request(options, function (response) {
		var data = '';
		response.setEncoding('utf8');

		response.on('data', function (chunk) {
			data += chunk;
		});

		response.on('end', function () {
			try {
				var output = JSON.parse(data);
			} catch (ex) {
				deferred.reject(new Error('Invalid JSON'));
				return;
			}

			// assuming that infinite loops won't happen
			if (response.statusCode >= 300 && response.statusCode < 400) {
				self
					._request('get', response.headers.location)
					.then(deferred.resolve, deferred.reject);
				return;
			}

			if (response.statusCode === 404) {
				deferred.resolve(null);
				return;
			}

			if (!(response.statusCode >= 200 && response.statusCode < 300)) {
				var error = new Error(output.error);
				error.code = error.statusCode = response.statusCode;
				deferred.reject(error);
				return;
			}

			deferred.resolve(output.result);
		});
	});

	request.end();

	request.on('error', function (error) {
		deferred.reject(error);
	});

	return deferred.promise;
}

PostcodesIO.prototype.lookup = function (postcode, callback) {
	if (Postcode.validOutcode(postcode)) {
		return this.lookupOutcode(postcode, callback);
	} else {
		return this.lookupPostcode(postcode, callback);
	};
}

PostcodesIO.prototype.lookupPostcode = function lookupPostcode(postcode, callback) {
	return this
		._request('get', 'postcodes/' + qs.escape(postcode))
		.nodeify(callback);
}

PostcodesIO.prototype.lookupOutcode = function lookupOutcode(postcode, callback) {
	return this
		._request('get', 'outcodes/' + qs.escape(postcode))
		.nodeify(callback);
}

PostcodesIO.prototype.near = function (arg1, arg2, arg3) {
	/*
		Valid options:
		number, number, optional function - nearCoordinate
		string, optional function, null/undefined - nearPostcode
	*/

	if (typeof arg1 === 'number' && typeof arg2 === 'number')
		return this.nearCoordinate(arg1, arg2, null, arg3);

	if (typeof arg1 === 'string' && !arg3)
		return this.nearPostcode(arg1, arg2);

	throw new Error('Invalid arguments');
}

PostcodesIO.prototype.nearCoordinate = function (latitude, longitude, options = {}, callback = null) {
	if (typeof callback === 'undefined'
		&& typeof options === 'function') {
		callback = options;
		options = null;
	}

	Object.assign(options || {}, {
		lat: latitude,
		lon: longitude
	});

	return this
		._request('get', 'postcodes', options)
		.then(function (data) {
			return data === null ? [] : data;
		})
		.nodeify(callback);
}

PostcodesIO.prototype.nearPostcode = function (postcode, callback) {
	return this
		._request('get', 'postcodes/' + qs.escape(postcode) + '/nearest')
		.then(function (data) {
			return data === null ? [] : data;
		})
		.nodeify(callback);
}

PostcodesIO.prototype.reverseGeocode = function (latitude, longitude, callback) {
	return this
		.nearCoordinate(latitude, longitude, { limit: 1, radius: 20000, wideSearch: true })
		.then(function (data) {
			return data.length ? data[0] : null;
		})
		.nodeify(callback);
}

PostcodesIO.prototype.validate = function (postcode, callback) {
	return this
		._request('get', 'postcodes/' + qs.escape(postcode) + '/validate')
		.nodeify(callback);
}

PostcodesIO.prototype.random = function (callback) {
	return this
		._request('get', 'random/postcodes')
		.nodeify(callback);
}
