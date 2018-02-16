const jsonClient = require('json-client');
const Postcode = require('postcode');

const defaultHostURL = 'https://api.postcodes.io';

const reverseGeocodeOptions = {
	limit: 1,
	radius: 20000,
	wideSearch: true,
};

class PostcodesIO {
	constructor(hostURL, opts) {
		if (typeof hostURL === 'object' && !opts) {
			opts = hostURL;
			hostURL = null;
		}

		this._client = jsonClient(hostURL || defaultHostURL, opts);
	}

	_request(path, params) {
		return this
			._client('get', path, params)
			.then(r => r.result)
			.catch(error => {
				if (error.statusCode === 404)
					return null;

				throw error;
			});
	}

	lookup(postcode) {
		if (Postcode.validOutcode(postcode))
			return this.lookupOutcode(postcode);

		return this.lookupPostcode(postcode);
	}

	lookupPostcode(postcode) {
		return this._request(`postcodes/${encodeURIComponent(postcode)}`);
	}

	lookupOutcode(postcode) {
		return this._request(`outcodes/${encodeURIComponent(postcode)}`);
	}

	/*
		Valid options:
		number, number - nearCoordinate
		string, null/undefined - nearPostcode
	*/
	near(arg1, arg2) {
		if (typeof arg1 === 'number' && typeof arg2 === 'number')
			return this.nearCoordinate(arg1, arg2);

		if (typeof arg1 === 'string' && arg2 == null)
			return this.nearPostcode(arg1);

		throw new Error('Invalid arguments');
	}

	nearCoordinate(latitude, longitude, options = {}) {
		Object.assign(options, {
			lat: latitude,
			lon: longitude,
		});

		return this
			._request('postcodes', options)
			.then(d => d || []);
	}

	nearPostcode(postcode) {
		return this
			._request(`postcodes/${encodeURIComponent(postcode)}/nearest`)
			.then(d => d || []);
	}

	reverseGeocode(latitude, longitude) {
		return this
			.nearCoordinate(latitude, longitude, reverseGeocodeOptions)
			.then(d => (d.length && d[0]) || null);
	}

	validate(postcode) {
		return this._request(`postcodes/${encodeURIComponent(postcode)}/validate`);
	}

	random() {
		return this._request('random/postcodes');
	}
}

module.exports = PostcodesIO;
