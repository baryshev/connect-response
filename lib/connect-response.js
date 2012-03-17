var
	connect = require('connect'),
	utils = connect.utils;

module.exports = function (options) {
	'use strict';
	options = options || {};
	var render, just;

	if (typeof options.render === 'function') {
		render = options.render;
	} else {
		just = new (require('just'))(options.just);
		render = function(template, data, cb) {
			just.render(template, data, function (err, html) {
				cb(err, html);
			});
		};
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
			var cookie = utils.serializeCookie(name, val, options);
			res.setHeader('Set-Cookie', cookie);
		};

		res.clearCookie = function (name, options) {
			var defaultOptions = { expires: new Date(1), path: '/' };
			res.setCookie(name, '', options ? utils.merge(defaultOptions, options) : defaultOptions);
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

		res.raw = function (status, contentType, charset) {
			contentType = contentType || 'text/html';
			charset = charset || 'utf-8';
			res.statusCode = status || 200;
			res.setHeader('Content-Type', contentType + '; charset=' + charset);
			res.end(res.data);
		};

		res.redirect = function (url, status) {
			res.statusCode = status || 301;
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
