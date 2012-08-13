(function () {
	'use strict';

	var cookie = require('cookie');

	module.exports = function (render) {
		if (typeof options.render !== 'function') {
			throw new Error('render function required');
		}

		return function (req, res, next) {
			res.data = {};

			res.setCookie = function (name, val, options) {
				options = options || {};
				if ('object' === typeof val) { val = JSON.stringify(val); }
				if (!(options.expires instanceof Date)) {
					options.expires = parseInt(options.expires, 10);
					if (isNaN(options.expires)) {
						delete (options.expires);
					} else {
						options.expires = new Date(Date.now() + options.expires);
					}
				}
				if (!options.path) { options.path = '/'; }
				res.setHeader('Set-Cookie', cookie.serialize(name, val, options));
			};

			res.clearCookie = function (name, options) {
				options = options || {};
				options.expires = new Date(1);
				if (!options.path) { options.path = '/'; }
				res.setCookie(name, '', options);
			};

			res.json = function (status, contentType, charset) {
				contentType = contentType || 'application/json';
				charset = charset || 'utf-8';
				res.statusCode = status || 200;
				res.setHeader('Content-Type', contentType + '; charset=' + charset);
				res.end(JSON.stringify(res.data));
			};

			res.html = function (template, status, contentType, charset) {
				contentType = contentType || 'text/html';
				charset = charset || 'utf-8';
				res.setHeader('Content-Type', contentType + '; charset=' + charset);
				render(template, res.data, function (err, html) {
					if (err) {
						next(err);
					} else {
						res.statusCode = status || 200;
						res.end(html);
					}
				});
			};

			res.text = function (status, contentType, charset) {
				contentType = contentType || 'text/plain';
				charset = charset || 'utf-8';
				res.statusCode = status || 200;
				res.setHeader('Content-Type', contentType + '; charset=' + charset);
				res.end(res.data);
			};

			res.redirect = function (url, status) {
				res.statusCode = status || 302;
				res.setHeader('Location', url);
				res.end();
			};

			res.back = function (status) {
				var url = req.headers.referer || req.headers.referrer || '/';
				res.redirect(url, status);
			};

			next();
		};
	};
}());
