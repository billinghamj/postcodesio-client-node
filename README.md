# postcodes.io client

Abstracts access to the [`postcodes.io`](//postcodes.io) API.

[![NPM Version](https://img.shields.io/npm/v/postcodesio-client.svg?style=flat)](//www.npmjs.org/package/postcodesio-client)
[![Build Status](https://img.shields.io/travis/billinghamj/postcodesio-client-node.svg?style=flat)](//travis-ci.org/billinghamj/postcodesio-client-node)
[![Coverage Status](https://img.shields.io/coveralls/billinghamj/postcodesio-client-node.svg?style=flat)](//coveralls.io/r/billinghamj/postcodesio-client-node)

```js
var PostcodesIO = require('postcodesio-client');
var postcodes = new PostcodesIO();

postcodes.lookup('EC1V 9LB').then(postcode => {
	console.log(postcode);

	// {
	//   "postcode": "EC1V 9LB",
	//   "admin_district": "Islington",
	//   "longitude": -0.091247681768113,
	//   "latitude": 51.5278436902703,
	//   "region": "London",
	//   ...
	// }
});
```

## Installation

```bash
$ npm install postcodesio-client
```

## Usage

Create an instance of the client, providing options if you wish:

```js
var PostcodesIO = require('postcodesio-client');

var postcodes = new PostcodesIO('https://api.postcodes.io', {
	headers: { 'User-Agent': 'MyAwesomeApp/1.0.0' } // default {} - extra headers
});
```

Make requests using Promises:

```js
postcodes
	.lookup('EC1V 9LB')
	.then(function (postcode) {
		console.log(postcode);
	}, function (error) {
		console.log('oh no, it failed ;_;');
	});
```

Not found (404) responses from the API are not considered errors. Instead, the
output will be `null`.

```js
postcodes.lookup('F4K3AA').then(postcode => {
	console.log(postcode);
	// null
});
```

Only Promises ([Promises/A+](//promisesaplus.com)) are supported - callbacks
are not. The following two sections specify exactly how you can apply Promises
to the reference below.

### Promises

```js
postcodes
	.method(parameters...)
	.then(function (outputs...) {

	}, function (error) {

	});
```

- `method` - the method you want to call
- `parameters` - any arguments specific to that method (see [Methods](#methods))
- `error` - instance of `Error`
- `outputs` - any outputs for that method (see [Methods](#methods))

Both `parameters` and `outputs` can mean zero, one, or many arguments. These are
specified for each method.

## Methods

### Lookup

Get lots of data for a postcode or outcode.

```js
postcodes.lookup(code)
```

Parameters:

- `code` - string - the postcode or outcode to retrieve

Outputs:

- `data` - [Postcode](#postcode) or [Outcode](#outcode) - the resulting postcode/outcode data

This may also be called explicitly as `postcodes.lookupPostcode(postcode)` or `postcodes.lookupOutcode(outcode)`.

### Near Coordinate

Find postcodes closest to a coordinate.

```js
postcodes.near(latitude, longitude)
```

This may also be called explicitly as `postcodes.nearCoordinate(latitude, longitude, options)`.

Parameters:

- `latitude` - number - the latitude of the coordinate
- `longitude` - number - the longitude of the coordinate
- `options` - object - optional, only available with an explicit call

Outputs:

- `postcodes` - array of [Postcode](#postcode) - the nearby postcodes

### Near Postcode

Find the postcodes closest to another postcode.

Warning: results may include the original postcode.

```js
postcodes.near(postcode)
```

This may also be called explicitly as `postcodes.nearPostcode(postcode)`.

Parameters:

- `postcode` - string - the postcode to search around

Outputs:

- `postcodes` - array of [Postcode](#postcode) - the nearby postcodes

### Reverse Geocode

Find the single closest postcode to a coordinate.

```js
postcodes.reverseGeocode(latitude, longitude)
```

Parameters:

- `latitude` - number - the latitude of the coordinate
- `longitude` - number - the longitude of the coordinate

Outputs:

- `postcode` - [Postcode](#postcode) - the nearby postcode

### Validate

Validates that the postcode exists. (Means it is in the official Royal Mail
Postcode Address File).

```js
postcodes.validate(postcode)
```

Parameters:

- `postcode` - string - the postcode to retrieve

Outputs:

- `exists` - boolean - indicates existence of postcode

### Random

Retrieve a random postcode. Not really sure why you'd want to do this, but here
it is...

```js
postcodes.random()
```

Outputs:

- `postcode` - [Postcode](#postcode) - a random postcode

## Types

### Postcode

Example:

```json
{
	"postcode": "EC1V 9LB",
	"quality": 1,
	"eastings": 532506,
	"northings": 182719,
	"country": "England",
	"nhs_ha": "London",
	"admin_county": null,
	"admin_district": "Islington",
	"admin_ward": "Bunhill",
	"longitude": -0.091247681768113,
	"latitude": 51.5278436902703,
	"parliamentary_constituency": "Islington South and Finsbury",
	"european_electoral_region": "London",
	"primary_care_trust": "Islington",
	"region": "London",
	"parish": null,
	"lsoa": "Islington 023A",
	"msoa": "Islington 023",
	"nuts": null,
	"incode": "9LB",
	"outcode": "EC1V",
	"ccg": "NHS Islington"
}
```
### Outcode

Example:

```json
{
    "outcode": "EC1V",
    "longitude": -0.0981811622126924,
    "latitude": 51.5266761246198,
    "northings": 182576,
    "eastings": 532028,
    "admin_district": [
        "Hackney",
        "Islington"
    ],
    "parish": [
        "Hackney, unparished area",
        "Islington, unparished area"
    ],
    "admin_county": [],
    "admin_ward": [
        "Bunhill",
        "Hoxton West",
        "Clerkenwell",
        "Hoxton East & Shoreditch",
        "St Peter's"
    ],
    "country": [
        "England"
    ]
}
```

## Testing

Install the development dependencies first:

```bash
$ npm install
```

Then run the tests:

```bash
$ npm test
```

## Support

Please open an issue on this repository.

## Authors

- James Billingham <james@jamesbillingham.com>

## License

MIT licensed - see [LICENSE](LICENSE) file
