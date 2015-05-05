"use strict";

var http = require('http');
var https = require('https');
var qs = require('querystring');
var objectMerge = require('object-merge');
var Q = require('q');

var PostcodesIO = module.exports = function (opts) {
	if (!(this instanceof PostcodesIO))
		return new PostcodesIO(opts);

	opts = opts || {};
	opts.secure = typeof opts.secure !== 'undefined' ? opts.secure : true;
	opts.hostname = opts.hostname || 'api.postcodes.io';
	opts.port = opts.port || (opts.secure ? 443 : 80);
	opts.headers = objectMerge({ 'Accept': 'application/json' }, opts.headers || {});

	this.options = opts;
}

PostcodesIO.prototype._request = function (method, path, params, options) {
	var query = (params ? '?' + qs.stringify(params) : '');

	path = path.replace(/^\//, '');

	options = objectMerge(this.options, options || {}, {
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
	return this
		._request('get', 'postcodes/' + qs.escape(postcode))
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

PostcodesIO.prototype.nearCoordinate = function (latitude, longitude, options, callback) {
	if (typeof callback === 'undefined'
		&& typeof options === 'function') {
		callback = options;
		options = null;
	}

	options = objectMerge(options || {}, {
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
		.nearCoordinate(latitude, longitude)
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
