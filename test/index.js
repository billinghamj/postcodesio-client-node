var test = require('tape');
var PostcodesIO = require('../lib');

test('correct types exported', function (t) {
	t.equal(typeof PostcodesIO, 'function');
	t.equal(typeof PostcodesIO.prototype.lookup, 'function');
	t.equal(typeof PostcodesIO.prototype.near, 'function');
	t.equal(typeof PostcodesIO.prototype.nearCoordinate, 'function');
	t.equal(typeof PostcodesIO.prototype.nearPostcode, 'function');
	t.equal(typeof PostcodesIO.prototype.reverseGeocode, 'function');
	t.equal(typeof PostcodesIO.prototype.validate, 'function');
	t.equal(typeof PostcodesIO.prototype.random, 'function');

	t.end();
});

test('correct types after initialization', function (t) {
	var client = new PostcodesIO();

	t.assert(client instanceof PostcodesIO);
	t.equal(typeof client.lookup, 'function');
	t.equal(typeof client.near, 'function');
	t.equal(typeof client.nearCoordinate, 'function');
	t.equal(typeof client.nearPostcode, 'function');
	t.equal(typeof client.reverseGeocode, 'function');
	t.equal(typeof client.validate, 'function');
	t.equal(typeof client.random, 'function');

	t.end();
});

test('correct types after calling as function', function (t) {
	var client = PostcodesIO();

	t.assert(client instanceof PostcodesIO);
	t.equal(typeof client.lookup, 'function');
	t.equal(typeof client.near, 'function');
	t.equal(typeof client.nearCoordinate, 'function');
	t.equal(typeof client.nearPostcode, 'function');
	t.equal(typeof client.reverseGeocode, 'function');
	t.equal(typeof client.validate, 'function');
	t.equal(typeof client.random, 'function');

	t.end();
});

test('default options set after initialization', function (t) {
	var client = new PostcodesIO();

	t.notEqual(client.options, null);
	t.equal(client.options.secure, true);
	t.equal(client.options.hostname, 'api.postcodes.io');
	t.equal(client.options.port, 443);
	t.deepEqual(client.options.headers, { 'Accept': 'application/json' });

	t.end();
});

test('options overridden after initialization with options', function (t) {
	var opts = {
		secure: false,
		hostname: 'example.com',
		port: 8246,
		headers: { 'Accept': 'text/xml' }
	};

	var client = new PostcodesIO(opts);

	t.notEqual(client.options, null);
	t.deepEqual(client.options, opts);

	t.end();
});

test('correct options after initialization with secure as false', function (t) {
	var client = new PostcodesIO({ secure: false });

	t.notEqual(client.options, null);
	t.equal(client.options.secure, false);
	t.equal(client.options.hostname, 'api.postcodes.io');
	t.equal(client.options.port, 80);

	t.end();
});

test('correct options after initialization with secure as true', function (t) {
	var client = new PostcodesIO({ secure: true });

	t.notEqual(client.options, null);
	t.equal(client.options.secure, true);
	t.equal(client.options.hostname, 'api.postcodes.io');
	t.equal(client.options.port, 443);

	t.end();
});

test('correct headers after initialization with custom headers', function (t) {
	var opts = {
		headers: { 'Authorization': 'Bearer foobar' }
	};

	var client = new PostcodesIO(opts);

	t.notEqual(client.options, null);

	t.deepEqual(client.options.headers, {
		'Accept': 'application/json',
		'Authorization': 'Bearer foobar'
	});

	t.end();
});
