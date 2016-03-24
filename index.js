var http = require("http");

function OnlyOnceClient (options) {
	this.protocol = options.secure ? "https:" : "http:";
	this.baseUrl = "apiteststand.onlyonce.com";
	this.version = options.version || "v1";

	this.key = options.key;
	if(!this.key) {
		throw new Error("Key is not set")
	}
	this.secret = options.secret;
	if(!this.secret) {
		throw new Error("Secret is not set")
	}
	this.bearer = undefined;
}

module.exports.createClient = function createClient(options) {
	return new OnlyOnceClient(options);
}

OnlyOnceClient.prototype.raw = function (endpoint, method, data, callback) {
	if(typeof endpoint != "string") throw new Error("Endpoint must be a string");
	if(typeof method != "string") throw new Error("Method must be a string");
	if(typeof callback === "undefined") {
		callback = data;
		data = {};
	}

	var headers = {
		"Cache-Control": "no-cache"
	};

	if(["POST"].indexOf(method.toUpperCase()) != -1) {
		headers['Content-Type'] = "application/json";
	}

	if(this.bearer) {
		headers['Authorization'] = this.bearer;
	}

	if(data.hasOwnProperty("headers")) {
		Object.keys(data.headers).forEach(function (key) {
			headers[key] = data.headers[key];
		});
	}

	var req = http.request({
		protocol: this.protocol,
		host: this.baseUrl,
		method: method,
		path: "/" + this.version + endpoint,
		headers: headers
	}, function (res) {
		var receivedData = "";

		res.setEncoding("utf8");
		res.on("data", function (chunk) {
			receivedData += chunk;
		});
		res.on("end", function() {
			var parsedData = {};
			try {
				parsedData = JSON.parse(receivedData);
			}catch(err) {
				parsedData = {};
			}

			return callback(null, parsedData, res);
		});
	});

	req.on("error", function (err) {
		return callback(err);
	});

	if(Object.keys(data).length > 0) {
		req.write(JSON.stringify(data));
	}
	req.end();
}

OnlyOnceClient.prototype.auth = function (callback) {
	this.raw("/token", "POST", { apiKey: this.key, apiSecret: this.secret }, function(err, data, res) {
		if(err) {
			return callback(err);
		}

		if(res.headers.hasOwnProperty("authorization")) {
			this.bearer = res.headers['authorization'];
		}else{
			return callback(new Error("Something went wrong, authorization token hasn't been retrieved"));
		}

		return callback();
	}.bind(this));
}

OnlyOnceClient.prototype.getServices = function (callback) {
	this.raw("/services", "GET", function (err, data) {
		if(err) {
			return callback(err);
		}

		return callback(null, data.data);
	}.bind(this));
}

OnlyOnceClient.prototype.getRequests = function (callback) {
	this.raw("/requests", "GET", function (err, data) {
		if(err) {
			return callback(err);
		}

		return callback(null, data.data);
	}.bind(this));
}

OnlyOnceClient.prototype.acceptRequest = function (cardId, callback) {
	this.raw("/requests/"+cardId+"/accept", "GET", function (err, data) {
		if(err) {
			return callback(err);
		}

		return callback(null);
	}.bind(this));
}

OnlyOnceClient.prototype.getCards = function (callback) {
	this.raw("/cards", "GET", function (err, data) {
		if(err) {
			return callback(err);
		}

		return callback(null, data.data);
	}.bind(this));
}

OnlyOnceClient.prototype.getCard = function (cardId, secretKey, callback) {
	this.raw("/cards/"+cardId, "GET", { headers: { "Secret-Key": secretKey } }, function (err, data) {
		if(err) {
			return callback(err);
		}

		return callback(null, data.data);
	}.bind(this));
}