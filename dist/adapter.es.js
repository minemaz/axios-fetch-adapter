import settle from 'axios/lib/core/settle';
import createError from 'axios/lib/core/createError';
import buildURL from 'axios/lib/helpers/buildURL';
import buildFullPath from 'axios/lib/core/buildFullPath';
import { isUndefined } from 'axios/lib/utils';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

/**
 * This function will create a Request object based on configuration's axios
 */

function createRequest(config) {
  var headers = new Headers(config.headers); // HTTP basic authentication

  if (config.auth) {
    var username = config.auth.username || '';
    var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
    headers.set('Authorization', "Basic ".concat(btoa(username + ':' + password)));
  }

  var method = config.method.toUpperCase();
  var options = {
    headers: headers,
    method: method
  };

  if (method !== 'GET' && method !== 'HEAD') {
    options.body = config.data;
  }

  if (config.mode) {
    options.mode = config.mode;
  }

  if (config.cache) {
    options.cache = config.cache;
  }

  if (config.integrity) {
    options.integrity = config.integrity;
  }

  if (config.redirect) {
    options.integrity = config.redirect;
  }

  if (config.referrer) {
    options.integrity = config.referrer;
  } // This config is similar to XHR’s withCredentials flag, but with three available values instead of two.
  // So if withCredentials is not set, default value 'same-origin' will be used


  if (!isUndefined(config.withCredentials)) {
    options.credentials = config.withCredentials ? 'include' : 'omit';
  }

  var fullPath = buildFullPath(config.baseURL, config.url);
  var url = buildURL(fullPath, config.params, config.paramsSerializer); // Expected browser to throw error if there is any wrong configuration value

  return new Request(url, options);
}

/**
 * Fetch API stage two is to get response body. This funtion tries to retrieve
 * response body based on response's type
 */

function getResponse(_x, _x2) {
  return _getResponse.apply(this, arguments);
}

function _getResponse() {
  _getResponse = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(request, config) {
    var stageOne, response;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return new Promise(function (res, rej) {
              var options = config;

              if (!options.hasOwnProperty('headers')) {
                options = Object.assign(options, {
                  "headers": {}
                });
              }

              if (!options.hasOwnProperty('data')) {
                options = Object.assign(options, {
                  "data": {}
                });
              }

              options.url = buildFullPath(options.baseURL, options.url);

              if (options.method === 'post') {
                if (options.headers['Content-Type'] === 'application/json') {
                  cordova.plugin.http.setDataSerializer('json');
                  options.data = JSON.parse(options.data);
                } else if (options.headers['Content-Type'].match(/^multipart\/form-data;/)) {
                  cordova.plugin.http.setDataSerializer('multipart');
                } else {
                  cordova.plugin.http.setDataSerializer('urlencoded');
                }
              } else if (options.method === 'get') {
                if (options.params) {
                  Object.keys(options.params).forEach(function (key) {
                    var _options$params$key;

                    options.params[key] = (_options$params$key = options.params[key]) !== null && _options$params$key !== void 0 ? _options$params$key : '';
                  });
                }
              }

              cordova.plugin.http.sendRequest(options.url, options, res, rej);
            });

          case 3:
            stageOne = _context.sent;
            _context.next = 9;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", Promise.reject(createError(JSON.stringify(_context.t0), config, null, request)));

          case 9:
            response = {
              // ok: stageOne.ok,
              status: stageOne.status,
              statusText: stageOne.statusText,
              // headers: new Headers(stageOne.headers), // Make a copy of headers
              headers: stageOne.headers,
              // Make a copy of headers
              config: config,
              request: request
            };

            if (stageOne.status >= 200 && stageOne.status !== 204) {
              response.data = stageOne.data;
            }

            return _context.abrupt("return", Promise.resolve(response));

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 6]]);
  }));
  return _getResponse.apply(this, arguments);
}

/**
 * - Create a request object
 * - Get response body
 * - Check if timeout
 */

function fetchAdapter(_x) {
  return _fetchAdapter.apply(this, arguments);
}

function _fetchAdapter() {
  _fetchAdapter = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(config) {
    var request, promiseChain, data;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            request = createRequest(config);
            promiseChain = [getResponse(request, config)];

            if (config.timeout && config.timeout > 0) {
              promiseChain.push(new Promise(function (res) {
                setTimeout(function () {
                  var message = config.timeoutErrorMessage ? config.timeoutErrorMessage : 'timeout of ' + config.timeout + 'ms exceeded';
                  res(createError(message, config, 'ECONNABORTED', request));
                }, config.timeout);
              }));
            }

            _context.next = 5;
            return Promise.race(promiseChain);

          case 5:
            data = _context.sent;
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              if (data instanceof Error) {
                reject(data);
              } else {
                Object.prototype.toString.call(config.settle) === '[object Function]' ? config.settle(resolve, reject, data) : settle(resolve, reject, data);
              }
            }));

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _fetchAdapter.apply(this, arguments);
}

export default fetchAdapter;
