var test = require('tape');
var PostcodesIO = require('../lib');

test('correct types exported', function (t) {
	t.equal(typeof PostcodesIO, 'function');
	t.equal(typeof PostcodesIO.prototype.lookup, 'function');
	t.equal(typeof PostcodesIO.prototype.lookupOutcode, 'function');
	t.equal(typeof PostcodesIO.prototype.lookupPostcode, 'function');
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
	t.equal(typeof client.lookupPostcode, 'function');
	t.equal(typeof client.lookupOutcode, 'function');
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
	t.equal(typeof client.lookupPostcode, 'function');
	t.equal(typeof client.lookupOutcode, 'function');
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
	t.equal(client.options.port, '443');
	t.deepEqual(client.options.headers, { 'Accept': 'application/json' });

	t.end();
});

test('with custom base URL', function(t) {
	var client = new PostcodesIO('http://example.com:8246');

	t.notEqual(client.options, null);
	t.deepEqual(client.options, {
		secure: false,
		hostname: 'example.com',
		port: '8246',
		headers: { Accept: 'application/json' },
	});

	t.end();
});

test('correct headers after initialization with custom headers', function (t) {
	var opts = {
		headers: { 'Authorization': 'Bearer foobar' }
	};

	var client = new PostcodesIO(null, opts);

	t.notEqual(client.options, null);

	t.deepEqual(client.options, {
		secure: true,
		hostname: 'api.postcodes.io',
		port: '443',
		headers: {
			Accept: 'application/json',
			Authorization: 'Bearer foobar',
		},
	});

	t.end();
});

test('promise returned by all methods', function (t) {
	var client = new PostcodesIO();

	t.equal(typeof client.lookup('EC1V 9LB').then, 'function');
	t.equal(typeof client.lookup('EC1V').then, 'function');
	t.equal(typeof client.lookupPostcode('EC1V 9LB').then, 'function');
	t.equal(typeof client.lookupOutcode('EC1V').then, 'function');
	t.equal(typeof client.near('EC1V 9LB').then, 'function');
	t.equal(typeof client.near(51.6562, -1.0699).then, 'function');
	t.equal(typeof client.nearCoordinate(51.6562, -1.0699).then, 'function');
	t.equal(typeof client.nearPostcode('EC1V 9LB').then, 'function');
	t.equal(typeof client.reverseGeocode(51.6562, -1.0699).then, 'function');
	t.equal(typeof client.validate('EC1V 9LB').then, 'function');
	t.equal(typeof client.random().then, 'function');

	t.end();
});
