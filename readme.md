## Synopsis

`node-onlyonce` is a NodeJS package that allows users to interface with the [Only Once](http://onlyonce.com) API more easily. The module is far from stable and should not be used in production code yet.

## Code Example

```
// Include the module
var onlyonce = require("onlyonce");

// Create a client using your API credentials
var oo = onlyonce.createClient({
	key: "USERS_API_KEY",
	secret: "USERS_API_SECRET",
	secure: true,
	version: "v1"
});

// Acquire a Bearer token for further requests using API credentials
oo.auth(function (err) {
	if(err) {
		return console.error(err);
	}

	// Get all the meta data of the cards shared with you
	oo.getCards(function (err, cards) {
		if(err) {
			return console.error(err);
		}

		console.log(cards);
	});
});
```

## Installation

```
npm install onlyonce --save
```

## API Reference

##### `client.auth(callback)`
Acquire a Bearer token to send along with future requests. Expects a `callback(err)` to be passed as argument.

##### `client.getServices(callback)`
Gives a clear overview of all API endpoints available by the Only Once API. Expects a `callback(err, endpoints)` to be passed as argument, where `endpoints` is an array of endpoint objects.

##### `client.getRequests(callback)`
Gives a full list of requests that have been sent to the user, including their current state. Pending requests can be accepted using `client.acceptRequest`. Expects a `callback(err, requests)` to be passed as argument, where `requests` is an array of request objects.

##### `client.acceptRequest(cardId, callback)`
Accepts a pending incoming card. Expects a `callback(err)` to be passed as argument.

##### `client.getCards(callback)`
Gives a full list of cards that have been shared with the user. To get the contents of a specific card, use `client.getCard`. Expects a `callback(err, cards)` to be passed as argument, where `cards` is an array of card objects.

##### `client.getCards(cardId, secretKey, callback)`
Gets the content of a specific shared card. `secretKey` is the key that is used to encrypt the user's data. Expects a `callback(err, data)` to be passed as argument, where `data` is an object containing the card's data.

## Tests

Currently there are no tests included with this project. This will change later.