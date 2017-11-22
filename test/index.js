const test = require('tape');
const PostcodesIO = require('../lib');

test('correct types exported', t => {
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

test('correct types after initialization', t => {
	const client = new PostcodesIO();

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

test('promise returned by all methods', t => {
	const client = new PostcodesIO();

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
